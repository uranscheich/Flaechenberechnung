# Flächenberechnung

Architektur-Webtool für Haustyp M (Mittelhaus), als HTML/CSS/JavaScript mit SVG-Vektorplänen. Persönlicher Untertitel: „Chrissis & Sassis + Wimmis & Almis neue Bude. live. love. laugh.“

## Starten

Node.js 22 oder neuer:

```sh
npm start
```

http://127.0.0.1:4317 öffnen. Kein Buildschritt und keine npm-Abhängigkeiten. Die Anwendungsdateien lassen sich auch statisch hosten; ein HTTP-Server ist für die ES-Module nötig.

## Funktionen

- EG, OG und DG in der gespiegelten Hausausrichtung (Treppe/WC links, Küche rechts) mit Maßketten, farbigen Raumflächen, Wandkörpern und Türanschlägen.
- Gemeinsames Geometriemodell für Raumkanten, Wandsegmente und darin verankerte Tür-/Fensteröffnungen. Geschlossene Küchen-Nordwand, Küchenzugang seitlich zum Windfang, vollständige WC-Nordwand; OG mit Flurversprung, Garderobenrücksprung und einer seitlichen Schlafzimmertür.
- Schematische Axonometrie, Beschriftungen, Einrichtung und Bemaßung schaltbar.
- Der Grundriss dient der Darstellung und Raumauswahl; die doppelte Raumbearbeitung sowie Hinzufügen/Entfernen neben dem Plan entfallen. Bezeichnungen und Berechnungswerte werden zentral in der WFB geändert. Bestehende Konturen und Berechnungsgrundlagen bleiben erhalten.
- §-3-Abzüge als editierbare Fläche, Prozentansatz und getrennte Wohnflächenzuordnung in der WFB. Bereits gespeicherte benannte Rechteckabzüge bleiben erhalten, bis ein direkter Abzug sie übersteuert.
- Höhenzonen für DG-Räume: Teilflächen unter 1 m, von 1 bis unter 2 m und ab 2 m. Die Eingabe ersetzt den pauschalen Faktor und gewichtet mit 0/50/100 %. Ihre Summe muss nach §-3-Abzug schließen; leere, negative oder nicht schließende Ansätze werden abgelehnt.
- Browserlokales Speichern, JSON-Import/-Export, SVG- und CSV-Export.
- Maßstäbliche A3-Pläne im Querformat, für den Bestand 1:100 bei 100 % Druckskalierung. Größere Konturen erhalten automatisch einen passenden kleineren Standardmaßstab.
- Bearbeitbare Flächenaufstellung direkt in der Ausgabevorschau: Raumname, Grundfläche, §-3-Abzug, Prozentansatz, Projekt-/Wohnflächenzuordnung sowie Antragsteller, Objektanschrift, Vorgangsnummer, Abzug von der Grundfläche, Ort und Datum. Live-Summe und ausdrückliches Übernehmen; ungültige Entwürfe bleiben stehen und verhindern die PDF-Ausgabe. Änderungen werden im Browser und JSON-Projekt gespeichert.
- Als letzte Berichtsseite eine Wohnflächenberechnung in A4 hoch nach dem oberen Teil des bereitgestellten ING-Formulars: Antragsteller, Beleihungsobjekt, Vorgangsnummer, Zimmer, Geschoss, Länge/Breite, Grundfläche, Anrechnung, Wohnfläche, Ausschlüsse und Unterschriften. Der untere Erläuterungsteil des Formulars wird nicht übernommen. Gestaltung im Creme-/Salbeistil der Seite.
- Info-i bei „Grundfläche nach § 3 WoFlV“ in der Tabellenüberschrift öffnet online die Gesetzeszusammenfassung. Das i und die Zusammenfassung werden nicht gedruckt.

## Maßgrundlage

Der Hauptbaukörper hat außen 5,95 × 10,15 m. Wandkerne gemäß Nutzerkorrektur: Ost/West 0,115 m, Nord/Süd 0,225 m. Die Zeichnung enthält darüber hinaus Randmaße, die nicht mit dem Wandkern gleichgesetzt werden:

