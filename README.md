# GRAPHITE
## Kino z černobílé doby
Toto je manuál pro webové stránky kina Graphite. Je zaměřen primárně pro vývojáře, který na ní v budoucnu pracuje.

### Obsah
1. Spuštění projektu ve vývojářském prostředí
2. Orientace ve frontendu
3. Orientace v backendu
4. Databáze
5. Obecné schopnosti stránky

### 1. Spuštění projektu ve vývojářském prostředí

Je třeba mít připravené následující nástroje:

- Běžný webový prohlížeč - např: **Chrome** nebo **Edge**
- **Node.js**
- **XAMPP** minálně s **Apache** serverem a **MySQL* databází
- Povolit balíčky **gd** a **openssl** v .ini souboru pro PHP (v *xampp/php/*)
- Doporučeno používat **Visual Studio Code** jako editor
- Je také doporučeno být na platformě **Windows 11**, ovšem

Také třeba mít zdroj:

- Hlavní projekt obsahující frontend i backend
- Skripty k vytvoření MySQL databáze + její naplnění
- klíč k šifrování v *.env* souboru

Pro samotné zprovoznění je třeba:

- Přejít do složky *Design/* a na tom místě spustit `npm --install` v terminálu
- **Otevřít XAMPP** (nejlépe jako správce) a spustit **Apache** a **MySQL**
- Pro jednoduchost se hodí najít v XAMPP složkách složku *php/* a přidat ji do systémové proměnné **Path**
- Otevřít druhou instanci terminálu a přejít do složky *Design/backend/* a spustit `php -S 127.0.0.1:8000`
- Zadat do prohlížeče *http://localhost/phpmyadmin/*, přejít do záložky **SQL** a spustit tam SQL skript na vytvoření databáze **kino**
- Po vytvoření databáze **kino** do ní přejít a v záložce **SQL** nad touto databází spustit skript s daty
- Soubor s šifrovacím klíčem **.env** je nutno vložit so složky *Design/backend/config/*
- Nyní stačí už jen přejít do první instance terminálu (stále ve složce *Design/*) a spustit `npm run dev`
- Pokud se sama neotevře záložka prohlížeče tak je třeba dostat se na adresu z výstupu terminálu (běžně něco jako: *http://localhost:3000/*)

Tímto by mělo být vše funkční.

### 2. Orientace ve frontendu

Frontend projektu je napsán pomocí framweworku **React** a to nad jazykem **Typescript**. Pro stylování byl použit framework **Tailwind**. Projekt se setavuje pomocí **Vite**. Pro přepínání mezi jednotlivými stránkami je použit **BrowserRouter** v souboru **App.tsx**.

### 3. Orientace v backendu

### 4. Databáze

### 5. Obecné schopnosti stránky

- Všechny stránky jsou respozivní

- Na všech stránkách je nejníže dostupný footer s kontaktníma infomacema a otevíracíma hodinama

- Hlavní stránka je první co se uživateli ukáže a nabízí přihlášení, přechod na rezervaci lístků (s přihlášením i bez), prohlížení momentálně promítaných filmů s možností přejít na detaily vybraného filmu a nakonec také jeden vybraný film

- Je možné se z okna přihlášení dostat i na stránku s registrací a zase zpět

- Po přihlášení se místo okna přihlášení ukáže okno profilu s možností si prohlédnout a upravit své údaje, být upozorněn a prohlížet příchozí zprávy, prohlédnout si odeslané zprávy a také jinému uživateli zprávu poslat

- Na stránce úpravy údajů se dají upravovat uživatelské údaje jako profilová fotografie, jméno, příjmení, email, pohlaví a telefon

- V případě Admina je možno na stránce úpravy údajů měnit údaje i jiným uživatelům a to včetně jejich role

