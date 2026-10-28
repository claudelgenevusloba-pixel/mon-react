import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LanguageContext = createContext(null);
const LANGUAGE_KEY = "gainOfficeLangue";
const DATE_FORMAT_KEY = "gainOfficeFormatDate";
const DEFAULT_LANGUAGE = "Français";
const DEFAULT_DATE_FORMAT = "DD/MM/YYYY";
const DATE_FORMATS = new Set(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]);

export function formaterDateSelonPreference(value, fallback = "—") {
  if (!value) return fallback;

  let date;
  if (value instanceof Date) {
    date = value;
  } else {
    const text = String(value);
    const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    date = dateOnly
      ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
      : new Date(text);
  }

  if (Number.isNaN(date.getTime())) return String(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  const format = localStorage.getItem(DATE_FORMAT_KEY);

  switch (DATE_FORMATS.has(format) ? format : DEFAULT_DATE_FORMAT) {
    case "MM/DD/YYYY": return `${month}/${day}/${year}`;
    case "YYYY-MM-DD": return `${year}-${month}-${day}`;
    default: return `${day}/${month}/${year}`;
  }
}

const translations = {
  English: {
    "Tableau de bord": "Dashboard",
    "Employés": "Employees",
    "Suivi des demandes": "Request tracking",
    "Tâches": "Tasks",
    "Demandes": "Requests",
    "Rapports": "Reports",
    "Paramètres": "Settings",
    "MENU PRINCIPAL": "MAIN MENU",
    "Gestion administrative": "Administrative management",
    "Notification": "Notification",
    "RECHERCHE": "SEARCH",
    "Rechercher...": "Search...",
    "Notifications": "Notifications",
    "non lue": "unread",
    "non lues": "unread",
    "Tout marquer comme lu": "Mark all as read",
    "Fermer les notifications": "Close notifications",
    "Chargement...": "Loading...",
    "Aucune notification": "No notifications",
    "Nouvelle notification": "New notification",
    "Mon profil": "My profile",
    "Profil": "Profile",
    "Sécurité": "Security",
    "Entreprise": "Company",
    "Gérez votre profil, votre sécurité et vos préférences.": "Manage your profile, security, and preferences.",
    "Enregistrer": "Save",
    "PARAMÈTRES": "SETTINGS",
    "Réinitialiser mes préférences": "Reset my preferences",
    "Gérez les informations de votre profil professionnel.": "Manage your work profile information.",
    "Nom complet": "Full name",
    "Prénom": "First name",
    "Adresse e-mail": "Email address",
    "Téléphone": "Phone",
    "Fonction": "Role",
    "Enregistrer le profil": "Save profile",
    "Protégez votre compte et gérez votre mot de passe.": "Protect your account and manage your password.",
    "Sécurité du compte": "Account security",
    "Votre mot de passe doit être difficile à deviner.": "Your password should be difficult to guess.",
    "Mot de passe actuel": "Current password",
    "Nouveau mot de passe": "New password",
    "Confirmer le nouveau mot de passe": "Confirm new password",
    "Choisissez les notifications que vous souhaitez recevoir.": "Choose which notifications you want to receive.",
    "Notifications par e-mail": "Email notifications",
    "Recevoir les notifications importantes par e-mail.": "Receive important notifications by email.",
    "Notifications de l'application": "In-app notifications",
    "Afficher les notifications dans GAIN OFFICE.": "Show notifications in GAIN OFFICE.",
    "Notifications des tâches": "Task notifications",
    "Recevoir les changements concernant vos tâches.": "Receive updates about your tasks.",
    "Notifications des demandes": "Request notifications",
    "Être informé des nouvelles demandes et de leur traitement.": "Get updates about new requests and their progress.",
    "Notifications des messages": "Message notifications",
    "Recevoir les notifications de nouveaux messages.": "Receive notifications about new messages.",
    "Enregistrer les préférences": "Save preferences",
    "Personnalisez vos préférences personnelles dans GAIN OFFICE.": "Customize your personal preferences in GAIN OFFICE.",
    "Afficher ma photo": "Show my photo",
    "Autoriser l'affichage de ma photo de profil.": "Allow my profile photo to be displayed.",
    "Enregistrer mes préférences": "Save my preferences",
    "Gérez les informations de votre entreprise.": "Manage your company information.",
    "Nom de l'entreprise": "Company name",
    "E-mail": "Email",
    "Adresse": "Address",
    "Enregistrer l'entreprise": "Save company",
    "RAPPORTS PÉRIODIQUES": "PERIODIC REPORTS",
    "Périodicité, échéances, rappels et validations des rapports.": "Report frequency, deadlines, reminders, and approvals.",
    "Périodicité des rapports": "Report frequency",
    "Non définie (aucune imposée)": "Not set (no requirement)",
    "Quotidienne": "Daily",
    "Hebdomadaire": "Weekly",
    "Mensuelle": "Monthly",
    "Délai de soumission (jours après la période)": "Submission deadline (days after period)",
    "Niveaux de validation": "Approval levels",
    "Rappels d'échéance": "Deadline reminders",
    "Notifier les rapports en retard": "Notify about overdue reports",
    "Enregistrer la configuration": "Save configuration",
    "Ex. Jean": "e.g. Jean",
    "Ex. 07 00 00 00 00": "e.g. 07 00 00 00 00",
    "Ex. : 2": "e.g. 2",
    "Déconnexion": "Sign out",
    "Modifier le mot de passe": "Change password",
    "Modification...": "Updating...",
    "Gérez les informations associées à votre compte.": "Manage the information associated with your account.",
    "Gérez les informations générales de Groupe GAIN SARL.": "Manage Groupe GAIN SARL's general information.",
    "Gérez votre profil, votre sécurité et vos préférences personnelles.": "Manage your profile, security, and personal preferences.",
    "Autoriser l'affichage de": "Allow display of",
    "Rapports périodiques": "Periodic reports",
    "Périodicité, échéances, rappels et circuit de validation des rapports.": "Report frequency, deadlines, reminders, and approval workflow.",
    "Rappels d'échéance": "Deadline reminders",
    "Être informé des nouvelles demandes et décisions.": "Get updates about new requests and decisions.",
    "Afficher les notifications directement dans GAIN OFFICE.": "Show notifications directly in GAIN OFFICE.",
    "Recevoir les notifications lorsqu'un message est reçu.": "Receive notifications when a message arrives.",
    "Utilisateur": "User",
    "Employé": "Employee",
    "Accès refusé": "Access denied",
    "Vous n'avez pas les permissions nécessaires pour accéder à cette page.":
      "You do not have permission to access this page.",
    "Page demandée :": "Requested page:",
    "Vous n'avez pas l'autorisation d'accéder aux paramètres.":
      "You are not authorized to access settings.",
    "Préférences": "Preferences",
    "Personnalisez vos préférences personnelles dans GAIN OFFICE.":
      "Customize your personal preferences in GAIN OFFICE.",
    "Langue": "Language",
    "Français": "French",
    "English": "English",
    "Format de date": "Date format",
    "Afficher la photo de profil": "Show profile photo",
    "Enregistrer les préférences": "Save preferences",
    "Réinitialiser les préférences": "Reset preferences",
    "Vos préférences ont été enregistrées.": "Your preferences have been saved.",
    "Impossible d'enregistrer vos préférences.": "Could not save your preferences.",
    "Voulez-vous vraiment réinitialiser vos préférences personnelles ?":
      "Are you sure you want to reset your personal preferences?",
    "Vos préférences ont été réinitialisées.": "Your preferences have been reset.",
    "Impossible de réinitialiser vos préférences.": "Could not reset your preferences.",
    "Suivi des demandes": "Request tracking",
    "Tableau de suivi des demandes avec recherche, filtres, tri et pagination.":
      "Track requests with search, filters, sorting, and pagination.",
    "Rechercher une demande...": "Search requests...",
    "Tous les types": "All types",
    "Tous les statuts": "All statuses",
    "Réinitialiser": "Reset",
    "Chargement du suivi des demandes...": "Loading request tracking...",
    "Aucune demande disponible.": "No requests available.",
    "Détail de la demande": "Request details",
    "Fermer": "Close",
    "Type": "Type",
    "Statut": "Status",
    "Demandeur": "Requester",
    "Date": "Date",
    "Traiteur": "Processed by",
    "Objet": "Subject",
    "Description": "Description",
    "Demandes par page": "Requests per page",
    "sur": "of",
    "Tous": "All",
    "En attente": "Pending",
    "Acceptée": "Accepted",
    "Acceptées": "Accepted",
    "Refusée": "Declined",
    "Refusées": "Declined",
    "Annulée": "Cancelled",
    "Congé": "Leave",
    "Absence": "Absence",
    "Document": "Document",
    "En cours": "In progress",
    "Terminée": "Completed",
    "Terminé": "Completed",
    "Échéance": "Due date",
    "Date de début": "Start date",
    "Rechercher une tâche...": "Search tasks...",
    "Enregistrer": "Save",
    "Annuler": "Cancel",
    "Enregistrer les modifications": "Save changes",
    "Aucune donnée disponible": "No data available",
    "Aucun résultat": "No results",
    "Nouvelle demande": "New request",
    "Nouvelle tâche": "New task",
    "Nouvel employé": "New employee",
    "Voir": "View",
    "Modifier": "Edit",
    "Supprimer": "Delete",
    "Envoyer": "Send",
    "Confirmer": "Confirm",
    "Oui": "Yes",
    "Non": "No",
    "Vérification de votre invitation...": "Checking your invitation...",
    "Veuillez patienter pendant que nous vérifions votre lien d'activation.": "Please wait while we verify your activation link.",
    "Activation indisponible": "Activation unavailable",
    "Aller à la connexion": "Go to sign in",
    "Compte activé !": "Account activated!",
    "Votre compte GAIN OFFICE a été activé avec succès.": "Your GAIN OFFICE account has been activated successfully.",
    "Vous pouvez maintenant vous connecter avec :": "You can now sign in with:",
    "Gestion professionnelle": "Professional management",
    "Activez votre compte": "Activate your account",
    "Bienvenue": "Welcome",
    "Votre compte professionnel GAIN OFFICE a été créé par l'administration.": "Your GAIN OFFICE work account was created by the administrator.",
    "E-mail personnel *": "Personal email *",
    "Téléphone personnel": "Personal phone",
    "Date de naissance": "Date of birth",
    "Votre ville": "Your city",
    "Confirmer le mot de passe": "Confirm password",
    "Activation...": "Activating...",
    "Activer mon compte": "Activate my account",
    "Votre mot de passe est sécurisé et ne sera jamais transmis par WhatsApp.": "Your password is secure and will never be shared through WhatsApp.",
    "Chargement du tableau de bord...": "Loading dashboard...",
    "Récupération des données GAIN OFFICE": "Retrieving GAIN OFFICE data",
    "Impossible de charger le dashboard": "Could not load the dashboard",
    "Réessayer": "Try again",
    "Bonjour,": "Hello,",
    "Gérer les employés": "Manage employees",
    "Voir les demandes": "View requests",
    "Actifs": "Active",
    "employés au total": "employees in total",
    "Effectif actuel": "Current headcount",
    "terminées": "completed",
    "validées": "approved",
    "à traiter": "to process",
    "Avancement": "Progress",
    "tâches terminées": "tasks completed",
    "Progression des tâches": "Task progress",
    "Suivi global des activités": "Overall activity tracking",
    "Terminées": "Completed",
    "En retard": "Overdue",
    "État du traitement": "Processing status",
    "% validées": "% approved",
    "TÂCHES": "TASKS",
    "Tâches récentes": "Recent tasks",
    "Voir tout": "View all",
    "Aucune tâche": "No tasks",
    "Aucune tâche à afficher pour votre espace.": "There are no tasks to show in your workspace.",
    "Créer une tâche": "Create a task",
    "ACTIVITÉ": "ACTIVITY",
    "Activité récente": "Recent activity",
    "Aucune activité récente": "No recent activity",
    "Les nouvelles activités apparaîtront ici.": "New activity will appear here.",
    "DEMANDES": "REQUESTS",
    "Dernières demandes": "Latest requests",
    "Aucune demande": "No requests",
    "Aucune demande enregistrée.": "No requests have been recorded.",
    "Faire une demande": "Make a request",
    "NOTIFICATIONS": "NOTIFICATIONS",
    "À ne pas manquer": "Don't miss",
    "Vous êtes à jour.": "You're all caught up.",
    "Tâches en retard": "Overdue tasks",
    "Demandes acceptées": "Accepted requests",
    "Demandes refusées": "Declined requests",
    "Plateforme interne de gestion des collaborateurs, tâches, demandes et activités de Groupe GAIN SARL.": "Internal platform for managing Groupe GAIN SARL employees, tasks, requests, and activities.",
    "Système opérationnel": "System operational",
    "Les informations affichées proviennent du système GAIN OFFICE et de votre API Laravel.": "The information shown comes from GAIN OFFICE and your Laravel API.",
    "Suivi en temps réel": "Real-time tracking",
    "Le tableau de bord est automatiquement actualisé toutes les 60 secondes.": "The dashboard refreshes automatically every 60 seconds.",
    "Accès non autorisé": "Unauthorized access",
    "Vous n'avez pas la permission d'accéder au module des demandes.": "You do not have permission to access the requests module.",
    "Total": "Total",
    "Aucune demande trouvée": "No requests found",
    "Aucune demande ne correspond à vos critères.": "No requests match your criteria.",
    "NOUVELLE DEMANDE": "NEW REQUEST",
    "Envoyer une demande": "Submit a request",
    "Remplissez les informations nécessaires.": "Fill in the required information.",
    "Type de demande": "Request type",
    "Message": "Message",
    "Expliquez votre demande...": "Explain your request...",
    "Envoyer la demande": "Submit request",
    "DÉTAIL DE LA DEMANDE": "REQUEST DETAILS",
    "Informations relatives à cette demande.": "Information about this request.",
    "Traitement de la demande": "Request processing",
    "Choisissez une décision.": "Choose a decision.",
    "Refuser": "Decline",
    "Accepter": "Accept",
    "Cette demande a été acceptée.": "This request has been accepted.",
    "Cette demande a été refusée.": "This request has been declined.",
    "Voir le profil": "View profile",
    "Copier l'e-mail": "Copy email",
    "Désactiver": "Deactivate",
    "Activer": "Activate",
    "Renvoyer l'invitation": "Resend invitation",
    "Vous n'avez pas l'autorisation d'accéder à la gestion des employés.": "You are not authorized to access employee management.",
    "Gestion des employés": "Employee management",
    "Gérez les collaborateurs, leurs accès et leurs informations.": "Manage employees, their access, and their information.",
    "Inviter un employé": "Invite an employee",
    "Total employés": "Total employees",
    "Employés actifs": "Active employees",
    "Invitations en attente": "Pending invitations",
    "Responsables": "Managers",
    "Tous les rôles": "All roles",
    "Tous les statuts": "All statuses",
    "Inactif": "Inactive",
    "Collaborateurs": "Employees",
    "résultat(s)": "result(s)",
    "Chargement des employés...": "Loading employees...",
    "Aucun employé trouvé": "No employees found",
    "Modifiez vos filtres ou ajoutez un collaborateur.": "Change your filters or add an employee.",
    "Poste": "Position",
    "Service": "Department",
    "Arrivée": "Start date",
    "Affichage de": "Showing",
    "à": "to",
    "sur": "of",
    "Page": "Page",
    "Prénom *": "First name *",
    "Nom *": "Last name *",
    "E-mail *": "Email *",
    "Téléphone / WhatsApp": "Phone / WhatsApp",
    "Matricule *": "Employee number *",
    "Rôle *": "Role *",
    "Sélectionner un rôle": "Select a role",
    "Sélectionner": "Select",
    "Poste *": "Position *",
    "Supérieur hiérarchique": "Supervisor",
    "Aucun (à définir plus tard)": "None (set later)",
    "Date d'embauche": "Hire date",
    "L’invitation sera envoyée automatiquement par e-mail à l’adresse renseignée. Après la création, vous pourrez aussi partager le lien d’activation par QR code ou WhatsApp.": "The invitation will be sent automatically by email to the address provided. After the account is created, you can also share the activation link by QR code or WhatsApp.",
    "Profil employé": "Employee profile",
    "Informations du collaborateur.": "Employee information.",
    "Copier": "Copy",
    "Date d'arrivée": "Start date",
    "Fermer": "Close",
    "Désactiver l'employé ?": "Deactivate this employee?",
    "Le compte de": "The account for",
    "sera désactivé.": "will be deactivated.",
    "QR code d'inscription": "Registration QR code",
    "QR code expiré — demandez un nouveau via « Renvoyer l'invitation ». ": "QR code expired — request a new one using ‘Resend invitation’.",
    "Expire dans": "Expires in",
    "L'employé scanne ce code avec son téléphone, complète ses informations personnelles et choisit son mot de passe. Le QR code est utilisable une seule fois.": "The employee scans this code with their phone, completes their personal information, and chooses a password. The QR code can only be used once.",
    "Copier le lien": "Copy link",
    "Envoyer par WhatsApp": "Send through WhatsApp",
    "ESPACE PROFESSIONNEL": "WORKSPACE",
    "Plateforme professionnelle de gestion administrative de Groupe GAIN SARL.": "Groupe GAIN SARL's professional administrative management platform.",
    "Gestion des tâches": "Task management",
    "Rapports et notifications": "Reports and notifications",
    "Connectez-vous à votre espace de gestion.": "Sign in to your workspace.",
    "Mot de passe oublié ?": "Forgot password?",
    "Connexion en cours...": "Signing in...",
    "Connexion sécurisée": "Secure sign-in",
    "Mot de passe oublié": "Forgot password",
    "Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.": "Enter your email address to receive a password reset link.",
    "Retour à la connexion": "Back to sign in",
    "page404": "Page not found",
    "Désolé, la page que vous recherchez n'existe pas.": "Sorry, the page you are looking for does not exist.",
    "Validé": "Approved",
    "Refusé": "Declined",
    "Correction demandée": "Changes requested",
    "En cours d'examen": "Under review",
    "Soumis": "Submitted",
    "Rapports": "Reports",
    "Suivi et consultation des rapports de tâches": "Track and review task reports",
    "Nouveau rapport": "New report",
    "Actualiser": "Refresh",
    "Total rapports": "Total reports",
    "Liste des rapports": "Reports list",
    "rapport": "report",
    "Production autorisée": "Production authorized",
    "Chargement des rapports...": "Loading reports...",
    "SOUMISSION": "SUBMISSION",
    "Nouveau rapport périodique": "New periodic report",
    "Votre rapport sera transmis à votre supérieur hiérarchique direct.": "Your report will be sent to your direct supervisor.",
    "Période du début": "Period start",
    "Période de fin": "Period end",
    "Travail effectué *": "Work completed *",
    "Difficultés rencontrées": "Challenges encountered",
    "Commentaire": "Comment",
    "CONSULTATION": "REVIEW",
    "Supérieur destinataire": "Receiving supervisor",
    "Motif de la décision": "Reason for decision",
    "Historique des étapes": "Step history",
    "— niveau": "— level",
    "Contrôle": "Review",
    "Vous disposez de l'autorisation de contrôle des rapports.": "You are authorized to review reports.",
    "Décision": "Decision",
    "Demander une correction": "Request changes",
    "GESTION DES TÂCHES": "TASK MANAGEMENT",
    "Tableau de bord des tâches": "Task dashboard",
    "Suivez et gérez les tâches de Groupe GAIN SARL": "Track and manage Groupe GAIN SARL tasks",
    "À faire": "To do",
    "Toutes priorités": "All priorities",
    "Tous services": "All departments",
    "TÂCHE": "TASK",
    "EXÉCUTANT": "ASSIGNEE",
    "SERVICE": "DEPARTMENT",
    "PRIORITÉ": "PRIORITY",
    "ÉCHÉANCE": "DUE DATE",
    "STATUT": "STATUS",
    "PROGRESSION": "PROGRESS",
    "ACTIONS": "ACTIONS",
    "Tâche(s) sur": "Task(s) out of",
    "Titre de la tâche": "Task title",
    "Description": "Description",
    "Décrivez le travail à réaliser...": "Describe the work to be done...",
    "Exécutant": "Assignee",
    "Sélectionner un collaborateur": "Select an employee",
    "Sélectionner un service": "Select a department",
    "Priorité": "Priority",
    "Date de début": "Start date",
    "Date d'échéance": "Due date",
    "DÉTAILS DE LA TÂCHE": "TASK DETAILS",
    "Créée par": "Created by",
    "Travail terminé": "Work completed",
    "À vérifier": "Needs review",
    "L'exécutant a déclaré cette tâche terminée. Vérifiez le travail avant de procéder à la validation.": "The assignee marked this task as complete. Review the work before approving it.",
    "Valider la tâche": "Approve task",
    "Discussion": "Discussion",
    "commentaire(s)": "comment(s)",
    "Aucun commentaire pour le moment.": "No comments yet.",
    "Utilisez le champ ci-dessous pour démarrer la discussion.": "Use the field below to start the discussion.",
    "Déclarer terminée": "Mark as complete",
    "Commencer la tâche": "Start task",
    "Se connecter": "Sign in",
    "G": "G",
    "GAIN OFFICE": "GAIN OFFICE",
    "Groupe GAIN SARL": "GAIN Group Ltd.",
    "votre.adresse@personnelle.com": "your.personal@email.com",
    "+225 07 00 00 00 00": "+225 07 00 00 00 00",
    "Quartier, ville...": "Neighborhood, city...",
    "Ville": "City",
    "Minimum 8 caractères": "At least 8 characters",
    "Répétez votre mot de passe": "Re-enter your password",
    "en cours": "in progress",
    "en attente": "pending",
    "Progression": "Progress",
    "Tâches terminées": "Completed tasks",
    "Objet de votre demande": "Request subject",
    "Rechercher un employé...": "Search employees...",
    "Actif": "Active",
    "Rôle": "Role",
    "Plus": "More",
    "07 00 00 00 00": "07 00 00 00 00",
    "Laisser vide pour conserver": "Leave blank to keep current",
    "Matricule": "Employee number",
    "QR code expiré — demandez un nouveau via « Renvoyer l'invitation ».": "QR code expired — request a new one using ‘Resend invitation’. ",
    "exemple@gain.ci": "example@gain.ci",
    "Mot de passe": "Password",
    "Votre mot de passe": "Your password",
    "© Groupe GAIN SARL 2026": "© GAIN Group Ltd. 2026",
    "Impossible de réinitialiser les préférences.": "Could not reset preferences.",
    "Autoriser l'affichage de votre avatar dans votre espace personnel.": "Allow your avatar to be displayed in your personal workspace.",
    "Délai de soumission (jours après la fin de période)": "Submission deadline (days after the period ends)",
    "1 \"” Superior direct uniquement": "1 – Direct supervisor only",
    "2 \"” Supérieur direct + niveau suivant": "2 – Direct supervisor + next level",
    "3 niveaux": "3 levels",
    "Rechercher un rapport...": "Search reports...",
    "Rapport": "Report",
    "Action": "Action",
    "×": "×",
    "Activités réalisées sur la période...": "Activities completed during the period...",
    "Obstacles, retards, besoins...": "Challenges, delays, needs...",
    "Information complémentaire...": "Additional information...",
    "Motif (obligatoire pour correction ou rejet)...": "Reason (required for changes or rejection)...",
    "Choisissez un nouveau mot de passe pour votre compte.": "Choose a new password for your account.",
    "Lien de réinitialisation invalide. Veuillez utiliser le lien reçu par e-mail.": "Invalid reset link. Please use the link sent to your email.",
    "Voir le détail de la demande": "View request details",
    "ID": "ID",
    "Validation": "Approval",
    "Validées": "Approved",
    "Aucune tâche trouvée": "No tasks found",
    "Modifiez vos critères de recherche ou de filtrage.": "Change your search or filter criteria.",
    "Collaborateur": "Employee",
    "Voir les détails": "View details",
    "tâche(s) sur": "task(s) out of",
    "Ex. Préparer le rapport mensuel": "e.g. Prepare the monthly report",
    "Écrire un commentaire...": "Write a comment...",
    "Directeur": "Director",
    "Sous-directeur": "Deputy director",
    "Responsable": "Manager",
    "Administrateur": "Administrator",
    "RH": "HR",
    "Employé": "Employee",
    "Invitation en attente": "Invitation pending",
    "Activé": "Activated",
    "Non renseigné": "Not provided",
    "Non renseignée": "Not provided",
    "Annulée": "Cancelled",
    "Validée": "Approved",
    "Acceptée": "Accepted",
    "Acceptées": "Accepted",
    "Refusée": "Declined",
    "Refusées": "Declined",
    "Brouillon": "Draft",
    "En validation": "Pending approval",
    "Validation": "Approval",
    "Normale": "Normal",
    "Haute": "High",
    "Urgente": "Urgent",
    "Faible": "Low",
    "Moyenne": "Medium",
    "À faire": "To do",
    "En attente de validation": "Pending approval",
    "Correction demandée": "Changes requested",
    "Aucune description renseignée.": "No description provided.",
    "Impossible de réinitialiser les préférences.": "Could not reset preferences.",
    "Votre mot de passe doit être suffisamment long et difficile à deviner.": "Your password should be long and difficult to guess.",
    "Terminés": "Completed",
    "La demande a été acceptée.": "The request was accepted.",
    "La demande a été refusée.": "The request was declined.",
    "Envoyez et suivez vos demandes.": "Submit and track your requests.",
    "Gérez les demandes reçues des collaborateurs.": "Manage requests received from employees.",
    "Espace de gestion": "Management workspace",
    "Espace personnel": "Personal workspace",
    "Consultez et traitez les demandes des collaborateurs.": "View and process employee requests.",
    "Créez et suivez vos demandes administratives.": "Create and track your administrative requests.",
    "Vous ne pouvez pas traiter votre propre demande. Elle reste en attente d’un autre valideur.": "You cannot process your own request. It remains pending until another reviewer acts.",
    "Votre demande est actuellement en attente de traitement.": "Your request is currently pending review.",
    "Aucun rapport disponible": "No reports available",
    "Aucun rapport ne correspond à votre recherche.": "No reports match your search.",
    "Les rapports de tâches apparaîtront ici.": "Task reports will appear here.",
    "Envoi en cours...": "Submitting...",
    "Soumettre le rapport": "Submit report",
    "Non assigné": "Unassigned",
    "Non assignée": "Unassigned",
    "Aucune échéance": "No due date",
    "Valider": "Approve",
    "Employé désactivé.": "Employee deactivated.",
    "Employé activé.": "Employee activated.",
    "Inviter un employé": "Invite an employee",
    "Modifier l'employé": "Edit employee",
    "Créez le compte professionnel du collaborateur.": "Create the employee's work account.",
    "Mettez à jour les informations du collaborateur.": "Update the employee's information.",
    "Créer l'employé": "Create employee",
    "MODIFICATION": "EDIT TASK",
    "NOUVELLE TÂCHE": "NEW TASK",
    "Modifier la tâche": "Edit task",
    "Créer la tâche": "Create task",
    "Mettez à jour les informations de la tâche.": "Update the task information.",
    "Créez une nouvelle tâche et attribuez-la à un collaborateur.": "Create a task and assign it to an employee.",
    "Enregistrer": "Save",
    "Terminer": "Complete",
    "Démarrer": "Start",
    "Vue générale de l'entreprise": "Company overview",
    "Vue générale des ressources humaines": "Human resources overview",
    "Vue générale de votre équipe": "Your team overview",
    "Administration de GAIN OFFICE": "GAIN OFFICE administration",
    "Votre espace de travail": "Your workspace",
    "Historique des actions": "Action history",
    "Consultez les actions récentes enregistrées dans l'application.": "Review recent actions recorded in the application.",
    "Rechercher dans l'historique...": "Search action history...",
    "Filtrer par module": "Filter by module",
    "Tous les modules": "All modules",
    "Date et heure": "Date and time",
    "Module": "Module",
    "Détail": "Details",
    "Aucune action enregistrée.": "No actions recorded.",
    "Chargement de l'historique...": "Loading action history...",
    "Utilisateur supprimé": "Deleted user",
    "action(s)": "action(s)",
    "Actions par page": "Actions per page",
    "Impossible de charger l'historique.": "Could not load action history.",
    "demandes": "Requests",
    "taches": "Tasks",
    "rapports": "Reports",
    "rapports_taches": "Task reports",
    "employes": "Employees",
    "auth": "Authentication",
    "creation": "Created",
    "modification": "Updated",
    "suppression": "Deleted",
    "validation": "Approved",
    "Aucune description": "No description",
    "Tâche sans titre": "Untitled task",
    "Vous n'avez pas l'autorisation de créer une tâche.": "You are not authorized to create a task.",
    "Vous n'avez pas l'autorisation de modifier une tâche.": "You are not authorized to edit a task.",
    "Vous n'avez pas l'autorisation de modifier cette tâche.": "You are not authorized to edit this task.",
    "Vous n'avez pas l'autorisation de supprimer une tâche.": "You are not authorized to delete a task.",
    "Veuillez remplir les champs obligatoires.": "Please fill in all required fields.",
    "La tâche a été modifiée avec succès.": "The task was updated successfully.",
    "La tâche a été créée avec succès.": "The task was created successfully.",
    "La tâche a été supprimée.": "The task was deleted.",
    "Vous ne pouvez modifier que vos propres tâches.": "You can only edit your own tasks.",
    "Le statut de la tâche a été mis à jour.": "The task status was updated.",
    "Commentaire ajouté.": "Comment added.",
    "Une correction a été demandée.": "Changes were requested.",
    "La tâche a été validée.": "The task was approved.",
    "Vous ne pouvez pas traiter votre propre demande.": "You cannot process your own request.",
    "Veuillez remplir tous les champs obligatoires.": "Please fill in all required fields.",
    "Vous n'avez pas l'autorisation de consulter les rapports.": "You are not authorized to view reports.",
    "Erreur lors du chargement des rapports.": "An error occurred while loading reports.",
    "Le prénom, le nom et l'e-mail sont obligatoires.": "First name, last name, and email are required.",
    "Le matricule est obligatoire.": "Employee number is required.",
    "Le numéro WhatsApp est obligatoire pour envoyer l'invitation.": "A WhatsApp number is required to send the invitation.",
    "Le numéro WhatsApp est invalide.": "The WhatsApp number is invalid.",
    "Veuillez sélectionner un rôle.": "Please select a role.",
    "Veuillez sélectionner un poste.": "Please select a position.",
    "Aucun résultat": "No results",
    "Actions": "Actions",
    "Mon profil": "My profile",
    "Sécurité": "Security",
    "Préférences": "Preferences",
    "Vous n'avez pas l'autorisation d'accéder aux paramètres.": "You are not authorized to access settings.",
    "Gérez les informations associées à votre compte.": "Manage the information associated with your account.",
    "Veuillez saisir une adresse e-mail valide.": "Please enter a valid email address.",
    "Votre session n'est plus valide. Veuillez vous reconnecter.": "Your session has expired. Please sign in again.",
  },
};

function lireLangueUtilisateur(idUtilisateur) {
  if (idUtilisateur) {
    try {
      const preferences = JSON.parse(
        localStorage.getItem(`gainOfficeParametres_${idUtilisateur}`) || "{}"
      );
      if (preferences.langue === "English" || preferences.langue === "Français") {
        return preferences.langue;
      }
    } catch {
      // Une préférence locale invalide ne doit pas empêcher l'ouverture de l'app.
    }
  }

  // Évite qu'un choix global d'un utilisateur s'applique au compte suivant.
  if (idUtilisateur) return DEFAULT_LANGUAGE;

  const langue = localStorage.getItem(LANGUAGE_KEY);
  return langue === "English" || langue === "Français"
    ? langue
    : DEFAULT_LANGUAGE;
}

function lireFormatDateUtilisateur(idUtilisateur) {
  if (idUtilisateur) {
    try {
      const preferences = JSON.parse(
        localStorage.getItem(`gainOfficeParametres_${idUtilisateur}`) || "{}"
      );
      if (DATE_FORMATS.has(preferences.formatDate)) return preferences.formatDate;
    } catch {
      // Ignore une préférence locale invalide.
    }
    return DEFAULT_DATE_FORMAT;
  }

  const format = localStorage.getItem(DATE_FORMAT_KEY);
  return DATE_FORMATS.has(format) ? format : DEFAULT_DATE_FORMAT;
}

export function LanguageProvider({ children }) {
  const [langue, setLangueState] = useState(() =>
    lireLangueUtilisateur()
  );
  const [formatDate, setFormatDateState] = useState(() =>
    lireFormatDateUtilisateur()
  );

  useEffect(() => {
    document.documentElement.lang = langue === "English" ? "en" : "fr";
    localStorage.setItem(LANGUAGE_KEY, langue);
  }, [langue]);

  const setLangue = useCallback((nouvelleLangue, idUtilisateur) => {
    const langueValide = nouvelleLangue === "English"
      ? "English"
      : DEFAULT_LANGUAGE;

    setLangueState(langueValide);
    localStorage.setItem(LANGUAGE_KEY, langueValide);

    if (idUtilisateur) {
      const cle = `gainOfficeParametres_${idUtilisateur}`;
      try {
        const preferences = JSON.parse(localStorage.getItem(cle) || "{}");
        localStorage.setItem(
          cle,
          JSON.stringify({ ...preferences, langue: langueValide })
        );
      } catch {
        localStorage.setItem(cle, JSON.stringify({ langue: langueValide }));
      }
    }
  }, []);

  const setFormatDate = useCallback((nouveauFormat, idUtilisateur) => {
    const formatValide = DATE_FORMATS.has(nouveauFormat)
      ? nouveauFormat
      : DEFAULT_DATE_FORMAT;

    setFormatDateState(formatValide);
    localStorage.setItem(DATE_FORMAT_KEY, formatValide);

    if (idUtilisateur) {
      const cle = `gainOfficeParametres_${idUtilisateur}`;
      try {
        const preferences = JSON.parse(localStorage.getItem(cle) || "{}");
        localStorage.setItem(cle, JSON.stringify({ ...preferences, formatDate: formatValide }));
      } catch {
        localStorage.setItem(cle, JSON.stringify({ formatDate: formatValide }));
      }
    }
  }, []);

  const valeur = useMemo(() => {
    const dictionnaire = translations[langue] || {};
    return {
      langue,
      formatDate,
      locale: langue === "English" ? "en-GB" : "fr-FR",
      setLangue,
      setFormatDate,
      languePourUtilisateur: lireLangueUtilisateur,
      formatDatePourUtilisateur: lireFormatDateUtilisateur,
      t: (texte) => dictionnaire[texte] || texte,
    };
  }, [langue, formatDate, setLangue, setFormatDate]);

  return (
    <LanguageContext.Provider value={valeur}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const contexte = useContext(LanguageContext);
  if (!contexte) {
    throw new Error("useLanguage doit être utilisé dans LanguageProvider");
  }
  return contexte;
}
