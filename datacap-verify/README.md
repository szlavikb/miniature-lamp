# Datacap Verify

A DMAICreditCardClaim Datacap batch-hez tartozó **verifikációs képernyő** Angular alkalmazásként: egyszerre mutatja a beolvasott dokumentum képét és a hozzá felismert mező-értékeket, kiemeli a hibás/alacsony bizonyosságú mezőket, és lehetővé teszi a javításukat.

Ez a projekt jelenleg a **mock adat fázisban** van: nem kapcsolódik élesben a hálózati megosztáshoz vagy a Datacaphez, hanem a valós batch mező-XML felépítését utánzó, generált minta adatokból dolgozik (lásd lentebb). Ez a köztes lépés ahhoz kell, hogy a felület kialakítását és a szerkesztési logikát a valós integráció nélkül, gyorsan lehessen iterálni.

## Előfeltételek

- [Node.js](https://nodejs.org/) LTS verzió (18.19+ vagy 20.x)
- npm (a Node.js-szel együtt települ)
- Egy modern böngésző (Chrome, Edge, Firefox)

Ellenőrzés:

```bash
node --version
npm --version
```

## Telepítés

```bash
cd datacap-verify
npm install
```

## Futtatás fejlesztői módban

```bash
npm start
```

(ez ekvivalens az `ng serve` paranccsal). Ezután nyisd meg a böngészőben:

```
http://localhost:4200/verify
```

A fejlesztői szerver figyeli a forrásfájlokat, és mentéskor automatikusan újratölti az oldalt.

## Build

```bash
npm run build
```

A fordított alkalmazás a `dist/datacap-verify` mappába kerül.

## Tesztek

```bash
npm test
```

Unit tesztek futtatása Karma-val (jelenleg minimális lefedettséggel - ez a kör az UI-ra fókuszált).

## Projektstruktúra

```
src/app/
  data-access/datacap/       # XML parsolás/dekódolás + adatbetöltés (a Datacap-specifikus réteg)
    models/batch.model.ts    # Batch / Document / Page / Field TypeScript modellek
    char-code-decoder.ts     # a Datacap karakterenkénti <C> kódolás dekódolása
    datacap-xml-parser.service.ts   # nyers XML -> tiszta modell
    datacap-mock-source.service.ts  # betölti a minta XML-eket (ITT KELL MAJD CSERÉLNI valós forrásra)
  state/
    batch-store.service.ts   # signal-alapú állapotkezelés (kiválasztott dokumentum/oldal, szerkesztések)
  features/verify/           # maga a verifikációs képernyő komponensei
    verify-page.component.ts       # konténer: toolbar + 3 hasábos elrendezés
    document-list/                 # bal oldali áttekintő lista (összes dokumentum/oldal)
    document-viewer/               # középső kép + navigáció
    field-panel/                   # jobb oldali szerkeszthető mezőlista
    batch-progress/                # "X/Y dokumentum ellenőrizve" jelző
public/mock-data/            # minta batch index (verify.xml) + mező-XML-ek + placeholder képek
```

## Hogyan működik a minta adat

A `public/mock-data/verify.xml` egy Datacap batch index felépítését követi: dokumentumokat (`<D TYPE="...">`) és oldalakat (`<P IMAGEFILE="..." DATAFILE="...">`) tartalmaz. A `DATAFILE` attribútum mutat a dokumentumhoz tartozó, felismert mezőket tartalmazó XML-re (pl. `tm000015.xml`).

Ezekben a mező-XML-ekben **nincs sima szöveges érték** - minden karaktert egy külön `<C>kód</C>` elem tárol a karakter decimális kódjával (pl. `<C>77</C><C>73</C>...` -> "MI..."). Ezt a `char-code-decoder.ts` dekódolja vissza szöveggé. Emellett a tizedes értékek (pl. a felismerés bizonyossága) magyar tizedesvesszővel szerepelnek ("7,4" és nem "7.4") - ezt a parser service kezeli.

**Fontos:** a `public/mock-data/` alatti fájlok kizárólag generált, kitalált adatokat tartalmaznak (nevek, dátumok, stb.) - ez szándékos, mivel ez a mappa verziókezelőbe kerül, és nem tartalmazhat valós batchből származó adatot.

## Terv / következő lépések

Ez a felület egy hosszabb terv első lépése:

1. **Ez a kör:** a verify képernyő felépítése, mock XML adattal (kész).
2. Valós batch mappa / hálózati megosztás bekötése a mock forrás helyett (`datacap-mock-source.service.ts` cseréje).
3. Élő Datacap API/HTTP integráció (mentés/submit valós backendre).
4. Valós bounding box (`Position`) koordináták bekötése -> a kép megfelelő régiójának kiemelése mezőválasztáskor (a minta adatban ez még mindenhol `0,0,0,0`).

## Angular parancsok gyors áttekintése (kezdőknek)

- `ng generate component valami` - új komponens létrehozása
- `ng serve` - fejlesztői szerver indítása
- `ng build` - production build készítése
- `ng test` - unit tesztek futtatása

További segítség: [Angular CLI dokumentáció](https://angular.dev/tools/cli).
