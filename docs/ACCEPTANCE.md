# Dual-mode x402 release — 2026-09-12T16:54:46.389Z

Production **b461376d-a8cf-494c-93b4-db39d192dc9b**, core **b6a2cd23cbff54c719617373b8c4cda6f8370172**, [PR #14](https://github.com/AcqPath/acqpath/pull/14) merged. [Stock fresh Preflight](https://developers.getacqpath.com/stock-x402) LIVE at **0.02 USDC on Base**; the [recommended secure SIWX route](https://developers.getacqpath.com/public-http) is unchanged. Stock binds the input at first valid use, not in the EIP-3009 signature.

617 tests PASS, 0 FAIL, two existing Windows skips; bundled SIWX 83/83, workerd, exact-head CI, audits and candidate/history scans PASS. Production unpaid and legacy checks PASS; CDP valid=true for both routes. Rollback: 0b952e13-d76c-4226-a117-521741d30769. No protected configuration changes, owner wallet or payment.

Agent402: origin refreshed; stock listing awaiting crawler readback. Wire behavior supported by local cryptographic reproduction; live dispatch still gated by settlement_required. PayAPI private buyer execution UNKNOWN; owner handles all email. Organic reports 0, repeat external payers 0, organic revenue 0 USDC, marketplace verification settlements 0 at 2026-09-12T16:55:31.619Z. Existing monitor includes the stock SKU and keeps marketplace verification separate.

## Previous release evidence

# Revenue Expansion release — 2026-09-12

Production Worker 0b952e13-d76c-4226-a117-521741d30769; core merge b2a9273f7269f137af2336d7819bbd3a7595a0b3, PR #13. Preflight remains 0.02/0.05 USDC. Ingestion Gate: fresh 0.04 + 0.02 per URL, deep 0.06 + 0.04, one to four unique URLs. Revalidation: 0.03/0.06 with authentic prior gateway checkpoint. [Buyer guide](https://developers.getacqpath.com/gateway), [TS/Python examples](https://developers.getacqpath.com/examples/GATEWAY.md), [release metadata](../metadata/revenue-release.json).

Core: 587 PASS, 2 existing Windows skips, 0 FAIL; bundled adapter 83/83; workerd, CI, audits and full candidate/history secret scans PASS. Production unpaid 26/26 PASS; Node/Python signed-offer verification stops before signing. No migrations; protected values unchanged. No owner wallet or payment. Mainnet paid E2E awaits a real external buyer.

Agent402: three paid routes indexed with Base metadata. Preflight #1 RSL rights before RAG ingestion; Gate #1 rights evidence before indexing / #2 batch content rights check; Revalidation #1 AI usage rights policy changes. Router payment UNSUPPORTED. Some other query phrasings have no result. PayAPI existing listing pending_review, payment_verified=false; no supported edit flow and no duplicate.

Organic paid operations 0; repeat external payers 0; organic revenue 0 USDC; marketplace verification settlements 0 (fresh aggregate and monitor readback 2026-09-12). Existing hourly monitor ACTIVE, including SKU mix and 100-operation milestone. Development freeze ACTIVE: incidents, security, standards compatibility and measurement only. No more directories or owner-funded transactions.

## Historical evidence follows

# Final technical release — 2026-09-11

Production version 0c3b5794-f428-4e69-879e-29cab293cd1a; core commit 9533e49d262d20d5bb3712321fbc66981e477418. Configured official TS/Python x402 + SIWX integration is deployed. Local/CI/workerd and public unpaid checks PASS; no owner wallet/payment. MAINNET PAID E2E = UNVERIFIED. Acquisition UNPROVEN. See [configured integration](https://developers.getacqpath.com/public-http).

# Historical acceptance — Phase 4 production coverage

At that earlier checkpoint, core PR9 was merged and production version 61b19442-bd51-46ec-be31-01422a07f877 was live. All 19 unpaid checks pass, including two genuine non-UNKNOWN prepared offers at 0.02 USDC, pinned server signature verification, same-context unpaid retry, legacy quote/claim/report and CDP valid=true. Tests: 498 PASS, zero FAIL, two existing Windows skips; local workerd, types, CI, audit and secret scans PASS. Protected payment/runtime bindings, routes, Access, reconciliation and schema are unchanged.

No wallet was signed and no payment occurred. Bazaar indexing, delivered paid report and post-settlement retry remain UNVERIFIED; Phase 5 prohibits owner-funded payment. Await the first independent external settlement; current scoped mainnet aggregate is zero. [Current evidence](BAZAAR-ENGINEERING-STATUS.md). npm remains on owner hold.

The following Phase 2 snapshot is historical, including its zero-core-edit statement, deployment IDs, counts, earlier aggregate snapshot and blocker labels. It does not override the subsequent owner authorization or current Phase 3B results.

# Odbiór Phase 2 MAX — 10 września 2026

| Pozycja | Stan i dowód |
|---|---|
| Repozytorium | VERIFIED LIVE: [reflectme-source/acqpath-distribution](https://github.com/reflectme-source/acqpath-distribution), osobny Git root i origin. Opis, 12 topics i homepage `/from-github` odczytane publicznie. Końcowe CI i commit są podane w sekcji dowodów poniżej. |
| Dokumentacja | VERIFIED LIVE: [developers.getacqpath.com](https://developers.getacqpath.com) oraz [Pages](https://acqpath-distribution.pages.dev). Osobny projekt `acqpath-distribution`; 19 stron i jawna lista zasobów maszynowych. |
| Wdrożenie Pages | `43c3c41e-c1f0-47af-83a5-bd3c3b8398d5`, produkcyjne wdrożenie projektu dystrybucji. Direct upload 47 plików, ZIP SHA256 `d501f82b957043ad0bfc93d721cc698ad590b2221f168a58e1faaf7344e045d4`. |
| Odczyt docs | VERIFIED LIVE, 15:53 UTC: na każdej domenie 44 zasoby i 27 odnośników PASS; zgodność treści, nagłówków, kanonicznych ścieżek i własnego HTTP 404. Normalizacja usuwa wyłącznie dokładny sprawdzony skrypt analityczny Cloudflare. |
| MCP Registry | VERIFIED LIVE: [3.1.0-rc.2](https://registry.modelcontextprotocol.io/v0.1/servers/com.getacqpath%2Facqpath/versions/3.1.0-rc.2), `active`, dokładna zgodność manifestu. To rewizja metadanych; backend pozostaje rc.1. |
| Smithery | VERIFIED LIVE: [AcqPath](https://smithery.ai/servers/reflectme-project/acqpath-rights-preflight), opublikowany remote endpoint i publiczny opis. Wyszukiwanie konkretnego RSL preflight znajduje wpis; wyniki innych zapytań nie są gwarantowane. |
| Glama | VERIFIED LIVE: [connector](https://glama.ai/mcp/connectors/com.getacqpath/acqpath), istniejący wpis, własność DNS zweryfikowana, endpoint zgodny, health metadata działa. Nie utworzono duplikatu. |
| GitMCP | VERIFIED LIVE w zakresie initialize/tools-list i pobrania dokumentacji: [MCP dokumentacji](https://gitmcp.io/reflectme-source/acqpath-distribution), protokół 2025-03-26, cztery narzędzia dokumentacyjne. Pobranie root llms PASS; wyszukiwanie semantyczne zwraca fallback/timeout. Nie jest płatnym MCP AcqPath. |
| Integracje | PUBLISHED: JS, TypeScript, Python read-only, konfiguracje MCP, workflow RAG/research/training/search/crawl oraz skill. Przykłady płatne wymagają własnego zatwierdzonego signera, limitu i prywatnego checkpointu. UNKNOWN oznacza hold. |
| Testy lokalne | 85/85 PASS, Windows Node 22.19.0, 46 modułów składni i 6 sum vendor PASS. TypeScript 7.0.2 strict i walidator SKILL PASS; Python ast.parse PASS. Nie wykonano prawdziwej płatności. |
| GitHub CI | VERIFIED: pierwsza wersja Phase 2 przeszła Windows i Ubuntu [34499024566](https://github.com/reflectme-source/acqpath-distribution/actions/runs/34499024566). Końcowe wyniki dla poprawionego monitora i 85 testów są przypięte do commitu w [release](https://github.com/reflectme-source/acqpath-distribution/releases/tag/distribution-v1.1.0). |
| Discovery | LOCAL VERIFIED 16:10 UTC: wszystkie 10 kontroli PASS, bez quotes/płatności/admin secrets. Pierwszy run GitHub wykrył timeout wyszukiwania Registry; poprawiono ograniczony retry i jawny upload tylko publicznych artefaktów. Końcowy run i dowód pobrania artefaktów znajdują się w release. |
| Sekrety | VERIFIED: Gitleaks 8.30.1, brak wykryć w 121 publicznych plikach, 17 plikach klienta, docs i staged diff. Końcowy inwentarz MANIFEST jest odświeżany przed commitem; skan nie jest certyfikacją. |
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

Końcowy Git HEAD, identyczny z origin/main, wyniki CI/discovery i odczyty publiczne są zapisane w załączniku `phase2-final-verification.json` do [release dystrybucji](https://github.com/reflectme-source/acqpath-distribution/releases/tag/distribution-v1.1.0). Ten zewnętrzny dowód jest tworzony po testach końcowego commitu, bez cyklu dopisywania jego własnego SHA do tego samego commitu.
