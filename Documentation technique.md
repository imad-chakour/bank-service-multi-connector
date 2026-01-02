# 📚 Documentation Technique - IR Bank 2026

## 🔐 JWT (JSON Web Tokens)

### Définition
JWT est un standard ouvert (RFC 7519) qui définit un moyen compact et autonome de transmettre des informations de manière sécurisée entre les parties en tant qu'objet JSON.

### Structure JWT

Un JWT se compose de trois parties séparées par des points (.) :

```
eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbXSwiZXhwIjoxNzY3NDYzNDIzLCJpYXQiOjE3NjczNzcwMjN9.t1jU9mJR9MWzOkzhWmQXnXAZdQQSM6MflLB1bB32dG8E8BhJtoJrsK7UVEsNy2z1FC28SPQPUnRnITPLJZCSgQ
```

#### 1. Header (En-tête)
```json
{
  "alg": "HS512",        // Algorithme de signature
  "typ": "JWT"          // Type de token
}
```

#### 2. Payload (Charge utile)
```json
{
  "sub": "admin",                    // Sujet (username)
  "roles": ["ROLE_AGENT_GUICHET"],   // Rôles utilisateur
  "exp": 1767463423,               // Date d'expiration
  "iat": 1767377023                // Date d'émission
}
```

#### 3. Signature
```
HMACSHA512(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  "@zeRtY1931"  // Clé secrète
)
```

### Configuration dans notre projet

```java
// JwtUtils.java
public String generateJwtToken(Authentication authentication) {
    UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
    
    Map<String, Object> credentials = new HashMap<>();
    credentials.put("roles", userPrincipal.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList()));
    credentials.put("sub", userPrincipal.getUsername());
    
    return Jwts.builder()
            .setClaims(credentials)
            .setIssuedAt(new Date())
            .setExpiration(new Date((new Date()).getTime() + delaiExpiration))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
}
```

### Flux d'authentification JWT

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Spring Security
    participant F as AuthTokenFilter
    participant J as JwtUtils
    participant DB as Database
    
    C->>S: POST /auth/signin
    S->>DB: Vérifier identifiants
    DB-->>S: Utilisateur + rôles
    S->>J: Générer JWT
    J-->>S: Token signé
    S-->>C: JWT + User info
    
    Note over C: Requêtes authentifiées
    C->>F: API Request + Bearer Token
    F->>F: Extraire token du header
    F->>J: Valider token
    J->>J: Vérifier signature + expiration
    J-->>F: Token valide
    F->>DB: Charger détails utilisateur
    DB-->>F: Authorities
    F->>S: Définir SecurityContext
    S-->>F: Autoriser l'accès
```

### Avantages du JWT
- **Stateless** : Pas de session côté serveur
- **Scalable** : Facile à distribuer
- **Sécurisé** : Signature cryptographique
- **Compact** : Peut être envoyé dans URL/headers
- **Auto-contenu** : Contient toutes les infos nécessaires

---

## 🛡️ Spring Security

### Architecture Spring Security

Spring Security est un framework qui fournit une authentification et une autorisation complètes pour les applications Java.

### Configuration dans notre projet

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
            .exceptionHandling().authenticationEntryPoint(unauthorizedHandler).and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/swagger-ui/**").permitAll()
                .anyRequest().authenticated()
            );
        
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

### Composants clés

#### 1. AuthenticationManager
Gère le processus d'authentification :
```java
@Bean
public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
    return authConfig.getAuthenticationManager();
}
```

#### 2. UserDetailsService
Charge les détails utilisateur depuis la base de données :
```java
@Service
public class UserServiceImpl implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String username) {
        // Charge utilisateur + rôles depuis DB
        // Retourne UserVo implémentant UserDetails
    }
}
```

#### 3. JWT Filter
Filtre personnalisé pour valider les tokens JWT :
```java
public class AuthTokenFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                HttpServletResponse response, 
                                FilterChain filterChain) {
        String jwt = parseJwt(request);
        if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
            String username = jwtUtils.getUserNameFromJwtToken(jwt);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }
}
```

### Annotations de sécurité

```java
// Au niveau méthode
@PreAuthorize("hasAuthority('GET_ALL_CUSTUMERS')")
public List<CustomerDto> customers() {
    return customerService.getAllCustomers();
}

