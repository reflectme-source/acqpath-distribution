# Kanały i ich rzeczywisty zakres

| Kanał | Pakiet | Co nie jest obiecane |
|---|---|---|
| MCP Registry | server.json, DNS proof, pinned publisher, odczyt wpisu | Automatyczna instalacja u wszystkich agentów, płatny zakup przez sam MCP |
| Cloudflare Pages | Osobny projekt, developers.getacqpath.com, sześć stron, SKILL.md, llms.txt | Przeniesienie starego landingu, ranking SEO, płatny ruch |
| npm | klient HTTP/x402, checkpointy, browser signer, przykłady | Automatyczna zgoda agenta na płatność, dowód efektywności biznesowej |
| Smithery | publikacja istniejącego MCP URL, gotowy opis | Zgodność paid flow przez proxy bez testu |
| PulseMCP | prawdziwy opis zgłoszenia | Złożenie/przyjęcie bez potwierdzenia formularza/kuratora |
| Bazaar | bounded search + spec wymaganej integracji | Indeksacja bez extension i udanego settlement; korekta core bez zgody |
| Agentic Market | oficjalna strona validator + check w closeout | Osobny niezależny kanał, jeśli czerpie z tego samego Bazaar |

MCP wypisuje też legacy acqpath_quote. W obecnej produkcji router jest wyłączony; opisy publikacji uprzedzają o tym. Nie aktywujemy providers ani nie fałszujemy tool-list. Większa konwersja wymaga użytecznego raportu i klienta, który rozumie quote-before-redeem; przypadkowy spamowy ruch nie jest sukcesem.
