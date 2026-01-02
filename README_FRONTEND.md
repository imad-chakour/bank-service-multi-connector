# Application React Frontend - Bank Service

Application React frontend pour communiquer avec l'API REST sécurisée avec JWT.

## Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn
- Le serveur backend doit être démarré sur `http://localhost:8080`

## Installation

1. Installer les dépendances :
```bash
npm install
```

## Démarrage

Pour démarrer l'application en mode développement :

```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## Structure du projet

```
src/
├── components/          # Composants React
│   ├── NavBar.js
│   ├── Home.js
│   ├── Login.js
│   ├── Register.js
│   ├── Profile.js
│   ├── CustomerList.js
│   ├── CustomerComponent.js
│   ├── BankAccount.js
│   ├── WirerTransfert.js
│   └── routes.applications.js
├── services/           # Services pour communiquer avec l'API
│   ├── auth.service.js
│   ├── axiosConfig.js
│   └── customers.service.js
├── images/             # Images de l'application
│   └── login.png       # À ajouter manuellement
├── App.js
├── App.css
├── index.js
└── index.css
```

## Comptes de test

Selon le backend, vous pouvez vous connecter avec :

1. **agentguichet** / **agentguichet** (ROLE_AGENT_GUICHET)
2. **agentguichet2** / **agentguichet2** (ROLE_AGENT_GUICHET_GET)
3. **client** / **client** (ROLE_CLIENT)
4. **admin** / **admin** (ROLE_AGENT_GUICHET + ROLE_CLIENT)

## Fonctionnalités

- Authentification (Login/Register)
- Gestion des clients (pour les agents guichet)
- Consultation des comptes bancaires
- Virements bancaires
- Profil utilisateur

## Notes

- L'image `login.png` doit être ajoutée dans le dossier `src/images/`
- L'URL de l'API backend est configurée dans les services (`http://localhost:8080`)
- Le token JWT est stocké dans le localStorage après connexion