// Au niveau classe
@PreAuthorize("hasRole('CLIENT')")
@RestController
@RequestMapping("/api/rest/transaction")
public class TransactionRestController {
    // Méthodes protégées
}
```

### Flux de sécurité Spring

```mermaid
graph TB
    A[Requête HTTP] --> B[Filter Chain]
    B --> C[AuthTokenFilter]
    C --> D{JWT Valide?}
    D -->|Oui| E[Charger User Details]
    D -->|Non| F[Continuer sans auth]
    E --> G[Créer Authentication]
    G --> H[Security Context]
    H --> I[Method Security]
    I --> J{Autorisé?}
    J -->|Oui| K[Controller]
    J -->|Non| L[Access Denied]
    F --> M[Public Endpoints]
    K --> N[Response]
    L --> O[403 Forbidden]
    M --> N
```

---

## 🌐 REST API (Representational State Transfer)

### Principes REST

REST est un style architectural basé sur HTTP avec des contraintes spécifiques :

1. **Client-Server** : Séparation des responsabilités
2. **Stateless** : Chaque requête contient toutes les infos
3. **Cacheable** : Les réponses peuvent être mises en cache
4. **Interface uniforme** : Utilisation standard des méthodes HTTP
5. **Système en couches** : Architecture évolutive

### Opérations CRUD dans notre projet

#### 1. CREATE (POST)
```java
@PostMapping("/agent_guichet/create")
@PreAuthorize("hasAuthority('CREATE_CUSTOMER')")
public ResponseEntity<AddCustomerResponse> addCustomer(@Valid @RequestBody AddCustomerRequest dto) {
    return new ResponseEntity<>(customerService.addCustomer(dto), HttpStatus.CREATED);
}
```

```javascript
// Appel Axios
const createCustomer = (identityRef, firstname, lastname, username) => {
    return api.post("/agent_guichet/create", {
        identityRef,
        firstname,
        lastname,
        username,
    });
};
```

#### 2. READ (GET)
```java
@GetMapping("/agent_guichet/all")
@PreAuthorize("hasAuthority('GET_ALL_CUSTUMERS')")
List<CustomerDto> customers() {
    return customerService.getAllCustomers();
}

@GetMapping("/agent_guichet/{identityRef}")
@PreAuthorize("hasAuthority('GET_CUSTOMER_BY_IDENTITY')")
CustomerDto getCustomer(@PathVariable String identityRef) {
    return customerService.getCustomerByIdentityRef(identityRef);
}
```

```javascript
// Appel Axios
const getCustomers = () => {
    return api.get("/agent_guichet/all");
};

