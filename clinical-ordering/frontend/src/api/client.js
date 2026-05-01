const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
const STATIC_BEARER_TOKEN = import.meta.env.VITE_API_BEARER_TOKEN;
const REQUEST_TIMEOUT_MS = 8_000;
const READ_RETRY_COUNT = 2;
const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_OPEN_MS = 5_000;
const RETRYABLE_SERVER_STATUSES = new Set([500, 502, 503, 504]);
const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const circuitBreakerState = {
  consecutiveFailures: 0,
  openUntil: 0,
};

class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.fieldErrors = options.fieldErrors ?? {};
    this.circuitOpen = options.circuitOpen ?? false;
  }
}

async function request(path, options = {}) {
  const method = normalizeMethod(options.method);
  if (isCircuitOpen()) {
    throw new ApiError("API temporarily unavailable. Please wait a few seconds and try again.", {
      status: 503,
      circuitOpen: true,
    });
  }

  const bearerToken =
    STATIC_BEARER_TOKEN ||
    (typeof window !== "undefined" ? readStoredAccessToken() : null);

  const maxAttempts = shouldRetryMethod(method) ? READ_RETRY_COUNT + 1 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
          ...(options.headers ?? {}),
        },
        ...options,
        method,
      });

      if (!response.ok) {
        const error = await toApiError(response);
        if (attempt < maxAttempts && shouldRetryError(error)) {
          await delay(retryDelayMs(attempt));
          continue;
        }

        throw error;
      }

      resetCircuitBreaker();

      if (response.status === 204) {
        return null;
      }

      return response.json();
    } catch (error) {
      const apiError = toRequestError(error);
      if (attempt < maxAttempts && shouldRetryError(apiError)) {
        await delay(retryDelayMs(attempt));
        continue;
      }

      recordFailureIfTransient(apiError);
      throw apiError;
    }
  }

  throw new ApiError("Request failed before a response was received.", { status: 0 });
}

function readStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const getItem = window.localStorage?.getItem;
  if (typeof getItem !== "function") {
    return null;
  }

  return getItem.call(window.localStorage, "clinicalOrderingAccessToken");
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function toApiError(response) {
  let message = `Request failed with status ${response.status}`;
  let fieldErrors = {};

  try {
    const errorBody = await response.json();
    fieldErrors = errorBody?.errors ?? {};
    if (errorBody?.message) {
      message = errorBody.message;
    }
    if (
      (message === "Validation failed." || !message) &&
      Object.keys(fieldErrors).length > 0
    ) {
      message = Object.values(fieldErrors)[0];
    }
  } catch {
    // Ignore JSON parsing failures and fall back to the status message.
  }

  return new ApiError(message, {
    status: response.status,
    fieldErrors,
  });
}

function toRequestError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error?.name === "AbortError") {
    return new ApiError("The request timed out. Please try again.", {
      status: 503,
    });
  }

  return new ApiError("Unable to reach the API. Make sure the backend is running.", {
    status: 0,
  });
}

function normalizeMethod(method) {
  return (method ?? "GET").toUpperCase();
}

function shouldRetryMethod(method) {
  return IDEMPOTENT_METHODS.has(method);
}

function shouldRetryError(error) {
  return error.status === 0 || RETRYABLE_SERVER_STATUSES.has(error.status);
}

function retryDelayMs(attempt) {
  return 200 * 2 ** (attempt - 1);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCircuitOpen() {
  return circuitBreakerState.openUntil > Date.now();
}

function recordFailureIfTransient(error) {
  if (!shouldRetryError(error)) {
    resetCircuitBreaker();
    return;
  }

  circuitBreakerState.consecutiveFailures += 1;
  if (circuitBreakerState.consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreakerState.openUntil = Date.now() + CIRCUIT_BREAKER_OPEN_MS;
  }
}

function resetCircuitBreaker() {
  circuitBreakerState.consecutiveFailures = 0;
  circuitBreakerState.openUntil = 0;
}

export function __resetApiClientStateForTests() {
  resetCircuitBreaker();
}

export function getPatients(query) {
  const params = new URLSearchParams();
  if (query?.trim()) {
    params.set("query", query.trim());
  }

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request(`/patients${suffix}`);
}

export function createPatient(payload) {
  return request("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getOrders(patientId) {
  const params = new URLSearchParams();
  if (patientId) {
    params.set("patientId", String(patientId));
  }

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request(`/orders${suffix}`);
}

export function createOrder(payload) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getReport(reportId) {
  return request(`/reports/${reportId}`);
}

export function assistReport(reportId, currentFindings, instruction = "") {
  return request(`/reports/${reportId}/assist`, {
    method: "POST",
    body: JSON.stringify({ currentFindings, instruction }),
  });
}

export function saveDraftReport(reportId, findings) {
  return request(`/reports/${reportId}/draft`, {
    method: "PUT",
    body: JSON.stringify({ findings }),
  });
}

export function finalizeReport(reportId, findings) {
  return request(`/reports/${reportId}/finalize`, {
    method: "POST",
    body: JSON.stringify({ findings }),
  });
}

export function amendReport(reportId, findings, note) {
  return request(`/reports/${reportId}/amend`, {
    method: "POST",
    body: JSON.stringify({ findings, amendmentReason: note }),
  });
}

export function cancelReport(reportId, note) {
  return request(`/reports/${reportId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ cancelReason: note }),
  });
}
