# Documentation Technique - Bank Service Multi-Connector

## Table des Matières

1. [Vue d'ensemble de l'architecture](#vue-densemble-de-larchitecture)
2. [Configuration et déploiement](#configuration-et-déploiement)
3. [Sécurité et authentification](#sécurité-et-authentification)
4. [APIs détaillées](#apis-détaillées)
5. [Base de données](#base-de-données)
6. [Patterns et bonnes pratiques](#patterns-et-bonnes-pratiques)
7. [Monitoring et logging](#monitoring-et-logging)
8. [Performance et optimisation](#performance-et-optimisation)

---

## Vue d'ensemble de l'architecture

### Architecture Globale

Le projet implémente une architecture micro-service avec Spring Boot suivant les principes SOLID et les meilleures pratiques Spring :

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│                  React Application                          │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│                   Web Layer                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────┐ │
│  │   REST API  │ │  SOAP API   │ │ GraphQL API │ │ gRPC  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Business Layer                             │
│              Service Classes                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Data Access Layer                            │
│            Spring Data JPA Repositories                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  Database Layer                             │
│                 H2 In-Memory DB                            │
└─────────────────────────────────────────────────────────────┘
```

### Package Structure

```
ma.formations.multiconnector/
├── config/                     # Configuration Spring
│   ├── SecurityConfiguration.java
│   ├── CxfConfig.java
│   ├── GrpcSecurityConfig.java
│   └── ModelMapperConfig.java
├── dao/                        # Data Access Objects
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   ├── CustomerRepository.java
│   ├── BankAccountRepository.java
│   └── BankAccountTransactionRepository.java
├── dtos/                       # Data Transfer Objects
│   ├── customer/
│   ├── bankaccount/
│   ├── transaction/
│   ├── user/
│   └── exception/
├── enums/                      # Énumérations
│   ├── Roles.java
│   └── Permissions.java
├── model/                      # Entités JPA
│   ├── User.java
│   ├── Role.java
│   ├── Permission.java
│   ├── Customer.java
│   ├── BankAccount.java
│   └── BankAccountTransaction.java
├── presentation/               # Controllers
│   ├── rest/                   # REST API
│   ├── graphql/                # GraphQL API
│   ├── soap/                   # SOAP API
│   └── grpc/                   # gRPC API
├── service/                    # Business Logic
│   ├── impl/
│   └── interfaces/
└── common/                     # Utilitaires
    └── CommonTools.java
```

---

## Configuration et déploiement

### Configuration Spring Boot

#### Application Properties
```properties
# Base de données H2
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true
spring.h2.console.path=/h2

# GraphQL
spring.graphql.graphiql.enabled=true
graphql.date.format=yyyy-MM-dd HH:mm:ss

# OpenAPI/Swagger
springdoc.api-docs.path=/api/rest/docs
springdoc.swagger-ui.path=/api/rest/docs-ui
springdoc.swagger-ui.operationsSorter=method

# gRPC
grpc.server.port=7777
grpc.server.security.enabled=false

# SOAP
cxf.path=/api/soap

# JWT Configuration
privite_key=@zeRtY1931
expiration_delay=86400000
```

### Configuration Maven

#### Dépendances Clés
- **Spring Boot Starters** : web, data-jpa, security, graphql, validation
- **JWT** : io.jsonwebtoken:jjwt:0.9.1
- **SOAP** : Apache CXF 4.0.3
- **gRPC** : io.grpc:grpc-stub, grpc-protobuf
- **Documentation** : SpringDoc OpenAPI
- **Utilitaires** : Lombok, ModelMapper

#### Plugins Maven
```xml
<plugins>
    <!-- Compiler Plugin avec Lombok -->
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
    </plugin>
    
    <!-- Spring Boot Plugin -->
    <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
    
    <!-- Protocol Buffers pour gRPC -->
    <plugin>
        <groupId>com.github.os72</groupId>
        <artifactId>protoc-jar-maven-plugin</artifactId>
    </plugin>
    
    <!-- Correction des annotations gRPC -->
    <plugin>
        <groupId>com.google.code.maven-replacer-plugin</groupId>
        <artifactId>replacer</artifactId>
    </plugin>
</plugins>
```

### Déploiement

#### Développement Local
```bash
# Backend
mvn clean spring-boot:run

# Frontend
cd src
npm install
npm start
```

#### Production
```bash
# Build JAR
mvn clean package

# Exécution
java -jar target/bank-service-multi-connector-0.0.1-SNAPSHOT.jar

# Build Frontend
cd src
npm run build
```

---

## Sécurité et authentification

### Architecture de Sécurité

#### JWT Token Flow
```
Client → Login Request → Spring Security → JWT Token → Client
Client → API Request + JWT → Security Filter → Validation → Controller
```

#### Configuration Spring Security
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/rest/auth/**").permitAll()
                .requestMatchers("/api/rest/docs-ui/**").permitAll()
                .requestMatchers("/h2/**").permitAll()
                .requestMatchers("/graphiql/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(new JwtAuthenticationFilter(), 
                UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

### Rôles et Permissions

#### Hiérarchie des Permissions
```java
public enum Permissions {
    // Customer permissions
    GET_ALL_CUSTUMERS,
    GET_CUSTOMER_BY_IDENTITY,
    CREATE_CUSTOMER,
    UPDATE_CUSTOMER,
    DELETE_CUSTOMER,
    
    // Bank Account permissions
    GET_ALL_BANK_ACCOUNT,
    GET_BANK_ACCOUNT_BY_RIB,
    CREATE_BANK_ACCOUNT,
    
    // Transaction permissions
    ADD_WIRED_TRANSFER,
    GET_TRANSACTIONS
}
```

#### Rôles Prédéfinis
1. **ROLE_AGENT_GUICHET** : CRUD complet clients et comptes
2. **ROLE_AGENT_GUICHET_GET** : Lecture seule clients et comptes
3. **ROLE_CLIENT** : Consultation et virements
4. **ROLE_ADMIN** : Agent Guichet + Client

### JWT Implementation

#### Token Generation
```java
public String generateToken(UserDetails userDetails) {
    Map<String, Object> claims = new HashMap<>();
    return createToken(claims, userDetails.getUsername());
}

private String createToken(Map<String, Object> claims, String subject) {
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(subject)
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + 
            expirationDelay))
        .signWith(SignatureAlgorithm.HS256, privateKey)
        .compact();
}
```

---

## APIs détaillées

### API REST

#### Architecture
- **Base Path** : `/api/rest`
- **Content-Type** : `application/json`
- **Authentication** : Bearer Token JWT

#### Controllers Principaux

##### AuthenticationController
```java
@RestController
@RequestMapping("/api/rest/auth")
public class AuthenticationController {
    
    @PostMapping("/login")
    public ResponseEntity<TokenVo> login(@RequestBody LoginRequest request);
    
    @PostMapping("/register")
    public ResponseEntity<UserVo> register(@RequestBody RegisterRequest request);
}
```

##### CustomerRestController
```java
@RestController
@RequestMapping("/api/rest/customers")
public class CustomerRestController {
    
    @GetMapping
    @PreAuthorize("hasAuthority('GET_ALL_CUSTUMERS')")
    public ResponseEntity<List<CustomerDto>> getAllCustomers();
    
    @GetMapping("/{identityRef}")
    @PreAuthorize("hasAuthority('GET_CUSTOMER_BY_IDENTITY')")
    public ResponseEntity<CustomerDto> getCustomerByIdentity(
        @PathVariable String identityRef);
    
    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_CUSTOMER')")
    public ResponseEntity<AddCustomerResponse> createCustomer(
        @Valid @RequestBody AddCustomerRequest request);
}
```

### API GraphQL

#### Schéma GraphQL
```graphql
type Customer {
    identityRef: String!
    firstname: String!
    lastname: String!
    username: String!
    bankAccounts: [BankAccount]
}

type BankAccount {
    rib: String!
    amount: Float!
    customer: Customer
    transactions: [BankAccountTransaction]
}

type Query {
    getAllCustomers: [Customer]
    getCustomerByIdentityRef(identityRef: String!): Customer
    getAllBankAccounts: [BankAccount]
    getBankAccountByRib(rib: String!): BankAccount
}

type Mutation {
    createCustomer(customer: CustomerInput!): Customer
    createBankAccount(bankAccount: BankAccountInput!): BankAccount
    wiredTransfer(transfer: TransferInput!): Boolean
}
```

#### Controller GraphQL
```java
@Controller
public class CustomerGraphqlController {
    
    @QueryMapping
    public List<CustomerDto> getAllCustomers() {
        return customerService.getAllCustomers();
    }
    
    @QueryMapping
    public CustomerDto getCustomerByIdentityRef(
            @Argument String identityRef) {
        return customerService.getCustomerByIdentityRef(identityRef);
    }
    
    @MutationMapping
    public CustomerDto createCustomer(@Argument AddCustomerRequest request) {
        return customerService.createCustomer(request);
    }
}
```

### API SOAP

#### Configuration CXF
```java
@Configuration
public class CxfConfig {
    
    @Bean
    public ServletRegistrationBean<CXFServlet> cxfServlet() {
        return new ServletRegistrationBean<>(new CXFServlet(), "/api/soap/*");
    }
    
    @Bean(name = Bus.DEFAULT_BUS_ID)
    public SpringBus springBus() {
        return new SpringBus();
    }
}
```

#### Service SOAP Endpoint
```java
@WebService(endpointInterface = "ma.formations.multiconnector.soap.BankSoapService")
@Service
public class BankSoapController implements BankSoapService {
    
    @Override
    public List<CustomerDto> getAllCustomers() {
        return customerService.getAllCustomers();
    }
    
    @Override
    public CustomerDto getCustomerByIdentity(String identityRef) {
        return customerService.getCustomerByIdentityRef(identityRef);
    }
}
```

### API gRPC

#### Fichier Proto
```protobuf
syntax = "proto3";

package bank;

service BankService {
    rpc getAllCustomers(Empty) returns (CustomerList);
    rpc getCustomerByIdentity(CustomerRequest) returns (Customer);
    rpc createCustomer(CreateCustomerRequest) returns (Customer);
    rpc wiredTransfer(TransferRequest) returns (TransferResponse);
}

message Customer {
    string identity_ref = 1;
    string firstname = 2;
    string lastname = 3;
    string username = 4;
}

message TransferRequest {
    string rib_from = 1;
    string rib_to = 2;
    double amount = 3;
    string username = 4;
}
```

#### Controller gRPC
```java
@GrpcService
public class BankGrpcController extends BankServiceGrpc.BankServiceImplBase {
    
    @Override
    public void getAllCustomers(Empty request, 
            StreamObserver<CustomerList> responseObserver) {
        List<CustomerDto> customers = customerService.getAllCustomers();
        CustomerList response = CustomerList.newBuilder()
            .addAllCustomers(convertToGrpcCustomers(customers))
            .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
```

---

## Base de données

### Schéma de la Base de Données

#### Tables Principales

```sql
-- Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    account_non_expired BOOLEAN DEFAULT TRUE,
    account_non_locked BOOLEAN DEFAULT TRUE,
    credentials_non_expired BOOLEAN DEFAULT TRUE,
    enabled BOOLEAN DEFAULT TRUE
);

-- Roles Table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    authority VARCHAR(50) UNIQUE NOT NULL
);

-- Permissions Table
CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    authority VARCHAR(50) UNIQUE NOT NULL
);

-- User-Role Mapping
CREATE TABLE user_roles (
    user_id BIGINT,
    role_id BIGINT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Role-Permission Mapping
CREATE TABLE role_permissions (
    role_id BIGINT,
    permission_id BIGINT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- Customers Table
CREATE TABLE customers (
    identity_ref VARCHAR(50) PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL
);

-- Bank Accounts Table
CREATE TABLE bank_accounts (
    rib VARCHAR(50) PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL,
    customer_identity_ref VARCHAR(50),
    FOREIGN KEY (customer_identity_ref) REFERENCES customers(identity_ref)
);

-- Transactions Table
CREATE TABLE bank_account_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_type VARCHAR(20) NOT NULL,
    bank_account_rib VARCHAR(50),
    FOREIGN KEY (bank_account_rib) REFERENCES bank_accounts(rib)
);
```

### Configuration JPA

#### Entités JPA

```java
@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
    
    @Id
    @Column(name = "identity_ref")
    private String identityRef;
    
    @Column(nullable = false)
    private String firstname;
    
    @Column(nullable = false)
    private String lastname;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BankAccount> bankAccounts;
}

@Entity
@Table(name = "bank_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankAccount {
    
    @Id
    @Column(name = "rib")
    private String rib;
    
    @Column(nullable = false)
    private Double amount;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_identity_ref")
    private Customer customer;
    
    @OneToMany(mappedBy = "bankAccount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BankAccountTransaction> transactions;
}
```

### Repositories Spring Data

```java
@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    
    Optional<Customer> findByUsername(String username);
    
    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.bankAccounts WHERE c.identityRef = :identityRef")
    Optional<Customer> findByIdentityRefWithBankAccounts(@Param("identityRef") String identityRef);
}

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, String> {
    
    List<BankAccount> findByCustomerIdentityRef(String customerIdentityRef);
    
    @Query("SELECT ba FROM BankAccount ba LEFT JOIN FETCH ba.customer WHERE ba.rib = :rib")
    Optional<BankAccount> findByRibWithCustomer(@Param("rib") String rib);
}
```

---

## Patterns et bonnes pratiques

### Design Patterns Implémentés

#### 1. Repository Pattern
```java
@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    // Méthodes de requête personnalisées
}
```

#### 2. Service Layer Pattern
```java
@Service
@Transactional
public class CustomerServiceImpl implements ICustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private ModelMapper modelMapper;
    
    @Override
    public CustomerDto createCustomer(AddCustomerRequest request) {
        // Logique métier
    }
}
```

#### 3. DTO Pattern
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDto {
    private String identityRef;
    private String firstname;
    private String lastname;
    private String username;
    private List<BankAccountDto> bankAccounts;
}
```

#### 4. Strategy Pattern (Mapping)
```java
@Configuration
public class ModelMapperConfig {
    
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
            .setMatchingStrategy(MatchingStrategies.STRICT);
        return modelMapper;
    }
}
```

### Bonnes Pratiques

#### Validation des Entrées
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddCustomerRequest {
    
    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Size(min = 3, max = 50, message = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")
    private String username;
    
    @NotBlank(message = "La référence d'identité est obligatoire")
    @Pattern(regexp = "^[A-Z][0-9]{3}$", message = "La référence doit être au format A000")
    private String identityRef;
    
    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 100)
    private String firstname;
    
    @NotBlank(message = "Le nom de famille est obligatoire")
    @Size(min = 2, max = 100)
    private String lastname;
}
```

#### Gestion des Exceptions
```java
@RestControllerAdvice
public class ExceptionHandlerController {
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(
            EntityNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("Entity Not Found")
            .message(ex.getMessage())
            .path("/api/rest/customers")
            .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
}
```

#### Transaction Management
```java
@Service
@Transactional
public class TransactionServiceImpl implements ITransactionService {
    
    @Override
    @Transactional
    public void wiredTransfer(AddWirerTransferRequest request) {
        // 1. Débiter le compte source
        // 2. Créditer le compte destination
        // 3. Enregistrer les transactions
        // Toute opération en cas d'échec sera rollback
    }
}
```

---

## Monitoring et logging

### Configuration Logging

#### Logback Configuration
```xml
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/bank-service.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/bank-service.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <logger name="ma.formations.multiconnector" level="DEBUG"/>
    <logger name="org.springframework.security" level="DEBUG"/>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

### Logging dans le Code

#### Service Layer Logging
```java
@Slf4j
@Service
public class CustomerServiceImpl implements ICustomerService {
    
    @Override
    public CustomerDto createCustomer(AddCustomerRequest request) {
        log.info("Creating customer with username: {}", request.getUsername());
        
        try {
            // Logique métier
            Customer customer = modelMapper.map(request, Customer.class);
            customer = customerRepository.save(customer);
            
            log.debug("Customer created successfully with ID: {}", customer.getIdentityRef());
            return modelMapper.map(customer, CustomerDto.class);
            
        } catch (Exception e) {
            log.error("Error creating customer: {}", e.getMessage(), e);
            throw new CustomerCreationException("Failed to create customer", e);
        }
    }
}
```

#### Security Logging
```java
@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
            HttpServletResponse response, FilterChain filterChain) {
        
        String token = extractToken(request);
        if (token != null && jwtUtils.validateToken(token)) {
            String username = jwtUtils.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            log.debug("Authenticated user: {} for request: {}", username, request.getRequestURI());
            
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, 
                    userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### Actuator Endpoints

#### Configuration Actuator
```properties
# Actuator endpoints
management.endpoints.web.exposure.include=health,info,metrics,loggers
management.endpoint.health.show-details=always
management.info.env.enabled=true

# Metrics
management.metrics.export.simple.enabled=true
```

#### Custom Health Indicator
```java
@Component
public class BankServiceHealthIndicator implements HealthIndicator {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Override
    public Health health() {
        try {
            long customerCount = customerRepository.count();
            return Health.up()
                .withDetail("database", "H2")
                .withDetail("customerCount", customerCount)
                .withDetail("status", "All systems operational")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .withException(e)
                .build();
        }
    }
}
```

---

## Performance et optimisation

### Optimisations JPA

#### Lazy Loading et Fetch Strategies
```java
@Entity
public class Customer {
    
    @OneToMany(mappedBy = "customer", 
               cascade = CascadeType.ALL, 
               fetch = FetchType.LAZY)
    private List<BankAccount> bankAccounts;
}

// Repository avec JOIN FETCH pour optimiser les requêtes
@Query("SELECT c FROM Customer c LEFT JOIN FETCH c.bankAccounts WHERE c.identityRef = :identityRef")
Optional<Customer> findByIdentityRefWithBankAccounts(@Param("identityRef") String identityRef);
```

#### Pagination
```java
@GetMapping
public ResponseEntity<Page<CustomerDto>> getAllCustomers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "identityRef") String sortBy) {
    
    Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
    Page<Customer> customers = customerRepository.findAll(pageable);
    Page<CustomerDto> customerDtos = customers.map(
        customer -> modelMapper.map(customer, CustomerDto.class));
    
    return ResponseEntity.ok(customerDtos);
}
```

### Caching

#### Configuration Cache
```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .maximumSize(100));
        return cacheManager;
    }
}
```

#### Utilisation du Cache
```java
@Service
public class CustomerServiceImpl implements ICustomerService {
    
