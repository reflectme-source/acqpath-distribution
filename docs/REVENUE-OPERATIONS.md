# Revenue Expansion release — 2026-09-12

Production Worker 0b952e13-d76c-4226-a117-521741d30769; core merge b2a9273f7269f137af2336d7819bbd3a7595a0b3, PR #13. Preflight remains 0.02/0.05 USDC. Ingestion Gate: fresh 0.04 + 0.02 per URL, deep 0.06 + 0.04, one to four unique URLs. Revalidation: 0.03/0.06 with authentic prior gateway checkpoint. [Buyer guide](https://developers.getacqpath.com/gateway), [TS/Python examples](https://developers.getacqpath.com/examples/GATEWAY.md), [release metadata](../metadata/revenue-release.json).

Core: 587 PASS, 2 existing Windows skips, 0 FAIL; bundled adapter 83/83; workerd, CI, audits and full candidate/history secret scans PASS. Production unpaid 26/26 PASS; Node/Python signed-offer verification stops before signing. No migrations; protected values unchanged. No owner wallet or payment. Mainnet paid E2E awaits a real external buyer.

Agent402: three paid routes indexed with Base metadata. Preflight #1 RSL rights before RAG ingestion; Gate #1 rights evidence before indexing / #2 batch content rights check; Revalidation #1 AI usage rights policy changes. Router payment UNSUPPORTED. Some other query phrasings have no result. PayAPI existing listing pending_review, payment_verified=false; no supported edit flow and no duplicate.

Organic paid operations 0; repeat external payers 0; organic revenue 0 USDC; marketplace verification settlements 0 (fresh aggregate and monitor readback 2026-09-12). Existing hourly monitor ACTIVE, including SKU mix and 100-operation milestone. Development freeze ACTIVE: incidents, security, standards compatibility and measurement only. No more directories or owner-funded transactions.

## Historical evidence follows

# Model operacyjny przychodu

## Cel

Marża od powtarzalnych, użytecznych zakupów; nie surowa liczba requestów, portfeli czy transakcji. Podstawowa oferta: signed observed-declarations report, fresh0.02/deep0.05 USDC według ostatniej konfiguracji. Każdy zakup musi sprawdzać aktualne quote/warunki. Raport nie jest licencją.

## Pierwsza fala

Trzy hipotezy: RAG ingestion (ai-index), research evidence (ai-input), content processing review (ai-train). Materiały i przykłady są gotowe. Jeden deweloper integruje SDK; jego klient może kupować wielokrotnie w swoim limicie, nie za środki sprzedawcy. Nie kupujemy reklam, nie sponsorujemy setek płatności i nie tworzymy sztucznych kont dla rankingu.

## Reguły analizy

Brak widoczności -> indeksacja/zgodność. Widoczność bez prób -> potrzeba/pozycjonowanie/zasięg. Wyceny niedostępne -> pokrycie. Oferty bez płatności -> kompatybilność, wartość, cena. Zakupy bez powrotów -> użyteczność lub rzadka potrzeba. Powtórki -> pomiar użyteczności i kosztu; ceny pozostają bez zmian. Problemy dostawy -> najpierw prawidłowa obsługa klienta, nie dokładanie ruchu.

Nie ma automatycznych zmian ceny. Brak niezależnych kupujących nie upoważnia do twierdzenia „cena idealna”. Hipotezy oceniamy po faktycznych wywołaniach, nie po samym upływie dnia. Tydzień bez ruchu i tydzień z tysiącem nieskutecznych prób to różne problemy.

## Dane dostępne bez zmian core

Optional metrics-read zbiera agregaty quote/payments/received/repeat wallet IDs. Filtruje testnet. Nie potrafi niezawodnie odjąć operator self-tests ani ustalić kanału pozyskania z samych agregatów. Dlatego organicRevenue, organicCustomers i netProfit pozostają null. Nie dopisujemy ich szacunkowo. Własne controlled QA dokumentujemy osobno; nie jest trakcją.

Przychód brutto = suma opłat. Zysk wymaga kosztów CDP, Cloudflare i pozostałych wydatków oraz zwrotów; pakiet nie importuje automatycznie faktur ani nie podaje stałej marży z sufitu. Na 2026-09-09 publiczne CDP docs opisują 1000 darmowych transakcji/miesiąc, potem 0.001 USD/tx; zweryfikuj rzeczywiste konto i bieżący cennik przed skalowaniem. Nie jest to autoryzacja do wydatków.

## Cykl

Po publikacji publiczny workflow obserwuje widoczność raz dziennie; nie wykonuje płatnych testów, nie czyta admin credentials. Codex odczytuje raporty, właściciel może przekazać bezpieczne agregaty do konsultacji. Ta paczka nie tworzy asystenta pracującego w tle w ChatGPT ani abonamentu na analizę. Prawdziwe nowe potrzeby kupujących uzasadniają późniejsze zmiany; provider routing nie jest włączany w tym etapie.

## Historical measurement Phase 2 — 2026-09-10

Właściciel zatwierdził jeden odczyt agregatów, wykonany 13:43 UTC. Nie jest on powtarzany ani dodany do harmonogramu. Pełny baseline, ograniczenia atrybucji i rzeczywiste zera/UNKNOWN: [REVENUE-BASELINE](../REVENUE-BASELINE.md). Aktualnie sprawdzony cennik facilitatora i obliczenia: [REVENUE-OPTIMIZATION](../REVENUE-OPTIMIZATION.md).
