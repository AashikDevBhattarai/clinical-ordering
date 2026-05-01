import { useState } from "react";

export function PatientWorkspace({
  patients,
  query,
  selectedPatientId,
  loading,
  busy,
  errors = {},
  onQueryChange,
  onSelectPatient,
  onClearError,
  onCreatePatient,
}) {
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    medicalRecordNumber: "",
    dateOfBirth: "",
    sex: "",
    phoneNumber: "",
    email: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();
    const created = await onCreatePatient(formState);
    if (created) {
      setFormState({
        firstName: "",
        lastName: "",
        medicalRecordNumber: "",
        dateOfBirth: "",
        sex: "",
        phoneNumber: "",
        email: "",
      });
    }
  }

  return (
    <section className="workspace-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Iteration 1</p>
          <h2>Patients</h2>
        </div>
      </div>

      <label className="field">
        <span>Search by name or MRN</span>
        <input
          data-testid="patient-search-input"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ada, Lovelace, MRN-1001"
        />
      </label>

      <div className="patient-list">
        {loading ? <p className="muted">Loading patients...</p> : null}
        {!loading && patients.length === 0 ? (
          <p className="muted">No patients found yet.</p>
        ) : null}
        {patients.map((patient) => {
          const selected = patient.id === selectedPatientId;
          return (
            <button
              type="button"
              key={patient.id}
              data-testid={`patient-row-${patient.id}`}
              className={`list-row ${selected ? "list-row--active" : ""}`}
              onClick={() => onSelectPatient(patient.id)}
            >
              <span className="list-row__title">
                {patient.lastName}, {patient.firstName}
              </span>
              <span className="list-row__meta">{patient.medicalRecordNumber}</span>
            </button>
          );
        })}
      </div>

      <form className="stacked-form" onSubmit={handleSubmit}>
        <div className="panel-subheader">
          <h3>Create Patient</h3>
          <p className="muted">Lightweight demographics for the MVP.</p>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>First name</span>
            <input
              data-testid="patient-first-name-input"
              value={formState.firstName}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  firstName: event.target.value,
                }))
              }
              aria-invalid={Boolean(errors.firstName)}
              onInput={() => onClearError?.("firstName")}
              required
            />
            {errors.firstName ? <span className="field-error">{errors.firstName}</span> : null}
          </label>
          <label className="field">
            <span>Last name</span>
            <input
              data-testid="patient-last-name-input"
              value={formState.lastName}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  lastName: event.target.value,
                }))
              }
              aria-invalid={Boolean(errors.lastName)}
              onInput={() => onClearError?.("lastName")}
              required
            />
            {errors.lastName ? <span className="field-error">{errors.lastName}</span> : null}
          </label>
          <label className="field">
            <span>MRN</span>
            <input
              data-testid="patient-mrn-input"
              value={formState.medicalRecordNumber}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  medicalRecordNumber: event.target.value,
                }))
              }
              aria-invalid={Boolean(errors.medicalRecordNumber)}
              onInput={() => onClearError?.("medicalRecordNumber")}
              required
            />
            {errors.medicalRecordNumber ? (
              <span className="field-error">{errors.medicalRecordNumber}</span>
            ) : null}
          </label>
          <label className="field">
            <span>Date of birth</span>
            <input
              data-testid="patient-dob-input"
              type="date"
              value={formState.dateOfBirth}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  dateOfBirth: event.target.value,
                }))
              }
              aria-invalid={Boolean(errors.dateOfBirth)}
              onInput={() => onClearError?.("dateOfBirth")}
            />
            {errors.dateOfBirth ? <span className="field-error">{errors.dateOfBirth}</span> : null}
          </label>
          <label className="field">
            <span>Sex</span>
            <input
              data-testid="patient-sex-input"
              value={formState.sex}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  sex: event.target.value,
                }))
              }
              aria-invalid={Boolean(errors.sex)}
              onInput={() => onClearError?.("sex")}
              placeholder="F / M / X"
            />
            {errors.sex ? <span className="field-error">{errors.sex}</span> : null}
          </label>
          <label className="field">
            <span>Phone number</span>
            <input
              data-testid="patient-phone-input"
              value={formState.phoneNumber}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  phoneNumber: event.target.value,
                }))
              }
              aria-invalid={Boolean(errors.phoneNumber)}
              onInput={() => onClearError?.("phoneNumber")}
            />
            {errors.phoneNumber ? <span className="field-error">{errors.phoneNumber}</span> : null}
          </label>
          <label className="field field--full">
            <span>Email</span>
            <input
              data-testid="patient-email-input"
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              aria-invalid={Boolean(errors.email)}
              onInput={() => onClearError?.("email")}
            />
            {errors.email ? <span className="field-error">{errors.email}</span> : null}
          </label>
        </div>

        <button
          className="primary-button"
          type="submit"
          disabled={busy}
          data-testid="save-patient-button"
        >
          {busy ? "Saving..." : "Save patient"}
        </button>
      </form>
    </section>
  );
}