    @Cacheable(value = "customers", key = "#identityRef")
    public CustomerDto getCustomerByIdentityRef(String identityRef) {
        Customer customer = customerRepository.findByIdentityRef(identityRef)
            .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        return modelMapper.map(customer, CustomerDto.class);
    }
    
    @CacheEvict(value = "customers", key = "#customer.identityRef")
    public CustomerDto updateCustomer(CustomerDto customer) {
        // Logique de mise à jour
    }
}
```

### Optimisations gRPC

#### Streaming pour grandes données
```java
@GrpcService
public class BankGrpcController extends BankServiceGrpc.BankServiceImplBase {
    
    @Override
    public void streamAllCustomers(Empty request, 
            StreamObserver<Customer> responseObserver) {
        
        try (Stream<Customer> customerStream = customerRepository
                .findAll()
                .stream()
                .map(this::convertToGrpcCustomer)) {
            
            customerStream.forEach(responseObserver::onNext);
            responseObserver.onCompleted();
            
        } catch (Exception e) {
            responseObserver.onError(e);
        }
    }
}
```

### Monitoring Performance

#### Micrometer Metrics
```java
@RestController
public class CustomerRestController {
    
    private final MeterRegistry meterRegistry;
    private final Counter customerCreationCounter;
    
    public CustomerRestController(ICustomerService customerService, 
                                 MeterRegistry meterRegistry) {
        this.customerService = customerService;
        this.meterRegistry = meterRegistry;
        this.customerCreationCounter = Counter.builder("customer.creation.count")
            .description("Number of customers created")
            .register(meterRegistry);
    }
    
    @PostMapping
    public ResponseEntity<AddCustomerResponse> createCustomer(
            @Valid @RequestBody AddCustomerRequest request) {
        
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            AddCustomerResponse response = customerService.createCustomer(request);
            customerCreationCounter.increment();
            return ResponseEntity.ok(response);
        } finally {
            sample.stop(Timer.builder("customer.creation.duration")
                .description("Time taken to create customer")
                .register(meterRegistry));
        }
    }
}
```

---

## Conclusion

Cette documentation technique fournit une vue complète de l'architecture, la configuration et les meilleures pratiques implémentées dans le projet Bank Service Multi-Connector. L'application démontre :

- Une architecture micro-service robuste et scalable
- Quatre types d'API différents (REST, SOAP, GraphQL, gRPC)
- Une sécurité complète avec JWT et Spring Security
- Des bonnes pratiques de développement Java/Spring
- Une gestion efficace des données avec JPA/H2
- Un monitoring et un logging appropriés

Le projet est conçu pour être évolutif et maintenable, en suivant les standards de l'industrie et les meilleures pratiques Spring Boot.
