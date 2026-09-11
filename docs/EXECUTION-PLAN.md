# Runbook wykonania dla Codex

## 0. Przygotowanie bez zmian kont

`node scripts/cli.mjs prepare`

Opcjonalny argument to ścieżka backendu do odczytu wyłącznie ustalonej listy plików, np. `node scripts/cli.mjs source-audit "%USERPROFILE%\Documents\GitHub\AcqPath\PROD\acqpath"`. Sam test nie czyta żadnych sekretów i niczego nie importuje/wykonuje z repo core.

Sprawdź .local/verification.json, public-audit.json, catalog-audit.json, status.json. Przy ENOTFOUND/timeout sprawdź sieć narzędzia — nie wyłączaj zabezpieczeń AcqPath. Najpierw uzyskaj aktualny publiczny PASS przed publikacją. Suma kontrolna referencji nie jest automatycznym dowodem aktualnego deploymentu.

## 1. Konfiguracja nazw i osobny GitHub

`node scripts/cli.mjs configure`

Użytkownik podaje GitHub owner, własną nazwę pakietu npm i opcjonalny namespace Smithery. Nie proś o klucze w czacie. Potwierdź, że zakres npm jest dostępny i należy do użytkownika. Nowy kod nie otrzymuje dostępu do backendu.

`node scripts/cli.mjs freeze-actions`

To odczytuje oficjalne refy Actions i zapisuje dokładne SHA. Następnie oficjalne `gh auth login` (użytkownik autoryzuje), a potem:

`node scripts/cli.mjs publish-github`

Skrypt sprawdza root/remote, publiczne pliki, testy; konfiguruje wyłącznie lokalnego autora z verified GitHub noreply. Publiczny będzie osobny materiał integracyjny, nie backend. Potwierdzenie: `PUBLISH SEPARATE DISTRIBUTION REPO`.

Nie zmieniaj auto-deploy starego projektu. Po pushu śledź realny wynik testów ubuntu/windows w Actions — są przygotowane, ale w środowisku autora nie wykonano runnera Windows.

## 2. Dokumentacja

Aktualny cel właściciela: osobny projekt **Cloudflare Pages** `acqpath-distribution`, preferowany hostname `developers.getacqpath.com`. Wykonaj `docs/CLOUDFLARE-DEPLOYMENT.md` i użyj `config/cloudflare-pages.json`. Deployment używa direct upload sprawdzonego `out/site`; GitHub przechowuje źródła i CI. Nie uruchamiaj starego `publish-pages`, który dotyczy GitHub Pages.

Codex wykonuje build, konfigurację, deployment i odczyt publicznych stron. Właściciel tylko loguje się i autoryzuje konta. Nie zmieniaj `acqpath-production`, `api.getacqpath.com`, konfiguracji produkcyjnego Workera ani Access. Dopiero zakończony deployment oraz poprawny publiczny HTTPS readback potwierdzają publikację.

## 3. MCP Registry

`node scripts/cli.mjs dns-prepare`
`node scripts/cli.mjs dns-apply`
`node scripts/cli.mjs publisher-install`
`node scripts/cli.mjs audit`
`node scripts/cli.mjs publish-registry`
`node scripts/cli.mjs catalogs`

Skrypt DNS dodaje wyłącznie własny TXT, nie nadpisuje innych rekordów. Token: Zone Read + DNS Edit, tylko strefa getacqpath.com. Klucz publikacji powstaje w .private; nie jest kluczem portfela. Oficjalne CLI może widnieć z kluczem domenowym w lokalnych argumentach procesu — nie nagrywaj terminala ani poleceń autoryzacji. Nigdy nie używaj tu klucza portfela.

Brak checksum oficjalnego assetu -> brak automatycznej instalacji, nie zgaduj hash. Istniejący, inny TXT MCP -> STOP bez kasowania. Istniejąca wersja manifestu -> odczytaj i porównaj; nie publikuj duplikatów ani nie zmieniaj nazwy losowo. Dopiero wynik Registry z dokładnym namespace + URL jest potwierdzeniem wpisu. Gdy API Registry wymaga nowego schematu, aktualizuj tylko distribution po sprawdzeniu dokumentacji.

