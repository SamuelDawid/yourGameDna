# FEATURE-001: Profil gracza (Player CRUD)

**Serwis:** `player-service`
**Branch:** `feat/player-crud`

---

## Wymagania biznesowe

Jako gracz chciałbym mieć możliwość:

1. Założenia profilu (nick, email, opcjonalnie krótki opis „o mnie”).
2. Zobaczenia swojego profilu.
3. Edycji swojego profilu (np. zmiana opisu lub nicku).
4. Usunięcia swojego profilu.

Jako administrator chciałbym mieć możliwość:

5. Przeglądania listy wszystkich graczy (stronicowanej).

> Logowanie i hasła **nie wchodzą** w zakres tego featuru (patrz: story 3, auth na końcu projektu).

---

## Wymagania techniczne

### Encja `Player`

| Pole | Typ | Zasady |
|---|---|---|
| `id` | Long | generowane przez bazę |
| `username` | String | wymagane, unikalne, 3–30 znaków |
| `email` | String | wymagane, unikalne, poprawny format email |
| `bio` | String | opcjonalne, max 2000 znaków |
| `createdAt` | LocalDateTime | ustawiane przez serwer przy tworzeniu, nie przez klienta |

### Baza danych

- Tabela tworzona **changesetem Liquibase** (`001-create-player-table.yaml`).
- Unikalność `username` i `email` wymuszona **na poziomie bazy** (constraint), nie tylko w kodzie.
- `bio` jako `VARCHAR(2000)`, żeby działało tak samo na H2 i Postgresie.
- `ddl-auto: validate`, więc encja i changeset muszą się zgadzać.

### Endpointy

| Metoda | URL | Sukces | Błędy |
|---|---|---|---|
| `POST` | `/players` | 201 + utworzony gracz | 400 (walidacja), 409 (nick/email zajęty) |
| `GET` | `/players/{id}` | 200 | 404 |
| `GET` | `/players?page=0&size=20` | 200 + strona | — |
| `PATCH` | `/players/{id}` | 200 + zaktualizowany gracz | 400, 404, 409 |
| `DELETE` | `/players/{id}` | 204 | 404 |

### Zasady

- Kontroler przyjmuje i zwraca **DTO**, nigdy encję.
- Osobne DTO na wejście przy tworzeniu (`Create…Command`), przy edycji (`Patch…Command`) i na wyjście (`…Dto`).
- Walidacja wejścia przez Jakarta Validation na DTO.
- Wspólny handler wyjątków zwraca błędy w jednym formacie (message, status, czas).
- **Brak `findAll()` bez paginacji.**

---

## Kryteria akceptacji

- [ ] Utworzenie gracza z poprawnymi danymi zwraca **201**, a `createdAt` jest ustawione.
- [ ] Nick krótszy niż 3 znaki albo zły email zwraca **400** z czytelnym komunikatem.
- [ ] Drugi gracz z tym samym nickiem lub emailem zwraca **409**.
- [ ] Pobranie nieistniejącego gracza zwraca **404**.
- [ ] `PATCH` zmienia tylko pola, które zostały przesłane (reszta zostaje bez zmian).
- [ ] Usunięty gracz przy kolejnym `GET` zwraca **404**.
- [ ] Lista graczy jest stronicowana.

---

## Testy

| Warstwa | Rodzaj testu | Co sprawdzić |
|---|---|---|
| Repository | `@DataJpaTest` (H2) | zapis i odczyt, constraint unikalności nicku i emaila |
| Service | unit test z Mockito | logika tworzenia, edycji, 404, 409 |
| Controller | `MockMvc` | statusy HTTP, walidacja (400), format JSON |

---

## Definition of Done

- [ ] Changeset wykonuje się na Postgresie (sprawdzone przez `\d player` w psql).
- [ ] Aplikacja startuje bez błędów walidacji schematu.
- [ ] Wszystkie kryteria akceptacji sprawdzone w Swaggerze.
- [ ] `./mvnw clean verify` przechodzi na zielono.
- [ ] Logi: `info` przy zmianach danych, `warn` przy odrzuconych żądaniach.
- [ ] Commit(y) na osobnym branchu i merge do `master`.

---

## Pytania do przemyślenia przed kodem

1. Dlaczego kontroler nie powinien zwracać encji bezpośrednio?
2. Unikalność nicku sprawdzasz w serwisie **i** masz constraint w bazie. Po co oba? Co się stanie, gdy dwa żądania z tym samym nickiem przyjdą w tej samej milisekundzie?
3. Jak `PATCH` ma odróżnić „pole nie zostało wysłane” od „pole wysłane jako puste”?
4. Czy `DELETE` powinien fizycznie usuwać gracza, skoro w przyszłości będzie miał oceny gier i followersów?

---

## Poza zakresem (kolejne featury)

- FEATURE-002: wyszukiwanie gier przez RAWG (catalog-service, Feign).
- FEATURE-003: dodanie gry do biblioteki gracza z oceną.
- Logowanie i rejestracja z hasłem.