const getCustomerById = (identityRef) => {
    return api.get(`/agent_guichet/${identityRef}`);
};
```

#### 3. UPDATE (PUT)
```java
@PutMapping("/agent_guichet/update/{identityRef}")
@PreAuthorize("hasAuthority('UPDATE_CUSTOMER')")
public ResponseEntity<UpdateCustomerResponse> updateCustomer(
        @PathVariable String identityRef, 
        @Valid @RequestBody UpdateCustomerRequest dto) {
    return new ResponseEntity<>(customerService.updateCustomer(identityRef, dto), HttpStatus.OK);
}
```

```javascript
// Appel Axios
const updateCustomer = (identityRef, firstname, lastname, username) => {
    return api.put(`/agent_guichet/update/${identityRef}`, {
        firstname,
        lastname,
        username,
    });
};
```

#### 4. DELETE (DELETE)
```java
@DeleteMapping("/agent_guichet/delete/{identityRef}")
@PreAuthorize("hasAuthority('DELETE_CUSTOMER')")
public ResponseEntity<Void> deleteCustomer(@PathVariable String identityRef) {
    customerService.deleteCustomer(identityRef);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
}
```

```javascript
// Appel Axios
const deleteCustomer = (identityRef) => {
    return api.delete(`/agent_guichet/delete/${identityRef}`);
};
```

### Configuration des endpoints REST

```java
@RestController
@RequestMapping("/api/rest/customer")
@PreAuthorize("hasAnyRole('ADMIN','AGENT_GUICHET','CLIENT')")
@CrossOrigin(origins = "http://localhost:3001", maxAge = 3600)
public class CustomerRestController {
    // Implémentation des endpoints CRUD
}
```

### Codes HTTP utilisés

| Code | Signification | Usage |
|-------|---------------|---------|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée |
| 204 | No Content | Ressource supprimée |
| 400 | Bad Request | Erreur validation |
| 401 | Unauthorized | Non authentifié |
| 403 | Forbidden | Pas autorisé |
| 404 | Not Found | Ressource inexistante |
| 500 | Internal Server Error | Erreur serveur |

---

## 🧼 SOAP API (Simple Object Access Protocol)

### Définition SOAP

SOAP est un protocole de communication basé sur XML pour l'échange d'informations structurées dans des environnements d'entreprise.

### Structure SOAP Message

```xml
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
    <soap:Header>
        <!-- En-têtes optionnels -->
    </soap:Header>
    <soap:Body>
        <!-- Corps du message -->
        <ns:getCustomer xmlns:ns="http://service.multiconnector.formations.ma/">
            <identityRef>CUST001</identityRef>
        </ns:getCustomer>
    </soap:Body>
</soap:Envelope>
```

### Configuration SOAP dans notre projet

#### 1. Dépendances Maven
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web-services</artifactId>
</dependency>
```

#### 2. Génération WSDL automatique
```java
@Endpoint
@RequiredArgsConstructor
public class BankSoapController {
    
    private static final String NAMESPACE_URI = "http://service.multiconnector.formations.ma/";
    
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getCustomerRequest")
    @ResponsePayload
    public GetCustomerResponse getCustomer(@RequestPayload GetCustomerRequest request) {
        CustomerDto customer = customerService.getCustomerByIdentityRef(request.getIdentityRef());
        return new GetCustomerResponse(customer);
    }
}
```

#### 3. Classes de requête/réponse
```java
@Data
@AllArgsConstructor
public class GetCustomerRequest {
    private String identityRef;
}

@Data
@AllArgsConstructor
public class GetCustomerResponse {
    private CustomerDto customer;
}
```

### Avantages SOAP pour l'intégration entreprise

1. **Contrat strict** : WSDL définit l'interface précis
2. **Sécurité intégrée** : WS-Security
3. **Transactions** : Support natif des transactions ACID
4. **Fiabilité** : Garanties de livraison
5. **Interopérabilité** : Standard multi-plateformes

### Flux SOAP

```mermaid
sequenceDiagram
    participant C as Client Enterprise
    participant W as WSDL
    participant S as SOAP Controller
    participant B as Business Logic
    
    C->>W: 1. Récupérer WSDL
    W-->>C: Contrat de service
    
    C->>S: 2. Requête SOAP/XML
    S->>S: 3. Parser XML
    S->>B: 4. Appeler service métier
    B-->>S: 5. Résultat
    S->>S: 6. Construire réponse XML
    S-->>C: 7. Réponse SOAP/XML
```

---

## 🔍 GraphQL (Graph Query Language)

### Définition GraphQL

GraphQL est un langage de requête pour APIs et un runtime pour exécuter ces requêtes sur le serveur.

### Schéma GraphQL dans notre projet

```graphql
type Customer {
    identityRef: String!
    firstname: String!
    lastname: String!
    username: String!
    bankAccounts: [BankAccount!]!
}

type BankAccount {
    rib: String!
    balance: Float!
    accountStatus: AccountStatus!
    customer: Customer!
    transactions: [Transaction!]!
}

type Query {
    getAllCustomers: [Customer!]!
    getCustomerByIdentityRef(identityRef: String!): Customer
    getAllBankAccounts: [BankAccount!]!
    getBankAccountByRib(rib: String!): BankAccount
}

type Mutation {
    createCustomer(customer: CustomerInput!): Customer!
    updateCustomer(identityRef: String!, customer: CustomerInput!): Customer!
    deleteCustomer(identityRef: String!): Boolean!
}
```

