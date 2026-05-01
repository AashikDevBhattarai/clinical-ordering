import { spawn } from "node:child_process";

const [serverScript, healthUrl, testScript] = process.argv.slice(2);

if (!serverScript || !healthUrl || !testScript) {
  console.error(
    "Usage: node ./scripts/run-with-server.mjs <server-npm-script> <health-url> <test-npm-script>",
  );
  process.exit(1);
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
let serverExit = null;

const server = spawn(npmCommand, ["run", serverScript], {
  detached: process.platform !== "win32",
  shell: false,
  stdio: "inherit",
});

server.once("exit", (code, signal) => {
  serverExit = { code, signal };
});

process.once("SIGINT", () => shutdown(130));
process.once("SIGTERM", () => shutdown(143));

try {
  await waitForUrl(healthUrl);
  const testExitCode = await runNpmScript(testScript);
  await stopServer();
  process.exit(testExitCode);
} catch (error) {
  console.error(error.message);
  await stopServer();
  process.exit(1);
}

async function waitForUrl(url, timeoutMs = 60_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (serverExit) {
      throw new Error(
        `Server script "${serverScript}" exited before ${url} was ready. Exit: ${formatExit(serverExit)}`,
      );
    }

    if (await isUrlReady(url)) {
      return;
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function isUrlReady(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1_000);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function runNpmScript(scriptName) {
  return new Promise((resolve) => {
    const test = spawn(npmCommand, ["run", scriptName], {
      shell: false,
      stdio: "inherit",
    });

    test.once("exit", (code, signal) => {
      if (signal) {
        resolve(1);
        return;
      }

      resolve(code ?? 1);
    });
  });
}

async function stopServer() {
  if (!server.pid || serverExit) {
    return;
  }

  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 5_000);

    if (process.platform === "win32") {
      const taskkill = spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
        shell: false,
        stdio: "ignore",
      });

      taskkill.once("exit", () => {
        clearTimeout(timeout);
        resolve();
      });
      taskkill.once("error", () => {
        clearTimeout(timeout);
        resolve();
      });
      return;
    }

    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      try {
        process.kill(server.pid, "SIGTERM");
      } catch {
        // Server already stopped.
      }
    }

    server.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function shutdown(exitCode) {
  await stopServer();
  process.exit(exitCode);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatExit(exit) {
  return exit.signal ? `signal ${exit.signal}` : `code ${exit.code}`;
}
