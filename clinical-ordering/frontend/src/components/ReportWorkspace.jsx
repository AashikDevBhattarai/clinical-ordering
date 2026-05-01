import { StatusBadge } from "./StatusBadge";

function actionHelpText(report) {
  if (!report) {
    return "Select an order to open the associated report.";
  }
  if (report.status === "DRAFT") {
    return "Draft reports can be saved repeatedly, finalized, or canceled with a reason.";
  }
  if (report.status === "FINALIZED") {
    return "Finalized reports can be amended with a reason or canceled with a reason.";
  }
  if (report.status === "AMENDED") {
    return "Amended reports are preserved as amended and may still be canceled with a reason.";
  }
  return "Canceled reports are read-only.";
}

export function ReportWorkspace({
  report,
  draftText,
  actionNote,
  loading,
  busy,
  assistantBusy = false,
  assistantSuggestion = null,
  errors = {},
  onDraftChange,
  onActionNoteChange,
  onSaveDraft,
  onFinalize,
  onAmend,
  onCancel,
  onGenerateAssist,
  onApplyAssistantSuggestion,
  onDismissAssistantSuggestion,
}) {
  const editable = report && report.status !== "CANCELED" && report.status !== "AMENDED";
  const canSaveDraft = report?.status === "DRAFT";
  const canFinalize = report?.status === "DRAFT";
  const canAmend = report?.status === "FINALIZED";
  const canCancel = report && report.status !== "CANCELED";
  const canUseAssistant = Boolean(editable);

  return (
    <section className="workspace-panel workspace-panel--report">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Iteration 2</p>
          <h2>Reporting</h2>
        </div>
      </div>

      {!report ? (
        <div className="empty-card">
          <p>{loading ? "Loading report..." : "Select an order to view its report."}</p>
        </div>
      ) : (
        <>
          <div className="report-summary">
            <div className="summary-heading">
              <div>
                <p className="eyebrow">Report #{report.id}</p>
                <h3>{report.patientDisplayName}</h3>
              </div>
              <div className="badge-stack">
                <StatusBadge value={report.status} />
                <StatusBadge value={report.orderStatus} />
              </div>
            </div>
            <p className="muted">{actionHelpText(report)}</p>
          </div>

          <label className="field">
            <span>Findings</span>
            <textarea
              data-testid="report-findings-input"
              rows="12"
              value={draftText}
              onChange={(event) => onDraftChange(event.target.value)}
              aria-invalid={Boolean(errors.findings)}
              readOnly={!editable}
              placeholder="Left ventricle size and systolic function..."
            />
            {errors.findings ? <span className="field-error">{errors.findings}</span> : null}
          </label>

          <div className="assistant-panel">
            <div className="assistant-panel__header">
              <div>
                <p className="eyebrow">LLM Assist</p>
                <strong>Report text suggestion</strong>
              </div>
              <button
                className="secondary-button"
                type="button"
                disabled={!canUseAssistant || busy || assistantBusy}
                onClick={onGenerateAssist}
                data-testid="report-assist-button"
              >
                {assistantBusy ? "Drafting..." : "Suggest text"}
              </button>
            </div>
            {assistantSuggestion ? (
              <div className="assistant-suggestion">
                <p className="muted">{assistantSuggestion.safetyNote}</p>
                <textarea
                  data-testid="report-assist-suggestion"
                  rows="8"
                  readOnly
                  value={assistantSuggestion.suggestedFindings}
                />
                <div className="action-row action-row--compact">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={onApplyAssistantSuggestion}
                    data-testid="apply-assist-suggestion-button"
                  >
                    Use suggestion
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={onDismissAssistantSuggestion}
                    data-testid="dismiss-assist-suggestion-button"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <label className="field">
            <span>Action note / reason</span>
            <textarea
              data-testid="report-action-note-input"
              rows="3"
              value={actionNote}
              onChange={(event) => onActionNoteChange(event.target.value)}
              aria-invalid={Boolean(errors.actionNote)}
              placeholder="Required for amendment and cancel."
              readOnly={!canAmend && !canCancel}
            />
            {errors.actionNote ? <span className="field-error">{errors.actionNote}</span> : null}
          </label>

          <div className="action-row">
            <button
              className="secondary-button"
              type="button"
              disabled={!canSaveDraft || busy}
              onClick={onSaveDraft}
              data-testid="save-draft-button"
            >
              Save draft
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={!canFinalize || busy}
              onClick={onFinalize}
              data-testid="finalize-report-button"
            >
              Finalize report
            </button>
            <button
              className="secondary-button secondary-button--accent"
              type="button"
              disabled={!canAmend || busy}
              onClick={onAmend}
              data-testid="amend-report-button"
            >
              Amend report
            </button>
            <button
              className="ghost-button"
              type="button"
              disabled={!canCancel || busy}
              onClick={onCancel}
              data-testid="cancel-report-button"
            >
              Cancel report
            </button>
          </div>

          <dl className="audit-grid">
            <div>
              <dt>Finalized</dt>
              <dd>{report.finalizedAt || "Not finalized"}</dd>
            </div>
            <div>
              <dt>Amended</dt>
              <dd>{report.amendedAt || "Not amended"}</dd>
            </div>
            <div>
              <dt>Canceled</dt>
              <dd>{report.canceledAt || "Not canceled"}</dd>
            </div>
            <div>
              <dt>Latest note</dt>
              <dd>{report.amendmentReason || report.cancelReason || "None"}</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}
