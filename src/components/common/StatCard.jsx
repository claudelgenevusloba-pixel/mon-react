export default function StatCard({
  className = "",
  onClick,
  children,
}) {
  const interactiveProps = onClick
    ? {
        role: "button",
        tabIndex: 0,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        },
      }
    : {};

  return (
    <article
      className={`app-stat-card ${className}`.trim()}
      onClick={onClick}
      {...interactiveProps}
    >
      {children}
    </article>
  );
}