### Implémentation GraphQL

#### 1. Dépendances
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-graphql</artifactId>
</dependency>
```

#### 2. Controller GraphQL
```java
@Controller
@RequiredArgsConstructor
public class CustomerGraphqlController {
    
    private final ICustomerService customerService;
    
    @QueryMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers().stream()
                .map(this::convertToGraphqlCustomer)
                .collect(Collectors.toList());
    }
    
    @QueryMapping
    public Customer getCustomerByIdentityRef(@Argument String identityRef) {
        CustomerDto dto = customerService.getCustomerByIdentityRef(identityRef);
        return convertToGraphqlCustomer(dto);
    }
    
    @MutationMapping
    public Customer createCustomer(@Argument CustomerInput customer) {
        AddCustomerRequest request = new AddCustomerRequest(
            customer.getIdentityRef(),
            customer.getFirstname(),
            customer.getLastname(),
            customer.getUsername()
        );
        CustomerDto dto = customerService.addCustomer(request);
        return convertToGraphqlCustomer(dto);
    }
}
```

#### 3. Types GraphQL
```java
@Data
@AllArgsConstructor
public class Customer {
    private String identityRef;
    private String firstname;
    private String lastname;
    private String username;
    private List<BankAccount> bankAccounts;
}

@Data
@AllArgsConstructor
public class CustomerInput {
    private String identityRef;
    private String firstname;
    private String lastname;
    private String username;
}
```

### Avantages de GraphQL

1. **Requêtes flexibles** : Client choisit les données nécessaires
2. **Single endpoint** : Un seul point d'accès
3. **Pas d'over-fetching** : Uniquement les données demandées
4. **Typage fort** : Schéma défini
5. **Introspection** : Auto-documentation

### Exemple de requête GraphQL

```graphql
query {
  getAllCustomers {
    identityRef
    firstname
    lastname
    bankAccounts {
      rib
      balance
    }
  }
}
```

```graphql
mutation {
  createCustomer(customer: {
    identityRef: "CUST123"
    firstname: "John"
    lastname: "Doe"
    username: "johndoe"
  }) {
    identityRef
    firstname
    lastname
  }
}
```

---

## ⚡ gRPC (Google Remote Procedure Call)

### Définition gRPC

gRPC est un framework RPC moderne utilisant HTTP/2 et Protocol Buffers pour la communication haute performance.

### Fichier .proto (Protocol Buffers)

```protobuf
syntax = "proto3";

package bank;

option java_package = "ma.formations.multiconnector.grpc";

service BankService {
  rpc GetCustomer(GetCustomerRequest) returns (GetCustomerResponse);
  rpc GetAllCustomers(GetAllCustomersRequest) returns (GetAllCustomersResponse);
  rpc CreateCustomer(CreateCustomerRequest) returns (CreateCustomerResponse);
  rpc UpdateCustomer(UpdateCustomerRequest) returns (UpdateCustomerResponse);
  rpc DeleteCustomer(DeleteCustomerRequest) returns (DeleteCustomerResponse);
}

message Customer {
  string identity_ref = 1;
  string firstname = 2;
  string lastname = 3;
  string username = 4;
}

message GetCustomerRequest {
  string identity_ref = 1;
}

message GetCustomerResponse {
  Customer customer = 1;
}

message GetAllCustomersRequest {}
message GetAllCustomersResponse {
  repeated Customer customers = 1;
}
```

### Implémentation gRPC dans notre projet

#### 1. Dépendances
```xml
<dependency>
    <groupId>net.devh</groupId>
    <artifactId>grpc-spring-boot-starter</artifactId>
</dependency>
```

#### 2. Service gRPC
```java
@GrpcService
@RequiredArgsConstructor
public class BankGrpcController extends BankServiceGrpc.BankServiceImplBase {
    
    private final ICustomerService customerService;
    
