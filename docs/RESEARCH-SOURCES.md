# Źródła pierwotne sprawdzone 2026-09-09

Dokumentacja platform to źródło zasad publikacji, nie dowód publikacji AcqPath. Nie wykorzystujemy blogów agregatorów do weryfikacji kontraktów technicznych.

| Źródło | Co potwierdza |
|---|---|
| https://coinbase-cloud.mintlify.app/x402/bazaar | Oficjalna dokumentacja CDP: extension + successful settlement, verify alone insufficient; opt-out przez brak extension |
| https://docs.x402.org/extensions/bazaar | Schema Bazaar, discovery extension i route templates; nie gwarantuje indeksacji AcqPath |
| https://docs.cdp.coinbase.com/api-reference/v2/rest-api/x402-facilitator/search-x402-resources | Bounded query/search, filtry sieci i odbiorcy |
| https://docs.cdp.coinbase.com/api-reference/v2/rest-api/x402-facilitator/bazaar-mcp-server | search_resources i proxy_tool_call dla obsługiwanych płatnych endpointów |
| https://agentic.market/validate | Walidator x402 i obecności w Bazaar; użyć prawdziwego publicznego zasobu, nie ujawniać claim tokena |
| https://modelcontextprotocol.io/registry/remote-servers | Manifest remotes/streamable-http, aktualny schema2025-12-11, publiczny URL; Registry preview |
| https://modelcontextprotocol.io/registry/authentication | Publikacja namespace przez DNS; publiczny Ed25519 TXT |
| https://modelcontextprotocol.io/registry/quickstart | Oficjalne mcp-publisher, publikacja i readback API |
| https://modelcontextprotocol.io/specification/2025-06-18/basic/transports | Streamable HTTP, notification202, opcjonalny GET405, session/version headers |
| https://smithery.ai/docs/build/publish | Public HTTPS URL, Streamable HTTP, skanowanie serwera; proxy gateway |
| https://smithery.ai/docs/concepts/cli | npm smithery, auth login, mcp publish URL -n namespace/server |
| https://www.pulsemcp.com/api | Dane katalogowe/źródła i granice automatyzacji; przyjęcia nie zakładamy |
| https://docs.npmjs.com/trusted-publishers/ | OIDC, dokładny repo/workflow/environment, pierwsza konfiguracja konta |
| https://docs.cdp.coinbase.com/x402/welcome | Warunki/cennik CDP; wymagają ponownej weryfikacji przed kosztami |

Źródło implementacji klienta: lokalna paczka AcqPath użytkownika, wybrane moduły zachowane byte-for-byte w vendor, hash w metadata/vendor-provenance.json. To nie oznacza audytu pełnego backendu. Źródło konfiguracji: ostatni przekazany log MAINNET LIVE z 2026-09-09 i wybrane pliki referencyjne; stan aktualny pobiera public-audit.

Środowisko autora nie mogło rozwiązać DNS domen runtime podczas weryfikacji. Nie wykonano rejestracji, publikacji, mutacji DNS, zakupu mainnet ani sprawdzenia bieżących organicznych wpływów. Lista dokumentacji nie zastępuje tych dowodów.
