# Start — tylko osobny workspace

## Teraz zrób 3 rzeczy

1. Rozpakuj paczkę **poza repo `acqpath`**, np. do:
   `%USERPROFILE%\Documents\GitHub\AcqPath\DISTRIBUTION\acqpath-distribution`
2. Otwórz ten folder jako projekt/workspace w Codex. Nie wybieraj `PROD\acqpath`.
3. Wklej całą treść `CODEX-START.txt` do Codex i uruchom pracę. Kodex ma uruchamiać polecenia i odczytywać raporty; Ty tylko udzielasz wymaganych autoryzacji.

`START.cmd` jest alternatywą wyłącznie do bezpiecznego przygotowania. Sam nie publikuje niczego i nie uruchamia portfela.

## O co może poprosić Codex

- nazwę konta/organizacji GitHub dla **nowego** repo `acqpath-distribution`;
- zalogowanie do oficjalnego GitHub CLI i npm; zakres npm musi należeć do Ciebie;
- ograniczony token Cloudflare do dodania pojedynczego TXT dla MCP (Zone Read + DNS Edit tylko getacqpath.com);
- ewentualne logowanie Smithery i weryfikację formularza publikacji;
- zatwierdzenie publikacji metadanych, dokumentacji i klienta na licencji MIT;
- oddzielnie: zgodę na jeden zakup maks. 0,05 USDC z osobnego portfela KUPUJĄCEGO, wyłącznie do sprawdzenia płatnego flow.

Nie podajesz seedu, klucza portfela, prywatnego tokena operatora do katalogów ani tokenów do czatu. Nie ustawiasz ponownie produkcji i nie uruchamiasz starych launcherów.

## Co oznacza koniec tego etapu

Powstaje raport faktycznie opublikowanych miejsc, działających połączeń i pozostałych przeszkód. Bazaar nie zostanie fałszywie oznaczony jako gotowy: w przejrzanej ścieżce serwera brakuje jego metadanych. Publikacja MCP i dokumentacji jest oddzielną czynnością od włączenia kompletnego płatnego narzędzia przez Bazaar.

Nie ma automatycznego wydawania Twojego salda. Wydatki kont hostingowych/płatniczych nadal mogą istnieć. Liczba klientów i zysk nie są gwarantowane przez wdrożenie.