    @Override
    public void getCustomer(GetCustomerRequest request, 
                         StreamObserver<GetCustomerResponse> responseObserver) {
        try {
            String identityRef = request.getIdentityRef();
            CustomerDto customerDto = customerService.getCustomerByIdentityRef(identityRef);
            
            Customer grpcCustomer = Customer.newBuilder()
                    .setIdentityRef(customerDto.getIdentityRef())
                    .setFirstname(customerDto.getFirstname())
                    .setLastname(customerDto.getLastname())
                    .setUsername(customerDto.getUsername())
                    .build();
            
            GetCustomerResponse response = GetCustomerResponse.newBuilder()
                    .setCustomer(grpcCustomer)
                    .build();
            
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(
                Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException()
            );
        }
    }
    
    @Override
    public void getAllCustomers(GetAllCustomersRequest request,
                             StreamObserver<GetAllCustomersResponse> responseObserver) {
        try {
            List<CustomerDto> customers = customerService.getAllCustomers();
            
            List<Customer> grpcCustomers = customers.stream()
                    .map(dto -> Customer.newBuilder()
                            .setIdentityRef(dto.getIdentityRef())
                            .setFirstname(dto.getFirstname())
                            .setLastname(dto.getLastname())
                            .setUsername(dto.getUsername())
                            .build())
                    .collect(Collectors.toList());
            
            GetAllCustomersResponse response = GetAllCustomersResponse.newBuilder()
                    .addAllCustomers(grpcCustomers)
                    .build();
            
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(
                Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException()
            );
        }
    }
}
```

### Configuration gRPC

```properties
# application.properties
grpc.server.port=7777
grpc.server.address=0.0.0.0
```

### Avantages de gRPC

1. **Haute performance** : HTTP/2 + binary protocol
2. **Typage fort** : Protocol Buffers
3. **Streaming** : Support bidirectionnel
4. **Génération de code** : Auto-généré dans multiple langages
5. **Compression** : Intégrée et efficace

### Performance comparée

```mermaid
graph LR
    A[gRPC] --> B[~10x REST]
    C[REST JSON] --> D[Baseline]
    E[SOAP XML] --> F[~5x REST]
    
    subgraph "Latence (ms)"
        G[gRPC: 2-5ms]
        H[REST: 20-50ms]
        I[SOAP: 100-250ms]
    end
```

---

## 🔄 Axios (Client HTTP)

### Définition Axios

Axios est un client HTTP basé sur promesses pour le navigateur et Node.js avec des fonctionnalités avancées.

### Configuration Axios dans notre projet

#### 1. Configuration de base
```javascript
// axiosConfig.js
import axios from "axios";
import AuthService from "./auth.service";

const api = axios.create({
  baseURL: "http://localhost:8080/api/rest/customer",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    const user = AuthService.getCurrentUser();
    if (user && user.jwtToken) {
      config.headers.Authorization = `Bearer ${user.jwtToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      AuthService.logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### 2. Services spécialisés
```javascript
// customers.service.js
import api from "./axiosConfig";

const CustomersService = {
  getCustomers: () => api.get("/agent_guichet/all"),
  
  createCustomer: (identityRef, firstname, lastname, username) => 
    api.post("/agent_guichet/create", {
      identityRef, firstname, lastname, username
    }),
  
  updateCustomer: (identityRef, firstname, lastname, username) => 
    api.put(`/agent_guichet/update/${identityRef}`, {
      firstname, lastname, username
    }),
  
  deleteCustomer: (identityRef) => 
    api.delete(`/agent_guichet/delete/${identityRef}`)
};

export default CustomersService;
```

#### 3. Service comptes bancaires
```javascript
// accounts.service.js
import axios from "axios";
import AuthService from "./auth.service";

const accountsApi = axios.create({
  baseURL: "http://localhost:8080/api/rest/bank",
  timeout: 10000,
});

accountsApi.interceptors.request.use((config) => {
  const user = AuthService.getCurrentUser();
  if (user && user.jwtToken) {
    config.headers.Authorization = `Bearer ${user.jwtToken}`;
  }
  return config;
});

const AccountsService = {
  getAccounts: () => accountsApi.get("/all"),
  
  getAccountByRib: (rib) => accountsApi.get(`?rib=${rib}`),
  
  createAccount: (accountData) => accountsApi.post("/create", accountData),
  
  transfer: (fromRib, toRib, amount) => 
    axios.post("http://localhost:8080/api/rest/transaction/create", {
      fromRib, toRib, amount
    }, {
      headers: {
        'Authorization': `Bearer ${AuthService.getCurrentUser()?.jwtToken}`
      }
    })
};

export default AccountsService;
```

### Fonctionnalités avancées d'Axios

#### 1. Gestion des erreurs
```javascript
const handleApiError = (error) => {
  if (error.response) {
    // Le serveur a répondu avec un statut d'erreur
    console.error('Response error:', error.response.status, error.response.data);
  } else if (error.request) {
    // La requête a été faite mais aucune réponse reçue
    console.error('Request error:', error.request);
  } else {
    // Erreur lors de la configuration de la requête
    console.error('Config error:', error.message);
  }
  return Promise.reject(error);
};
```

#### 2. Retry automatique
```javascript
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000; // 1s, 2s, 3s
  },
  retryCondition: (error) => {
    return error.response?.status >= 500 || error.code === 'ECONNABORTED';
  }
});
```

#### 3. Cancelation de requêtes
```javascript
const CancelToken = axios.CancelToken;
let cancel;

