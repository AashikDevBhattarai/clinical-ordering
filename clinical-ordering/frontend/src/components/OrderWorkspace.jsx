import { useEffect, useState } from "react";
import { StatusBadge } from "./StatusBadge";

export function OrderWorkspace({
  patient,
  orders,
  selectedOrderId,
  loading,
  busy,
  errors = {},
  onSelectOrder,
  onClearError,
  onCreateOrder,
}) {
  const [formState, setFormState] = useState({
    studyType: "ECHOCARDIOGRAM",
    priority: "ROUTINE",
    orderReason: "",
    orderedBy: "",
  });

  useEffect(() => {
    setFormState((current) => ({
      ...current,
      orderReason: "",
    }));
  }, [patient?.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!patient) {
      return;
    }

    const created = await onCreateOrder({
      patientId: patient.id,
      ...formState,
    });

    if (created) {
      setFormState((current) => ({
        ...current,
        orderReason: "",
      }));
    }
  }

  return (
    <section className="workspace-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Iteration 1</p>
          <h2>Orders</h2>
        </div>
      </div>

      {!patient ? (
        <div className="empty-card">
          <p>Select a patient to place an order.</p>
        </div>
      ) : (
        <>
          <div className="patient-summary">
            <div>
              <p className="eyebrow">Selected Patient</p>
              <h3>
                {patient.lastName}, {patient.firstName}
              </h3>
            </div>
            <div className="summary-meta">
              <span>MRN {patient.medicalRecordNumber}</span>
              <span>{patient.dateOfBirth || "DOB not captured"}</span>
            </div>
          </div>

          <form className="stacked-form" onSubmit={handleSubmit}>
            <div className="panel-subheader">
              <h3>Create Echo Order</h3>
              <p className="muted">
                A draft report is created automatically after order placement.
              </p>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Study type</span>
                <select
                  data-testid="study-type-select"
                  value={formState.studyType}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      studyType: event.target.value,
                    }))
                  }
                >
                  <option value="ECHOCARDIOGRAM">Echocardiogram</option>
                </select>
              </label>
              <label className="field">
                <span>Priority</span>
                <select
                  data-testid="order-priority-select"
                  value={formState.priority}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      priority: event.target.value,
                    }))
                  }
                >
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="STAT">Stat</option>
                </select>
              </label>
              <label className="field field--full">
                <span>Ordering provider</span>
                <input
                  data-testid="ordered-by-input"
                  value={formState.orderedBy}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      orderedBy: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(errors.orderedBy)}
                  onInput={() => onClearError?.("orderedBy")}
                  placeholder="Dr. Meredith Grey"
                  required
                />
                {errors.orderedBy ? <span className="field-error">{errors.orderedBy}</span> : null}
              </label>
              <label className="field field--full">
                <span>Clinical reason</span>
                <textarea
                  data-testid="order-reason-input"
                  rows="3"
                  value={formState.orderReason}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      orderReason: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(errors.orderReason)}
                  onInput={() => onClearError?.("orderReason")}
                  placeholder="Systolic murmur, evaluate LV function"
                  required
                />
                {errors.orderReason ? (
                  <span className="field-error">{errors.orderReason}</span>
                ) : null}
              </label>
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={busy}
              data-testid="place-order-button"
            >
              {busy ? "Placing..." : "Place order"}
            </button>
          </form>

          <div className="panel-subheader">
            <h3>Recent Orders</h3>
            {loading ? <p className="muted">Refreshing orders...</p> : null}
          </div>

          <div className="order-list">
            {orders.length === 0 && !loading ? (
              <p className="muted">No orders for this patient yet.</p>
            ) : null}
            {orders.map((order) => {
              const selected = order.id === selectedOrderId;
              return (
                <button
                  type="button"
                  key={order.id}
                  data-testid={`order-row-${order.id}`}
                  className={`list-row ${selected ? "list-row--active" : ""}`}
                  onClick={() => onSelectOrder(order.id)}
                >
                  <div className="list-row__split">
                    <span className="list-row__title">
                      #{order.id} {order.studyType.replaceAll("_", " ")}
                    </span>
                    <StatusBadge value={order.priority} />
                  </div>
                  <div className="list-row__split">
                    <StatusBadge value={order.status} />
                    <span className="list-row__meta">
                      Report {order.reportStatus}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
