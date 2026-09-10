# Model operacyjny przychodu

## Cel

Marża od powtarzalnych, użytecznych zakupów; nie surowa liczba requestów, portfeli czy transakcji. Podstawowa oferta: signed observed-declarations report, fresh0.02/deep0.05 USDC według ostatniej konfiguracji. Każdy zakup musi sprawdzać aktualne quote/warunki. Raport nie jest licencją.

## Pierwsza fala

Trzy hipotezy: RAG ingestion (ai-index), research evidence (ai-input), content processing review (ai-train). Materiały i przykłady są gotowe. Jeden deweloper integruje SDK; jego klient może kupować wielokrotnie w swoim limicie, nie za środki sprzedawcy. Nie kupujemy reklam, nie sponsorujemy setek płatności i nie tworzymy sztucznych kont dla rankingu.

## Reguły analizy

Brak widoczności -> indeksacja/zgodność. Widoczność bez prób -> potrzeba/pozycjonowanie/zasięg. Wyceny niedostępne -> pokrycie. Oferty bez płatności -> kompatybilność, wartość, cena. Zakupy bez powrotów -> użyteczność lub rzadka potrzeba. Powtórki -> rozszerzenie skutecznego kanału i kontrolowane eksperymenty ceny. Problemy dostawy -> najpierw prawidłowa obsługa klienta, nie dokładanie ruchu.

Nie ma automatycznych zmian ceny. Brak niezależnych kupujących nie upoważnia do twierdzenia „cena idealna”. Hipotezy oceniamy po faktycznych wywołaniach, nie po samym upływie dnia. Tydzień bez ruchu i tydzień z tysiącem nieskutecznych prób to różne problemy.

## Dane dostępne bez zmian core

Optional metrics-read zbiera agregaty quote/payments/received/repeat wallet IDs. Filtruje testnet. Nie potrafi niezawodnie odjąć operator self-tests ani ustalić kanału pozyskania z samych agregatów. Dlatego organicRevenue, organicCustomers i netProfit pozostają null. Nie dopisujemy ich szacunkowo. Własne controlled QA dokumentujemy osobno; nie jest trakcją.

Przychód brutto = suma opłat. Zysk wymaga kosztów CDP, Cloudflare i pozostałych wydatków oraz zwrotów; pakiet nie importuje automatycznie faktur ani nie podaje stałej marży z sufitu. Na 2026-09-09 publiczne CDP docs opisują 1000 darmowych transakcji/miesiąc, potem 0.001 USD/tx; zweryfikuj rzeczywiste konto i bieżący cennik przed skalowaniem. Nie jest to autoryzacja do wydatków.

## Cykl

Po publikacji publiczny workflow obserwuje widoczność raz dziennie; nie wykonuje płatnych testów, nie czyta admin credentials. Codex odczytuje raporty, właściciel może przekazać bezpieczne agregaty do konsultacji. Ta paczka nie tworzy asystenta pracującego w tle w ChatGPT ani abonamentu na analizę. Prawdziwe nowe potrzeby kupujących uzasadniają późniejsze zmiany; provider routing nie jest włączany w tym etapie.

## Pomiar Phase 2 — 2026-09-10

Właściciel zatwierdził jeden odczyt agregatów, wykonany 13:43 UTC. Nie jest on powtarzany ani dodany do harmonogramu. Pełny baseline, ograniczenia atrybucji i rzeczywiste zera/UNKNOWN: [REVENUE-BASELINE](../REVENUE-BASELINE.md). Aktualnie sprawdzony cennik facilitatora i obliczenia: [REVENUE-OPTIMIZATION](../REVENUE-OPTIMIZATION.md).