const fetchCustomers = () => {
  if (cancel) {
    cancel('Operation canceled due to new request');
  }
  
  cancel = CancelToken.source();
  
  return api.get('/agent_guichet/all', {
    cancelToken: cancel.token
  });
};

// Pour annuler
// cancel.cancel('User canceled the request');
```

### Avantages d'Axios

1. **Promesses natives** : Support async/await
2. **Intercepteurs** : Transformation de requêtes/réponses
3. **Support navigateur/Node** : Code universel
4. **Gestion erreurs** : Centralisée
5. **Cancelation** : Annulation de requêtes
6. **Auto JSON** : Parsing automatique
7. **Timeout** : Configuration flexible

---

## 📊 Comparaison des Technologies

### Performance

| Technologie | Latence | Throughput | Complexité |
|-------------|----------|-------------|-------------|
| **gRPC** | 2-5ms | Très élevé | Moyenne |
| **REST** | 20-50ms | Élevé | Faible |
| **GraphQL** | 25-60ms | Moyen | Moyenne |
| **SOAP** | 100-250ms | Faible | Élevée |

### Cas d'usage

| Scénario | Technologie recommandée |
|----------|----------------------|
| **Microservices internes** | gRPC |
| **API publique mobile/web** | REST |
| **Requêtes complexes/flexibles** | GraphQL |
| **Intégration entreprise** | SOAP |

### Écosystème et outils

| Technologie | Outils disponibles |
|-------------|-------------------|
| **REST** | Swagger, Postman, Insomnia |
| **GraphQL** | GraphQL Playground, Apollo Studio |
| **gRPC** | grpcurl, BloomRPC, Postman gRPC |
| **SOAP** | SoapUI, WSDL Analyzer |

---

## 🔗 Intégration dans IR Bank 2026

### Architecture multi-API

```mermaid
graph TB
    subgraph "Frontend React"
        A[Axios Client]
        B[Services Layer]
    end
    
    subgraph "Backend Spring Boot"
        C[REST Controllers]
        D[GraphQL Controllers]
        E[gRPC Services]
        F[SOAP Controllers]
        G[Business Logic]
    end
    
    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    C --> G
    D --> G
    E --> G
    F --> G
    
    H[Swagger UI] --> C
    I[GraphQL Playground] --> D
    J[gRPC Client] --> E
    K[SOAP Client] --> F
```

### Configuration unifiée

```java
@Configuration
public class WebConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

Cette architecture multi-protocoles permet à IR Bank 2026 de s'intégrer facilement avec différents types de clients tout en offrant des performances optimales selon les cas d'usage spécifiques.

---

*📅 Document mis à jour : Janvier 2026*
