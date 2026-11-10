import { LockKeyhole } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import "./routing.css";

export default function AccessDenied() {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <section className="access-denied-page">
      <div className="access-denied-box">
        <LockKeyhole className="access-denied-icon" aria-hidden="true" />
        <h1>{t("Accès refusé")}</h1>
        <p>
          {t("Vous n'avez pas les permissions nécessaires pour accéder à cette page.")}
        </p>
        <small>
          {t("Page demandée :")} {location.pathname}
        </small>
      </div>
    </section>
  );
}
