# FEATURE-002: Wyszukiwanie gier z RAWG (catalog-service)

**Serwis:** `catalog-service` (nowy moduł)
**Branch:** `feat/catalog-search`

---

## Wymagania biznesowe

Jako gracz chciałbym mieć możliwość:

1. Wyszukania gry po nazwie (np. „witcher”) i zobaczenia listy wyników.
2. Zobaczenia szczegółów wybranej gry (opis, gatunki, platformy, data premiery, ocena).

> To przygotowanie pod FEATURE-003: gracz najpierw **znajduje** grę tutaj, a potem dodaje ją do swojej biblioteki w `player-service` po `rawgId`.

---

## Wymagania techniczne

### Nowy moduł

- Nowy projekt Spring Boot `catalog-service` dopisany do `<modules>` w parent pomie.
- Port inny niż `player-service` (np. `8082`).
- **Bez bazy danych** w tym featurze, więc bez JPA, Liquibase i Postgresa w pomie. Cache gier w bazie to osobny featur.
- Klucz RAWG z `.env` (`RAWG_API_KEY`), **nigdy** w kodzie ani w repo.

### Komunikacja z RAWG

- **Feign Client** do RAWG API (`https://api.rawg.io/api`).
- Klucz przekazywany jako parametr `key` w każdym zapytaniu.
- Endpointy RAWG, których potrzebujesz:
    - `GET /games?search=...&page=...&page_size=...` → lista gier
    - `GET /games/{id}` → szczegóły gry
- **Osobne DTO na odpowiedź RAWG** (to, co przychodzi z zewnątrz) i **osobne DTO na odpowiedź Twojego API** (to, co zwracasz frontendowi). RAWG używa `snake_case` (`background_image`, `description_raw`), a Twoje API `camelCase`.

### Endpointy catalog-service

| Metoda | URL | Sukces | Błędy |
|---|---|---|---|
| `GET` | `/games/search?query=witcher&page=0&size=10` | 200 + strona wyników (`PageDto`) | 400 (brak `query`) |
| `GET` | `/games/{rawgId}` | 200 + szczegóły gry | 404 (brak gry w RAWG), 503 (RAWG niedostępne) |

### Co zwracać frontendowi

**Wynik wyszukiwania** (lista, więc tylko to, co potrzebne na liście):

| Pole | Skąd w RAWG |
|---|---|
| `rawgId` | `id` |
| `name` | `name` |
| `released` | `released` |
| `imageUrl` | `background_image` |
| `rating` | `rating` |

**Szczegóły gry:** powyższe plus `description` (`description_raw`), `genres` (lista nazw), `platforms` (lista nazw).

### Obsługa błędów RAWG

- `ErrorDecoder` (tak jak w proxy):
    - 404 z RAWG → 404 z Twojego API,
    - 401/403 (zły klucz) → 502, bo to problem konfiguracji, a nie użytkownika,
    - 5xx lub brak połączenia → 503.
- Błędy w tym samym formacie `ProblemDetail` co w `player-service`.

> Retry, fallback i circuit breaker **nie wchodzą** w ten featur (FEATURE-004).

---

## Kryteria akceptacji

- [ ] `GET /games/search?query=witcher` zwraca listę gier z RAWG w formacie `PageDto`.
- [ ] Brak parametru `query` zwraca **400**.
- [ ] `GET /games/3328` zwraca szczegóły gry z gatunkami i platformami jako listą nazw.
- [ ] Nieistniejące `rawgId` zwraca **404**, a nie 500.
- [ ] Zły klucz RAWG zwraca **502** z czytelnym komunikatem.
- [ ] Klucz RAWG nie występuje nigdzie w repozytorium.
- [ ] Odpowiedzi Twojego API mają pola w `camelCase`.

---

## Testy

| Warstwa | Rodzaj testu | Co sprawdzić |
|---|---|---|
| Service | unit test z Mockito (mock Feign clienta) | mapowanie RAWG DTO → Twoje DTO, przeliczenie strony |
| Controller | `@WebMvcTest` + MockMvc | statusy, brak `query` → 400, 404 z serwisu |
| ErrorDecoder | zwykły unit test | który status RAWG zamienia się na który wyjątek |

> Opcjonalnie, dla chętnych: test Feign clienta z **WireMock**, czyli udawanym serwerem RAWG. Sprawdza, czy URL i parametry są poprawne.

---

## Definition of Done

- [ ] `catalog-service` startuje i jest widoczny w Swaggerze.
- [ ] Wyszukiwanie działa na prawdziwym RAWG (sprawdzone w Swaggerze).
- [ ] `./mvnw clean verify` z głównego folderu przechodzi dla **obu** modułów.
- [ ] `.env.example` zawiera `RAWG_API_KEY=` (bez wartości).
- [ ] Merge PR do `master`.

---

## Zanim zaczniesz

1. **Sprawdź, czy RAWG działa** (wcześniej bywał niedostępny):
   `curl "https://api.rawg.io/api/games?key=TWOJ_KLUCZ&search=witcher&page_size=1"`
2. Przejrzyj dokumentację: https://api.rawg.io/docs/. Zobacz, jak wygląda odpowiedź `/games` i `/games/{id}`.

## Pytania do przemyślenia

1. Dlaczego nie zwracać frontendowi DTO z RAWG 1:1? Co się stanie, jeśli RAWG zmieni nazwę pola?
2. RAWG numeruje strony od **1**, a Spring `Pageable` od **0**. Gdzie i jak to przeliczysz?
3. Gdzie powinien siedzieć klucz API: w każdej metodzie Feign clienta jako parametr, czy da się go dodać automatycznie do każdego zapytania? (Podpowiedź: `RequestInterceptor`.)
4. Wynik wyszukiwania i szczegóły gry to dwa różne DTO. Dlaczego nie jedno?

---

## Poza zakresem (kolejne featury)

- FEATURE-003: dodanie gry do biblioteki gracza z oceną (`player-service` → Feign → `catalog-service`).
- FEATURE-004: retry, fallback i circuit breaker dla RAWG.
- Cache gier w bazie `catalog-service`.