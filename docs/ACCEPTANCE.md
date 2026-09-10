# Odbiór wdrożenia — 10 września 2026

| Pozycja | Rzeczywisty wynik i dowód |
|---|---|
| Repozytorium | PUBLISHED_READBACK: [reflectme-source/acqpath-distribution](https://github.com/reflectme-source/acqpath-distribution), osobny root Git i origin. |
| Dokumentacja | PUBLISHED_READBACK: [developers.getacqpath.com](https://developers.getacqpath.com). Cloudflare Pages `acqpath-distribution`, direct upload; domena Active, SSL enabled. |
| Wdrożenie Pages | `4a357b8b-ebfb-4190-a81c-b60f41bf80fa`; [domena Pages](https://acqpath-distribution.pages.dev). Archiwum 15 plików; SHA256 `353c474b7bca8e2be30b9fca7f11a4ba81507e24e1b3dfd23d33e60dd7715b2a`. |
| Publiczny odczyt docs | PUBLIC_READ_VERIFIED: 12 adresów na każdej domenie, HTTP 200, zgodne SHA256 i nagłówki bezpieczeństwa; nieistniejąca strona zwraca własne HTTP 404. |
| MCP Registry | PUBLISHED_READBACK: [com.getacqpath/acqpath, wersja 3.1.0-rc.1](https://registry.modelcontextprotocol.io/v0.1/servers/com.getacqpath%2Facqpath/versions/3.1.0-rc.1), status `active`, remote `https://api.getacqpath.com/mcp`. Potwierdzono 13:16 UTC. |
| Dowód DNS MCP | DNS_PROOF_VISIBLE: dodano zatwierdzony TXT z publicznym kluczem rejestru, TTL 300 s. Prywatny klucz pozostaje lokalnie. |
| Publiczne API | PUBLIC_READ_VERIFIED: oczekiwany hash źródła i klucz dowodowy zgodne; MCP initialize/notifications/tools-list działają. Nie wywołano narzędzi tworzących quote. |
| Testy lokalne | LOCAL_VERIFIED: 70/70, Windows, Node 22.19.0; `.local/verification.json`. |
| GitHub CI | PASS 70/70 na Windows i Ubuntu, Node 24.20.0, commit `2c3e239060c904c86aecb65e8b9c3c95ec7860a2`: [wynik CI](https://github.com/reflectme-source/acqpath-distribution/actions/runs/34482128139). |
| Discovery z GitHub | [Uruchomienie 13:23 UTC](https://github.com/reflectme-source/acqpath-distribution/actions/runs/34482274141): public API PASS, MCP Registry FOUND, sześć zapytań Bazaar bez dopasowania. Workflow ma dzienny harmonogram; powodzenie tego uruchomienia nie gwarantuje przyszłych wyników. |
| Sekrety | Gitleaks 8.30.1: brak wykrytych sekretów w źródłach, snapshotach publikacji, staged diff, SDK i docs. Pełny skan workspace znalazł jedynie trzy przykładowe dane w README ignorowanego archiwum samego skanera. `.private`, `.tools`, `.local` i `out` nie są publikowane w Git. |
| Core | SELECTED_FILES_MATCH: ponowny odczyt 9 dozwolonych plików przez `source-audit`, 13:16 UTC. Zero zapisów do core i zero zmian konfiguracji produkcyjnego Workera/Access. Porównanie dotyczy wybranych plików, nie całego core. |
| npm SDK | NOT_PUBLISHED_OWNER_REQUEST: właściciel zatwierdził MIT dla klienta, następnie polecił zachować SDK bez publikacji npm. `npmPublicationEnabled:false`, build `private:true`; CLI i workflow blokują publikację. Logowanie i własność scope nie zostały potwierdzone. |
| Smithery | NOT_PUBLISHED: opcjonalny kanał, brak skonfigurowanego namespace/logowania; przygotowano metadane. |
| PulseMCP | NOT_SUBMITTED: przygotowano materiał do moderowanego zgłoszenia, brak potwierdzonego wpisu. |
| Bazaar | BLOCKED_BY_CURRENT_CORE_CONTRACT: brak metadanych Bazaar w przejrzanej ścieżce płatności. Sześć publicznych zapytań 13:15 UTC bez dopasowania; nie jest to dowód nieobecności we wszystkich katalogach. |
| Pełny zakup / USDC | NOT_PERFORMED: zero płatności, zero podpisów portfela, brak dowodu pełnego paid flow. |
| Popyt i przychód | ORGANIC_USAGE_UNVERIFIED: nie potwierdzono niezależnych klientów, powtórek ani zysku. |

GitHub przechowuje źródła i wykonuje CI; kolejne aktualizacje dokumentacji wymagają osobnego uploadu sprawdzonego `out/site` do tego projektu Pages. Push sam nie wdraża dokumentacji. Instrukcja: `docs/CLOUDFLARE-DEPLOYMENT.md`.

Nie zmieniono PAYMENT_MODE, PAY_TO, cen, provider routing, produkcyjnych tras ani Cloudflare Access. Dodano wyłącznie CNAME `developers` i zatwierdzony TXT MCP. `RECONCILIATION_READY` nie został naprawiony w tym zadaniu; nie deklarujemy gotowości płatnego flow ani przepustowości.

Następny pomiar komercyjny: pierwszy niezależny kupujący, poprawnie dostarczony raport, ponowne użycie oraz przychód pomniejszony o rzeczywiste koszty. Własny zakup testowy nie jest dowodem organicznego popytu.
