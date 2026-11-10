import { CheckCircle2, Clock3, Flag, RotateCcw } from "lucide-react";

const STATUS_STYLES = {
  "En cours": "progress",
  "En attente de validation": "validation",
  "Validée": "validated",
  "Correction demandée": "correction",
};

const PRIORITY_STYLES = {
  Basse: "low",
  Haute: "high",
  Urgente: "urgent",
};

function StatusIcon({ status }) {
  if (status === "Validée" || status === "En attente de validation") {
    return <CheckCircle2 size={13} aria-hidden="true" />;
  }

  if (status === "Correction demandée") {
    return <RotateCcw size={13} aria-hidden="true" />;
  }

  return <Clock3 size={13} aria-hidden="true" />;
}

export function TaskStatusBadge({ status, label }) {
  const style = STATUS_STYLES[status] || "todo";

  return (
    <span className={`task-status ${style}`}>
      <StatusIcon status={status} />
      {label}
    </span>
  );
}

export function TaskPriorityBadge({ priority, label }) {
  const style = PRIORITY_STYLES[priority] || "normal";

  return (
    <span className={`priority ${style}`}>
      <Flag size={12} aria-hidden="true" />
      {label}
    </span>
  );
}
