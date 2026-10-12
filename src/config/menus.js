// src/config/menu.js

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Bell,
  Settings,
  BarChart3,
} from "lucide-react";


/**
 * =========================================================
 * GAIN OFFICE — MENU PRINCIPAL
 * =========================================================
 *
 * Le menu est filtré par access.js.
 *
 * permission = permission nécessaire pour afficher
 *              l'élément.
 */

const menu = [

  {
    id: "dashboard",

    label: "Tableau de bord",

    icon: LayoutDashboard,

    permission: "voir_dashboard",

    path: "/dashboard",
  },


  {
    id: "employes",

    label: "Employés",

    icon: Users,

    permission: "voir_employes",

    path: "/employes",
  },


  {
    id: "taches",

    label: "Tâches",

    icon: ClipboardList,

    permission: "voir_taches",

    path: "/taches",
  },


  {
    id: "demandes",

    label: "Demandes",

    icon: FileText,

    permission: "voir_demandes",

    path: "/demandes",
  },


  {
    id: "rapports",

    label: "Rapports",

    icon: BarChart3,

    permission: "voir_rapports",

    path: "/rapports",
  },


  {
    id: "notifications",

    label: "Notifications",

    icon: Bell,

    permission: "voir_notifications",

    path: "/notifications",
  },


  {
    id: "parametres",

    label: "Paramètres",

    icon: Settings,

    permission: "voir_parametres",

    path: "/parametres",
  },
];


export default menu;