## 4. SDK npm

Aktualna decyzja właściciela: **zachować SDK bez publikacji npm**. Zgoda na MIT pozostaje zapisana, ale `npmPublicationEnabled:false` utrzymuje `private:true` i blokuje CLI oraz workflow. Nie wznawiaj logowania ani publikacji bez nowej instrukcji właściciela. Poniższy proces dotyczy dopiero przyszłego zatwierdzonego wydania.

`node scripts/cli.mjs audit`
`node scripts/cli.mjs publish-npm`

Pierwsze wydanie: użytkownik wykonuje oficjalne npm login/2FA we własnym terminalu. Potwierdzenie `PUBLISH CLIENT PACKAGE UNDER MIT` dotyczy wyłącznie klienta, nie backendu, raportów czy praw wydawców. Pakiet zawiera minimalny klient i jawne przypięcie odbiorcy. Nie publikuj pod nieposiadanym zakresem.

Odczytaj opublikowaną wersję i pobierz ją do izolowanego katalogu testowego. Sprawdź publiczny read-only przykład. Weryfikacja źródła lokalnego nie jest dowodem publikacji npm. Istniejącej wersji nie nadpisuj — ustal czy należy do właściciela i czy artefakt jest zgodny, a kolejne wydanie wymaga spójnego nowego numeru.

Dla następnych wydań skonfiguruj w npm Trusted Publisher: ten GitHub owner/repo, `npm-publish.yml`, środowisko `npm-release` z required reviewer. Workflow jest manual, wykorzystuje OIDC i nie potrzebuje stałego NPM_TOKEN. Musi istnieć dokładnie na tym repo.

## 5. Smithery i kuratorzy

Opcjonalnie:
`node scripts/cli.mjs smithery-install`
`node scripts/cli.mjs smithery-login`
`node scripts/cli.mjs audit`
`node scripts/cli.mjs publish-smithery`

Narzędzie instaluje dokładnie odczytaną wersję npm `smithery` w .tools z lockfile, bez skryptów instalacyjnych; aktualny audit High/Critical musi przejść. Nie aktualizuje globalnego PATH. Jeśli wymaga innego środowiska, nie zgaduj — użyj oficjalnego publikowania URL w smithery.ai/new i przygotowanego `metadata/smithery-listing.json`.

Po publikacji przetestuj handshake/tools-list przez rzeczywistą integrację. Nie testuj kupowania przez gateway bez oddzielnej zgody. `paidMcpCompatible:false` zostaje, dopóki pełna ścieżka nie została osobno potwierdzona. Materiał PulseMCP jest w metadata/pulsemcp-submission.md; brak automatyzacji moderowanego formularza nie oznacza, że został wysłany.

## 6. Phase 5 — bez płatności właściciela

Buyer-demo jest zablokowane. Prywatne narzędzia QA zachowane archiwalnie; nie uruchamiaj portfela, nie proś o środki lub podpis. Pierwsze rozliczenie ma pochodzić od niezależnego zewnętrznego kupującego. Monitoring: docs/PHASE5-MONITOR.md.

## 7. Odczyt biznesu i zakończenie

`node scripts/cli.mjs metrics-read "<read-only path to AcqPath core>"`

Wyłącznie po `READ PRODUCTION AGGREGATES`, lokalnie; używa istniejącego production operator bearer + Access do pojedynczego GET stats. Nie tworzy dodatkowych uprawnień, nie publikuje poświadczeń i nie włącza stałego procesu z admin tokenem. Alternatywa: metrics-import dla uprzednio zredagowanego eksportu.

`node scripts/cli.mjs status`

Uzupełnij docs/ACCEPTANCE.md faktycznymi linkami/dowodami w .local/closeout.md. Wynik: rozdzielone LOCAL_VERIFIED, PUBLIC_READ_VERIFIED, PUBLISHED_READBACK, PAID_FLOW_TESTED, ORGANIC_USAGE_UNVERIFIED, BAZAAR_BLOCKED_BY_CORE_CONTRACT. Nie maskuj nieukończonych kanałów. Użytkownik ma dostać krótką listę rzeczywiście działających miejsc, nie 100 komend.
