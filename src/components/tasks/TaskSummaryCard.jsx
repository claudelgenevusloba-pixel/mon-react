export default function TaskSummaryCard({ icon: Icon, tone, label, value }) {
  return (
    <article className="summary-card">
      <div className={`summary-icon ${tone}`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
