# Flächenberechnung

Ein lokales Architektur-Webtool für den Haustyp M (Mittelhaus). HTML, CSS und JavaScript mit SVG-Vektorplänen, ohne Buildschritt und ohne Anwendungsserver-Abhängigkeiten.

## Starten

Node.js 22 oder neuer:

```sh
npm start
```

Anschließend http://127.0.0.1:4317 öffnen. Alternativ können `index.html`, `style.css` und `src/` auf einem statischen Webserver bereitgestellt werden. ES-Module benötigen einen HTTP-Server; direktes Öffnen als `file://` wird nicht unterstützt.

## Enthalten

- Erdgeschoss, Obergeschoss und Dachgeschoss aus dem bereitgestellten Bestandsplan.
- Interaktive Raumwahl, Farbflächen, Beschriftungen und Referenzbemaßung.
- Schematische Axonometrie als zusätzliche Raumansicht (kein volumetrisches 3D-Modell).
- Geometrische Polygonberechnung, bearbeitbare Rechteckmaße und Eckpunkte.
- Umschaltung zwischen berechneter Geometrie und beschriftetem Planwert pro Raum.
- Flächenfaktoren und Ein-/Ausschluss einzelner Räume.
- Browserlokales Speichern sowie JSON-Projekte zum Export und Import.
- SVG- und CSV-Export, maßstäblicher A3-Bericht im Querformat mit einem Blatt pro Geschoss und PDF über den Browserdruck (für den Bestandsplan 1:100).
- Lokale PDF-Vorschau. Die Originalvorlage wird nicht im öffentlichen Repository veröffentlicht.

## Maßgrundlage und Grenzen

Die Maßketten der Vorlage werden als Meterwerte übernommen: Außenmaß 5,95 × 10,15 m, Innenbreite 5,69 m; Erdgeschoss-Küchenbreite 2,885 m; Obergeschoss 2,76 / 2,815 m auf der Gartenseite und 3,01 / 2,565 m auf der Eingangsseite. Die inneren Längsabschnitte 3,515 + 0,115 + 3,01 + 0,115 + 2,885 ergeben 9,640 m; das Außenmaß abzüglich 2 × 0,25 m ergibt 9,650 m. Die Kontur verwendet 9,650 m; diese Differenz von 1 cm ist nicht als präzises Aufmaß aufzulösen.

Vollständig bemaßte Rechtecke werden unmittelbar berechnet. Für unvollständig bemaßte verwinkelte Räume ist die Kontur ergänzt und als solche gekennzeichnet; als anfängliche Berechnungsbasis dient dort der beschriftete Planwert. Über den Inspector kann bewusst zur Konturberechnung gewechselt werden. Die aufgedruckten Planflächen bleiben als Vergleichswert erhalten. Geometrie und Referenzwerte werden nicht unbemerkt gleichgesetzt.

Die beschrifteten Planwerte ergeben: EG 50,83 m², OG 48,12 m², Dachboden 32,67 m². Der bemaßte Dachbodenbereich 5,69 × 5,80 m ergibt geometrisch 33,002 m². Keine Putzabzüge oder anderen Korrekturen werden angenommen, um die Originalwerte zu erzwingen.

Die Bemaßung am Planrahmen beschreibt die feste Bestandsvorlage; sie ist kein dynamisches Aufmaß bearbeiteter Raumkonturen. Die schematische Darstellung ergänzt Mobiliar und Treppen. Flächen sind additiv, keine automatische Vereinigung überlappender Polygone. Neue Räume werden rechts neben dem Bestandsplan angelegt. Treppen und Außenbereiche sind keine erfassten Raumflächen. Kein CAD-Ersatz und keine automatische Wohnflächen-/DIN-Klassifizierung; Faktoren müssen fachlich gewählt werden. Insbesondere ist der Dachboden nicht automatisch Wohnfläche; 1,50-m-Linien ersetzen keine Höhenzonierung. Der Druckmaßstab wird je Blatt angegeben. Für den Bestandsplan ist er 1:100 auf A3 quer bei 100 % Druckskalierung; größere Konturen erhalten automatisch einen passenden kleineren Standardmaßstab. Der grafische Maßstab ist Bestandteil der SVG und skaliert mit ihr.

## Daten

Projektinhalte bleiben im Browser (`localStorage`) oder in ausdrücklich exportierten Dateien. Die PDF-Vorschau verwendet eine lokale Blob-URL. Für Typografie wird Google Fonts geladen; bei fehlender Verbindung greift die Systemschrift. Es gibt keinen Cloud-Upload für Projektdaten. Browserdaten sind kein Backup: JSON exportieren.

## Prüfen

```sh
npm test
```

Die Tests prüfen Flächenformeln, Faktoren, Originalwerte, JSON-Validierung und SVG-Escaping. Browserprüfung separat durchführen: Geschosse, Maßänderung, Faktoren, Ausschluss, JSON-Roundtrip, Exporte und Bericht. Die Druckausgabe hängt vom Browser ab; A3 quer und 100 % Skalierung verwenden und Browserkopf-/Fußzeilen abschalten.

## Maßplan-Überarbeitung

Die Außenwände sind als maßhaltiger Wandkörper mit Schraffur modelliert: seitlich 13 cm (1,5 + 11,5 cm), stirnseitig 25 cm. Außenkontur, lichte Innenkontur, Geschosssumme und Projektflächensumme werden getrennt gezeigt. Geschossbezogene Maßketten und der 1,00-m-Außenversatz des Anbaus sind separat dargestellt. Unter „Maßgrundlage“ werden die Herleitungen und die 1-cm-Maßkettendifferenz offen ausgewiesen. Tür-/Fensterlagen und Einrichtung sind schematisch; ergänzte Innenkonturen bleiben gekennzeichnet. Eine bereitgestellte PDF kann lokal unter `local/reference.pdf` liegen; dieser Ordner ist ausgeschlossen.
