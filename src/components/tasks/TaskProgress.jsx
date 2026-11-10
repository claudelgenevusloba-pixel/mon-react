export default function TaskProgress({ value, variant = "table" }) {
  const progress = Math.min(100, Math.max(0, Number(value) || 0));

  if (variant === "detail") {
    return (
      <div className="detail-progress">
        <div style={{ width: `${progress}%` }} />
      </div>
    );
  }

  return (
    <div className="task-progress-cell">
      <div className="progress-top">{progress}%</div>
      <div className="progress-track">
        <div className="progress-value" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
