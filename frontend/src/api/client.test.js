import {
  __resetApiClientStateForTests,
  cancelReport,
  createPatient,
  getPatients,
} from "./client";

describe("api client", () => {
  beforeEach(() => {
    __resetApiClientStateForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    __resetApiClientStateForTests();
  });

  it("surfaces the first field-level validation error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message: "Validation failed.",
          errors: {
            cancelReason: "Cancel reason is required.",
          },
        }),
      }),
    );

    await expect(cancelReport(3, "")).rejects.toMatchObject({
      message: "Cancel reason is required.",
      fieldErrors: {
        cancelReason: "Cancel reason is required.",
      },
      status: 400,
    });
  });

  it("retries transient GET failures and eventually succeeds", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });
    vi.stubGlobal("fetch", fetchMock);

    const request = getPatients("");
    await vi.runAllTimersAsync();

    await expect(request).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-idempotent write requests", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createPatient({
        firstName: "Meredith",
        lastName: "Grey",
        medicalRecordNumber: "MRN-3001",
      }),
    ).rejects.toMatchObject({
      message: "Unable to reach the API. Make sure the backend is running.",
      status: 0,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("opens the circuit breaker after repeated transient failures", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        message: "Reporting service unavailable.",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const request = getPatients("");
      const rejection = expect(request).rejects.toMatchObject({
        message: "Reporting service unavailable.",
        status: 503,
      });
      await vi.runAllTimersAsync();
      await rejection;
    }

    await expect(getPatients("")).rejects.toMatchObject({
      message: "API temporarily unavailable. Please wait a few seconds and try again.",
      status: 503,
      circuitOpen: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(9);
  });
});
