# Kalustonhallinta -sovellus Medialle
Tehtävänä on luoda web -sovellus, joka mahdollistaa erilaisten laitteiden varaus / lainaustilanteen seurannan. Ohjelmalla tulostetaan laitteisiin liimattavia qr -koodeja ja aina laitetta lainatessa tai palautettaessa luetaan qr -koodi ja kerrotaan lainauksen / palautuksen tiedot. 
Ohjelmassa on seuraavat toiminnallisuudet
# Hallinta -osio
-	Käytetään tietokoneella
- Kirjautumistoiminto ja vain kirjautumalla pääsee sisään
- Käyttäjien hallinta. Voidaan hallita pääkäyttäjiä ja lainaajia
    - pääkäyttäjästä rooli, etunimi, sukunimi, sähköpostiosoite, puhelinnumero
    - lainaajasta ryhmätunnus, etunimi, sukunimi
- Laitteet -sivu, jossa näkyy laitteiden lainaustilanne. Voidaan lisätä uusi laite ja poistaa käytöstä poistuva laite. Vapaana olevat laiteet laitetyypeittäin
- Laitteen tiedoissa 
    - tyyppi ( esim. kamera ), nimi, hankintavuosi, lisätiedot, lainauspäivä, sijainti ( missä laite on jos se ei ole käytössä ) kenellä lainassa 
# Mobiilisovellus
- vain opettaja käyttää. Eli opiskelija ei lainaa itsekseen mitään. 
- Opettaja kirjautuu mobiilisovellukseen (pikalinkki). 
- Luetaan qr -koodi. Jos laite löytyy, tarkistetaan onko laite lainassa vai vapaana. 
    - Jos vapaana, lainataan. Kirjoitetaan kuka lainaa ja arvioitu palautuspäivä
    - Jos lainassa, palautetaan.  
# Pohdittavaa
- Mitä laitetyyppejä on? Toki saadaan lisättyä myöhemmin, mutta jonkinlainen lista. 
- Halutaanko että laitteen sijainti on vapaa tekstikenttä vai tehdäänkö lista mahdollisista sijainneista? 
