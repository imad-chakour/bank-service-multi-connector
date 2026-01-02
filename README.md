# Bank Service Multi-Connector

Une application bancaire micro-service implémentée avec Spring Boot 3.2.0 et Java 17, offrant quatre types d'API : REST, SOAP, GraphQL et gRPC avec authentification JWT.

## 🏗️ Architecture

L'application suit une architecture en 3 couches :

- **Data Access Layer** : Spring Data JPA avec H2 Database
- **Business Layer** : Services métier avec logique de gestion
- **Web Layer** : Quatre types d'API (REST, SOAP, GraphQL, gRPC)

## 🚀 Fonctionnalités

### Services Bancaires
- Consultation de la liste des clients
- Consultation d'un client par son identité
- Consultation de la liste des comptes bancaires
- Consultation d'un compte bancaire par son RIB
- Virements entre comptes
- Gestion des transactions

### Sécurité
- Authentification JWT avec Spring Security
- Gestion des rôles et permissions
- Quatre types d'utilisateurs prédéfinis

## 🛠️ Technologies Utilisées

### Backend
- **Java 17** - Langage principal
- **Spring Boot 3.2.0** - Framework principal
- **Spring Security** - Sécurité et authentification
- **Spring Data JPA** - Accès aux données
- **Spring GraphQL** - API GraphQL
- **Apache CXF** - Services SOAP
- **gRPC** - Services gRPC
- **H2 Database** - Base de données en mémoire
- **JWT (JJWT)** - Tokens d'authentification
- **ModelMapper** - Mapping d'objets
- **Lombok** - Réduction de code boilerplate
- **OpenAPI/Swagger** - Documentation API REST

### Frontend
- **React 18.2.0** - Framework frontend
- **React Router DOM** - Routage
- **Axios** - Client HTTP
- **Bootstrap 5** - Framework CSS
- **React Validation** - Validation des formulaires

## 📋 Prérequis

- Java 17 ou supérieur
- Maven 3.6+
- Node.js 14+ (pour le frontend)
- npm ou yarn

## 🚀 Démarrage Rapide

### Backend

1. **Cloner le repository**
```bash
git clone <repository-url>
cd bank-service-multi-connecteur-jwt
```

2. **Compiler et démarrer l'application**
```bash
mvn clean install
mvn spring-boot:run
```

L'application backend sera disponible sur :
- **API REST** : http://localhost:8080
- **Documentation Swagger** : http://localhost:8080/api/rest/docs-ui
- **Console H2** : http://localhost:8080/h2
- **GraphQL Playground** : http://localhost:8080/graphiql
- **Services SOAP** : http://localhost:8080/api/soap
- **Services gRPC** : localhost:7777

### Frontend

1. **Naviguer vers le répertoire frontend**
```bash
cd src
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer l'application**
```bash
npm start
```

L'application frontend sera disponible sur : http://localhost:3000

## 🔐 Comptes de Test

Quatre comptes utilisateurs sont pré-configurés :

| Username | Password | Rôle | Permissions |
|----------|----------|------|-------------|
| `agentguichet` | `agentguichet` | Agent Guichet | CRUD complet sur clients et comptes |
| `agentguichet2` | `agentguichet2` | Agent Guichet (Lecture) | Lecture seule sur clients et comptes |
| `client` | `client` | Client | Consultation et virements |
| `admin` | `admin` | Administrateur | Agent Guichet + Client |

## 📚 Documentation des API

### API REST
- **Base URL** : http://localhost:8080/api/rest
- **Documentation** : http://localhost:8080/api/rest/docs-ui
- **Authentification** : Bearer Token JWT

#### Endpoints principaux :
- `POST /api/rest/auth/login` - Authentification
- `GET /api/rest/customers` - Liste des clients
- `GET /api/rest/customers/{identityRef}` - Client par ID
- `POST /api/rest/customers` - Créer un client
- `PUT /api/rest/customers/{identityRef}` - Mettre à jour un client
- `DELETE /api/rest/customers/{identityRef}` - Supprimer un client
- `GET /api/rest/bank-accounts` - Liste des comptes
- `GET /api/rest/bank-accounts/{rib}` - Compte par RIB
- `POST /api/rest/bank-accounts` - Créer un compte
- `POST /api/rest/transactions/wire-transfer` - Effectuer un virement

### API GraphQL
- **URL** : http://localhost:8080/graphql
- **Playground** : http://localhost:8080/graphiql

#### Exemples de requêtes :
```graphql
query {
  getAllCustomers {
    identityRef
    firstname
    lastname
    username
  }
}

query {
  getCustomerByIdentityRef(identityRef: "A100") {
    identityRef
    firstname
    lastname
    bankAccounts {
      rib
      amount
    }
  }
}
```

### API SOAP
- **WSDL** : http://localhost:8080/api/soap/bank?wsdl
- **Endpoint** : http://localhost:8080/api/soap

### API gRPC
- **Port** : 7777
- **Proto file** : `src/main/resources/bank.proto`

## 🗄️ Base de Données

L'application utilise une base de données H2 en mémoire avec les tables suivantes :

- **users** - Utilisateurs et authentification
- **roles** - Rôles utilisateurs
- **permissions** - Permissions système
- **user_roles** - Association utilisateurs-rôles
- **role_permissions** - Association rôles-permissions
- **customers** - Informations clients
- **bank_accounts** - Comptes bancaires
- **bank_account_transactions** - Transactions et virements

## 🔧 Configuration

### Variables d'environnement
```properties
# Base de données H2
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=

# JWT
privite_key=@zeRtY1931
expiration_delay=86400000

# gRPC
grpc.server.port=7777

# SOAP
cxf.path=/api/soap
```

## 🧪 Tests

### Tests Backend
```bash
mvn test
```

### Tests Frontend
```bash
npm test
```

## 📝 Développement

### Structure du Projet

```
bank-service-multi-connecteur-jwt/
├── src/
│   ├── main/
│   │   ├── java/ma/formations/multiconnector/
│   │   │   ├── config/          # Configurations Spring
│   │   │   ├── dao/             # Repositories JPA
│   │   │   ├── dtos/            # Data Transfer Objects
│   │   │   ├── enums/           # Énumérations
│   │   │   ├── model/           # Entités JPA
│   │   │   ├── presentation/    # Controllers (REST/GraphQL/SOAP/gRPC)
│   │   │   ├── service/         # Services métier
│   │   │   └── common/          # Utilitaires
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── bank.proto       # Définition gRPC
│   │       └── graphql/         # Schémas GraphQL
│   └── frontend/                # Application React
├── target/                      # Build Maven
├── pom.xml                      # Configuration Maven
└── package.json                 # Dépendances React
```

### Conventions de Code
- Architecture en couches claire
- Utilisation de DTOs pour les échanges API
- Validation des entrées avec Bean Validation
- Gestion centralisée des exceptions
- Documentation avec OpenAPI/Swagger

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## 📞 Support

Pour toute question ou support technique, veuillez contacter :
- Email : support@bank-service.com
- Issues GitHub : [Issues du projet]

---

**Développé avec ❤️ par Abbou Formations**

