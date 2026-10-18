# Kontrakt frontend ↔ BFF

To jest wszystko, czego frontend oczekuje od BFF. Ścieżki pod `/api/games` i `/api/players` celowo odwzorowują endpointy serwisów, żeby BFF mógł je w większości po prostu przepuszczać.

Źródło prawdy po stronie frontendu: [`src/api/types.ts`](src/api/types.ts) (kształty JSON) i pliki w [`src/api/`](src/api) (ścieżki). Udawana implementacja tego kontraktu, której można podejrzeć zachowanie: [`src/mocks/mock/handlers.ts`](src/mocks/mock/handlers.ts).

## Zasady

| Temat | Zasada |
|---|---|
| Prefiks | Wszystko pod `/api/...`. W dev Vite przekazuje `/api` do `BFF_URL` **bez** zmiany ścieżki. |
| Format | JSON, pola w `camelCase` – tak jak DTO serwisów. |
| Sesja | Po `login`/`register` BFF ustawia ciasteczko sesji (`HttpOnly`, `SameSite=Lax`). Frontend nie dostaje ani nie przechowuje tokenów. |
| 401 | Z dowolnego endpointu = brak lub wygaśnięcie sesji. Frontend czyści gracza i przechodzi na `/login`. |
| Autoryzacja | BFF sprawdza, czy gracz z sesji to ten sam `{playerId}` co w ścieżce. Jeśli nie – `403`. |
| Błędy | `ProblemDetail` (RFC 9457). Frontend pokazuje `detail`, a mapę `errors` (pole → lista komunikatów) przypina do pól formularza – dokładnie format z `GlobalExceptionHandler` w player-service. |
| CORS | W dev niepotrzebny – przeglądarka widzi jeden adres (`localhost:5173`), resztę robi proxy Vite. |

