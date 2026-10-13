# FEATURE-003: Biblioteka gracza – dodanie gry z oceną

**Serwis:** `player-service` (woła `catalog-service`)
**Branch:** `SK/feat003-player-library`

---

## Wymagania biznesowe

Jako gracz chciałbym mieć możliwość:

1. Dodania gry do swojej biblioteki (gra wybrana wcześniej z wyszukiwarki z FEATURE-002, po `rawgId`).
2. Ustawienia statusu gry: **gram / ukończona / porzucona**.
3. Ocenienia gry: ocena ogólna oraz (opcjonalnie) oceny w kategoriach: **gameplay, grafika, fabuła/questy, mikrotransakcje**.
4. Napisania krótkiej recenzji.
5. Przeglądania swojej biblioteki.
6. Zmiany statusu, oceny lub recenzji.
7. Usunięcia gry z biblioteki.

> Oceny w kategoriach to podstawa przyszłego „Gamer DNA” i rekomendacji.

---

## Wymagania techniczne

### Komunikacja między serwisami (nowość w tym featurze)

- `player-service` **woła `catalog-service`** przez **Feign Client**, żeby sprawdzić, czy gra o danym `rawgId` istnieje, i pobrać jej nazwę.
- `player-service` **nie** woła RAWG bezpośrednio. Tylko `catalog-service` zna RAWG i jego klucz.
- Adres catalog-service z konfiguracji, ze zmienną i wartością domyślną (pod Dockera):
  `catalog-service.url=${CATALOG_SERVICE_URL:http://localhost:8082}`
- Do `player-service` wracają zależności OpenFeign (bez circuit breakera, ten jest w FEATURE-004).

### Encja `LibraryEntry` (nowa tabela)

| Pole | Typ | Zasady |
|---|---|---|
| `id` | Long | generowane przez bazę |
| `player` | relacja do `Player` | wymagane |
| `rawgId` | Long | wymagane |
| `gameName` | String | nazwa gry pobrana z catalog-service w momencie dodania |
| `status` | enum `PLAYING` / `COMPLETED` / `DROPPED` | wymagane |
| `rating` | Integer | opcjonalne, 1–10 |
| `gameplayRating`, `graphicsRating`, `storyRating`, `monetizationRating` | Integer | opcjonalne, każde 1–10 |
| `review` | String | opcjonalne, max 2000 znaków |
| `createdAt` | LocalDateTime | ustawiane przez serwer |

- Changeset Liquibase `002-create-library-entry-table.yaml`: klucz obcy do `player`.
- **Jeden gracz nie może mieć tej samej gry dwa razy:** unikalność pary `(player_id, rawg_id)` wymuszona **w bazie** (constraint), a nie tylko w kodzie.

### Endpointy

| Metoda | URL | Sukces | Błędy |
|---|---|---|---|
| `POST` | `/players/{playerId}/library` | 201 + dodana pozycja | 400 (walidacja), 404 (gracz lub gra nie istnieje), 409 (gra już w bibliotece), 503 (catalog-service niedostępny) |
| `GET` | `/players/{playerId}/library?page=0&size=20` | 200 + `PageDto` | 404 (gracz) |
| `PATCH` | `/players/{playerId}/library/{rawgId}` | 200 + zaktualizowana pozycja | 400, 404 |
| `DELETE` | `/players/{playerId}/library/{rawgId}` | 204 | 404 |

### Body `POST` (przykład)

```json
{
  "rawgId": 3328,
  "status": "COMPLETED",
  "rating": 9,
  "gameplayRating": 9,
  "graphicsRating": 10,
  "storyRating": 10,
  "monetizationRating": 8,
  "review": "Najlepsze questy poboczne w historii."
}
```

### Obsługa błędów z catalog-service

| catalog-service zwraca | player-service odpowiada |
|---|---|
| 404 | 404 („gra nie istnieje”) |
| 5xx / brak połączenia | 503 |

- Błędy w formacie `ProblemDetail`, tak samo jak w FEATURE-001.

---

## Kryteria akceptacji

- [ ] Dodanie istniejącej gry do biblioteki istniejącego gracza zwraca **201**, a w bazie zapisana jest nazwa gry.
- [ ] Nieistniejący gracz → **404**, a catalog-service **nie jest** w ogóle wołany.
- [ ] Nieistniejąca gra (`rawgId`) → **404**.
- [ ] Ta sama gra dodana drugi raz → **409**.
- [ ] Ocena spoza zakresu 1–10 → **400** z listą błędnych pól.
- [ ] catalog-service wyłączony → **503** z czytelnym komunikatem.
- [ ] Biblioteka gracza zwracana stronicowana.
- [ ] `PATCH` zmienia tylko przesłane pola.

---

## Testy

| Warstwa | Rodzaj testu | Co sprawdzić |
|---|---|---|
| Repository | `@DataJpaTest` | zapis pozycji, **constraint unikalności (gracz, gra)** |
| Service | unit test z Mockito (mock repozytoriów i Feign clienta) | 404 gracza, 404 gry, 409, zapis nazwy gry, częściowy update |
| Controller | `@WebMvcTest` + MockMvc | statusy, walidacja ocen (400), format JSON |

---

## Definition of Done

- [ ] Oba serwisy działają lokalnie jednocześnie (player na 8081, catalog na 8082).
- [ ] Dodanie gry działa end-to-end w Swaggerze: player → catalog → RAWG.
- [ ] Changeset wykonuje się na Postgresie (`\d library_entry` w psql).
- [ ] `./mvnw clean verify` z głównego folderu przechodzi dla wszystkich modułów.
- [ ] Dev notes w `sk.devnotes/`.
- [ ] Merge PR.

---

## Pytania do przemyślenia przed kodem

1. **Po co zapisywać `gameName`, skoro można go pobrać z catalog-service?** Pomyśl o wyświetleniu biblioteki z 50 grami: ile wywołań do catalog-service by to wymagało? A co, jeśli catalog akurat nie działa?
2. **W jakiej kolejności sprawdzać rzeczy w `POST`?** Gracz istnieje → gra już w bibliotece → gra istnieje w catalogu. Dlaczego wołanie innego serwisu warto zrobić **na końcu**?
3. **Unikalność sprawdzasz w kodzie i masz constraint w bazie.** Co zobaczy klient, jeśli dwa identyczne żądania przyjdą jednocześnie i oba przejdą sprawdzenie w kodzie?
4. **Usunięcie gracza (FEATURE-001):** co teraz stanie się z jego biblioteką? Spróbuj usunąć gracza, który ma gry w bibliotece, i zobacz, co zwróci baza.
5. **`rawgId` w URL-u `PATCH`/`DELETE` zamiast `id` pozycji:** jakie to ma zalety dla frontendu?

---

## Poza zakresem (kolejne featury)

- FEATURE-004: circuit breaker, retry i fallback dla RAWG (catalog) **i** dla catalog-service (player).
- Wishlist (gry jeszcze niewydane) i powiadomienia.
- Gamer DNA i rekomendacje.