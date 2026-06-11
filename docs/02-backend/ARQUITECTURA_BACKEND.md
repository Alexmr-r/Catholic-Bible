# 🏗️ Arquitectura del Backend - Biblia Católica API

## 📚 Índice

1. [Explicación Simple (como MVC pero mejor)](#explicación-simple)
2. [La Arquitectura de Cebolla (Onion)](#arquitectura-de-cebolla)
3. [Regla de Dependencias](#regla-de-dependencias)
4. [¿Qué es cada carpeta?](#qué-es-cada-carpeta)
5. [Puertos y Adaptadores](#puertos-y-adaptadores)
6. [Flujo de una Petición](#flujo-de-una-petición)
7. [Comparación con MVC](#comparación-con-mvc)
8. [Decisiones de Diseño](#decisiones-de-diseño)

---

## 🎯 Explicación Simple

### Si ya conoces MVC (Modelo-Vista-Controlador):

```
MVC Tradicional:
┌─────────────────────────────────────┐
│  Vista (HTML/JSON)                  │
│         ↓ ↑                         │
│  Controlador (recibe peticiones)    │
│         ↓ ↑                         │
│  Modelo (datos + lógica + BD)       │ ← TODO mezclado aquí
└─────────────────────────────────────┘
```

**Problema de MVC:** El "Modelo" hace demasiadas cosas:
- Define los datos (User, Book)
- Contiene lógica de negocio (validaciones)
- Accede a la base de datos (queries SQL)

**Nuestra arquitectura separa el Modelo en 3 partes:**

```
Nuestra Arquitectura (es como MVC pero más organizado):

┌─────────────────────────────────────┐
│  Controller (recibe peticiones)     │  ← Igual que MVC
│         ↓ ↑                         │
├─────────────────────────────────────┤
│  Service (lógica de negocio)        │  ← La "inteligencia"
│         ↓ ↑                         │
├─────────────────────────────────────┤
│  Model (solo datos, nada más)       │  ← Datos puros
│         ↓ ↑                         │
├─────────────────────────────────────┤
│  Repository (acceso a BD)           │  ← Solo base de datos
└─────────────────────────────────────┘
```

### Analogía: Un restaurante

Piensa en un restaurante:

| MVC | Nuestra Arquitectura | Restaurante |
|-----|----------------------|-------------|
| Vista | Controller + DTOs | El camarero que toma la comanda |
| Modelo (todo junto) | - | - |
| - | Service | El chef que decide cómo cocinar |
| - | Model | La receta (solo información) |
| - | Repository | El que va a la despensa a buscar ingredientes |

**En MVC:** El chef hace TODO: toma el pedido, decide la receta, busca ingredientes, y cocina.

**En nuestra arquitectura:** Cada uno tiene su trabajo específico.

---

## 🧅 Arquitectura de Cebolla

### ¿Por qué "cebolla"?

Porque tiene **capas** como una cebolla. Lo importante es:
- **El centro** (Domain) no conoce nada de fuera
- **Las capas externas** conocen a las internas, pero NO al revés

```
                    ┌───────────────────────────────┐
                    │                               │
                    │      INFRASTRUCTURE           │  ← Capa externa
                    │   (Controllers, BD, APIs)     │     Conoce TODO
                    │                               │
                    │   ┌───────────────────────┐   │
                    │   │                       │   │
                    │   │     APPLICATION       │   │  ← Capa media
                    │   │     (Services)        │   │     Conoce Domain
                    │   │                       │   │
                    │   │   ┌───────────────┐   │   │
                    │   │   │               │   │   │
                    │   │   │    DOMAIN     │   │   │  ← Centro (el corazón)
                    │   │   │   (Modelos)   │   │   │     NO conoce a nadie
                    │   │   │               │   │   │
                    │   │   └───────────────┘   │   │
                    │   │                       │   │
                    │   └───────────────────────┘   │
                    │                               │
                    └───────────────────────────────┘
```

### Las 3 capas explicadas:

| Capa | ¿Qué contiene? | ¿A quién conoce? | Analogía |
|------|----------------|------------------|----------|
| **Domain** | Modelos (Book, User, Verse) | A NADIE | Las recetas (solo información) |
| **Application** | Services (BibleService) | Solo a Domain | El chef (usa las recetas) |
| **Infrastructure** | Controllers, Repositories, JWT | A Domain y Application | El restaurante completo |

---

## 📏 Regla de Dependencias

### LA REGLA MÁS IMPORTANTE:

> **Las flechas de dependencia SIEMPRE apuntan hacia el centro (Domain)**

```
Infrastructure → Application → Domain ← (nadie le apunta a él desde dentro)
      ↓               ↓           
  (conoce a)      (conoce a)     (no conoce a nadie)
```

### ¿Qué significa esto en código?

```java
// ✅ CORRECTO: Infrastructure conoce a Application
// Archivo: infrastructure/adapter/in/rest/controller/BibleController.java
public class BibleController {
    private final BibleUseCase bibleService;  // ← Usa algo de Application
}

// ✅ CORRECTO: Application conoce a Domain
// Archivo: application/service/BibleService.java
public class BibleService {
    private final BibleRepositoryPort repository;  // ← Interfaz de Domain
    
    public Book getBook(String id) {
        return repository.findById(id);  // ← Devuelve un Book (Domain)
    }
}

// ✅ CORRECTO: Domain NO conoce a nadie
// Archivo: domain/model/Book.java
public class Book {
    private String id;
    private String name;
    // NO importa nada de application ni infrastructure
}

// ❌ INCORRECTO: Domain NO puede conocer a Infrastructure
// Archivo: domain/model/Book.java
import com.bibliacatolica.api.infrastructure.something;  // ❌ PROHIBIDO
```

### ¿Por qué esta regla?

**Porque el centro (Domain) es lo más importante y estable:**
- Si cambias de PostgreSQL a MongoDB → Solo cambias Infrastructure
- Si cambias de REST a GraphQL → Solo cambias Infrastructure
- Domain (las reglas de negocio) NO cambia

---

## 📁 ¿Qué es cada carpeta?

### Estructura visual:

```
src/main/java/com/bibliacatolica/api/
│
├── domain/                 ← 🎯 EL CENTRO (no conoce a nadie)
│   ├── model/              ← Los datos puros
│   │   ├── Book.java
│   │   ├── Chapter.java
│   │   ├── User.java
│   │   └── Verse.java
│   │
│   ├── port/               ← Las interfaces (contratos)
│   │   ├── in/             ← "¿Qué puedo hacer?" (UseCases)
│   │   └── out/            ← "¿Qué necesito?" (Repositories)
│   │
│   └── exception/          ← Errores de negocio
│
├── application/            ← 🔧 LA LÓGICA (conoce a Domain)
│   └── service/
│       ├── BibleService.java
│       └── AuthService.java
│
└── infrastructure/         ← ⚙️ LA TECNOLOGÍA (conoce a todos)
    ├── adapter/
    │   ├── in/             ← Entrada (REST Controllers)
    │   └── out/            ← Salida (Base de datos)
    └── config/             ← Configuraciones (Security, Swagger)
```

### Explicación de cada parte:

#### 1. `domain/model/` - Los Modelos

**¿Qué son?** Clases que representan los datos de tu aplicación.

```java
// domain/model/Book.java
public class Book {
    private String id;           // "genesis"
    private String name;         // "Génesis"
    private int totalChapters;   // 50
    
    // Puede tener métodos de negocio simples
    public boolean isOldTestament() {
        return this.testament == Testament.OLD;
    }
}
```

**Reglas:**
- ❌ NO tienen `@Entity` (eso es de JPA/Infrastructure)
- ❌ NO tienen `@RestController` (eso es de Spring/Infrastructure)
- ✅ Son Java puro, sin dependencias externas

---

#### 2. `domain/port/` - Los Puertos

**¿Qué son?** Interfaces que definen "contratos".

**Puerto IN (entrada) = "¿Qué puede hacer la aplicación?"**

```java
// domain/port/in/BibleUseCase.java
public interface BibleUseCase {
    List<Book> getAllBooks();
    Book getBookById(String id);
    Chapter getChapter(String bookId, int number);
}
```

Es como un menú de restaurante: define QUÉ puedes pedir, pero no CÓMO se prepara.

**Puerto OUT (salida) = "¿Qué necesita la aplicación?"**

```java
// domain/port/out/BibleRepositoryPort.java
public interface BibleRepositoryPort {
    Optional<Book> findById(String id);
    List<Book> findByTestament(Testament testament);
}
```

Es como decir "necesito alguien que me traiga libros", sin decir DE DÓNDE (PostgreSQL, MongoDB, archivo JSON, etc.)

---

#### 3. `application/service/` - Los Servicios

**¿Qué son?** Clases que IMPLEMENTAN la lógica de negocio.

```java
// application/service/BibleService.java
@Service
public class BibleService implements BibleUseCase {

    private final BibleRepositoryPort repository;  // ← Puerto OUT

    @Override
    public Book getBookById(String id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Libro no encontrado"));
    }
    
    @Override
    public List<Book> getAllBooks() {
        return repository.findAll();
    }
}
```

**Observa:**
- Implementa `BibleUseCase` (puerto IN de Domain)
- Usa `BibleRepositoryPort` (puerto OUT de Domain)
- NO sabe si la BD es PostgreSQL, MongoDB, o un archivo

---

#### 4. `infrastructure/adapter/in/` - Adaptadores de Entrada

**¿Qué son?** Lo que recibe peticiones del exterior (HTTP, CLI, etc.)

```java
// infrastructure/adapter/in/rest/controller/BibleController.java
@RestController
@RequestMapping("/bible")
public class BibleController {

    private final BibleUseCase bibleService;  // ← Puerto IN

    @GetMapping("/books")
    public List<BookDto> getAllBooks() {
        List<Book> books = bibleService.getAllBooks();
        return books.stream().map(this::toDto).toList();
    }
    
    @GetMapping("/books/{id}")
    public BookDto getBook(@PathVariable String id) {
        Book book = bibleService.getBookById(id);
        return toDto(book);
    }
}
```

**Observa:**
- Usa `BibleUseCase` (NO `BibleService` directamente)
- Convierte `Book` (Domain) a `BookDto` (lo que ve el cliente)

---

#### 5. `infrastructure/adapter/out/` - Adaptadores de Salida

**¿Qué son?** Lo que conecta con sistemas externos (BD, APIs, etc.)

```java
// infrastructure/adapter/out/persistence/BiblePersistenceAdapter.java
@Component
public class BiblePersistenceAdapter implements BibleRepositoryPort {

    private final JpaBookRepository jpaRepository;  // ← Spring Data JPA

    @Override
    public Optional<Book> findById(String id) {
        return jpaRepository.findById(id)
            .map(this::toDomain);  // Convierte Entity → Domain
    }
    
    private Book toDomain(BookEntity entity) {
        return Book.builder()
            .id(entity.getId())
            .name(entity.getName())
            .build();
    }
}
```

**Observa:**
- Implementa `BibleRepositoryPort` (puerto OUT de Domain)
- Usa `JpaBookRepository` (Spring Data JPA - tecnología específica)
- Convierte `BookEntity` (JPA) → `Book` (Domain)

---

## 🔌 Puertos y Adaptadores

### Analogía: Enchufes eléctricos

Piensa en un enchufe:

```
TU LÁMPARA                    ENCHUFE                    RED ELÉCTRICA
(necesita                     (interfaz                  (provee
 electricidad)                 estándar)                  electricidad)
     │                            │                            │
     │         ┌──────────────────┴──────────────────┐        │
     └────────►│  🔌 Puerto (interfaz estándar)     │◄───────┘
               └──────────────────────────────────────┘
```

**La lámpara NO sabe:**
- De dónde viene la electricidad (hidroeléctrica, solar, nuclear)
- Cómo funciona la red eléctrica
- Solo sabe que si se enchufa, funciona

**En nuestra arquitectura:**

```
BibleService                BibleRepositoryPort              PostgreSQL
(necesita                   (interfaz                        (provee
 datos)                      estándar)                        datos)
     │                            │                              │
     │         ┌──────────────────┴──────────────────┐          │
     └────────►│  🔌 Puerto (interface Java)         │◄─────────┘
               └──────────────────────────────────────┘
                              ▲
                              │
                    Adaptador (implementación)
                    BiblePersistenceAdapter
```

**El servicio NO sabe:**
- Si los datos vienen de PostgreSQL, MongoDB, o un JSON
- Cómo funciona JPA
- Solo sabe que si llama al puerto, recibe datos

### ¿Por qué esto es útil?

```java
// Si mañana quieres cambiar de PostgreSQL a MongoDB:

// ANTES (con PostgreSQL):
@Component
public class BiblePersistenceAdapter implements BibleRepositoryPort {
    private final JpaBookRepository jpaRepo;  // ← PostgreSQL
}

// DESPUÉS (con MongoDB):
@Component
public class BibleMongoAdapter implements BibleRepositoryPort {
    private final MongoBookRepository mongoRepo;  // ← MongoDB
}

// BibleService NO CAMBIA NADA ✅
// BibleController NO CAMBIA NADA ✅
// Solo cambias el adaptador
```

---

## 🔄 Flujo de una Petición

### Ejemplo: `GET /api/v1/bible/books/genesis`

```
   CLIENTE
      │
      │ GET /api/v1/bible/books/genesis
      ▼
┌─────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                          │
│  ┌────────────────────────────────────────────────────────┐│
│  │ BibleController                                        ││
│  │   @GetMapping("/books/{id}")                          ││
│  │   public BookDto getBook(String id) {                 ││
│  │       Book book = bibleUseCase.getBookById(id); ──────┼┼─┐
│  │       return toDto(book);                             ││ │
│  │   }                                                   ││ │
│  └────────────────────────────────────────────────────────┘│ │
└─────────────────────────────────────────────────────────────┘ │
                                                                │
┌───────────────────────────────────────────────────────────────│─┐
│                      APPLICATION                              │ │
│  ┌──────────────────────────────────────────────────────────┐ │ │
│  │ BibleService implements BibleUseCase                     │ │ │
│  │                                                          │◄┘ │
│  │   public Book getBookById(String id) {                   │   │
│  │       return repository.findById(id) ────────────────────┼───┼─┐
│  │           .orElseThrow(() -> new NotFoundException());   │   │ │
│  │   }                                                      │   │ │
│  └──────────────────────────────────────────────────────────┘   │ │
└─────────────────────────────────────────────────────────────────┘ │
                                                                    │
┌───────────────────────────────────────────────────────────────────│─┐
│                      INFRASTRUCTURE                               │ │
│  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │ BiblePersistenceAdapter implements BibleRepositoryPort       │◄┘ │
│  │                                                              │   │
│  │   public Optional<Book> findById(String id) {                │   │
│  │       BookEntity entity = jpaRepo.findById(id); ─────────────┼───┼─┐
│  │       return Optional.of(toDomain(entity));                  │   │ │
│  │   }                                                          │   │ │
│  └──────────────────────────────────────────────────────────────┘   │ │
└─────────────────────────────────────────────────────────────────────┘ │
                                                                        │
┌───────────────────────────────────────────────────────────────────────│─┐
│                       POSTGRESQL                                      │ │
│                                                                       │ │
│  SELECT * FROM books WHERE id = 'genesis'                             │◄┘
│                                                                       │
└───────────────────────────────────────────────────────────────────────────┘
```

### Resumen del flujo:

```
1. Cliente → GET /bible/books/genesis
2. BibleController recibe la petición
3. Controller llama a bibleUseCase.getBookById("genesis")
4. BibleService (implementa UseCase) llama a repository.findById("genesis")
5. BiblePersistenceAdapter (implementa RepositoryPort) llama a JPA
6. JPA ejecuta SQL en PostgreSQL
7. PostgreSQL devuelve datos
8. Adapter convierte Entity → Domain (Book)
9. Service devuelve Book
10. Controller convierte Book → BookDto
11. Spring convierte BookDto → JSON
12. Cliente recibe JSON
```

---

## 🔄 Comparación con MVC

### MVC Tradicional:

```
┌─────────────────────────────────────────────────────────────┐
│  Controller                                                 │
│    ↓                                                        │
│  Service (opcional, a veces todo en Controller)             │
│    ↓                                                        │
│  Model (@Entity con JPA + lógica de negocio mezclada)       │
│    ↓                                                        │
│  Base de datos                                              │
└─────────────────────────────────────────────────────────────┘

Problemas:
- Model hace demasiado (datos + lógica + BD)
- Si cambias BD, cambias todo
- Difícil de testear
```

### Nuestra Arquitectura (Hexagonal/Onion):

```
┌─────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE                                             │
│  ├── Controller (REST)           → Recibe peticiones        │
│  └── PersistenceAdapter (JPA)    → Accede a BD              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  APPLICATION                                        │   │
│  │  └── Service                  → Lógica de negocio   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  DOMAIN                                     │   │   │
│  │  │  ├── Model                 → Solo datos     │   │   │
│  │  │  └── Ports                 → Interfaces     │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Beneficios:
- Cada capa tiene UNA responsabilidad
- Domain no conoce la tecnología (BD, HTTP)
- Fácil de testear (mockeas los puertos)
- Puedes cambiar BD sin tocar lógica
```

### Tabla comparativa:

| Aspecto | MVC | Hexagonal/Onion |
|---------|-----|-----------------|
| Model | Datos + JPA + Lógica | Solo datos puros |
| Acceso a BD | En el Model | En Adapter separado |
| Lógica de negocio | Dispersa | En Service |
| Cambiar BD | Cambias todo | Solo cambias Adapter |
| Testing | Difícil | Fácil (mockeas puertos) |
| Complejidad | Menor | Mayor (más archivos) |
| Mantenibilidad | Menor | Mayor |

---

## 🎯 Decisiones de Diseño

### 1. ¿Por qué separar BookEntity de Book?

```java
// ❌ MVC tradicional: Una sola clase
@Entity
public class Book {
    @Id private String id;
    @Column private String name;
    
    // Si cambias de JPA a MongoDB, cambias TODA la clase
}

// ✅ Nuestra arquitectura: Dos clases separadas

// domain/model/Book.java (puro, sin JPA)
public class Book {
    private String id;
    private String name;
}

// infrastructure/.../BookEntity.java (con JPA)
@Entity
@Table(name = "books")
public class BookEntity {
    @Id private String id;
    @Column private String name;
}

// El Adapter convierte entre ambas
Book toDomain(BookEntity entity) { ... }
BookEntity toEntity(Book book) { ... }
```

**Ventaja:** Si cambias de JPA a MongoDB, solo cambias BookEntity y el Adapter. Book NO cambia.

### 2. ¿Por qué usar interfaces (Ports)?

```java
// El Service usa una INTERFAZ, no una implementación
public class BibleService {
    private final BibleRepositoryPort repository;  // ← Interfaz
}

// Hay una implementación para PostgreSQL
public class BiblePersistenceAdapter implements BibleRepositoryPort { }

// Podría haber otra para testing
public class MockBibleRepository implements BibleRepositoryPort { }

// O para MongoDB
public class BibleMongoAdapter implements BibleRepositoryPort { }
```

**Ventaja:** El Service NO sabe qué implementación se usa. Puedes cambiarla sin tocar el Service.

### 3. ¿Por qué DTOs separados?

```java
// Domain (interno, completo)
public class User {
    private UUID id;
    private String email;
    private String passwordHash;  // ← Dato sensible
    private LocalDateTime createdAt;
}

// DTO (lo que ve el cliente, filtrado)
public record UserDto(
    String id,
    String email
    // ❌ NO expone passwordHash
    // ❌ NO expone createdAt (si no es necesario)
) {}
```

**Ventaja:** Controlas exactamente qué datos expones al exterior.

---

## 📖 Glosario Simple

| Término | ¿Qué es? | Ejemplo |
|---------|----------|---------|
| **Domain** | El centro, reglas de negocio puras | Book.java, User.java |
| **Application** | La lógica que orquesta todo | BibleService.java |
| **Infrastructure** | La tecnología (HTTP, BD) | BibleController.java, BiblePersistenceAdapter.java |
| **Port IN** | "¿Qué puedo hacer?" | BibleUseCase.java |
| **Port OUT** | "¿Qué necesito?" | BibleRepositoryPort.java |
| **Adapter IN** | Recibe peticiones externas | BibleController.java |
| **Adapter OUT** | Conecta con sistemas externos | BiblePersistenceAdapter.java |
| **DTO** | Lo que ve el cliente | BookDto.java |
| **Entity** | Lo que entiende la BD | BookEntity.java |
| **Model** | Lo que entiende el negocio | Book.java |

---

## 🎓 Resumen Final

### La regla de oro:

```
DOMAIN (centro)     →  No conoce a nadie
APPLICATION         →  Solo conoce a DOMAIN
INFRASTRUCTURE      →  Conoce a DOMAIN y APPLICATION
```

### Por qué es mejor que MVC:

1. **Separación clara:** Cada cosa en su lugar
2. **Testeable:** Puedes mockear puertos fácilmente
3. **Mantenible:** Cambios en BD no afectan lógica
4. **Escalable:** Puedes añadir nuevos adaptadores (GraphQL, CLI)

### Cuándo NO usar esta arquitectura:

- Proyectos muy pequeños (CRUD simple)
- Prototipos rápidos
- Cuando no esperas cambiar de tecnología

### Cuándo SÍ usarla:

- Proyectos medianos/grandes
- Cuando la lógica de negocio es importante
- Cuando quieres tests robustos
- Cuando podrías cambiar de BD en el futuro

---

## 📚 Próximos pasos

1. **[CLASES_DETALLADAS.md](./CLASES_DETALLADAS.md)** - Explicación de cada archivo Java
2. **[RESPUESTAS_DIRECTAS.md](./RESPUESTAS_DIRECTAS.md)** - Preguntas frecuentes

---

**Última actualización:** 18 de enero, 2026

