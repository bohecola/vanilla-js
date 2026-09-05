/*
  Deutsche Übersetzung — Schlüssel exakt wie dict.zh.ts / dict.en.ts.
  Annotiert mit `: Dict`; jede fehlende/überzählige Taste oder abweichende
  Parametrisierung ist ein tsc-Fehler.
*/
import type { Dict, CompileIssue } from './dict.zh'

export const de: Dict = {
  'html.lang': 'de',
  'html.title': 'Jotter · JS/TS-Notizzettel',
  'locale.bcp47': 'de-DE',

  'header.import': 'Importieren',
  'header.theme': 'Design wechseln',
  'header.theme.dark': 'Dunkel',
  'header.theme.light': 'Hell',
  'header.theme.system': 'System',
  'header.accent': 'Farbe wechseln',
  'header.accent.blue': 'Blau',
  'header.accent.pink': 'Pink',
  'header.accent.orange': 'Orange',
  'header.accent.green': 'Grün',
  'header.lang': 'Sprache wechseln',
  'header.lang.system': 'System',
  'header.github': 'GitHub-Repository',

  'notice.close': 'Hinweis schließen',
  'notice.demoLoadFailed': (p: { message: string }) => `Demo konnte nicht geladen werden: ${p.message}`,
  'notice.notTextFile': (p: { name: string }) =>
    `${p.name} ist keine bearbeitbare Textdatei und wurde nicht geöffnet`,
  'notice.deleted': (p: { name: string }) => `${p.name} gelöscht`,
  'notice.rootRemoved': (p: { name: string }) =>
    `${p.name} wurde entfernt. Auf der Festplatte hat sich nichts geändert.`,
  'notice.renamed': (p: { name: string }) => `Umbenannt in ${p.name}`,
  'notice.saved': (p: { name: string }) => `${p.name} gespeichert`,
  'notice.demoReadFailed': (p: { message: string }) =>
    `Demo-Quellen konnten nicht gelesen werden: ${p.message}`,
  'notice.demosSaved': (p: { count: number; label: string }) =>
    `${p.count} Demo${p.count === 1 ? '' : 's'} in ${p.label} gespeichert. Sie können sie jetzt bearbeiten — Strg+S schreibt auf die Festplatte.`,
  'notice.demosSavedClosed': (p: { count: number; label: string }) =>
    `${p.count} Demo${p.count === 1 ? '' : 's'} in ${p.label} gespeichert, links aber nicht geöffnet. Zum Bearbeiten hier öffnen Sie dieses Verzeichnis über „Ordner öffnen“.`,
  'notice.demoSaveCleaned': (p: { count: number }) =>
    `${p.count} unvollständige${p.count === 1 ? '' : 's'} Verzeichnis${p.count === 1 ? '' : 'se'} eines früheren Speichervorgangs bereinigt`,
  'notice.demoSaveGone':
    'Das unvollständige Verzeichnis des letzten Speicherns existiert nicht mehr; nichts zu bereinigen',
  'notice.pathCopied': (p: { path: string }) => `Pfad kopiert: ${p.path}`,
  'notice.copyFailed': 'Kopieren fehlgeschlagen, bitte erneut versuchen',
  'notice.fileReadFailed': (p: { message: string }) => `Datei konnte nicht gelesen werden: ${p.message}`,
  'notice.draftWillSaveTo': (p: { path: string }) =>
    `Geben Sie links einen Dateinamen ein und drücken Sie Enter, um in ${p.path} zu speichern`,
  'notice.noWriteTarget':
    'Diese Datei liegt nicht in einem lokalen Ordner; es gibt keinen Ort zum Zurückschreiben — stattdessen heruntergeladen',
  'notice.saveFailed': (p: { message: string }) => `Speichern fehlgeschlagen: ${p.message}`,
  'notice.externalChanged': (p: { name: string }) =>
    `${p.name} wurde auf der Festplatte geändert, während Sie noch ungespeicherte Änderungen haben; Speichern überschreibt die Version auf der Festplatte`,
  'notice.reloaded': (p: { name: string }) =>
    `${p.name} wurde aus der neuesten Version auf der Festplatte neu geladen`,
  'notice.createdButEmpty': (p: { name: string; message: string }) =>
    `${p.name} wurde erstellt, aber der Inhalt konnte nicht geschrieben werden: ${p.message}`,

  'editor.noFile': 'Keine Datei geöffnet',
  'editor.dirty': 'Ungespeicherte Änderungen',
  'editor.save': 'Speichern',
  'editor.saving': 'Speichern…',
  'editor.download': 'Herunterladen',
  'editor.stop': 'Stoppen',
  'editor.runDisabled': 'Der Ausführer führt nur JavaScript / TypeScript aus',
  'editor.run': 'Ausführen',

  'tab.close': 'Tab schließen',
  'tab.scrollLeft': 'Tabs nach links scrollen',
  'tab.scrollRight': 'Tabs nach rechts scrollen',
  'tab.ctx.close': 'Schließen',
  'tab.ctx.closeOthers': 'Andere schließen',
  'tab.ctx.closeRight': 'Rechts schließen',
  'tab.ctx.closeAll': 'Alle schließen',
  'confirm.closeMany.one': 'Ungespeicherten Tab schließen?',
  'confirm.closeMany.many': (p: { count: number }) =>
    `${p.count} ungespeicherte${p.count === 1 ? 'n' : ''} Tab${p.count === 1 ? '' : 's'} schließen?`,
  'confirm.closeMany.unsaved': 'Diese ungespeicherten Änderungen gehen verloren.',
  'tab.closeAria': (p: { name: string }) => `Tab ${p.name} schließen`,
  'confirm.closeTab.title': (p: { name: string }) => `${p.name} schließen?`,
  'confirm.closeTab.unsaved':
    'Diese Datei hat ungespeicherte Änderungen, die beim Schließen verloren gehen.',
  'confirm.closeTab.ok': 'Schließen',
  'confirm.newScratch.title': 'Entwurf verwerfen?',
  'confirm.newScratch.body': 'Der Entwurf enthält ungespeicherten Inhalt, der ersetzt wird.',
  'confirm.newScratch.ok': 'Verwerfen und neu anlegen',
  'panes.resize': 'Ziehen, um Editor und Ausgabe zu skalieren',

  'statusbar.noFile': 'Keine Datei geöffnet',
  'statusbar.ln': (p: { line: number; col: number }) => `Ln ${p.line}, Sp. ${p.col}`,
  'statusbar.spaces': (p: { size: number }) => `Leerzeichen: ${p.size}`,
  'statusbar.tabSize': (p: { size: number }) => `Tab-Größe: ${p.size}`,
  'statusbar.js': 'JavaScript (.js-Datei, als JavaScript ausgeführt)',
  'statusbar.ts': 'TypeScript (.ts-Datei, als TypeScript ausgeführt)',

  'confirm.cancel': 'Abbrechen',
  'confirm.cancelSave.title': 'Speichern stoppen?',
  'confirm.cancelSave.body':
    'Das Schreiben wird gestoppt und bereits geschriebene unvollständige Dateien werden gelöscht, sodass der Zustand vor dem Speichern wiederhergestellt ist.',
  'confirm.cancelSave.ok': 'Speichern stoppen',
  'confirm.cleanupInterrupted.title': 'Unterbrochenen Speichervorgang bereinigen?',
  'confirm.cleanupInterrupted.bodyMultiple': (p: { labels: string }) =>
    `In ${p.labels} wurden unvollständige Dateien eines unterbrochenen Speicherns (möglicherweise Seitenneuladung oder -schließen) gefunden. Löschen?`,
  'confirm.cleanupInterrupted.bodyRecord': (p: { label: string }) =>
    `Ein Speichern wurde unterbrochen (Seitenneuladung oder -schließen); in ${p.label} blieben unvollständige Dateien zurück. Löschen?`,
  'confirm.cleanupInterrupted.ok': 'Bereinigen',
  'confirm.saveDemos.title': 'Alle Demos lokal speichern?',
  'confirm.saveDemos.body': (p: { count: number }) =>
    `Alle ${p.count} Demo${p.count === 1 ? '' : 's'} werden in den gewählten Ordner gespeichert und ein Unterordner angelegt. Fortfahren?`,
  'confirm.saveDemos.ok': 'Ordner wählen',
  'confirm.openDemos.title': 'Gespeicherten Ordner links öffnen?',
  'confirm.openDemos.body': (p: { count: number; label: string }) =>
    `${p.count} Demo${p.count === 1 ? '' : 's'} in ${p.label} gespeichert. Diesen Ordner links öffnen, um sie direkt zu bearbeiten?`,
  'confirm.openDemos.ok': 'Öffnen',
  'confirm.delete.title': (p: { name: string }) => `${p.name} löschen?`,
  'confirm.delete.dir': (p: { path: string }) => `${p.path} und sein gesamter Inhalt werden gelöscht.`,
  'confirm.delete.file': (p: { path: string }) => `${p.path} wird gelöscht.`,
  'confirm.delete.unsavedInDir': (p: { count: number }) =>
    `${p.count} darin geöffnete Datei${p.count === 1 ? '' : 'en'} mit ungespeicherten Änderungen wird${p.count === 1 ? '' : 'en'} ebenfalls gelöscht.`,
  'confirm.delete.unsavedFile':
    'Diese Datei hat ungespeicherte Änderungen, die ebenfalls gelöscht werden.',
  'confirm.delete.irreversible':
    'Das Löschen wirkt direkt auf die Festplatte: kein Papierkorb, kein Rückgängig.',
  'confirm.delete.ok': 'Löschen',
  'confirm.closeRoot.title': (p: { name: string }) => `${p.name} entfernen?`,
  'confirm.closeRoot.listOnly':
    'Es wird nur aus der Liste links entfernt. Auf der Festplatte ändert sich nichts.',
  'confirm.closeRoot.openFiles': (p: { count: number }) =>
    `${p.count} geöffnete Datei${p.count === 1 ? '' : 'en'} wird${p.count === 1 ? '' : 'en'} dabei geschlossen.`,
  'confirm.closeRoot.openFilesUnsaved': (p: { count: number; unsaved: number }) =>
    `${p.count} geöffnete Datei${p.count === 1 ? '' : 'en'} wird${p.count === 1 ? '' : 'en'} geschlossen, ${p.unsaved} mit ungespeicherten Änderungen gehen verloren.`,
  'confirm.closeRoot.reauth':
    'Für die erneute Nutzung muss der Ordner noch einmal gewählt werden. Aus Browser-Sicherheitsgründen kann eine Webseite diese Zugriffsberechtigung nicht selbst aufbewahren.',
  'confirm.closeRoot.ok': 'Entfernen',
  'confirm.renameDir.title': (p: { from: string; to: string }) =>
    `${p.from} in ${p.to} umbenennen?`,
  'confirm.renameDir.how':
    'Browser bieten keine Ordner-Umbenenn-API: Der gesamte Ordner wird unter dem neuen Namen kopiert und das Original erst gelöscht, wenn jede Datei kopiert ist.',
  'confirm.renameDir.size': (p: { files: number; size: string }) =>
    `${p.files} Datei${p.files === 1 ? '' : 'en'}, ${p.size} insgesamt. Lassen Sie die Seite während des Kopierens offen.`,
  'confirm.renameDir.risk':
    'Kopierte Dateien erhalten die aktuelle Änderungszeit. Bricht der Vorgang mittendrin ab, bleibt das Original unversehrt, es bleibt aber ein halb kopierter Ordner zurück.',
  'confirm.renameDir.ok': 'Umbenennen',

  'sidebar.title': 'Dateien',
  'sidebar.expand': 'Dateibereich einblenden',
  'sidebar.collapse': 'Dateibereich ausblenden',
  'sidebar.newScratch': 'Neuer Entwurf',
  'sidebar.resize': 'Ziehen zum Skalieren (Doppelklick setzt zurück)',
  'sidebar.localDirs': 'Lokale Ordner',
  'sidebar.newFileIn': (p: { target: string }) => `Neue Datei in ${p.target}`,
  'sidebar.newDirIn': (p: { target: string }) => `Neuer Ordner in ${p.target}`,
  'sidebar.refreshTarget': (p: { target: string }) => `${p.target} neu laden`,
  'sidebar.openAnother': 'Weiteren Ordner öffnen',
  'sidebar.openFolder': 'Ordner öffnen',
  'sidebar.unsupported': (p: { label: string }) =>
    `Dieser Browser kann keine lokalen Ordner öffnen — nur Chromium-basierte wie Chrome und Edge implementieren diese API. Oben können Sie mit „${p.label}“ weiterhin eine einzelne Datei öffnen.`,
  'sidebar.needAuth': 'Berechtigung erforderlich',
  'sidebar.reauthHint': (p: { label: string }) =>
    `Mit „${p.label}“ markierte Ordner kehren mit einem Klick zurück — der Browser fragt bei jedem Neuladen erneut`,
  'sidebar.loading': 'Lädt…',
  'sidebar.unsaved': 'Nicht gespeichert',
  'sidebar.emptyDir': 'Leerer Ordner',
  'sidebar.truncated': (p: { max: number }) =>
    `Zu viele Einträge, nur die ersten ${p.max} werden angezeigt`,
  'sidebar.rootLocked': (p: { name: string }) =>
    `Hier klicken, um ${p.name} wieder Zugriff zu geben`,
  'sidebar.rootHint': (p: { name: string }) =>
    `${p.name} (klicken zum Auf-/Zuklappen und als Ziel für neue Einträge setzen; Rechtsklick für weitere Optionen)`,
  'sidebar.rootMenu': (p: { name: string }) => `Aktionen für ${p.name}`,
  'sidebar.renameAria': 'Neuer Name',
  'sidebar.newFileAria': 'Neuer Dateiname',
  'sidebar.newDirAria': 'Neuer Ordnername',
  'sidebar.demos': 'Demo-Snippets',
  'sidebar.demosDirty': 'Ungespeicherte Demo-Änderungen',
  'sidebar.saveDemos': 'Jede Demo in einem lokalen Ordner speichern',
  'sidebar.cancelSave': 'Speichern abbrechen',
  'sidebar.cancellingSave': 'Abbruch…',
  'sidebar.savingDemos': (p: { done: number; total: number }) =>
    `Lokales Speichern ${p.done}/${p.total}`,
  'sidebar.savingDemosFile': (p: { name: string; done: number; total: number }) =>
    `Schreibe ${p.name} (${p.done}/${p.total})`,
  'sidebar.currentPath': (p: { path: string }) => `Aktueller Ordner: ${p.path}`,
  'sidebar.uncategorized': 'Nicht kategorisiert',

  'menu.rename': 'Umbenennen',
  'menu.delete': 'Löschen',
  'menu.copyPath': 'Pfad kopieren',
  'menu.newFile': 'Neue Datei',
  'menu.newDir': 'Neuer Ordner',
  'menu.refresh': 'Aktualisieren',
  'menu.removeRoot': 'Ordner entfernen',

  'console.empty': '// Konsolenausgabe erscheint hier',

  'console.clear': 'Leeren',

  'console.omitted': (n: number) => `${n} älteste Zeilen ausgelassen`,

  'file.untitled': (p: { ext: string }) => `Ohne Titel.${p.ext}`,
  'file.newDir': 'Neuer Ordner',
  'file.scratch': 'Entwurf',

  'validate.empty': 'Der Name darf nicht leer sein',
  'validate.tooLong': 'Der Name ist zu lang — höchstens 255 Zeichen',
  'validate.dots': '„.“ und „..“ können nicht als Name verwendet werden',
  'validate.slash':
    'Der Name darf keinen Schrägstrich enthalten — neue Einträge landen immer im aktuellen Ordner',
  'validate.illegalChars': 'Der Name darf < > : " | ? * und Ähnliches nicht enthalten',
  'validate.control': 'Der Name darf keine Steuerzeichen enthalten',
  'validate.trailing': 'Der Name darf nicht mit Punkt oder Leerzeichen enden',
  'validate.reserved': (p: { name: string }) =>
    `${p.name} kollidiert mit einem reservierten Systemnamen, bitte anderen wählen`,
  'validate.exists': (p: { name: string }) => `${p.name} existiert bereits, anderen Namen wählen`,
  'validate.createExt':
    'Es können nur bearbeitbare Textdateien angelegt werden (.js / .ts / .json / .md u. a.)',
  'validate.renameExt':
    'Diese Endung macht die Datei hier unöffnbar — verwenden Sie .js / .ts / .json / .md u. a.',

  'err.fs.noPicker': 'Dieser Browser kann keine lokalen Ordner öffnen',

  'err.fs.notAllowed': 'Kein Zugriff auf diese Datei oder diesen Ordner (von einem anderen Programm gesperrt, schreibgeschützt oder Berechtigung entzogen)',
  'err.fs.tooLarge': (p: { name: string; size: string; max: string }) =>
    `${p.name} ist ${p.size}, über dem Limit von ${p.max}; nicht geöffnet`,
  'err.fs.binary': (p: { name: string }) =>
    `${p.name} wirkt binär und wurde nicht geöffnet`,
  'err.fs.nameTaken': (p: { name: string; kind: 'file' | 'directory' }) =>
    `${p.name} existiert bereits (${p.kind === 'file' ? 'Datei' : 'Ordner'}), anderen Namen wählen`,
  'err.fs.uniqueExhausted': (p: { base: string }) =>
    `${p.base} und die nächsten 99 nummerierten Namen sind belegt, bereinigen Sie zuerst den Zielordner`,
  'err.fs.badBundlePath': (p: { path: string }) => `Ungültiger Dateipfad: ${p.path}`,
  'err.fs.caseRenameUnsupported':
    'Dieser Browser kann einen Eintrag nicht nur in anderer Groß-/Kleinschreibung umbenennen. Benennen Sie ihn zuerst anders, dann in den gewünschten Namen.',
  'err.fs.ignoredDirInTree': (p: { name: string }) =>
    `Der Ordner enthält ${p.name}; so etwas zu kopieren ergibt keinen Sinn. Benennen Sie es im Dateimanager des Systems um.`,
  'err.fs.treeTooManyFiles': (p: { max: number }) =>
    `Der Ordner enthält mehr als ${p.max} Dateien, für ein Kopieren in einem Stück zu viel. Benennen Sie im Dateimanager des Systems um.`,
  'err.fs.treeTooLarge': (p: { max: string }) =>
    `Der Ordner überschreitet ${p.max}, für ein Kopieren in einem Stück zu groß. Benennen Sie im Dateimanager des Systems um.`,

  'err.idb.open': 'IndexedDB konnte nicht geöffnet werden',
  'err.idb.blocked': 'IndexedDB wird von einem anderen Tab blockiert',
  'err.idb.abort': 'Die IndexedDB-Transaktion wurde abgebrochen',
  'err.idb.fail': 'Die IndexedDB-Transaktion ist fehlgeschlagen',
  'err.compile.failed': (p: { issues: CompileIssue[] }) =>
    `TypeScript-Kompilierung fehlgeschlagen: ${p.issues
      .map(
        (i) =>
          `${i.text || 'Unbekannter Fehler'}${i.loc ? ` (Zeile ${i.loc.line}, Spalte ${i.loc.column})` : ''}`
      )
      .join(' ; ')}`,
  'err.compile.raw': (p: { message: string }) =>
    `TypeScript-Kompilierung fehlgeschlagen: ${p.message}`,
  'err.imports.unresolved': (p: { specs: string[] }) =>
    `Der Code importiert ${p.specs.map((s) => `„${s}“`).join(', ')}, und dieser Lauf kann Modulimporte nicht auflösen. Der Ausführer ist ein Web Worker ohne Modul-Auflösung — betten Sie die Abhängigkeit in dieselbe Datei ein, bevor Sie ausführen.`,

  'err.save.cancelled': 'Speichern abgebrochen',
  'err.ws.rootMoved': (p: { name: string }) =>
    `Der Ordner ${p.name} ist nicht mehr an seinem Platz und wurde aus der Liste entfernt`,
  'err.ws.permissionDenied': (p: { name: string }) =>
    `Zugriff auf ${p.name} fehlgeschlagen. Klicken Sie erneut oder schließen und öffnen Sie ihn neu.`,
  'err.ws.permissionUnavailable':
    'Dieser Browser kann den Ordner vom letzten Mal nicht wiederherstellen, bitte öffnen Sie ihn erneut',
  'err.ws.dirStale': (p: { name: string }) =>
    `Der Ordner ${p.name} kann nicht mehr geöffnet werden, bitte neu laden`,
  'err.ws.dirGone': 'Dieser Ordner ist nicht mehr auf der Festplatte, neu laden und erneut versuchen',
  'err.ws.parentGone': 'Der Zielordner ist weg, neu laden und erneut versuchen',
  'err.ws.parentStale': 'Der Zielordner kann nicht mehr geöffnet werden, neu laden versuchen',
  'err.ws.holderGone':
    'Der Ordner, in dem er liegt, ist weg, neu laden und erneut versuchen',
  'err.ws.entryStale': (p: { name: string }) =>
    `${p.name} kann nicht mehr geöffnet werden, bitte neu laden`,
  'err.ws.entryMissing': (p: { name: string }) =>
    `${p.name} ist nicht mehr auf der Festplatte, bitte neu laden`,
  'err.ws.entryFailed': (p: { name: string; message: string }) => `${p.name}: ${p.message}`,
}
