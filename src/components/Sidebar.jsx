import React from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  Building2,
  History,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { PERMISSIONS } from "../config/permissions";
import { aPermission } from "../config/access";
import { useLanguage } from "../context/LanguageContext";

import "../styles/components/sidebar.css";

function Sidebar({ utilisateur, onDeconnexion }) {
  const { t } = useLanguage();
  const nomEntreprise = "Groupe GAIN SARL";

  const peutVoir = (permission) => {
    return aPermission(utilisateur, permission);
  };

  const liens = [
    {
      to: "/dashboard",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      permission: PERMISSIONS.VOIR_DASHBOARD,
    },
    {
      to: "/employes",
      label: "Employés",
      icon: Users,
      permission: PERMISSIONS.VOIR_EMPLOYES,
    },
    {
      to: "/suivi-demandes",
      label: "Suivi des demandes",
      icon: FileText,
      permission: PERMISSIONS.VOIR_DEMANDES,
    },
    {
      to: "/historique",
      label: "Historique des actions",
      icon: History,
      permission: PERMISSIONS.VOIR_HISTORIQUE,
    },
    {
      to: "/taches",
      label: "Tâches",
      icon: ClipboardList,
      permission: PERMISSIONS.VOIR_TACHES,
    },
    {
      to: "/demandes",
      label: "Demandes",
      icon: FileText,
      permission: PERMISSIONS.VOIR_DEMANDES,
    },
    {
      to: "/rapports",
      label: "Rapports",
      icon: FileText,
      permission: PERMISSIONS.VOIR_RAPPORTS,
    },
  ];

  const liensAutorises = liens.filter((lien) =>
    peutVoir(lien.permission)
  );

  const peutVoirParametres = peutVoir(
    PERMISSIONS.VOIR_PARAMETRES
  );

  return (
    <aside className="app-sidebar">

      {/* =====================================================
          LOGO / ENTREPRISE
      ===================================================== */}

      <div className="sidebar-brand">

        <div className="sidebar-logo">
          <Building2
            size={26}
            strokeWidth={2.2}
          />
        </div>

        <div className="sidebar-brand-text">
          <strong>GAIN OFFICE</strong>
          <span>{nomEntreprise}</span>
        </div>

      </div>


      {/* =====================================================
          {t("MENU PRINCIPAL")}
      ===================================================== */}

      <nav className="sidebar-nav">

        <div className="sidebar-section-title">
          {t("MENU PRINCIPAL")}
        </div>

        {liensAutorises.map((lien) => {
          const Icon = lien.icon;

          return (
            <NavLink
              key={lien.to}
              to={lien.to}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              <Icon
                className="sidebar-link-icon"
                size={19}
                strokeWidth={2}
              />

              <span>{t(lien.label)}</span>
            </NavLink>
          );
        })}

      </nav>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="sidebar-footer">

        {/* PARAMÈTRES */}

        {peutVoirParametres && (
          <NavLink
            to="/parametres"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link sidebar-footer-link active"
                : "sidebar-link sidebar-footer-link"
            }
          >
            <Settings
              className="sidebar-link-icon"
              size={19}
              strokeWidth={2}
            />

            <span>{t("Paramètres")}</span>
          </NavLink>
        )}


      </div>

    </aside>
  );
}

export default Sidebar;
