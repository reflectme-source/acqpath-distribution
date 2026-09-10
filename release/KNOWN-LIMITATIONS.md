# Aktualne ograniczenia Phase 2 MAX

Stan publikacji i wykonanych testów: [ACCEPTANCE](../docs/ACCEPTANCE.md). Ten dokument zastępuje historyczne ograniczenia paczki sprzed pierwszej publikacji.

- Bazaar/x402scan: brak natywnej metadanej Bazaar oraz niepotwierdzona zgodność private quote/retrieval z discovery; minimalna propozycja w [BAZAAR-COMPATIBILITY](../BAZAAR-COMPATIBILITY.md). Żadnej zmiany core nie wykonano.
- Płatny flow: testy klienta używają fixtures. Brak realnego settlement, podpisów portfela i dowodu niezależnego płatnika. Reconciliation pozostaje poza zakresem.
- Kanały: Docker wymaga zgody na publiczny fork/PR; Context7 logowania; PulseMCP ma wstrzymany intake. npm jest celowo nieopublikowany. Bieżące szczegóły w [CHANNEL-MATRIX](../CHANNEL-MATRIX.md).
- Wyszukiwanie: przyjęcie metadanych nie zapewnia wyników dla każdego intentu. MCP Registry szuka po nazwie. SEO i ranking skills nie są potwierdzone publikacją plików.
- Analityka: docs visits nie identyfikują agentów ani płatników. Brak kosztów i niezależności portfeli oznacza UNKNOWN dla zysku i organicznego revenue.
- Skan sekretów i porównanie dziewięciu dozwolonych plików nie są pełną certyfikacją bezpieczeństwa ani audytem całego backendu.
