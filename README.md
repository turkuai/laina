# Kalustonhallinta -sovellus Medialle

Tehtävänä on luoda web -sovellus, joka mahdollistaa erilaisten laitteiden varaus / lainaustilanteen seurannan. Ohjelmalla tulostetaan laitteisiin liimattavia qr -koodeja ja aina laitetta lainatessa tai palautettaessa luetaan qr -koodi ja kerrotaan lainauksen / palautuksen tiedot.

Ohjelmassa on seuraavat toiminnallisuudet

## Hallinta -osio

- Käytetään tietokoneella
- Kirjautumistoiminto ja vain kirjautumalla pääsee sisään
- Käyttäjien hallinta. Voidaan hallita pääkäyttäjiä ja lainaajia
  - pääkäyttäjästä rooli, etunimi, sukunimi, sähköpostiosoite, puhelinnumero
  - lainaajasta ryhmätunnus, etunimi, sukunimi
- Laitteet -sivu, jossa näkyy laitteiden lainaustilanne. Voidaan lisätä uusi laite ja poistaa käytöstä poistuva laite. Vapaana olevat laiteet laitetyypeittäin
- Laitteen tiedoissa
  - tyyppi (esim. kamera), nimi, hankintavuosi, lisätiedot, lainauspäivä, sijainti (missä laite on jos se ei ole käytössä), kenellä lainassa

## Mobiilisovellus

- vain opettaja käyttää. Eli opiskelija ei lainaa itsekseen mitään.
- Opettaja kirjautuu mobiilisovellukseen (pikalinkki).
- Luetaan qr -koodi. Jos laite löytyy, tarkistetaan onko laite lainassa vai vapaana.
  - Jos vapaana, lainataan. Kirjoitetaan kuka lainaa ja arvioitu palautuspäivä
  - Jos lainassa, palautetaan.

## Pohdittavaa

- Mitä laitetyyppejä on? Toki saadaan lisättyä myöhemmin, mutta jonkinlainen lista.
- Halutaanko että laitteen sijainti on vapaa tekstikenttä vai tehdäänkö lista mahdollisista sijainneista?

---

## Asennus ja käyttöönotto

### Vaatimukset

Ennen projektin käyttöönottoa, varmista että sinulla on seuraavat ohjelmistot asennettuna:

- **Git** - Versionhallintojärjestelmä ([lataa täältä](https://git-scm.com/))
- **Node.js** (v14 tai uudempi) - JavaScript runtime ([lataa täältä](https://nodejs.org/))
- **npm** - Node.js:n pakettienhallintatyökalu (asennetaan automaattisesti Node.js:n mukana)
- **MySQL** - Tietokanta. Voit käyttää XAMPP:ia joka sisältää MySQL:n ([lataa täältä](https://www.apachefriends.org/))
- **Git Bash** tai muu komentoriviohjelma

### 1. Projektin kloonaaminen

Avaa komentorivi/Git Bash ja navigoi kansioon, jossa haluat projektin olevan:

```bash
git clone <repository-url>
cd kalustonhallinta
```

### 2. Riippuvuuksien asennus

Asenna projektin tarvitsemat npm-paketit:

```bash
npm install
```

### 3. Tietokannan asennus ja konfigurointi

#### XAMPP:n käynnistäminen

1. Avaa XAMPP Control Panel
2. Käynnistä Apache- ja MySQL-palvelut klikkaamalla "Start" -painikkeita

#### Tietokannan luominen

1. Avaa phpMyAdmin osoitteessa `http://localhost/phpmyadmin`
2. Luo uusi tietokanta:
   - Klikkaa "New" vasemmalla puolella
   - Anna tietokannalle nimeksi `kalustonhallinta`
   - Valitse merkistö: `utf8mb4_unicode_ci`
   - Klikkaa "Create"
3. Tuo tietokantarakenne projektista löytyvästä SQL-tiedostosta:
   - Valitse luomasi `kalustonhallinta` -tietokanta
   - Valitse "Import" -välilehti
   - Valitse `database.sql` -tiedosto projektista (tai vastaava SQL-tiedosto)
   - Klikkaa "Go"

### 4. Ympäristömuuttujien konfigurointi

Luo projektin juurikansioon `.env` -tiedosto seuraavalla sisällöllä:

```
# Palvelin
PORT=3000
NODE_ENV=development

# Tietokanta
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=kalustonhallinta
DB_CHARSET=utf8mb4

# Autentikointi
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d

# Istunto
SESSION_SECRET=your_session_secret_key_here
```

**Huomio:** Muuta `JWT_SECRET` ja `SESSION_SECRET` joihin kertakäyttöisiin arvoihin tuotantoympäristöä varten. Paikallisesti voit käyttää oletusarvoja.

### 5. Projektin käynnistäminen

Käynnistä sovellus seuraavalla komennolla:

```bash
npm start
```

Sovellus alkaa kuunnella osoitteessa `http://localhost:3000`

Hallinta -osio on käytettävissä osoitteessa: `http://localhost:3000/admin`

Mobiilisovellus on käytettävissä osoitteessa: `http://localhost:3000/mobile`

### 6. Ensimmäinen kirjautuminen

Käytä ensimmäisen kirjautumisen yhteydessä seuraavia oletusarvoja (tai ne, jotka on määritetty tietokannan alustuksessa):

- **Käyttäjänimi:** `admin`
- **Salasana:** `admin123` (muuta tämä välittömästi ensimmäisen kirjautumisen jälkeen!)

### Kehitystyökalujen käyttö

Kehitystilassa voit käyttää hot-reload -ominaisuutta:

```bash
npm run dev
```

Tämä käynnistää sovelluksen nodemon-työkalulla, joka uudelleenkäynnistää palvelimen automaattisesti kun muutat tiedostoja.

### Vianmääritys

**Virhe: "Connection refused at 127.0.0.1:3306"**
- Varmista että MySQL-palvelu on käynnissä XAMPP:issa
- Tarkista `.env` -tiedoston tietokanta-asetukset

**Virhe: "Database 'kalustonhallinta' doesn't exist"**
- Varmista että olet luonut tietokannan phpMyAdminissa
- Tarkista että tietokannan nimi `.env` -tiedostossa on oikea

**Virhe: "npm: command not found"**
- Node.js ei ole asennettuna tai se ei ole PATH-muuttujassa
- Lataa ja asenna Node.js uudelleen

**Portti 3000 on jo käytössä**
- Muuta porttia `.env` -tiedostossa tai käytä komentoa: `PORT=3001 npm start`





Mobile styles: 
set add button in server grid desktop to hidden ( mobile )
make it on mobile only a + not an add at the top refer to picture. so " hid the add but make it plus at the top "
making it hidden because its used on desktop
