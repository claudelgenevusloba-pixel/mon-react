# GAIN OFFICE — frontend

Application React de gestion des employés, demandes, tâches, rapports et paramètres de GAIN OFFICE.

## Démarrer l’application

1. Installer Node.js et npm.
2. À la racine de ce projet, exécuter `npm install` si les dépendances ne sont pas encore installées.
3. Lancer `npm run dev`.
4. Démarrer l’API Laravel située dans `C:\wamp64\www\gain-office-api`.

Le frontend appelle l’API Laravel configurée dans `src/config/api.js`. Les requêtes communes passent par Axios, puis par les services métier dans `src/services/`.

## Organisation du code

- `src/components/` : éléments d’interface réutilisables.
- `src/config/` : configuration de l’API, des routes, des rôles et des permissions.
- `src/context/` : état partagé, notamment la session et la langue.
- `src/hooks/` : comportements React réutilisables.
- `src/layouts/` : structure commune des pages connectées.
- `src/pages/` : écrans de l’application.
- `src/services/` : communication avec l’API Laravel.
- `src/styles/` : styles globaux, composants et pages.
- `src/utils/` : fonctions de formatage et de traitement des médias.
- `output/pdf/` : guides de référence du projet au format PDF.

Les fichiers d’environnement et les secrets ne doivent pas être ajoutés au dépôt Git.
