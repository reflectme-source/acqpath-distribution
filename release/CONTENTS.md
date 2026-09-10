# Zawartość dystrybucji

AGENTS.md, START-TUTAJ.md i CODEX-START.txt zawierają zasady osobnego workspace. Obowiązują ograniczenia zapisu do core i osobna zgoda na realną płatność.

scripts/ zawiera lokalne testy, build, publiczne readback/discovery i narzędzia publikacji. Build tworzy 19 stron oraz machine assets z jawnej listy, wyłącznie w out/site.

packages/rights-client/ zawiera klienta HTTP/x402 i zaszyfrowane checkpointy. Jest objęty zatwierdzonym MIT, lecz publikacja npm pozostaje wyłączona. buyer-demo/ jest opcjonalny i nigdy nie uruchamia się podczas build/CI.

examples/ i skills/acqpath-rights-preflight/ zawierają bezpieczne przykłady integracji oraz skill. metadata/ zawiera manifesty, snapshot publicznego kontraktu, intent pages i propozycje kanałów. site/ zawiera statyczny CSS, ikonę i nagłówki docs.

.github/workflows/ zawiera zweryfikowane workflow z przypiętymi SHA. Dzienny discovery jest read-only. tests/ zawiera 85 testów bez prawdziwych płatności.

Pięć raportów Phase 2 znajduje się w root. docs/ACCEPTANCE.md podaje rzeczywiste dowody. release/VERIFICATION.json jest lokalnym raportem testów, a SETUP-VERIFICATION.json pozostaje historycznym dowodem Phase 1.

MANIFEST.json zawiera aktualne sumy publicznych źródeł z normalizacją CRLF do LF, bez samego manifestu i katalogów ignorowanych. To inwentarz integralności, nie podpis audytora.
