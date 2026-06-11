# 📝 Clases Detalladas - Biblia Católica API

> ⚠️ **Nota de contexto (junio 2026):** este documento didáctico se escribió en la fase inicial del proyecto (migraciones V1–V3, Biblia de Jerusalén en español). **Los conceptos siguen siendo válidos**, pero el estado actual es: migraciones **V1–V11**, contenido bíblico **CPDV en inglés** (V6), 10 controladores REST y nuevas tablas (trials, progreso, suscripciones). El estado real verificado está en `DOCUMENTACION_MAESTRA_2026.md`.

## 📚 Índice

1. [Punto de Entrada](#punto-de-entrada)
2. [Capa Domain (Dominio)](#capa-domain)
3. [Capa Application (Servicios)](#capa-application)
4. [Capa Infrastructure (Infraestructura)](#capa-infrastructure)

---

## 🚀 Punto de Entrada

### `BibliaApiApplication.java`

```java
@SpringBootApplication
public class BibliaApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(BibliaApiApplication.class, args);
    }
}
```

**¿Qué hace?**
- Es el punto de entrada de la aplicación
- `@SpringBootApplication` combina 3 anotaciones:
  - `@Configuration` → Permite definir beans
  - `@EnableAutoConfiguration` → Configura Spring automáticamente
  - `@ComponentScan` → Escanea y registra todos los `@Component`, `@Service`, etc.

**¿Por qué es tan simple?**
Spring Boot hace toda la magia automáticamente. Lee `application.yml`, conecta a la BD, levanta el servidor, etc.

---

## 🧠 Capa Domain

La capa más importante. Contiene el "cerebro" de la aplicación.

### 📦 Models (Entidades de Dominio)

#### `Book.java`

```java
@Getter
@Builder
public class Book {
    private final String id;           // "genesis", "matthew"
    private final String name;          // "Génesis", "San Mateo"
    private final String abbreviation;  // "Gn", "Mt"
    private final Testament testament;  // OLD o NEW
    private final BookCategory category; // PENTATEUCH, GOSPELS, etc.
    private final int totalChapters;
    private final int orderIndex;       // Posición en la Biblia (1-73)
    private final String description;
    private final String author;
    private final String historicalContext;

    public boolean isOldTestament() {
        return testament == Testament.OLD;
    }

    public boolean isNewTestament() {
        return testament == Testament.NEW;
    }

    public String getFullReference() {
        return String.format("%s (%s)", name, abbreviation);
    }
}
```

**¿Qué representa?**
Un libro de la Biblia (Génesis, Mateo, Apocalipsis, etc.)

**Decisiones de diseño:**
- `@Getter` → Genera getters automáticamente (Lombok)
- `@Builder` → Permite crear objetos con `Book.builder().id("genesis").build()`
- `final` → Campos inmutables (no pueden cambiar después de crearse)
- Métodos de negocio → `isOldTestament()`, `getFullReference()`

---

#### `Testament.java`

```java
public enum Testament {
    OLD("old"),
    NEW("new");

    private final String code;

    Testament(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public static Testament fromCode(String code) {
        return switch (code.toLowerCase()) {
            case "old" -> OLD;
            case "new" -> NEW;
            default -> throw new IllegalArgumentException("Unknown testament: " + code);
        };
    }
}
```

**¿Qué representa?**
Los dos testamentos de la Biblia.

**¿Por qué enum?**
- Solo hay 2 valores posibles (OLD, NEW)
- Type-safe (no puedes pasar un String incorrecto)
- `fromCode("old")` convierte String a enum

---

#### `BookCategory.java`

```java
public enum BookCategory {
    PENTATEUCH("Pentateuco"),
    HISTORICAL("Históricos"),
    WISDOM("Sapienciales"),
    PROPHETS("Profetas"),
    GOSPELS("Evangelios"),
    ACTS("Hechos"),
    PAULINE_EPISTLES("Cartas Paulinas"),
    CATHOLIC_EPISTLES("Cartas Católicas"),
    REVELATION("Apocalipsis");

    private final String displayName;

    public String getDisplayName() {
        return displayName;
    }
}
```

**¿Qué representa?**
Las categorías de libros de la Biblia.

---

#### `Chapter.java`

```java
@Getter
@Builder
public class Chapter {
    private final UUID id;
    private final String bookId;
    private final int chapterNumber;
    private final String version;       // "Biblia de Jerusalén"
    private final List<Section> sections;
    private final ChapterReference previousChapter;
    private final ChapterReference nextChapter;

    public int getTotalVerses() {
        return sections.stream()
                .mapToInt(s -> s.getVerses().size())
                .sum();
    }
}
```

**¿Qué representa?**
Un capítulo de un libro (ej: Génesis 1).

**Campos importantes:**
- `sections` → Lista de secciones (partes con título)
- `previousChapter` / `nextChapter` → Para navegación

---

#### `Section.java`

```java
@Getter
@Builder
public class Section {
    private final UUID id;
    private final String title;    // "La creación", "Las Bienaventuranzas"
    private final int orderIndex;
    private final List<Verse> verses;
}
```

**¿Qué representa?**
Una sección dentro de un capítulo.

**Ejemplo:**
```
Mateo 5:
├── Sección 1: "Las Bienaventuranzas" (v. 1-12)
├── Sección 2: "Sal de la tierra y luz del mundo" (v. 13-16)
└── Sección 3: "Jesús y la Ley" (v. 17-20)
```

---

#### `Verse.java`

```java
@Getter
@Builder
public class Verse {
    private final UUID id;
    private final int verseNumber;
    private final String text;
    private final boolean hasNote;

    public String getReference(String bookAbbreviation, int chapter) {
        return String.format("%s %d:%d", bookAbbreviation, chapter, verseNumber);
    }
}
```

**¿Qué representa?**
Un versículo individual.

---

#### `User.java`

```java
@Getter
@Builder
public class User {
    private final UUID id;
    private final String email;
    private final String passwordHash;
    private final String fullName;
    private final boolean emailVerified;
    private final boolean active;
    private final LocalDateTime createdAt;
    private final LocalDateTime lastLoginAt;

    public boolean canLogin() {
        return active && emailVerified;
    }
}
```

**¿Qué representa?**
Un usuario de la aplicación.

**Nota:** `passwordHash` almacena la contraseña encriptada, NO la contraseña real.

---

#### `Favorite.java`

```java
@Getter
@Builder
public class Favorite {
    private final UUID id;
    private final UUID userId;
    private final UUID verseId;
    private final String bookId;
    private final String bookName;
    private final int chapterNumber;
    private final int verseNumber;
    private final String verseText;
    private final String note;
    private final List<String> tags;
    private final LocalDateTime createdAt;

    public String getReference() {
        return String.format("%s %d:%d", bookName, chapterNumber, verseNumber);
    }
}
```

**¿Qué representa?**
Un versículo guardado como favorito por un usuario.

---

### 🔌 Ports IN (Casos de Uso)

#### `BibleUseCase.java`

```java
public interface BibleUseCase {

    // Libros
    BooksResponse getAllBooks();
    List<Book> getBooksByTestament(Testament testament);
    Book getBookById(String bookId);

    // Capítulos
    Chapter getChapter(String bookId, int chapterNumber);
    Chapter getChapter(String bookId, int chapterNumber, String version);

    // Versículos
    Verse getVerse(String bookId, int chapter, int verse);
    List<Verse> getVerses(String bookId, int chapter, int startVerse, int endVerse);

    // Búsqueda
    SearchResult.SearchResultPage searchVerses(SearchQuery query);

    // DTOs internos
    record BooksResponse(List<Book> oldTestament, List<Book> newTestament) {}
    
    record SearchQuery(
        String query,
        Testament testament,
        List<String> bookIds,
        int page,
        int pageSize
    ) {}
}
```

**¿Qué es?**
Define QUÉ puede hacer la aplicación relacionado con la Biblia.

**¿Quién lo implementa?**
`BibleService` en la capa application.

**¿Quién lo usa?**
`BibleController` en la capa infrastructure.

---

#### `AuthenticationUseCase.java`

```java
public interface AuthenticationUseCase {

    AuthResult register(RegisterCommand command);
    AuthResult login(LoginCommand command);
    AuthResult refreshToken(String refreshToken);
    void logout(UUID userId, String token);
    User getCurrentUser(String token);

    record RegisterCommand(String email, String password, String fullName) {}
    record LoginCommand(String email, String password) {}
    record AuthResult(User user, String accessToken, String refreshToken, long expiresIn) {}
}
```

**¿Qué define?**
Operaciones de autenticación: registro, login, logout, etc.

---

#### `FavoriteUseCase.java`

```java
public interface FavoriteUseCase {

    List<Favorite> getUserFavorites(UUID userId);
    List<Favorite> getUserFavorites(UUID userId, Testament testament);
    Favorite addFavorite(AddFavoriteCommand command);
    Favorite updateFavorite(UUID favoriteId, UUID userId, UpdateFavoriteCommand command);
    void removeFavorite(UUID favoriteId, UUID userId);
    boolean isFavorite(UUID userId, String bookId, int chapter, int verse);

    record AddFavoriteCommand(
        UUID userId,
        String bookId,
        int chapterNumber,
        int verseNumber,
        String note,
        List<String> tags
    ) {}

    record UpdateFavoriteCommand(String note, List<String> tags) {}
}
```

**¿Qué define?**
Operaciones para manejar versículos favoritos.

---

### 🔌 Ports OUT (Repositorios)

#### `BibleRepositoryPort.java`

```java
public interface BibleRepositoryPort {

    // Libros
    List<Book> findAllBooks();
    List<Book> findBooksByTestament(Testament testament);
    Optional<Book> findBookById(String bookId);
    Book saveBook(Book book);

    // Capítulos
    Optional<Chapter> findChapter(String bookId, int chapterNumber);
    Optional<Chapter> findChapter(String bookId, int chapterNumber, String version);
    List<Chapter> findChaptersByBookId(String bookId);
    Chapter saveChapter(Chapter chapter);

    // Versículos
    Optional<Verse> findVerse(String bookId, int chapterNumber, int verseNumber);
    List<Verse> findVerses(String bookId, int chapterNumber, int startVerse, int endVerse);
    List<Verse> findVersesByChapter(UUID chapterId);
    Verse saveVerse(Verse verse);

    // Búsqueda
    List<SearchResult> searchVerses(String query, int limit, int offset);
    List<SearchResult> searchVersesByTestament(String query, Testament testament, int limit, int offset);
    List<SearchResult> searchVersesByBook(String query, String bookId, int limit, int offset);
    long countSearchResults(String query);
    long countSearchResultsByTestament(String query, Testament testament);
}
```

**¿Qué define?**
QUÉ necesita la aplicación de la base de datos.

**¿Quién lo implementa?**
`BiblePersistenceAdapter` en la capa infrastructure.

**Nota:** Es una INTERFAZ. No sabe si la BD es PostgreSQL, MongoDB o un archivo JSON.

---

#### `UserRepositoryPort.java`

```java
public interface UserRepositoryPort {
    Optional<User> findById(UUID id);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    User save(User user);
    void updateLastLogin(UUID userId, LocalDateTime lastLogin);
}
```

---

### ⚠️ Exceptions (Excepciones)

#### `DomainException.java`

```java
public abstract class DomainException extends RuntimeException {
    protected DomainException(String message) {
        super(message);
    }
}
```

**¿Qué es?**
Clase base para todas las excepciones del dominio.

---

#### `ResourceNotFoundException.java`

```java
public class ResourceNotFoundException extends DomainException {
    public ResourceNotFoundException(String resourceName, String identifier) {
        super(String.format("%s no encontrado: %s", resourceName, identifier));
    }
}
```

**¿Cuándo se lanza?**
Cuando buscas algo que no existe.

```java
Book book = bibleRepository.findBookById("genesis")
    .orElseThrow(() -> new ResourceNotFoundException("Libro", "genesis"));
```

---

#### `AuthenticationException.java`

```java
public class AuthenticationException extends DomainException {
    public AuthenticationException(String message) {
        super(message);
    }
}
```

**¿Cuándo se lanza?**
- Credenciales incorrectas
- Token expirado
- Usuario deshabilitado

---

## 🔧 Capa Application

### Services (Servicios)

#### `BibleService.java`

```java
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BibleService implements BibleUseCase {

    private final BibleRepositoryPort bibleRepository;

    @Override
    public BooksResponse getAllBooks() {
        log.debug("Obteniendo todos los libros de la Biblia");
        
        List<Book> oldTestament = bibleRepository.findBooksByTestament(Testament.OLD);
        List<Book> newTestament = bibleRepository.findBooksByTestament(Testament.NEW);
        
        return new BooksResponse(oldTestament, newTestament);
    }

    @Override
    public Book getBookById(String bookId) {
        log.debug("Obteniendo libro: {}", bookId);
        
        return bibleRepository.findBookById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Libro", bookId));
    }

    @Override
    public Chapter getChapter(String bookId, int chapterNumber) {
        log.debug("Obteniendo capítulo {}.{}", bookId, chapterNumber);
        
        return bibleRepository.findChapter(bookId, chapterNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Capítulo",
                        String.format("%s %d", bookId, chapterNumber)));
    }

    @Override
    public SearchResult.SearchResultPage searchVerses(SearchQuery query) {
        log.debug("Buscando versículos con query: {}", query.query());

        int offset = query.page() * query.pageSize();
        List<SearchResult> results;
        long totalResults;

        if (query.testament() != null) {
            results = bibleRepository.searchVersesByTestament(
                    query.query(), query.testament(), query.pageSize(), offset);
            totalResults = bibleRepository.countSearchResultsByTestament(
                    query.query(), query.testament());
        } else {
            results = bibleRepository.searchVerses(query.query(), query.pageSize(), offset);
            totalResults = bibleRepository.countSearchResults(query.query());
        }

        return SearchResult.SearchResultPage.builder()
                .results(results)
                .totalResults(totalResults)
                .page(query.page())
                .pageSize(query.pageSize())
                .hasMore(offset + results.size() < totalResults)
                .build();
    }
}
```

**Anotaciones explicadas:**
- `@Slf4j` → Crea automáticamente `log.debug()`, `log.info()`, etc.
- `@Service` → Spring lo registra como servicio
- `@RequiredArgsConstructor` → Genera constructor con `bibleRepository`
- `@Transactional(readOnly = true)` → Optimiza consultas de solo lectura

**¿Qué hace?**
- Implementa `BibleUseCase`
- Orquesta llamadas al repositorio
- Transforma datos si es necesario
- Lanza excepciones de negocio

---

#### `AuthenticationService.java`

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService implements AuthenticationUseCase {

    private final UserRepositoryPort userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AuthResult register(RegisterCommand command) {
        log.info("Registrando usuario: {}", command.email());

        // Verificar si el email ya existe
        if (userRepository.existsByEmail(command.email())) {
            throw new DuplicateResourceException("Usuario", command.email());
        }

        // Crear usuario con contraseña encriptada
        User user = User.builder()
                .id(UUID.randomUUID())
                .email(command.email())
                .passwordHash(passwordEncoder.encode(command.password()))
                .fullName(command.fullName())
                .emailVerified(true)  // Simplificado para demo
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        // Generar tokens
        String accessToken = jwtTokenProvider.generateAccessToken(savedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser);

        return new AuthResult(
                savedUser,
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpiration()
        );
    }

    @Override
    @Transactional
    public AuthResult login(LoginCommand command) {
        log.info("Login de usuario: {}", command.email());

        // Buscar usuario
        User user = userRepository.findByEmail(command.email())
                .orElseThrow(() -> new AuthenticationException("Credenciales inválidas"));

        // Verificar contraseña
        if (!passwordEncoder.matches(command.password(), user.getPasswordHash())) {
            throw new AuthenticationException("Credenciales inválidas");
        }

        // Verificar que puede hacer login
        if (!user.canLogin()) {
            throw new AuthenticationException("Usuario deshabilitado o no verificado");
        }

        // Actualizar último login
        userRepository.updateLastLogin(user.getId(), LocalDateTime.now());

        // Generar tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        return new AuthResult(user, accessToken, refreshToken, 
                jwtTokenProvider.getAccessTokenExpiration());
    }
}
```

**¿Qué hace?**
- Maneja registro y login
- Encripta contraseñas con `BCrypt`
- Genera tokens JWT
- Verifica credenciales

---

## ⚙️ Capa Infrastructure

### 🔐 Security (Seguridad)

#### `SecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // Deshabilitado para API REST
            .cors(cors -> cors.configure(http))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/bible/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                // Todo lo demás requiere autenticación
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**¿Qué hace?**
- Configura Spring Security
- Define qué rutas son públicas y cuáles requieren login
- Añade el filtro JWT para validar tokens

---

#### `JwtTokenProvider.java`

```java
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenExpiration;

    public String generateAccessToken(User user) {
        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("name", user.getFullName())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }
}
```

**¿Qué hace?**
- Genera tokens JWT para usuarios autenticados
- Valida tokens recibidos
- Extrae información del usuario del token

---

#### `JwtAuthenticationFilter.java`

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (jwtTokenProvider.validateToken(token)) {
            String userId = jwtTokenProvider.getUserIdFromToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(userId);

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
```

**¿Qué hace?**
- Intercepta todas las peticiones HTTP
- Busca el header `Authorization: Bearer <token>`
- Valida el token y establece el usuario en el contexto de seguridad

---

### 🌐 Controllers (REST)

#### `BibleController.java`

```java
@Slf4j
@RestController
@RequestMapping("/bible")
@RequiredArgsConstructor
@Tag(name = "Biblia", description = "Endpoints para contenido bíblico")
public class BibleController {

    private final BibleUseCase bibleUseCase;

    @GetMapping("/books")
    @Operation(summary = "Obtener todos los libros")
    public ResponseEntity<BibleDto.BooksResponse> getAllBooks() {
        BibleUseCase.BooksResponse books = bibleUseCase.getAllBooks();
        return ResponseEntity.ok(new BibleDto.BooksResponse(
                books.oldTestament().stream().map(this::toBookDto).toList(),
                books.newTestament().stream().map(this::toBookDto).toList()
        ));
    }

    @GetMapping("/books/{bookId}")
    @Operation(summary = "Obtener un libro por ID")
    public ResponseEntity<BibleDto.BookDetailDto> getBook(
            @Parameter(description = "ID del libro", example = "genesis")
            @PathVariable String bookId) {
        Book book = bibleUseCase.getBookById(bookId);
        return ResponseEntity.ok(toBookDetailDto(book));
    }

    @GetMapping("/books/{bookId}/chapters/{chapterNumber}")
    @Operation(summary = "Obtener un capítulo")
    public ResponseEntity<BibleDto.ChapterResponse> getChapter(
            @PathVariable String bookId,
            @PathVariable int chapterNumber) {
        Chapter chapter = bibleUseCase.getChapter(bookId, chapterNumber);
        return ResponseEntity.ok(toChapterResponse(chapter));
    }

    @GetMapping("/search")
    @Operation(summary = "Buscar versículos")
    public ResponseEntity<BibleDto.SearchResponse> searchVerses(
            @RequestParam String query,
            @RequestParam(required = false) String testament,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        
        Testament testamentFilter = testament != null ? 
                Testament.fromCode(testament) : null;

        SearchResult.SearchResultPage results = bibleUseCase.searchVerses(
                new BibleUseCase.SearchQuery(query, testamentFilter, null, page, pageSize)
        );

        return ResponseEntity.ok(toSearchResponse(results));
    }

    // Métodos privados de conversión a DTO
    private BibleDto.BookDto toBookDto(Book book) { ... }
    private BibleDto.BookDetailDto toBookDetailDto(Book book) { ... }
    private BibleDto.ChapterResponse toChapterResponse(Chapter chapter) { ... }
}
```

**Anotaciones Swagger:**
- `@Tag` → Agrupa endpoints en Swagger
- `@Operation` → Describe el endpoint
- `@Parameter` → Describe un parámetro

---

#### `AuthController.java`

```java
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación")
public class AuthController {

    private final AuthenticationUseCase authenticationUseCase;

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario")
    public ResponseEntity<AuthDto.AuthResponse> register(
            @Valid @RequestBody AuthDto.RegisterRequest request) {
        
        AuthenticationUseCase.AuthResult result = authenticationUseCase.register(
                new AuthenticationUseCase.RegisterCommand(
                        request.email(),
                        request.password(),
                        request.fullName()
                )
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toAuthResponse(result));
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión")
    public ResponseEntity<AuthDto.AuthResponse> login(
            @Valid @RequestBody AuthDto.LoginRequest request) {
        
        AuthenticationUseCase.AuthResult result = authenticationUseCase.login(
                new AuthenticationUseCase.LoginCommand(
                        request.email(),
                        request.password()
                )
        );

        return ResponseEntity.ok(toAuthResponse(result));
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener usuario actual")
    public ResponseEntity<AuthDto.UserDto> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.replace("Bearer ", "");
        User user = authenticationUseCase.getCurrentUser(token);
        
        return ResponseEntity.ok(new AuthDto.UserDto(
                user.getId().toString(),
                user.getEmail(),
                user.getFullName()
        ));
    }
}
```

---

### 📋 DTOs (Data Transfer Objects)

#### `BibleDto.java`

```java
public class BibleDto {

    public record BookDto(
        String id,
        String name,
        String abbreviation,
        String testament,
        String category,
        int totalChapters,
        String description
    ) {}

    public record BooksResponse(
        List<BookDto> oldTestament,
        List<BookDto> newTestament
    ) {}

    public record ChapterResponse(
        String bookId,
        String bookName,
        int chapter,
        String version,
        List<SectionDto> sections,
        ChapterReferenceDto previousChapter,
        ChapterReferenceDto nextChapter
    ) {}

    public record SectionDto(
        String title,
        List<VerseDto> verses
    ) {}

    public record VerseDto(
        int number,
        String text,
        boolean hasNote
    ) {}

    public record SearchResponse(
        List<SearchResultDto> results,
        long total,
        int page,
        int pageSize,
        boolean hasMore
    ) {}
}
```

**¿Por qué records?**
- Java 14+ feature
- Inmutables automáticamente
- Genera `equals()`, `hashCode()`, `toString()`
- Sintaxis compacta

---

### 💾 Persistence (Persistencia)

#### `BookEntity.java`

```java
@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
public class BookEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String abbreviation;

    @Column(nullable = false)
    private String testament;

    @Column(nullable = false)
    private String category;

    @Column(name = "total_chapters", nullable = false)
    private int totalChapters;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String author;

    @Column(name = "historical_context", columnDefinition = "TEXT")
    private String historicalContext;
}
```

**Diferencia con Book (domain):**
- Tiene `@Entity`, `@Table`, `@Column` (JPA)
- Es mutable (`@Setter`)
- Pertenece a la capa infrastructure

---

#### `JpaBookRepository.java`

```java
@Repository
public interface JpaBookRepository extends JpaRepository<BookEntity, String> {

    List<BookEntity> findAllByOrderByOrderIndexAsc();

    List<BookEntity> findByTestamentOrderByOrderIndexAsc(String testament);

    @Query("SELECT b FROM BookEntity b WHERE b.category = :category ORDER BY b.orderIndex")
    List<BookEntity> findByCategory(@Param("category") String category);
}
```

**¿Qué hace?**
- Extiende `JpaRepository` (Spring Data JPA)
- Spring genera la implementación automáticamente
- Los métodos se traducen a SQL

**Ejemplo de traducción:**
```java
findByTestamentOrderByOrderIndexAsc("old")
// Se traduce a:
SELECT * FROM books WHERE testament = 'old' ORDER BY order_index ASC
```

---

#### `BiblePersistenceAdapter.java`

```java
@Component
@RequiredArgsConstructor
public class BiblePersistenceAdapter implements BibleRepositoryPort {

    private final JpaBookRepository bookRepository;
    private final JpaChapterRepository chapterRepository;
    private final JpaVerseRepository verseRepository;

    @Override
    public List<Book> findAllBooks() {
        return bookRepository.findAllByOrderByOrderIndexAsc().stream()
                .map(this::toBookDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Book> findBookById(String bookId) {
        return bookRepository.findById(bookId)
                .map(this::toBookDomain);
    }

    // Convierte Entity JPA → Model de Dominio
    private Book toBookDomain(BookEntity entity) {
        return Book.builder()
                .id(entity.getId())
                .name(entity.getName())
                .abbreviation(entity.getAbbreviation())
                .testament(Testament.fromCode(entity.getTestament()))
                .category(BookCategory.valueOf(entity.getCategory()))
                .totalChapters(entity.getTotalChapters())
                .orderIndex(entity.getOrderIndex())
                .description(entity.getDescription())
                .author(entity.getAuthor())
                .historicalContext(entity.getHistoricalContext())
                .build();
    }

    // Convierte Model de Dominio → Entity JPA
    private BookEntity toBookEntity(Book book) {
        BookEntity entity = new BookEntity();
        entity.setId(book.getId());
        entity.setName(book.getName());
        entity.setAbbreviation(book.getAbbreviation());
        entity.setTestament(book.getTestament().getCode());
        entity.setCategory(book.getCategory().name());
        entity.setTotalChapters(book.getTotalChapters());
        entity.setOrderIndex(book.getOrderIndex());
        entity.setDescription(book.getDescription());
        entity.setAuthor(book.getAuthor());
        entity.setHistoricalContext(book.getHistoricalContext());
        return entity;
    }
}
```

**¿Qué hace?**
- Implementa `BibleRepositoryPort` (puerto OUT)
- Usa repositorios JPA internamente
- Convierte entre Entity (JPA) y Model (dominio)

**Patrón Adapter:**
```
BibleService (usa)→ BibleRepositoryPort (interfaz)
                           ↑
              BiblePersistenceAdapter (implementa)
                           ↓
                  JpaBookRepository (JPA)
                           ↓
                      PostgreSQL
```

---

## 📊 Resumen Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                           DOMAIN                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Models    │  │  Ports IN   │  │      Ports OUT          │ │
│  │ Book, User  │  │ BibleUseCase│  │ BibleRepositoryPort     │ │
│  │ Chapter     │  │ AuthUseCase │  │ UserRepositoryPort      │ │
│  └─────────────┘  └──────▲──────┘  └───────────▲─────────────┘ │
└───────────────────────────│────────────────────│────────────────┘
                            │                    │
┌───────────────────────────│────────────────────│────────────────┐
│                      APPLICATION               │                 │
│  ┌────────────────────────┴──────────────────┐ │                 │
│  │              BibleService                 │ │                 │
│  │         AuthenticationService             │ │                 │
│  └───────────────────────────────────────────┘ │                 │
└────────────────────────────────────────────────│─────────────────┘
                                                 │
┌────────────────────────────────────────────────│─────────────────┐
│                    INFRASTRUCTURE              │                 │
│                                                │                 │
│  Adapters IN                  Adapters OUT     │                 │
│  ┌─────────────────┐          ┌────────────────┴──────────────┐ │
│  │ BibleController │          │ BiblePersistenceAdapter       │ │
│  │ AuthController  │          │ UserPersistenceAdapter        │ │
│  └─────────────────┘          └───────────────────────────────┘ │
│                                          │                       │
│  Config                                  ▼                       │
│  ┌─────────────────┐          ┌───────────────────────────────┐ │
│  │ SecurityConfig  │          │ JPA Repositories              │ │
│  │ JwtProvider     │          │ JpaBookRepository, etc.       │ │
│  └─────────────────┘          └───────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

**Última actualización:** 18 de enero, 2026

