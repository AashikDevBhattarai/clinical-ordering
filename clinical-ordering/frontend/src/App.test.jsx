import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import * as client from "./api/client";

vi.mock("./api/client", async () => {
  const actual = await vi.importActual("./api/client");
  return {
    ...actual,
    getPatients: vi.fn(),
    createPatient: vi.fn(),
    getOrders: vi.fn(),
    createOrder: vi.fn(),
    getReport: vi.fn(),
    assistReport: vi.fn(),
    saveDraftReport: vi.fn(),
    finalizeReport: vi.fn(),
    amendReport: vi.fn(),
    cancelReport: vi.fn(),
  };
});

describe("App", () => {
  const patient = {
    id: 1,
    firstName: "Ada",
    lastName: "Lovelace",
    medicalRecordNumber: "MRN-1001",
    dateOfBirth: "1984-12-10",
  };

  const order = {
    id: 10,
    patientId: 1,
    patientDisplayName: "Lovelace, Ada (MRN-1001)",
    studyType: "ECHOCARDIOGRAM",
    priority: "ROUTINE",
    orderReason: "Systolic murmur",
    orderedBy: "Dr. Grey",
    status: "ORDERED",
    reportId: 55,
    reportStatus: "DRAFT",
  };

  const secondOrder = {
    id: 11,
    patientId: 1,
    patientDisplayName: "Lovelace, Ada (MRN-1001)",
    studyType: "ECHOCARDIOGRAM",
    priority: "URGENT",
    orderReason: "Follow-up imaging",
    orderedBy: "Dr. Bailey",
    status: "FINALIZED",
    reportId: 56,
    reportStatus: "FINALIZED",
  };

  const report = {
    id: 55,
    orderId: 10,
    patientId: 1,
    patientDisplayName: "Lovelace, Ada (MRN-1001)",
    status: "DRAFT",
    orderStatus: "ORDERED",
    findings: "Initial draft findings",
    amendmentReason: null,
    cancelReason: null,
    finalizedAt: null,
    amendedAt: null,
    canceledAt: null,
  };

  const secondReport = {
    id: 56,
    orderId: 11,
    patientId: 1,
    patientDisplayName: "Lovelace, Ada (MRN-1001)",
    status: "FINALIZED",
    orderStatus: "FINALIZED",
    findings: "Follow-up report findings",
    amendmentReason: null,
    cancelReason: null,
    finalizedAt: "2026-04-28T14:00:00Z",
    amendedAt: null,
    canceledAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    client.getPatients.mockResolvedValue([patient]);
    client.getOrders.mockResolvedValue([order]);
    client.getReport.mockResolvedValue(report);
  });

  it("bootstraps the workflow and finalizes a report", async () => {
    const user = userEvent.setup();

    client.finalizeReport.mockResolvedValue({
      ...report,
      status: "FINALIZED",
      orderStatus: "FINALIZED",
      findings: "Final findings",
      finalizedAt: "2026-04-28T10:00:00Z",
    });

    render(<App />);

    expect(await screen.findByText("Selected Patient")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Initial draft findings")).toBeInTheDocument();

    await user.clear(screen.getByTestId("report-findings-input"));
    await user.type(screen.getByTestId("report-findings-input"), "Final findings");
    await user.click(screen.getByTestId("finalize-report-button"));

    await waitFor(() => {
      expect(client.finalizeReport).toHaveBeenCalledWith(55, "Final findings");
    });

    expect(await screen.findByText("Report finalized.")).toBeInTheDocument();
    expect(screen.getAllByText("FINALIZED").length).toBeGreaterThan(0);
  });

  it("creates a patient and selects the new record", async () => {
    const user = userEvent.setup();

    client.getPatients
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          ...patient,
          id: 2,
          firstName: "Grace",
          lastName: "Hopper",
          medicalRecordNumber: "MRN-1002",
        },
      ]);
    client.createPatient.mockResolvedValue({
      ...patient,
      id: 2,
      firstName: "Grace",
      lastName: "Hopper",
      medicalRecordNumber: "MRN-1002",
    });

    render(<App />);

    await user.type(screen.getByTestId("patient-first-name-input"), "Grace");
    await user.type(screen.getByTestId("patient-last-name-input"), "Hopper");
    await user.type(screen.getByTestId("patient-mrn-input"), "MRN-1002");
    await user.click(screen.getByTestId("save-patient-button"));

    await waitFor(() => {
      expect(client.createPatient).toHaveBeenCalledWith({
        firstName: "Grace",
        lastName: "Hopper",
        medicalRecordNumber: "MRN-1002",
        dateOfBirth: null,
        sex: null,
        phoneNumber: null,
        email: null,
      });
    });

    expect(await screen.findByText("Patient Hopper, Grace created.")).toBeInTheDocument();
  });

  it("blocks cancel locally when no cancel reason is provided", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByDisplayValue("Initial draft findings")).toBeInTheDocument();

    await user.click(screen.getByTestId("cancel-report-button"));

    expect(client.cancelReport).not.toHaveBeenCalled();
    expect((await screen.findAllByText("Cancel reason is required.")).length).toBeGreaterThan(0);
  });

  it("loads the report for the clicked recent order", async () => {
    const user = userEvent.setup();

    client.getOrders.mockResolvedValue([order, secondOrder]);
    client.getReport.mockImplementation(async (reportId) => {
      if (reportId === 56) {
        return secondReport;
      }
      return report;
    });

    render(<App />);

    expect(await screen.findByDisplayValue("Initial draft findings")).toBeInTheDocument();

    await user.click(screen.getByTestId("order-row-11"));

    await waitFor(() => {
      expect(client.getReport).toHaveBeenLastCalledWith(56);
    });

    expect(await screen.findByDisplayValue("Follow-up report findings")).toBeInTheDocument();
    expect(screen.getByText("Report #56")).toBeInTheDocument();
  });

  it("generates and applies an assistant report suggestion", async () => {
    const user = userEvent.setup();

    client.assistReport.mockResolvedValue({
      reportId: 55,
      suggestedFindings: "Assistant suggested findings",
      safetyNote: "Assistant output is a drafting aid only.",
      provider: "TEMPLATE_ASSISTANT",
    });

    render(<App />);

    expect(await screen.findByDisplayValue("Initial draft findings")).toBeInTheDocument();

    await user.click(screen.getByTestId("report-assist-button"));

    await waitFor(() => {
      expect(client.assistReport).toHaveBeenCalledWith(55, "Initial draft findings");
    });

    expect(await screen.findByDisplayValue("Assistant suggested findings")).toBeInTheDocument();

    await user.click(screen.getByTestId("apply-assist-suggestion-button"));

    expect(screen.getByTestId("report-findings-input")).toHaveValue(
      "Assistant suggested findings",
    );
    expect(screen.queryByTestId("report-assist-suggestion")).not.toBeInTheDocument();
  });
});
