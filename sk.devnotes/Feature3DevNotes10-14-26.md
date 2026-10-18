# Dev notes – 2026-10-14

**Moduł:** `player-service`
**Temat:** FEATURE-003 – biblioteka gracza, dzień 1: encja i baza

---

## Co zostało zrobione

- Dodana encja `GameRating` (pozycja w bibliotece gracza).
- Napisany changeset Liquibase tworzący tabelę dla `GameRating`.
- Dodana relacja między `Player` a `GameRating` w obu encjach.

---

## Na co uważać

- **Relacja jest na razie tylko w kodzie Javy, w bazie jej jeszcze nie ma.** Przy `ddl-auto: validate` Hibernate porówna encje z tabelami, więc **aplikacja (i testy) mogą nie wystartować**, dopóki changeset z relacją nie zostanie dodany (np. błąd o brakującej kolumnie klucza obcego).
- **Nowy changeset = nowy plik** (np. `003-...yaml`). Nie edytować changesetu, który już wykonał się na Postgresie, bo Liquibase rzuci `checksum validation failed`. Jeśli changeset z dzisiaj jeszcze nigdzie się nie wykonał, można go po prostu uzupełnić.

---

## TODO na jutro

### Baza
- [ ] Changeset z relacją: kolumna `player_id` + klucz obcy do tabeli `player`.
- [ ] Constraint unikalności na parze `(player_id, rawg_id)`, żeby gracz nie mógł mieć tej samej gry dwa razy.
- [ ] Sprawdzić w psql (`\d nazwa_tabeli`), czy kolumny, klucz obcy i constraint faktycznie powstały.
- [ ] Sprawdzić, czy aplikacja startuje bez błędów walidacji schematu.

### Dalej (według `feat003.md`)
- [ ] Feign client w `player-service` do `catalog-service` (`GET /games/{id}`).
- [ ] Serwis: dodanie gry do biblioteki (kolejność: gracz → duplikat → catalog).
- [ ] Endpointy: `POST`, `GET`, `PATCH`, `DELETE` dla `/players/{playerId}/library`.
- [ ] Obsługa błędów: 404 gracza/gry, 409 duplikat, 503 catalog niedostępny.
- [ ] Testy: repozytorium (constraint unikalności), serwis, kontroler.

---

## Status
✅ Encja i pierwszy changeset gotowe.
⏳ Changeset z relacją do dodania. Bez niego aplikacja może nie wystartować.