Przykład błędu walidacji, który frontend umie wyświetlić przy polach:

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "instance": "/api/players/1/library",
  "errors": { "storyRating": ["must be between 1 and 10"] }
}
```

## Auth – implementuje sam BFF

| Metoda | URL | Body | Sukces | Błędy |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | `{ userName, email, password }` | `201` + `PlayerDto`, ustawia sesję | `400` (walidacja), `409` (nick/email zajęty) |
| `POST` | `/api/auth/login` | `{ email, password }` | `200` + `PlayerDto`, ustawia sesję | `401` (zły email lub hasło) |
| `POST` | `/api/auth/logout` | – | `204`, kasuje sesję | – |
| `GET` | `/api/auth/me` | – | `200` + `PlayerDto` | `401` (nikt nie jest zalogowany) |

Rejestracja to w praktyce `POST /players` w player-service + zapisanie hasła po stronie BFF/auth. Frontend waliduje wcześniej: nick 3–30 znaków, poprawny email, hasło min. 8 znaków. Przy `409` frontend zgaduje pole po treści komunikatu („username” → pole Nick, „email” → pole Email), więc komunikaty z player-service mogą zostać takie, jakie są.

## Gry – proxy do catalog-service

| Metoda | URL | Sukces | Błędy |
|---|---|---|---|
| `GET` | `/api/games?search=witcher&page=0&size=12` | `200` + `PageDto<GameDto>` | `400` (brak `search`), `503` |
| `GET` | `/api/games/{rawgId}` | `200` + `GameDetailsDto` | `404`, `502`, `503` |

Frontend sam liczy numer kolejnej strony (`page` = liczba pobranych stron), więc działa niezależnie od `pageNumber` w odpowiedzi.

## Profil i biblioteka – proxy do player-service

| Metoda | URL | Body | Sukces | Błędy |
|---|---|---|---|---|
| `PATCH` | `/api/players/{playerId}` | `UpdatePlayerCommand` – tylko zmienione pola | `200` + `PlayerDto` | `400`, `409` |
| `GET` | `/api/players/{playerId}/library?page=0&size=50` | – | `200` + `PageDto<LibraryEntry>` | `404` |
| `POST` | `/api/players/{playerId}/library` | `AddLibraryEntryCommand` | `201` + `LibraryEntry` | `400`, `404`, `409`, `503` |
| `PATCH` | `/api/players/{playerId}/library/{rawgId}` | tylko zmienione pola | `200` + `LibraryEntry` | `400`, `404` |
| `DELETE` | `/api/players/{playerId}/library/{rawgId}` | – | `204` | `404` |

- Profil pobiera **całą** bibliotekę (strony po 50, aż do `totalPages`), bo Game DNA potrzebuje wszystkich gier.
- `PATCH` biblioteki wysyła tylko pola zmienione w formularzu. Gdy gracz wyczyści ocenę albo recenzję, pole przychodzi jako `null`. Jeśli backend zostanie przy `NullValuePropertyMappingStrategy.IGNORE` (jak w `PlayerMapper`), wyczyszczenie po prostu nie zadziała – to decyzja po stronie serwisu.
- Przy `409` z `POST` frontend przełącza dialog na edycję istniejącego wpisu.

## Kształty JSON

`PlayerDto` (player-service):

```json
{ "id": 1, "userName": "geralt", "email": "geralt@example.com", "bio": "Gram głównie w RPG." }
```

`PageDto<T>` (moduł `common`):

```json
{ "content": [], "pageNumber": 0, "pageSize": 12, "totalElements": 34, "totalPages": 3 }
```

`GameDto` / `GameDetailsDto` (catalog-service) – `released` jako `LocalDate`, `rating` jako String z RAWG:

```json
{
  "rawgId": 3328,
  "name": "The Witcher 3: Wild Hunt",
  "released": "2015-05-18",
  "imageUrl": "https://media.rawg.io/...",
  "rating": "4.65",
  "description": "…",
  "genres": ["Action", "RPG"],
  "platforms": ["PC", "PlayStation 5"]
}
```

`LibraryEntry` – nazwy pól z `feat003.md`:

```json
{
  "rawgId": 3328,
  "gameName": "The Witcher 3: Wild Hunt",
  "status": "COMPLETED",
  "rating": 9,
  "gameplayRating": 9,
  "graphicsRating": 10,
  "storyRating": 10,
  "monetizationRating": 8,
  "review": "Najlepsze questy poboczne w historii.",
  "createdAt": "2026-10-15T11:22:33.123"
}
```

| Pole | Zasady |
|---|---|
| `status` | `NONE` (frontend: „Chcę zagrać”), `PLAYING`, `COMPLETED`, `DROPPED` – wartości z enuma `GameStatus` |
| `rating` i 4 geny | `1–10` albo `null`; dla `NONE` frontend ich nie wysyła |
| `review` | max 2000 znaków |
| `imageUrl` | opcjonalne, spoza specyfikacji – jeśli się pojawi, profil pokaże okładki zamiast generowanych |

`AddLibraryEntryCommand` to `LibraryEntry` bez `gameName` i `createdAt` (te ustawia serwer), z wymaganymi `rawgId` i `status`.

Jeśli w DTO użyjesz innych nazw pól, zmiana po stronie frontendu to `src/api/types.ts` + `src/domain/genes.ts` (pola genów).

## Jak to rozpisać w BFF

| Żądanie z frontendu | Co robi BFF |
|---|---|
| `/api/auth/**` | obsługuje sam (sesja, hasła) |
| `/api/games/**` | sprawdza sesję → `catalog-service /games/**` (obcięty prefiks `/api`) |
| `/api/players/**` | sprawdza sesję i `{playerId}` → `player-service /players/**` |

Gdy BFF będzie serwował też frontend, wystarczy wrzucić zawartość `frontend/dist/` (z `npm run build`) do jego plików statycznych i dla ścieżek spoza `/api` zwracać `index.html` (routing jest po stronie przeglądarki: `/`, `/login`, `/register`, `/profile`).