- Ost/West: 0,115 + 0,015 = 0,130 m je Seite → 5,69 m innen.
- Nord/Süd: das in der Vorlage hochgestellte Maß 25⁵ cm bedeutet 25,5 cm = 0,255 m je Seite → 9,64 m innen. Das verbleibende Restmaß zum Wandkern beträgt 0,030 m; ein bestimmter Materialaufbau wird nicht angenommen.
- Die Längsteilmaßkette 3,455 + 0,175 + 3,01 + 0,115 + 2,885 schließt damit bei 9,640 m. Die klarere Vorlage vom 17.10.2026 unterscheidet beim oberen Querwandbereich 3,455 und 0,175 m.
- Außenkontur Hauptbaukörper: 60,3925 m². Lichte Innenkontur einschließlich Treppenraum: 54,8516 m². Der 1,00-m-Außenversatz des H.A.R.-Anbaus wird separat gezeigt.

Nicht vollständig bemaßte Innenlängen bleiben ergänzte Konturen. Die Maßbeschriftung bleibt leserichtig, die Längsmaßketten stehen weiterhin links. Das DG-Blatt der neuen Datei zeigt noch die andere Orientierung; die Treppenöffnung ist entsprechend EG/OG links übernommen und so gekennzeichnet. Türanschläge und die Wandanschlüsse folgen dem Grundriss; ihre nicht bemaßten Abstände sind aus der Zeichnung angenähert. Die Darstellung ist kein geprüftes Aufmaß. Rahmenmaßketten beschreiben den Bestand und werden durch freie Raumkonturbearbeitung nicht automatisch verändert.

Planwerte als Vergleich: EG 51,60 m², OG 48,59 m², Dachboden 32,67 m². Ein bemaßtes Rechteck kann davon abweichen, z.B. Küche 2,885 × 2,885 = 8,323225 m² oder Dachboden 5,69 × 5,80 = 33,002 m². Keine erfundenen Putzabzüge zum Erzwingen eines Referenzwerts.

## Wohnflächenblatt nach ING-Formular

Lichte Maße, Abzüge nach § 3 und Anrechnung nach § 4 werden getrennt verarbeitet. Bereits in der Geometrie ausgesparte Treppen, Wände oder Nischen werden nicht ein zweites Mal abgezogen. Zugehörigkeit nach § 2 ist eine eigene Auswahl. H.A.R. und Dachboden sind anfänglich nicht als Wohnfläche angesetzt; das ist keine automatische bauordnungsrechtliche Eignungsfeststellung. Die WFB bietet für DG-Räume getrennte Teilflächen nach lichter Höhe. Diese sind nach §-3-Abzügen zu erfassen und ersetzen den pauschalen Prozentfaktor, ohne zusätzliche Multiplikation. Ein geschlossener Dachboden erhält keinen automatischen 50-%-Ansatz: Bodenräume sind nach § 2 Abs. 3 Nr. 1 d ausgeschlossen; die 50-%-Regel für unbeheizbare Wintergärten, Schwimmbäder und ähnliche Räume erfasst nicht allein wegen der Geschlossenheit jeden Dachboden. Für zulässige Wohnräume unter Dach gelten 0/50/100 % je Höhenzone. Die vorhandenen 1,50-m-Linien liefern keine ausreichenden Daten für die 1-m-/2-m-Zonen; die App erfindet keine Teilflächen. Geänderte Grundflächenwerte werden als manueller Ansatz geführt und verändern die gezeichnete Kontur nicht. Direkte §-3-Abzüge übersteuern die benannten Rechteckabzüge; die ursprünglichen Rechteckangaben werden dabei weiterhin im Projekt aufbewahrt. Die Herkunft der Flächen bleibt im Projekt gespeichert; die zusätzliche Beschriftung „Planwert (ungeprüft)“ wird auf Wunsch nicht auf dem Wohnflächenblatt ausgegeben.

