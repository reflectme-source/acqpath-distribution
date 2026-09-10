# Odbiór — wypełnia Codex wynikami, nie założeniami

| Pozycja | Dowód potrzebny | Status przed uruchomieniem u właściciela |
|---|---|---|
| Pakiet lokalny | release/VERIFICATION.json + testy | Patrz rzeczywisty raport w paczce |
| Core bez zmian | selected-file comparison przed/po, brak komend deploy | Kod core nie jest modyfikowany przez przygotowanie |
| Publiczne API | bieżący public-audit z source/key/handshake | REMOTE_UNVERIFIED w środowisku autora |
| Nowe repo | dokładny owner/acqpath-distribution, commit, secret review | NOT_PUBLISHED |
| Docs Pages | zakończony workflow + pobranie publicznej strony | NOT_PUBLISHED |
| npm | dokładny pakiet/wersja + pobranie i test | NOT_PUBLISHED |
| MCP Registry | API zwraca dokładny namespace i URL | NOT_PUBLISHED |
| Smithery | wpis i test narzędzi przez gateway | NOT_PUBLISHED |
| PulseMCP | potwierdzenie kuratora/widoczna strona | NOT_SUBMITTED |
| Bazaar | poprawny wpis + płatne wywołanie workflow | BLOCKED_BY_CURRENT_CORE_CONTRACT |
| Mainnet purchase | realny settlement + podpisany raport + zapis self-test | NOT_PERFORMED_BY_PACKAGE_AUTHOR |
| Organic revenue | niepowiązani kupujący, powtórki i rozpoznane koszty | NOT_ESTABLISHED |

Nie zastępuj wymaganych dowodów samym tekstem PASS w logu. `RECONCILIATION_READY` pozostaje nierozwiązane zgodnie z ostatnim logiem. Brak problemu w krótkim teście nie dowodzi odporności na awarie lub wysokiej przepustowości.
