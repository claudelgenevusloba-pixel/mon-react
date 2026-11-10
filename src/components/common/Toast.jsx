import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ICONES = {
  error: AlertCircle,
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
};

export default function Toast({
  message,
  type = "success",
  onClose,
  className = "",
}) {
  if (!message) return null;

  const Icon = ICONES[type] || ICONES.info;

  return (
    <div
      className={`app-toast app-toast--${type} ${type} ${className}`.trim()}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          className="app-toast__close"
          onClick={onClose}
          aria-label="Fermer la notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
