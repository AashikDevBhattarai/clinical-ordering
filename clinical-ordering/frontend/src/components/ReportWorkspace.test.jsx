import { fireEvent, render, screen } from "@testing-library/react";
import { ReportWorkspace } from "./ReportWorkspace";

const baseProps = {
  draftText: "Normal LV function.",
  actionNote: "",
  loading: false,
  busy: false,
  onDraftChange: vi.fn(),
  onActionNoteChange: vi.fn(),
  onSaveDraft: vi.fn(),
  onFinalize: vi.fn(),
  onAmend: vi.fn(),
  onCancel: vi.fn(),
  onGenerateAssist: vi.fn(),
  onApplyAssistantSuggestion: vi.fn(),
  onDismissAssistantSuggestion: vi.fn(),
};

describe("ReportWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows draft actions for draft reports", () => {
    render(
      <ReportWorkspace
        {...baseProps}
        report={{
          id: 1,
          patientDisplayName: "Lovelace, Ada (MRN-1001)",
          status: "DRAFT",
          orderStatus: "ORDERED",
        }}
      />,
    );

    expect(screen.getByTestId("save-draft-button")).toBeEnabled();
    expect(screen.getByTestId("finalize-report-button")).toBeEnabled();
    expect(screen.getByTestId("amend-report-button")).toBeDisabled();
  });

  it("shows amend and cancel paths for finalized reports", () => {
    render(
      <ReportWorkspace
        {...baseProps}
        report={{
          id: 2,
          patientDisplayName: "Grey, Meredith (MRN-1002)",
          status: "FINALIZED",
          orderStatus: "FINALIZED",
        }}
      />,
    );

    expect(screen.getByTestId("save-draft-button")).toBeDisabled();
    expect(screen.getByTestId("finalize-report-button")).toBeDisabled();
    expect(screen.getByTestId("amend-report-button")).toBeEnabled();
    expect(screen.getByTestId("cancel-report-button")).toBeEnabled();
  });

  it("forwards action-note changes", () => {
    render(
      <ReportWorkspace
        {...baseProps}
        report={{
          id: 3,
          patientDisplayName: "Hopper, Grace (MRN-1003)",
          status: "FINALIZED",
          orderStatus: "FINALIZED",
        }}
      />,
    );

    fireEvent.change(screen.getByTestId("report-action-note-input"), {
      target: { value: "Correction" },
    });

    expect(baseProps.onActionNoteChange).toHaveBeenCalledWith("Correction");
  });

  it("renders inline validation errors for findings and action note", () => {
    render(
      <ReportWorkspace
        {...baseProps}
        errors={{
          findings: "Findings are required to finalize a report.",
          actionNote: "Cancel reason is required.",
        }}
        report={{
          id: 4,
          patientDisplayName: "Burke, Preston (MRN-1004)",
          status: "DRAFT",
          orderStatus: "ORDERED",
        }}
      />,
    );

    expect(screen.getByText("Findings are required to finalize a report.")).toBeInTheDocument();
    expect(screen.getByText("Cancel reason is required.")).toBeInTheDocument();
  });

  it("shows assistant suggestions and applies them on user action", () => {
    render(
      <ReportWorkspace
        {...baseProps}
        assistantSuggestion={{
          suggestedFindings: "Suggested report text",
          safetyNote: "Review before finalizing.",
          provider: "TEMPLATE_ASSISTANT",
        }}
        report={{
          id: 5,
          patientDisplayName: "Bailey, Miranda (MRN-1005)",
          status: "DRAFT",
          orderStatus: "ORDERED",
        }}
      />,
    );

    expect(screen.getByDisplayValue("Suggested report text")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("apply-assist-suggestion-button"));

    expect(baseProps.onApplyAssistantSuggestion).toHaveBeenCalled();
  });
});
