import { ArrowLeft, CircleHelp, House } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState, PageHeader } from "../components/common";
import { useLanguage } from "../context/LanguageContext";
import "./page404.css";

export default function Page404() {
  const { t } = useLanguage();

  return (
    <section className="not-found-page">
      <div className="not-found-page__card">
        <PageHeader
          className="not-found-page__header"
          eyebrow="GAIN OFFICE"
          title={t("Page introuvable")}
          description={t("Désolé, la page que vous recherchez n'existe pas ou a été déplacée.")}
          actions={
            <Link className="not-found-page__home" to="/">
              <House size={17} aria-hidden="true" />
              {t("Retour au tableau de bord")}
            </Link>
          }
        />
        <EmptyState
          icon={CircleHelp}
          title={t("Vérifiez l'adresse de la page")}
          description={t("Vous pouvez revenir en arrière ou retourner à l'accueil de l'application.")}
          action={
            <button
              type="button"
              className="not-found-page__home"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={17} aria-hidden="true" />
              {t("Page précédente")}
            </button>
          }
        />
      </div>
    </section>
  );
}
