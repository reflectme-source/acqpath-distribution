# Ustalenia, których nie wolno ukryć

## Bazaar — wymaga osobnej decyzji o integracji core

Przejrzane pliki src/native/service.mjs, src/payments/extensions.mjs i src/payments/x402.mjs nie zawierają deklarowania/podawania `bazaar` w natywnym płatnym flow. API ma dynamiczny report id oraz prywatny claim. Potwierdzenie stosuje się do wybranego źródła referencyjnego; source-audit porównuje te pliki na maszynie właściciela.

Oficjalne CDP wymaga poprawnej deklaracji Bazaar oraz udanego settle do indeksacji. Nie da się uczciwie „dopisać wpisu” tym pakietem i obiecać pełnego paid call bez zmiany kontraktu lub zatwierdzonego adaptera. Nie dodajemy potajemnie innego payment servera/proxy ani nie przenosimy odbiorcy. Publiczne materiały, npm, MCP Registry i kompatybilny Smithery są osobnymi kanałami, które można ukończyć bez tej zmiany.

## Pokrycie i wyniki

Cena .02/.05 USDC nie jest dowodem, że przykładowy URL ma użyteczną deklarację. Trzeba dobrać rzeczywiście obsługiwany input z aktualnych capabilities. Brak deklaracji oznacza unavailable, a UNKNOWN nie udziela zgody na użycie. Żaden przykład nie może reklamować braku deklaracji jako copyright clearance.

## Niskie limity wycen, wysoki cap pieniędzy

Ostatni owner log: 500 rights quotes/dzień, 2000 metadata fetches/dzień, 60 requestów/min/IP oraz 1m USDC/dzień cap pieniędzy. Nie ruszamy ich. Zależnie od przebiegu i cache wąskim gardłem mogą być wyceny/pobrania, nie cap kwotowy. To nie jest capacity audit ani obietnica miliona raportów.

## Recovery i live validation

Owner uruchomił LIVE z DEGRADED reconciliation. Metadane gotowości nie wolno zmieniać na payment-tested bez rzeczywistej transakcji. Podnoszenie ruchu bez niezawodnego recovery zwiększa obsługę wyjątków. Pakiet nie naprawia tego błędu i nie udaje, że CLI manual recovery jest już zweryfikowane.

## Zewnętrzne platformy

Moderacja, niewłasny npm scope, brak uprawnień, wyłączone Pages, drift protokołu, DNS/firewall czy rate limits pozostają rzeczywistymi możliwymi blokadami. Błędy nie uzasadniają wycięcia kontroli. Kontynuujemy niezależne kanały, nie obiecujemy, że jedna komenda zagwarantuje publikację wszędzie.
