import { useDeferredValue, useEffect, useRef, useState } from "react";
import {
  amendReport,
  assistReport,
  cancelReport,
  createOrder,
  createPatient,
  finalizeReport,
  getOrders,
  getPatients,
  getReport,
  saveDraftReport,
} from "./api/client";
import { OrderWorkspace } from "./components/OrderWorkspace";
import { PatientWorkspace } from "./components/PatientWorkspace";
import { ReportWorkspace } from "./components/ReportWorkspace";
import "./styles/app.css";

export default function App() {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [report, setReport] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [banner, setBanner] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [busy, setBusy] = useState(false);
  const [patientErrors, setPatientErrors] = useState({});
  const [orderErrors, setOrderErrors] = useState({});
  const [reportErrors, setReportErrors] = useState({});
  const [assistantSuggestion, setAssistantSuggestion] = useState(null);
  const [assistantBusy, setAssistantBusy] = useState(false);
  const reportRequestRef = useRef(0);
  const selectedOrderIdRef = useRef(null);

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ?? null;

  useEffect(() => {
    void loadPatients(deferredQuery);
  }, [deferredQuery]);

  useEffect(() => {
    if (!selectedPatientId) {
      setOrders([]);
      updateSelectedOrderId(null);
      cancelPendingReportLoad();
      resetReportWorkspace();
      setOrderErrors({});
      setReportErrors({});
      return;
    }

    setOrderErrors({});
    setReportErrors({});
    setOrders([]);
    updateSelectedOrderId(null);
    cancelPendingReportLoad();
    resetReportWorkspace();
    void loadOrders(selectedPatientId);
  }, [selectedPatientId]);

  async function loadPatients(nextQuery) {
    setLoadingPatients(true);
    try {
      const data = await getPatients(nextQuery);
      setPatients(data);
      setSelectedPatientId((current) => {
        if (current && data.some((patient) => patient.id === current)) {
          return current;
        }
        return data[0]?.id ?? null;
      });
    } catch (error) {
      setBanner({ tone: "error", text: error.message });
    } finally {
      setLoadingPatients(false);
    }
  }

  async function loadOrders(patientId, preferredOrderId = null) {
    setLoadingOrders(true);
    try {
      const data = await getOrders(patientId);
      setOrders(data);
      const nextOrder = resolveNextSelectedOrder(data, preferredOrderId);
      updateSelectedOrderId(nextOrder?.id ?? null);
      void loadOrderReport(nextOrder);
    } catch (error) {
      setBanner({ tone: "error", text: error.message });
    } finally {
      setLoadingOrders(false);
    }
  }

  async function loadOrderReport(order) {
    const requestId = reportRequestRef.current + 1;
    reportRequestRef.current = requestId;

    if (!order?.reportId) {
      setLoadingReport(false);
      resetReportWorkspace();
      return;
    }

    setLoadingReport(true);
    resetReportWorkspace();
    try {
      const data = await getReport(order.reportId);
      if (reportRequestRef.current !== requestId) {
        return;
      }
      setReport(data);
      setDraftText(data.findings ?? "");
      setActionNote("");
      setReportErrors({});
      setAssistantSuggestion(null);
    } catch (error) {
      if (reportRequestRef.current !== requestId) {
        return;
      }
      setBanner({ tone: "error", text: error.message });
    } finally {
      if (reportRequestRef.current === requestId) {
        setLoadingReport(false);
      }
    }
  }

  async function handleCreatePatient(payload) {
    setBusy(true);
    clearBanner();
    setPatientErrors({});
    try {
      const created = await createPatient(normalizePatientPayload(payload));
      const data = await getPatients("");
      setPatients(data);
      setQuery("");
      setSelectedPatientId(created.id);
      setBanner({
        tone: "success",
        text: `Patient ${created.lastName}, ${created.firstName} created.`,
      });
      return true;
    } catch (error) {
      setPatientErrors(error.fieldErrors ?? {});
      setBanner({ tone: "error", text: error.message });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateOrder(payload) {
    setBusy(true);
    clearBanner();
    setOrderErrors({});
    try {
      const created = await createOrder(payload);
      await loadOrders(payload.patientId, created.id);
      setBanner({
        tone: "success",
        text: `Order #${created.id} placed and draft report created.`,
      });
      return true;
    } catch (error) {
      setOrderErrors(error.fieldErrors ?? {});
      setBanner({ tone: "error", text: error.message });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveDraft() {
    if (!report) {
      return;
    }

    setBusy(true);
    clearBanner();
    setReportErrors({});
    try {
      const updated = await saveDraftReport(report.id, draftText);
      syncReport(updated);
      setBanner({ tone: "success", text: "Draft report saved." });
    } catch (error) {
      setReportErrors(mapReportFieldErrors(error.fieldErrors));
      setBanner({ tone: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleFinalize() {
    if (!report) {
      return;
    }

    const validationErrors = validateReportAction("finalize", draftText, actionNote);
    if (Object.keys(validationErrors).length > 0) {
      setReportErrors(validationErrors);
      setBanner({ tone: "error", text: Object.values(validationErrors)[0] });
      return;
    }

    setBusy(true);
    clearBanner();
    setReportErrors({});
    try {
      const updated = await finalizeReport(report.id, draftText);
      syncReport(updated);
      setBanner({ tone: "success", text: "Report finalized." });
    } catch (error) {
      setReportErrors(mapReportFieldErrors(error.fieldErrors));
      setBanner({ tone: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleAmend() {
    if (!report) {
      return;
    }

    const validationErrors = validateReportAction("amend", draftText, actionNote);
    if (Object.keys(validationErrors).length > 0) {
      setReportErrors(validationErrors);
      setBanner({ tone: "error", text: Object.values(validationErrors)[0] });
      return;
    }

    setBusy(true);
    clearBanner();
    setReportErrors({});
    try {
      const updated = await amendReport(report.id, draftText, actionNote);
      syncReport(updated);
      setActionNote("");
      setBanner({ tone: "success", text: "Report amended." });
    } catch (error) {
      setReportErrors(mapReportFieldErrors(error.fieldErrors));
      setBanner({ tone: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!report) {
      return;
    }

    const validationErrors = validateReportAction("cancel", draftText, actionNote);
    if (Object.keys(validationErrors).length > 0) {
      setReportErrors(validationErrors);
      setBanner({ tone: "error", text: Object.values(validationErrors)[0] });
      return;
    }

    setBusy(true);
    clearBanner();
    setReportErrors({});
    try {
      const updated = await cancelReport(report.id, actionNote);
      syncReport(updated);
      setActionNote("");
      setBanner({ tone: "success", text: "Report canceled." });
    } catch (error) {
      setReportErrors(mapReportFieldErrors(error.fieldErrors));
      setBanner({ tone: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateAssist() {
    if (!report) {
      return;
    }

    setAssistantBusy(true);
    clearBanner();
    try {
      const suggestion = await assistReport(report.id, draftText);
      setAssistantSuggestion(suggestion);
      setBanner({ tone: "success", text: "Assistant suggestion ready for review." });
    } catch (error) {
      setBanner({ tone: "error", text: error.message });
    } finally {
      setAssistantBusy(false);
    }
  }

  function handleApplyAssistantSuggestion() {
    if (!assistantSuggestion?.suggestedFindings) {
      return;
    }

    setDraftText(assistantSuggestion.suggestedFindings);
    setReportErrors((current) => withoutField(current, "findings"));
    setAssistantSuggestion(null);
    setBanner({ tone: "success", text: "Assistant suggestion applied to findings." });
  }

  function syncReport(updatedReport) {
    setReport(updatedReport);
    setDraftText(updatedReport.findings ?? "");
    setOrders((current) =>
      current.map((order) =>
        order.id === updatedReport.orderId
          ? {
              ...order,
              status: updatedReport.orderStatus,
              reportStatus: updatedReport.status,
            }
          : order,
      ),
    );
  }

  function clearBanner() {
    setBanner(null);
  }

  function handleSelectOrder(orderId) {
    if (
      selectedOrderIdRef.current === orderId &&
      report?.orderId === orderId &&
      !loadingReport
    ) {
      return;
    }

    clearBanner();
    setReportErrors({});
    updateSelectedOrderId(orderId);
    const nextOrder = orders.find((order) => order.id === orderId) ?? null;
    void loadOrderReport(nextOrder);
  }

  function updateSelectedOrderId(orderId) {
    selectedOrderIdRef.current = orderId;
    setSelectedOrderId(orderId);
  }

  function resetReportWorkspace() {
    setReport(null);
    setDraftText("");
    setActionNote("");
    setReportErrors({});
    setAssistantSuggestion(null);
  }

  function cancelPendingReportLoad() {
    reportRequestRef.current += 1;
    setLoadingReport(false);
  }

  function resolveNextSelectedOrder(availableOrders, preferredOrderId) {
    if (!Array.isArray(availableOrders) || availableOrders.length === 0) {
      return null;
    }

    if (preferredOrderId != null) {
      const preferredOrder = availableOrders.find((order) => order.id === preferredOrderId);
      if (preferredOrder) {
        return preferredOrder;
      }
    }

    if (selectedOrderIdRef.current != null) {
      const currentOrder = availableOrders.find(
        (order) => order.id === selectedOrderIdRef.current,
      );
      if (currentOrder) {
        return currentOrder;
      }
    }

    return availableOrders[0] ?? null;
  }

  function clearPatientError(field) {
    setPatientErrors((current) => withoutField(current, field));
  }

  function clearOrderError(field) {
    setOrderErrors((current) => withoutField(current, field));
  }

  function clearReportError(field) {
    setReportErrors((current) => withoutField(current, field));
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Clinical Ordering System MVP</p>
          <h1>Patient intake, echo ordering, and report lifecycle in one workspace.</h1>
        </div>
        <div className="hero-card">
          <span>Stack</span>
          <strong>Spring Boot + React</strong>
          <small>Iterative delivery with documented backlog and lifecycle rules.</small>
        </div>
      </header>

      {banner ? (
        <div className={`banner banner--${banner.tone}`}>{banner.text}</div>
      ) : null}

      <main className="workspace-grid">
        <PatientWorkspace
          patients={patients}
          query={query}
          selectedPatientId={selectedPatientId}
          loading={loadingPatients}
          busy={busy}
          errors={patientErrors}
          onQueryChange={setQuery}
          onSelectPatient={setSelectedPatientId}
          onClearError={clearPatientError}
          onCreatePatient={handleCreatePatient}
        />
        <OrderWorkspace
          patient={selectedPatient}
          orders={orders}
          selectedOrderId={selectedOrderId}
          loading={loadingOrders}
          busy={busy}
          errors={orderErrors}
          onSelectOrder={handleSelectOrder}
          onClearError={clearOrderError}
          onCreateOrder={handleCreateOrder}
        />
        <ReportWorkspace
          report={report}
          draftText={draftText}
          actionNote={actionNote}
          loading={loadingReport}
          busy={busy}
          assistantBusy={assistantBusy}
          assistantSuggestion={assistantSuggestion}
          errors={reportErrors}
          onDraftChange={(value) => {
            setDraftText(value);
            clearReportError("findings");
          }}
          onActionNoteChange={(value) => {
            setActionNote(value);
            clearReportError("actionNote");
          }}
          onSaveDraft={handleSaveDraft}
          onFinalize={handleFinalize}
          onAmend={handleAmend}
          onCancel={handleCancel}
          onGenerateAssist={handleGenerateAssist}
          onApplyAssistantSuggestion={handleApplyAssistantSuggestion}
          onDismissAssistantSuggestion={() => setAssistantSuggestion(null)}
        />
      </main>
    </div>
  );
}

function normalizePatientPayload(payload) {
  return {
    ...payload,
    dateOfBirth: payload.dateOfBirth || null,
    sex: payload.sex || null,
    phoneNumber: payload.phoneNumber || null,
    email: payload.email || null,
  };
}

function validateReportAction(action, findings, actionNote) {
  const errors = {};
  const trimmedFindings = findings.trim();
  const trimmedActionNote = actionNote.trim();

  if (action === "finalize" && !trimmedFindings) {
    errors.findings = "Findings are required to finalize a report.";
  }

  if (action === "amend") {
    if (!trimmedFindings) {
      errors.findings = "Findings are required to amend a report.";
    }
    if (!trimmedActionNote) {
      errors.actionNote = "Amendment reason is required.";
    }
  }

  if (action === "cancel" && !trimmedActionNote) {
    errors.actionNote = "Cancel reason is required.";
  }

  return errors;
}

function mapReportFieldErrors(fieldErrors = {}) {
  const reportFieldErrors = {};

  if (fieldErrors.findings) {
    reportFieldErrors.findings = fieldErrors.findings;
  }

  if (fieldErrors.amendmentReason) {
    reportFieldErrors.actionNote = fieldErrors.amendmentReason;
  }

  if (fieldErrors.cancelReason) {
    reportFieldErrors.actionNote = fieldErrors.cancelReason;
  }

  return reportFieldErrors;
}

function withoutField(errors, field) {
  if (!errors[field]) {
    return errors;
  }

  const next = { ...errors };
  delete next[field];
  return next;
}
