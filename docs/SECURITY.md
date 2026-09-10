# Granice bezpieczeństwa

Domyślne prepare/audit/catalogs/build/status nie podpisują płatności, nie tworzą quotes i nie czytają poświadczeń operatora. Sieciowe GET i MCP initialize/list mają limity rozmiaru/czasu i allowlist originów. Publikacje wymagają aktualnego publicznego audytu i osobnej zgody. Audyt publiczny nie stanowi pentestu ani zapewnienia płatności.

Nie przechowujemy żadnego klucza sprzedającego USDC. Lokalny opcjonalny test kupuje maksymalnie jeden raport za 50,000 micro-USDC; portfel użytkownika podpisuje EIP-3009, a SDK zachowuje podpisany checkpoint przed wysłaniem. Przykłady klienckie mogą kupować w ramach budżetu ustawionego przez KUPUJĄCEGO — nie są autonomicznym wydawaniem AcqPath.

Przechowuj .private, .local, .tools i ewentualne dane npm/gh wyłącznie prywatnie. .private/registry-key.pem jest kluczem prawa do publikacji namespace MCP, nie portfelem. Publisher oficjalnie przyjmuje go jako parametr; lokalny uprzywilejowany proces może zobaczyć argumenty. Nie używaj tej funkcji na niezaufanej współdzielonej maszynie. Skrypt nie wypisuje stdout/stderr autoryzacji.

EncryptedCheckpointStore używa AES-256-GCM, scrypt, odrębnego AAD per order i blokady katalogowej. Nie ma automatycznego kasowania osieroconych blokad, resetu checkpointu ani nowego podpisu po błędzie. Hasło przechowuje użytkownik; nie zapewniamy odzyskania bez niego. Uprawnienia mode600 na Windows nie zastępują systemowych ACL/BitLocker.

Nie wysyłaj claim tokenów, podpisów, seedów, osobistych maili, kopii core czy prywatnych logów do katalogów/LLM. Admin token nie jest read-only z natury, dlatego optional metrics-read ogranicza kod do jednego znanego GET, bez przekazywania poświadczeń do CI. Nie jest to niezależna granica uprawnień dla złośliwego kodu lokalnego.

Zależności runtime root/client: zero npm dependencies. Sześć modułów vendor jest kopią wybranego publicznego klienta z projektu użytkownika, przypiętą w vendor-provenance. To nie jest certyfikacja x402 ani niezależny audyt. Instalatory zewnętrznych oficjalnych narzędzi działają dopiero na maszynie właściciela i mają oddzielne locki; status testów lokalnych nie obejmuje zaufania do całego zewnętrznego toolchainu.

Statyczny skaner wykrywa wybrane wzorce tokenów/kluczy, nie wszystkie możliwe sekrety. Codex nadal przegląda staged diff i listę plików tarballa przed publikacją. GitHub public owner/commit metadata mogą ujawniać powiązanie konta z projektem; prywatność danych kontaktowych nie oznacza anonimowości prawnej.
