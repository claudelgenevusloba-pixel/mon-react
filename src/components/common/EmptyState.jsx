import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  compact = false,
  className = "",
}) {
  return (
    <div
      className={[
        "app-empty-state",
        compact && "app-empty-state--compact",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
    >
      <Icon className="app-empty-state__icon" aria-hidden="true" />
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {action && <div className="app-empty-state__action">{action}</div>}
    </div>
  );
}
