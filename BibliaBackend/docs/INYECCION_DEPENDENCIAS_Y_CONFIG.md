# 🤝 Inyección de Dependencias, Interfaces y Configuración en Spring

## ¿Por qué el Controller usa la interfaz (BibleUseCase) y no la clase (BibleService) directamente?

### 1. **Desacoplamiento y flexibilidad**
- El Controller depende de la **interfaz** (BibleUseCase), no de la clase concreta (BibleService).
- Así, el Controller no sabe ni le importa qué implementación real hay detrás.
- Si mañana cambias la lógica, o quieres usar una versión "falsa" para tests, no tienes que tocar el Controller.

### 2. **¿Qué hace Spring?**
- Cuando ve `private final BibleUseCase bibleUseCase;`, Spring busca una clase que implemente esa interfaz (por ejemplo, BibleService) y la "inyecta" automáticamente.
- En tiempo de ejecución, el Controller recibe un objeto real de BibleService, pero solo sabe que es un BibleUseCase.

### 3. **¿Por qué es útil?**
- **Testabilidad:** Puedes inyectar un mock o una implementación "falsa" para pruebas.
- **Flexibilidad:** Puedes tener varias implementaciones y elegir cuál usar según el entorno (producción, test, demo, etc.).
- **Principio SOLID:** Cumple el principio de inversión de dependencias: las capas externas dependen de abstracciones, no de detalles concretos.

---

## Ejemplo práctico

```java
// Interfaz (puerto de entrada)
public interface BibleUseCase {
    Book getBookById(String id);
}

// Implementación real
@Service
public class BibleService implements BibleUseCase {
    ...
}

// Implementación "falsa" para tests
default class FakeBibleService implements BibleUseCase {
    public Book getBookById(String id) {
        return new Book("fake", "Libro de prueba", ...);
    }
}

// Controller (solo depende de la interfaz)
@RestController
public class BibleController {
    private final BibleUseCase bibleUseCase;
    // Spring inyecta BibleService o FakeBibleService aquí
}
```

---

## ¿Dónde entra la configuración (Config)?

Si tienes varias implementaciones de la interfaz, puedes usar una clase de configuración para decidir cuál se inyecta:

```java
@Configuration
public class BibleConfig {
    @Bean
    public BibleUseCase bibleUseCase() {
        // Aquí decides cuál devolver
        // return new BibleService(...); // Real
        return new FakeBibleService();   // Para tests
    }
}
```

O puedes usar perfiles de Spring:

```java
@Service
@Profile("prod")
public class BibleService implements BibleUseCase { ... }

@Service
@Profile("test")
public class FakeBibleService implements BibleUseCase { ... }
```

Así, Spring elige automáticamente la implementación según el entorno.

---

## Resumen visual

```
┌──────────────────────────────┐
│ BibleController              │
│  depende de → BibleUseCase   │
│         ▲                    │
│         │                    │
│  Spring inyecta:             │
│    - BibleService (real)     │
│    - FakeBibleService (test) │
└──────────────────────────────┘
```

- El Controller nunca sabe ni le importa qué clase concreta hay detrás.
- Así el código es más flexible, testeable y mantenible.

---

**¿Dudas? Lee este archivo cada vez que te líes con interfaces, servicios y configuración en Spring.**

