# Odbiór Phase 2 MAX — 10 września 2026

| Pozycja | Stan i dowód |
|---|---|
| Repozytorium | VERIFIED LIVE: [reflectme-source/acqpath-distribution](https://github.com/reflectme-source/acqpath-distribution), osobny Git root i origin. Opis, 12 topics i homepage `/from-github` odczytane publicznie. Końcowe CI i commit są podane w sekcji dowodów poniżej. |
| Dokumentacja | VERIFIED LIVE: [developers.getacqpath.com](https://developers.getacqpath.com) oraz [Pages](https://acqpath-distribution.pages.dev). Osobny projekt `acqpath-distribution`; 19 stron i jawna lista zasobów maszynowych. |
| Wdrożenie Pages | `0cb5dc5d-d511-4dc1-a28b-067c710dfe51`, produkcyjne wdrożenie projektu dystrybucji. Direct upload 47 plików, ZIP SHA256 `5272c149a2211883e0c672998e44834c3674b67887e40582088e650914d57e04`. |
| Odczyt docs | VERIFIED LIVE, 15:23 UTC: na każdej domenie 44 zasoby i 27 odnośników PASS; zgodność treści, nagłówków, kanonicznych ścieżek i własnego HTTP 404. Normalizacja usuwa wyłącznie dokładny sprawdzony skrypt analityczny Cloudflare. |
| MCP Registry | VERIFIED LIVE: [3.1.0-rc.2](https://registry.modelcontextprotocol.io/v0.1/servers/com.getacqpath%2Facqpath/versions/3.1.0-rc.2), `active`, dokładna zgodność manifestu. To rewizja metadanych; backend pozostaje rc.1. |
| Smithery | VERIFIED LIVE: [AcqPath](https://smithery.ai/servers/reflectme-project/acqpath-rights-preflight), opublikowany remote endpoint i publiczny opis. Wyszukiwanie konkretnego RSL preflight znajduje wpis; wyniki innych zapytań nie są gwarantowane. |
| Glama | VERIFIED LIVE: [connector](https://glama.ai/mcp/connectors/com.getacqpath/acqpath), istniejący wpis, własność DNS zweryfikowana, endpoint zgodny, health metadata działa. Nie utworzono duplikatu. |
| GitMCP | VERIFIED LIVE w zakresie initialize/tools-list: [MCP dokumentacji](https://gitmcp.io/reflectme-source/acqpath-distribution), protokół 2025-03-26, cztery narzędzia dokumentacyjne. Nie jest płatnym MCP AcqPath. |
| Integracje | PUBLISHED: JS, TypeScript, Python read-only, konfiguracje MCP, workflow RAG/research/training/search/crawl oraz skill. Przykłady płatne wymagają własnego zatwierdzonego signera, limitu i prywatnego checkpointu. UNKNOWN oznacza hold. |
| Testy lokalne | 83/83 PASS, Windows Node 22.19.0, 45 modułów składni i 6 sum vendor PASS. TypeScript 7.0.2 strict i walidator SKILL PASS; Python ast.parse PASS. Nie wykonano prawdziwej płatności. |
| Core | 15:23 UTC SELECTED_FILES_MATCH: wszystkie 9 dozwolonych plików. To ograniczone porównanie, nie pełny audyt core. Zero zapisów do core i konfiguracji produkcyjnego Workera. |
| Analityka | PUBLISHED / aktywna wyłącznie dla docs. Beacon odczytany na obu hostach. Ścieżki `/from-*` identyfikują wejście do dokumentacji; nie łączą go z płatnością. QA i wizyty właściciela nie są klientami. |
| npm | READY BUT OWNER ACTION REQUIRED / OWNER HOLD: klient MIT zatwierdzony, publikacja nadal wyłączona na późniejsze polecenie właściciela. `npmPublicationEnabled:false`, pakiet `private:true`. |
| Docker | READY BUT OWNER ACTION REQUIRED: trzy pliki gotowe i sprawdzone; publiczny fork/PR wymaga odpowiedzi na już zadane pytanie po odmowie automatycznego przeglądu. Nie wysłano PR. |
| Context7 | READY BUT OWNER ACTION REQUIRED: formularz dodania publicznej dokumentacji wymaga logowania właściciela w otwartej karcie. Nie zgłoszono biblioteki. |
| PulseMCP | SUBMITTED / PENDING jako kategoria oczekiwania: faktycznie NOT SUBMITTED, intake wstrzymany od 3 września. Nie deklarujemy oczekującego zgłoszenia. |
| Bazaar / pochodne / x402scan | BLOCKED BY CORE: dokładna analiza i minimalna propozycja w [BAZAAR-COMPATIBILITY](../BAZAAR-COMPATIBILITY.md). Brak zmiany core, podpisów i płatności indeksującej. |
| Płatne katalogi / masowe listy | SKIPPED AS LOW VALUE: MCP.so, MCP Market i niezweryfikowane listy. Zero wydatków. |
| Revenue | Jedyny zatwierdzony odczyt agregatów 13:43 UTC: 0 zarejestrowanych dostępnych quotes, 0 mainnet paid reports, 0 received micro-USDC, 0 repeat wallet IDs. Organic customers, organic revenue i net profit UNKNOWN; brak importu kosztów. |

GitHub przechowuje źródła i wykonuje CI. Push nie wdraża dokumentacji: kolejna publikacja wymaga osobnego direct upload do tego projektu Pages. Dzienny workflow o 06:23 UTC sprawdza publiczne powierzchnie bez operator secrets, quotes i płatności; przyszły sukces harmonogramu nie jest zagwarantowany.

Dodano wyłącznie oddzielny projekt docs, jego CNAME, zatwierdzony TXT MCP oraz zatwierdzony TXT Glama `_glama-claim.api.getacqpath.com`, TTL 300. Nie zmieniono PAYMENT_MODE, PAY_TO, cen, wallet, providers, produkcyjnych tras, Access ani reconciliation.

Pełne macierze: [kanały](../CHANNEL-MATRIX.md), [discovery](../DISCOVERY-TESTS.md), [baseline](../REVENUE-BASELINE.md), [ekonomika](../REVENUE-OPTIMIZATION.md). Nie ogłaszamy pełnego zakończenia zadań zależnych od właściciela. Największy spodziewany wpływ komercyjny: osobno zatwierdzona zgodność Bazaar i testy bez settlement. Provider routing nie powinien być następną fazą przed dowodem powtarzalnego zewnętrznego użycia.
