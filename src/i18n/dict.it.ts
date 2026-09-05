/*
  Dizionario italiano — chiavi identiche a dict.zh.ts / dict.en.ts.
  L'annotazione `: Dict` fa sì che una chiave mancante/in più o una firma di
  parametro sbagliata siano errori di compilazione (tsc), mai un buco a runtime.
*/
import type { Dict, CompileIssue } from './dict.zh.ts'

export const it: Dict = {
  'html.lang': 'it',
  'html.title': 'Jotter · Blocco note JS / TS',
  'locale.bcp47': 'it-IT',

  'header.import': 'Importa',
  'header.theme.dark': 'Scuro',
  'header.theme.light': 'Chiaro',
  'header.theme.system': 'Sistema',
  'header.accent.blue': 'Blu',
  'header.accent.pink': 'Rosa',
  'header.accent.orange': 'Arancione',
  'header.accent.green': 'Verde',
  'header.lang.system': 'Sistema',
  'header.github': 'Repository GitHub',

  // ---- 设置面板 ----
  'settings.title': 'Impostazioni',
  'settings.appearance': 'Aspetto',
  'settings.mode': 'Tema',
  'settings.accent': 'Colore accento',
  'settings.language': 'Lingua',
  'settings.editor': 'Editor',
  'settings.fontSize': 'Dimensione carattere',
  'settings.fontFamily': 'Carattere',
  'settings.fontFamily.system': 'Monospace di sistema',
  'settings.fontFamily.hint': 'I caratteri non sono inclusi nell\'app. Un carattere ha effetto solo se è installato su questo dispositivo; altrimenti viene usato il monospace di sistema.',
  'settings.editorTheme': 'Tema dell\'editor',
  'settings.editorTheme.auto': 'Segui l\'interfaccia',
  'settings.editorTheme.dark': 'Scuro',
  'settings.editorTheme.light': 'Chiaro',
  'settings.wordWrap': 'A capo automatico',
  'settings.minimap': 'Minimappa',
  'settings.lineNumbers': 'Numeri di riga',
  'settings.fontLigatures': 'Legature',
  'settings.fontLigatures.hint': 'Mostra combinazioni come =>, != e >= come un unico glifo. Funziona solo con caratteri che supportano le legature, come Fira Code o JetBrains Mono.',
  'settings.reset': 'Ripristina',
  'settings.shortcuts': 'Scorciatoie',
  'settings.shortcuts.app': 'App',
  'settings.shortcuts.editorBuiltin': 'Editor (integrate)',
  'settings.shortcuts.rename': 'Rinomina (selezione nella barra laterale)',
  'settings.shortcuts.palette': 'Riquadro comandi',
  'settings.shortcuts.find': 'Trova',
  'settings.shortcuts.replace': 'Sostituisci',
  'settings.shortcuts.format': 'Formatta documento',
  'settings.shortcuts.comment': 'Attiva/disattiva commento di riga',
  'settings.shortcuts.moveLine': 'Sposta riga su / giù',
  'settings.shortcuts.copyLine': 'Copia riga in basso',
  'settings.shortcuts.multiCursor': 'Seleziona occorrenza successiva',
  'settings.close': 'Chiudi',

  'notice.close': 'Chiudi avviso',
  'notice.demoLoadFailed': (p: { message: string }) => `Impossibile caricare la demo: ${p.message}`,
  'notice.notTextFile': (p: { name: string }) =>
    `${p.name} non è un file di testo modificabile, quindi non è stato aperto`,
  'notice.deleted': (p: { name: string }) => `Eliminato ${p.name}`,
  'notice.rootRemoved': (p: { name: string }) =>
    `${p.name} è stato rimosso. Sul disco non è cambiato nulla.`,
  'notice.renamed': (p: { name: string }) => `Rinominato in ${p.name}`,
  'notice.saved': (p: { name: string }) => `Salvato ${p.name}`,
  'notice.demoReadFailed': (p: { message: string }) =>
    `Impossibile leggere le sorgenti della demo: ${p.message}`,
  'notice.demosSaved': (p: { count: number; label: string }) =>
    `${p.count} demo salvate in ${p.label}. Ora puoi modificarle direttamente — Ctrl+S scrive sul disco.`,
  'notice.demosSavedClosed': (p: { count: number; label: string }) =>
    `${p.count} demo salvate in ${p.label}, senza aprirle a sinistra. Per modificarle qui, usa « Apri cartella » su quella cartella.`,
  'notice.demoSaveCleaned': (p: { count: number }) =>
    `Pulite ${p.count} cartelle incomplete rimaste da un salvataggio precedente`,
  'notice.demoSaveGone':
    'La cartella incompleta del salvataggio precedente non esiste più; niente da pulire',
  'notice.pathCopied': (p: { path: string }) => `Percorso copiato: ${p.path}`,
  'notice.copyFailed': 'Copia non riuscita, riprova',
  'notice.fileReadFailed': (p: { message: string }) =>
    `Impossibile leggere il file: ${p.message}`,
  'notice.draftWillSaveTo': (p: { path: string }) =>
    `Scrivi un nome di file a sinistra e premi Invio per salvarlo in ${p.path}`,
  'notice.noWriteTarget':
    'Questo file non è dentro una cartella locale, quindi non c\'è dove riscriverlo — scaricato al suo posto',
  'notice.saveFailed': (p: { message: string }) => `Salvataggio non riuscito: ${p.message}`,
  'notice.externalChanged': (p: { name: string }) =>
    `${p.name} è cambiato sul disco mentre hai ancora modifiche non salvate; salvare sovrascriverà la versione sul disco`,
  'notice.reloaded': (p: { name: string }) =>
    `${p.name} è stato ricaricato dall'ultima versione sul disco`,
  'notice.createdButEmpty': (p: { name: string; message: string }) =>
    `${p.name} è stato creato, ma il contenuto non ha potuto essere scritto: ${p.message}`,

  'editor.noFile': 'Nessun file aperto',
  'editor.dirty': 'Modifiche non salvate',
  'editor.save': 'Salva',
  'editor.saving': 'Salvataggio…',
  'editor.download': 'Scarica',
  'editor.stop': 'Ferma',
  'editor.runDisabled': 'L\'esecutore gira solo JavaScript / TypeScript',
  'editor.run': 'Esegui',

  'tab.close': 'Chiudi scheda',
  'tab.scrollLeft': 'Scorri le schede a sinistra',
  'tab.scrollRight': 'Scorri le schede a destra',
  'tab.ctx.close': 'Chiudi',
  'tab.ctx.closeOthers': 'Chiudi le altre',
  'tab.ctx.closeRight': 'Chiudi a destra',
  'tab.ctx.closeAll': 'Chiudi tutte',
  'confirm.closeMany.one': 'Chiudere la scheda non salvata?',
  'confirm.closeMany.many': (p: { count: number }) => `Chiudere ${p.count} schede non salvate?`,
  'confirm.closeMany.unsaved': 'Queste modifiche non salvate andranno perse.',
  'tab.closeAria': (p: { name: string }) => `Chiudi la scheda ${p.name}`,
  'confirm.closeTab.title': (p: { name: string }) => `Chiudere ${p.name}?`,
  'confirm.closeTab.unsaved':
    'Questo file ha modifiche non salvate che andranno perse chiudendolo.',
  'confirm.closeTab.ok': 'Chiudi',
  'confirm.newScratch.title': 'Scartare la bozza?',
  'confirm.newScratch.body': 'La bozza contiene testo non salvato che verrà sostituito.',
  'confirm.newScratch.ok': 'Scarta e crea',
  'panes.resize': 'Trascina per ridimensionare editor e output',

  'statusbar.noFile': 'Nessun file aperto',
  'statusbar.ln': (p: { line: number; col: number }) => `Riga ${p.line}, Col ${p.col}`,
  'statusbar.spaces': (p: { size: number }) => `Spazi: ${p.size}`,
  'statusbar.tabSize': (p: { size: number }) => `Dimensione tab: ${p.size}`,
  'statusbar.js': 'JavaScript (file .js, eseguito come JavaScript)',
  'statusbar.ts': 'TypeScript (file .ts, eseguito come TypeScript)',

  'confirm.cancel': 'Annulla',
  'confirm.cancelSave.title': 'Interrompere il salvataggio?',
  'confirm.cancelSave.body':
    'La scrittura si fermerà e i file incompleti già scritti verranno eliminati, riportando lo stato precedente al salvataggio.',
  'confirm.cancelSave.ok': 'Interrompi salvataggio',
  'confirm.cleanupInterrupted.title': 'Pulire un salvataggio interrotto?',
  'confirm.cleanupInterrupted.bodyMultiple': (p: { labels: string }) =>
    `In ${p.labels} sono stati trovati file incompleti di un salvataggio interrotto (possibile ricarica o chiusura della pagina). Eliminarli?`,
  'confirm.cleanupInterrupted.bodyRecord': (p: { label: string }) =>
    `Un salvataggio è stato interrotto (ricarica o chiusura della pagina) e ha lasciato file incompleti in ${p.label}. Eliminarli?`,
  'confirm.cleanupInterrupted.ok': 'Pulisci',
  'confirm.saveDemos.title': 'Salvare tutte le demo localmente?',
  'confirm.saveDemos.body': (p: { count: number }) =>
    `Tutte le ${p.count} demo verranno salvate nella cartella scelta, creando una sottocartella. Continuare?`,
  'confirm.saveDemos.ok': 'Scegli cartella',
  'confirm.openDemos.title': 'Aprire la cartella salvata a sinistra?',
  'confirm.openDemos.body': (p: { count: number; label: string }) =>
    `${p.count} demo salvate in ${p.label}. Aprire questa cartella nel pannello a sinistra per modificarle direttamente?`,
  'confirm.openDemos.ok': 'Apri',
  'confirm.delete.title': (p: { name: string }) => `Eliminare ${p.name}?`,
  'confirm.delete.dir': (p: { path: string }) =>
    `Questo eliminerà ${p.path} e tutto il suo contenuto.`,
  'confirm.delete.file': (p: { path: string }) => `Questo eliminerà ${p.path}.`,
  'confirm.delete.unsavedInDir': (p: { count: number }) =>
    `${p.count} file aperti al suo interno hanno modifiche non salvate e verranno eliminati anch'essi.`,
  'confirm.delete.unsavedFile':
    'Questo file ha modifiche non salvate, che verranno eliminate anch\'esse.',
  'confirm.delete.irreversible':
    'L\'eliminazione agisce direttamente sul disco: niente cestino e nessun annullamento possibile.',
  'confirm.delete.ok': 'Elimina',
  'confirm.closeRoot.title': (p: { name: string }) => `Rimuovere ${p.name}?`,
  'confirm.closeRoot.listOnly':
    'Viene solo tolto dall\'elenco a sinistra. Sul disco non cambia nulla.',
  'confirm.closeRoot.openFiles': (p: { count: number }) =>
    `${p.count} file aperti al suo interno verranno chiusi.`,
  'confirm.closeRoot.openFilesUnsaved': (p: { count: number; unsaved: number }) =>
    `${p.count} file aperti verranno chiusi, e ${p.unsaved} con modifiche non salvate andranno persi.`,
  'confirm.closeRoot.reauth':
    'Per riusarlo devi scegliere di nuovo la cartella. Per una regola di sicurezza del browser, una pagina web non può conservare da sola questo permesso.',
  'confirm.closeRoot.ok': 'Rimuovi',
  'confirm.renameDir.title': (p: { from: string; to: string }) =>
    `Rinominare ${p.from} in ${p.to}?`,
  'confirm.renameDir.how':
    'Il browser non offre un\'API per rinominare le cartelle: l\'intera cartella viene copiata col nuovo nome e l\'originale eliminata solo dopo che ogni file è stato copiato.',
  'confirm.renameDir.size': (p: { files: number; size: string }) =>
    `${p.files} file, ${p.size} in totale. Tieni aperta la pagina durante la copia.`,
  'confirm.renameDir.risk':
    'I file copiati ottengono la data di modifica corrente. Se la copia fallisce a metà, l\'originale resta intatto ma resta una cartella copiata a metà sul disco.',
  'confirm.renameDir.ok': 'Rinomina',

  'sidebar.title': 'File',
  'sidebar.expand': 'Mostra il pannello file',
  'sidebar.collapse': 'Nascondi il pannello file',
  'sidebar.newScratch': 'Nuovo appunto',
  'sidebar.resize': 'Trascina per ridimensionare (doppio clic per resettare)',
  'sidebar.localDirs': 'Cartelle locali',
  'sidebar.newFileIn': (p: { target: string }) => `Nuovo file in ${p.target}`,
  'sidebar.newDirIn': (p: { target: string }) => `Nuova cartella in ${p.target}`,
  'sidebar.refreshTarget': (p: { target: string }) => `Ricarica ${p.target}`,
  'sidebar.openAnother': 'Apri un\'altra cartella',
  'sidebar.openFolder': 'Apri cartella',
  'sidebar.unsupported': (p: { label: string }) =>
    `Questo browser non apre cartelle locali — solo i browser basati su Chromium come Chrome ed Edge implementano questa API. Puoi comunque aprire un singolo file con « ${p.label} » in alto.`,
  'sidebar.needAuth': 'Richiede permesso',
  'sidebar.reauthHint': (p: { label: string }) =>
    `Le cartelle contrassegnate con « ${p.label} » tornano con un clic — il browser chiede di nuovo a ogni ricarica della pagina`,
  'sidebar.loading': 'Lettura…',
  'sidebar.unsaved': 'Non salvato',
  'sidebar.emptyDir': 'Cartella vuota',
  'sidebar.truncated': (p: { max: number }) =>
    `Troppe voci, mostro solo le prime ${p.max}`,
  'sidebar.rootLocked': (p: { name: string }) =>
    `Clicca qui per concedere di nuovo l'accesso a ${p.name}`,
  'sidebar.rootHint': (p: { name: string }) =>
    `${p.name} (clicca per aprire / chiudere e renderla la destinazione delle nuove voci; tasto destro per altre opzioni)`,
  'sidebar.rootMenu': (p: { name: string }) => `Azioni per ${p.name}`,
  'sidebar.renameAria': 'Nuovo nome',
  'sidebar.newFileAria': 'Nuovo nome file',
  'sidebar.newDirAria': 'Nuovo nome cartella',
  'sidebar.demos': 'Frammenti demo',
  'sidebar.demosDirty': 'Modifiche demo non salvate',
  'sidebar.saveDemos': 'Salva ogni demo in una cartella locale',
  'sidebar.cancelSave': 'Annulla salvataggio',
  'sidebar.cancellingSave': 'Annullamento…',
  'sidebar.savingDemos': (p: { done: number; total: number }) =>
    `Salvataggio locale ${p.done}/${p.total}`,
  'sidebar.savingDemosFile': (p: { name: string; done: number; total: number }) =>
    `Scrittura di ${p.name} (${p.done}/${p.total})`,
  'sidebar.uncategorized': 'Non categorizzati',

  'menu.rename': 'Rinomina',
  'menu.delete': 'Elimina',
  'menu.copyPath': 'Copia percorso',
  'menu.newFile': 'Nuovo file',
  'menu.newDir': 'Nuova cartella',
  'menu.removeRoot': 'Rimuovi cartella',

  'console.empty': '// qui compare l\'output della console',

  'console.clear': 'Svuota',

  'console.omitted': (n: number) => `${n} righe più vecchie omesse`,

  'file.untitled': (p: { ext: string }) => `Senza titolo.${p.ext}`,
  'file.newDir': 'Nuova cartella',
  'file.scratch': 'Appunto',

  'validate.empty': 'Il nome non può essere vuoto',
  'validate.tooLong': 'Nome troppo lungo — al massimo 255 caratteri',
  'validate.dots': '« . » e « .. » non possono essere usati come nome',
  'validate.slash':
    'Il nome non può contenere una barra — le nuove voci finiscono sempre nella cartella corrente',
  'validate.illegalChars': 'Il nome non può contenere < > : " | ? * o caratteri simili',
  'validate.control': 'Il nome non può contenere caratteri di controllo',
  'validate.trailing': 'Il nome non può finire con un punto o uno spazio',
  'validate.reserved': (p: { name: string }) =>
    `${p.name} collide con un nome riservato di sistema, scegline un altro`,
  'validate.exists': (p: { name: string }) => `${p.name} esiste già, scegli un altro nome`,
  'validate.createExt':
    'Si possono creare solo file di testo modificabili (.js / .ts / .json / .md e simili)',
  'validate.renameExt':
    'Questa estensione impedirebbe di aprire il file — usa .js / .ts / .json / .md e simili',

  'err.fs.noPicker': 'Questo browser non apre cartelle locali',

  'err.fs.notAllowed': 'Nessun permesso per accedere a questo file o cartella (bloccato da un altro programma, in sola lettura o autorizzazione revocata)',
  'err.fs.tooLarge': (p: { name: string; size: string; max: string }) =>
    `${p.name} pesa ${p.size}, oltre il limite di ${p.max}; non è stato aperto`,
  'err.fs.binary': (p: { name: string }) =>
    `${p.name} sembra un file binario; non è stato aperto`,
  'err.fs.nameTaken': (p: { name: string; kind: 'file' | 'directory' }) =>
    `${p.name} esiste già (${p.kind === 'file' ? 'file' : 'cartella'}), scegli un altro nome`,
  'err.fs.uniqueExhausted': (p: { base: string }) =>
    `${p.base} e i 99 nomi numerati successivi sono tutti occupati; pulisci prima la cartella di destinazione`,
  'err.fs.badBundlePath': (p: { path: string }) => `Percorso file non valido: ${p.path}`,
  'err.fs.caseRenameUnsupported':
    'Questo browser non rinomina una voce in un nome che differisce solo per maiuscole/minuscole. Rinominala prima in qualcos\'altro e poi nel nome voluto.',
  'err.fs.ignoredDirInTree': (p: { name: string }) =>
    `La cartella contiene ${p.name}; copiare una cartella del genere non ha senso. Rinominala nel file manager del sistema.`,
  'err.fs.treeTooManyFiles': (p: { max: number }) =>
    `La cartella contiene più di ${p.max} file, troppo da copiare in blocco. Rinominala nel file manager del sistema.`,
  'err.fs.treeTooLarge': (p: { max: string }) =>
    `Il contenuto della cartella supera ${p.max}, troppo da copiare in blocco. Rinominala nel file manager del sistema.`,

  'err.idb.open': 'Impossibile aprire IndexedDB',
  'err.idb.blocked': 'IndexedDB è bloccato da un\'altra scheda',
  'err.idb.abort': 'La transazione IndexedDB è stata interrotta',
  'err.idb.fail': 'La transazione IndexedDB è fallita',
  'err.compile.failed': (p: { issues: CompileIssue[] }) =>
    `Compilazione TypeScript fallita: ${p.issues
      .map(
        (i) =>
          `${i.text || 'Errore sconosciuto'}${i.loc ? ` (riga ${i.loc.line}, colonna ${i.loc.column})` : ''}`
      )
      .join('; ')}`,
  'err.compile.raw': (p: { message: string }) =>
    `Compilazione TypeScript fallita: ${p.message}`,
  'err.imports.unresolved': (p: { specs: string[] }) =>
    `Il codice importa ${p.specs.map((s) => `« ${s} »`).join(', ')}, e questo ambiente non risolve gli import di moduli. L'esecutore è un Web Worker senza risolutore di moduli — incorpora la dipendenza nello stesso file prima di eseguire.`,

  'err.save.cancelled': 'Salvataggio annullato',
  'err.ws.rootMoved': (p: { name: string }) =>
    `La cartella ${p.name} non è più dove si trovava, quindi è stata tolta dall'elenco`,
  'err.ws.permissionDenied': (p: { name: string }) =>
    `Impossibile ottenere l'accesso a ${p.name}. Clicca di nuovo, oppure chiudila e riapri.`,
  'err.ws.permissionUnavailable':
    'Questo browser non può ripristinare la cartella dell\'ultima volta; riapri la cartella',
  'err.ws.dirStale': (p: { name: string }) =>
    `La cartella ${p.name} non può più essere aperta, aggiorna`,
  'err.ws.dirGone': 'Questa cartella non è più sul disco; aggiorna e riprova',
  'err.ws.parentGone': 'La cartella di destinazione è sparita; aggiorna e riprova',
  'err.ws.parentStale': 'La cartella di destinazione non può più essere aperta; prova ad aggiornare',
  'err.ws.holderGone': 'La cartella che la contiene è sparita; aggiorna e riprova',
  'err.ws.entryStale': (p: { name: string }) => `La voce ${p.name} non può più essere aperta, aggiorna`,
  'err.ws.entryMissing': (p: { name: string }) => `La voce ${p.name} non è più sul disco, aggiorna`,
  'err.ws.entryFailed': (p: { name: string; message: string }) => `Voce ${p.name}: ${p.message}`,
}
