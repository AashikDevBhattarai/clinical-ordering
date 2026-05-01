const toneByStatus = {
  ORDERED: "ordered",
  DRAFT: "draft",
  FINALIZED: "finalized",
  AMENDED: "amended",
  CANCELED: "canceled",
  ROUTINE: "routine",
  URGENT: "urgent",
  STAT: "stat",
};

export function StatusBadge({ value }) {
  if (!value) {
    return null;
  }

  const tone = toneByStatus[value] ?? "neutral";
  return (
    <span className={`status-badge status-badge--${tone}`}>
      {String(value).replaceAll("_", " ")}
    </span>
  );
}