Der obere Abschnitt des vom Nutzer bereitgestellten ING-Formulars sieht einen zusätzlichen 3-%-Abzug vor. `formDeduction` führt diesen separat: standardmäßig 0,03, in der WFB auf 0 umstellbar. Die Formularwohnfläche ist die anrechenbare Fläche nach §-3-Abzug und Höhengewichtung bzw. Prozentansatz, anschließend multipliziert mit 0,97. Die zugrunde liegenden Raumflächen, die gesetzliche Wohnflächensumme und Maßangaben werden dadurch nicht verändert. Die WFB bezeichnet die Auswahl wie die Vorlage als „Grundfläche abzügl. 3 %“ und zeigt zusätzlich die Summe vor diesem Abzug. JSON speichert die Auswahl. Es wird keine allgemeine gesetzliche 3-%-Pflicht behauptet.

Länge und Breite erscheinen nur bei einer geometrisch berechneten Rechteckfläche. Bei Planwerten, manuellen Ansätzen und Polygonen bleiben diese Felder frei bzw. mit Strich gekennzeichnet; Grundfläche und Herkunft werden ausgewiesen. Nicht angesetzte Räume stehen als eigene Ausschlusszeilen im Formular. Das Original-PDF des ING-Formulars wird ebenfalls nicht eingebettet oder hochgeladen.

Amtlicher Text, am 17.10.2026 geprüft: [§ 2 WoFlV](https://www.gesetze-im-internet.de/woflv/__2.html), [§ 3 WoFlV](https://www.gesetze-im-internet.de/woflv/__3.html), [§ 4 WoFlV](https://www.gesetze-im-internet.de/woflv/__4.html).

## Daten und Privatsphäre

Die Originalvorlage wird weder eingebettet noch online bereitgestellt und ist kein Bestandteil dieses Repositorys. Der lokale Server liefert ausschließlich `index.html`, `style.css` und die JavaScript-Module unter `src/`. PDFs, Arbeitsdateien, Exporte und Tests sind über HTTP nicht erreichbar. Referenzdateien liegen außerhalb des Webroots. Der Server bindet ausschließlich an 127.0.0.1.

Projektinhalte bleiben im Browser oder in ausdrücklich exportierten Dateien. Google Fonts wird für die Typografie geladen; ohne Verbindung greift die Systemschrift. Es gibt keinen Upload von Projekt- oder Vorlagedaten. JSON-Dateien als Backup exportieren.

Bereits gespeicherte Projekte erhalten die korrigierten Standardkonturen beim Laden. Eigene Raumkonturen werden flächentreu mitgespiegelt; Namen, Faktoren, manuelle Ansätze und andere Änderungen bleiben erhalten. Bereits umgestellte Projekte werden kein zweites Mal gespiegelt. Eine bestehende gültige Abzugsberechnung hat Vorrang, falls ein neuer Standardplanwert darunter läge. „Hausanschluss“ wird bei diesem ursprünglichen Namen zu „H.A.R.“ migriert.

## Prüfen

```sh
npm test
```

Geprüft werden u.a. Flächenformeln, Maßabschluss, Türöffnungen und Schwenkrichtungen, Küchen-/WC-/OG-Anschlüsse, Datenmigration, Abzüge und Wohnflächenzuordnung, Höhengewichtung ohne doppelte Kürzung, schließende Teilflächen nach Abzug, manuelle Entwürfe und atomare Validierung, SVG-Escaping, Spiegelung von Türanschlägen und Konturen, Maßstab, ING-Formularabzug und Bankangaben, letzte Formularseite und Schutz der Arbeitsdateien vor HTTP-Zugriff. Browserprüfung zusätzlich für Darstellung, Bericht, Infofeld und Exporte. Beim PDF-Druck 100 %, A3 quer für Planblätter und A4 hoch für das letzte Formularblatt sowie keine Browser-Kopf-/Fußzeilen verwenden.
