/** En-tête réutilisable pour harmoniser les pages métier. */
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
  eyebrowClassName = "",
  titleClassName = "",
  descriptionClassName = "",
}) {
  return (
    <header className={`app-page-header ${className}`.trim()}>
      <div className="app-page-header__copy">
        {eyebrow && (
          <span
            className={`app-page-header__eyebrow ${eyebrowClassName}`.trim()}
          >
            {eyebrow}
          </span>
        )}

        <h1 className={`app-page-header__title ${titleClassName}`.trim()}>
          {title}
        </h1>

        {description && (
          <p
            className={`app-page-header__description ${descriptionClassName}`.trim()}
          >
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="app-page-header__actions">
          {actions}
        </div>
      )}
    </header>
  );
}
