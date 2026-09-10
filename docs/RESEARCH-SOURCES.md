# Źródła pierwotne Phase 2 — sprawdzone 2026-09-10

Zasady publikacji pochodzą z oficjalnej dokumentacji, utrzymywanych repozytoriów i formularzy usług. Zasady platformy nie stanowią dowodu publikacji AcqPath; rzeczywiste odczyty są w [DISCOVERY-TESTS](../DISCOVERY-TESTS.md).

| Źródło | Zastosowanie |
|---|---|
| [MCP Registry API](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/api/official-registry-api.md) | Dokładny odczyt wersji, lifecycle i wyszukiwanie substring po nazwie |
| [MCP Registry schema](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/api/openapi.yaml) | API rejestru i dane manifestu; nie deklaracja paid flow |
| [Remote MCP servers](https://modelcontextprotocol.io/registry/remote-servers) | Publikacja istniejącego endpointu Streamable HTTP |
| [MCP transport](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports) | Initialize, notification, tools/list, sesje i wersja protokołu |
| [Smithery publish](https://smithery.ai/docs/build/publish) | Remote HTTPS i skan metadanych; logowanie właściciela |
| [Glama API](https://glama.ai/mcp/reference) | Autoryzacja Directory API; publiczny HTML nie wymaga tego klucza |
| [Glama FAQ](https://glama.ai/mcp/faq) | Remote connectors, health i logowanie pełnych payloadów gateway; private claims wymagają ostrożnej integracji |
| [Docker contribution guide](https://github.com/docker/mcp-registry/blob/main/CONTRIBUTING.md) | Remote wpis trzyplikowy, przegląd PR i MIT wkładu katalogowego |
| [PulseMCP submit](https://www.pulsemcp.com/submit) | Formularz wstrzymany od 3 września, sprawdzony w UI |
| [Context7 add library](https://context7.com/add-library) | Dodawanie publicznych źródeł dokumentacji wymaga logowania |
| [GitMCP](https://gitmcp.io/) | Repozytorium jako osobny MCP dokumentacji |
| [Agent Skills](https://skills.sh/docs) | Źródło skill i instalacje; nie generujemy instalacji dla rankingu |
| [Skills well-known provider](https://github.com/vercel-labs/skills/blob/main/src/providers/wellknown.ts) | Bieżący alternatywny discovery 0.2.0; nie wdrażano redundantnego indeksu ani nie deklarowano jego zgodności |
| [CDP Get discovered](https://docs.cdp.coinbase.com/x402/seller/get-discovered) | Bazaar extension, dynamiczne pathParamsSchema, forwarding resource i nonsettling validate; exact analiza w BAZAAR-COMPATIBILITY |
| [Bazaar implementation](https://github.com/x402-foundation/x402/tree/main/typescript/packages/extensions/src/bazaar) | Aktualna implementacja schematów i propagacji extension |
| [x402 v2 specification](https://github.com/x402-foundation/x402/blob/main/specs/x402-specification-v2.md) | Resource/accepts/extensions oraz settlement |
| [Agentic Market](https://agentic.market/about) | Powiązanie z ekosystemem Coinbase Bazaar |
| [Agentic Wallet search](https://docs.cdp.coinbase.com/agentic-wallet/cli/skills/search-for-service) | Odkrywanie usług przez agentów zdolnych do płatności |
| [x402scan spec](https://www.x402scan.com/discovery/spec) | API-origin OpenAPI, x-payment-info, probing i rejestracja SIWX; nie wykonywano probe po metodach ani podpisu |
| [CDP FAQ](https://docs.cdp.coinbase.com/x402/support/faq) | Opublikowana taryfa facilitatora; nie dowód rzeczywistych kosztów konta |
| [Pages Web Analytics](https://developers.cloudflare.com/pages/how-to/web-analytics/) | Analityka statycznych docs i wstrzykiwany skrypt |
| [Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) | CSP i ograniczenia analityki; rzeczywisty snippet odczytano z obu hostów |
| [MCP.so remote form](https://mcp.so/submit?type=remote-server) i [MCP Market](https://mcpmarket.com/submit) | Bieżące płatne formularze; oba pominięto bez wydatków |
| [Microsoft registry](https://github.com/microsoft/mcp-server-registry) | Aktualny zakres first-party; AcqPath nie jest pierwszą stroną Microsoft |

Publiczny kontrakt AcqPath pochodzi z capabilities, service info, OpenAPI i MCP metadata, zapisanych przed optymalizacją. Zgodność core porównano wyłącznie przez dozwolony dziewięcioplikowy source-audit. Agregaty biznesowe odczytano dokładnie raz po oddzielnej zgodzie właściciela. Żadne źródło nie dowodzi klientów, zysku ani pełnego mainnet paid flow.
