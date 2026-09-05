/*
  Dictionnaire français — les clés suivent exactement dict.zh.ts / dict.en.ts.
  Annoté `: Dict` : une clé manquante, une clé en trop ou une signature de paramètre
  différente est une erreur de compilation (tsc), rien ne passe silencieusement.
*/
import type { Dict, CompileIssue } from './dict.zh'

export const fr: Dict = {
  // ---- Document ----
  'html.lang': 'fr',
  'html.title': 'Jotter · Bloc-notes JS / TS',
  'locale.bcp47': 'fr-FR',

  // ---- Barre du haut ----
  'header.import': 'Importer',
  'header.theme': 'Changer de thème',
  'header.theme.dark': 'Sombre',
  'header.theme.light': 'Clair',
  'header.theme.system': 'Système',
  'header.accent': 'Changer la couleur',
  'header.accent.blue': 'Bleu',
  'header.accent.pink': 'Rose',
  'header.accent.orange': 'Orange',
  'header.accent.green': 'Vert',
  'header.lang': 'Changer de langue',
  'header.lang.system': 'Système',
  'header.github': 'Dépôt GitHub',

  // ---- Notifications ----
  'notice.close': 'Fermer la notification',
  'notice.demoLoadFailed': (p: { message: string }) => `Échec du chargement de la démo : ${p.message}`,
  'notice.notTextFile': (p: { name: string }) =>
    `${p.name} n’est pas un fichier texte éditable, il n’a pas été ouvert`,
  'notice.deleted': (p: { name: string }) => `${p.name} supprimé`,
  'notice.rootRemoved': (p: { name: string }) =>
    `${p.name} a été retiré. Aucun fichier n’a changé sur le disque.`,
  'notice.renamed': (p: { name: string }) => `Renommé en ${p.name}`,
  'notice.saved': (p: { name: string }) => `${p.name} enregistré`,
  'notice.demoReadFailed': (p: { message: string }) =>
    `Échec de la lecture des sources de la démo : ${p.message}`,
  'notice.demosSaved': (p: { count: number; label: string }) =>
    `${p.count} démo${p.count === 1 ? '' : 's'} enregistrée${p.count === 1 ? '' : 's'} dans ${p.label}. Vous pouvez les modifier — Ctrl+S écrit sur le disque.`,
  'notice.demosSavedClosed': (p: { count: number; label: string }) =>
    `${p.count} démo${p.count === 1 ? '' : 's'} enregistrée${p.count === 1 ? '' : 's'} dans ${p.label}, sans les ouvrir à gauche. Pour les modifier ici, utilisez « Ouvrir un dossier » sur ce répertoire.`,
  'notice.demoSaveCleaned': (p: { count: number }) =>
    `${p.count} dossier${p.count === 1 ? '' : 's'} incomplet${p.count === 1 ? '' : 's'} d’un enregistrement précédent a${p.count === 1 ? '' : 'ont'} été nettoyé${p.count === 1 ? '' : 's'}`,
  'notice.demoSaveGone':
    'Le dossier incomplet de l’enregistrement précédent n’existe plus ; rien à nettoyer',
  'notice.pathCopied': (p: { path: string }) => `Chemin copié : ${p.path}`,
  'notice.copyFailed': 'Échec de la copie, veuillez réessayer',
  'notice.fileReadFailed': (p: { message: string }) => `Échec de la lecture du fichier : ${p.message}`,
  'notice.draftWillSaveTo': (p: { path: string }) =>
    `Tapez un nom de fichier à gauche puis Entrée pour l’enregistrer dans ${p.path}`,
  'notice.noWriteTarget':
    'Ce fichier n’est pas dans un dossier local ; il n’y a rien où l’écrire — téléchargé à la place',
  'notice.saveFailed': (p: { message: string }) => `Échec de l’enregistrement : ${p.message}`,
  'notice.externalChanged': (p: { name: string }) =>
    `${p.name} a changé sur le disque alors que vous avez encore des modifications non enregistrées ; enregistrer écrasera la version du disque`,
  'notice.reloaded': (p: { name: string }) =>
    `${p.name} a été rechargé depuis la dernière version sur le disque`,
  'notice.createdButEmpty': (p: { name: string; message: string }) =>
    `${p.name} a été créé, mais son contenu n’a pas pu être écrit : ${p.message}`,

  // ---- Barre d’outils de l’éditeur ----
  'editor.noFile': 'Aucun fichier ouvert',
  'editor.dirty': 'Modifications non enregistrées',
  'editor.save': 'Enregistrer',
  'editor.saving': 'Enregistrement…',
  'editor.download': 'Télécharger',
  'editor.stop': 'Arrêter',
  'editor.runDisabled': "L'exécuteur ne gère que JavaScript / TypeScript",
  'editor.run': 'Exécuter',

  // ---- Onglets ----
  'tab.close': 'Fermer l’onglet',
  'tab.scrollLeft': 'Faire défiler les onglets vers la gauche',
  'tab.scrollRight': 'Faire défiler les onglets vers la droite',
  'tab.ctx.close': 'Fermer',
  'tab.ctx.closeOthers': 'Fermer les autres',
  'tab.ctx.closeRight': 'Fermer à droite',
  'tab.ctx.closeAll': 'Tout fermer',
  'confirm.closeMany.one': 'Fermer l’onglet non enregistré ?',
  'confirm.closeMany.many': (p: { count: number }) =>
    `Fermer ${p.count} onglet${p.count === 1 ? '' : 's'} non enregistré${p.count === 1 ? '' : 's'} ?`,
  'confirm.closeMany.unsaved': 'Ces modifications non enregistrées seront perdues.',
  'tab.closeAria': (p: { name: string }) => `Fermer l’onglet ${p.name}`,
  'confirm.closeTab.title': (p: { name: string }) => `Fermer ${p.name} ?`,
  'confirm.closeTab.unsaved':
    'Ce fichier a des modifications non enregistrées qui seront perdues si vous le fermez.',
  'confirm.closeTab.ok': 'Fermer',
  'confirm.newScratch.title': 'Effacer le brouillon ?',
  'confirm.newScratch.body': 'Le brouillon contient du texte non enregistré qui sera perdu.',
  'confirm.newScratch.ok': 'Effacer et créer',
  'panes.resize': 'Glisser pour redimensionner les volets éditeur et sortie',

  // ---- Barre d’état ----
  'statusbar.noFile': 'Aucun fichier ouvert',
  'statusbar.ln': (p: { line: number; col: number }) => `Ln ${p.line}, Col ${p.col}`,
  'statusbar.spaces': (p: { size: number }) => `Espaces : ${p.size}`,
  'statusbar.tabSize': (p: { size: number }) => `Taille de tab : ${p.size}`,
  'statusbar.js': 'JavaScript (fichier .js, exécuté en JavaScript)',
  'statusbar.ts': 'TypeScript (fichier .ts, exécuté en TypeScript)',

  // ---- Boîtes de confirmation ----
  'confirm.cancel': 'Annuler',
  'confirm.cancelSave.title': 'Arrêter l’enregistrement ?',
  'confirm.cancelSave.body':
    'L’écriture va s’arrêter et les fichiers incomplets déjà écrits seront supprimés, ce qui restaure l’état d’avant l’enregistrement.',
  'confirm.cancelSave.ok': 'Arrêter l’enregistrement',
  'confirm.cleanupInterrupted.title': 'Nettoyer un enregistrement interrompu ?',
  'confirm.cleanupInterrupted.bodyMultiple': (p: { labels: string }) =>
    `Des fichiers incomplets laissés par un enregistrement interrompu (rechargement ou fermeture de page) ont été trouvés dans ${p.labels}. Les supprimer ?`,
  'confirm.cleanupInterrupted.bodyRecord': (p: { label: string }) =>
    `Un enregistrement a été interrompu (rechargement ou fermeture de page) ; des fichiers incomplets ont été laissés dans ${p.label}. Les supprimer ?`,
  'confirm.cleanupInterrupted.ok': 'Nettoyer',
  'confirm.saveDemos.title': 'Enregistrer toutes les démos en local ?',
  'confirm.saveDemos.body': (p: { count: number }) =>
    `Les ${p.count} démo${p.count === 1 ? '' : 's'} seront enregistrée${p.count === 1 ? '' : 's'} dans le dossier que vous choisissez, en créant un sous-dossier. Continuer ?`,
  'confirm.saveDemos.ok': 'Choisir le dossier',
  'confirm.openDemos.title': 'Ouvrir le dossier enregistré sur la gauche ?',
  'confirm.openDemos.body': (p: { count: number; label: string }) =>
    `${p.count} démo${p.count === 1 ? '' : 's'} enregistrée${p.count === 1 ? '' : 's'} dans ${p.label}. Ouvrir ce dossier dans le panneau de gauche pour les modifier ?`,
  'confirm.openDemos.ok': 'Ouvrir',
  'confirm.delete.title': (p: { name: string }) => `Supprimer ${p.name} ?`,
  'confirm.delete.dir': (p: { path: string }) => `Cela supprimera ${p.path} et tout ce qu’il contient.`,
  'confirm.delete.file': (p: { path: string }) => `Cela supprimera ${p.path}.`,
  'confirm.delete.unsavedInDir': (p: { count: number }) =>
    `${p.count} fichier${p.count === 1 ? '' : 's'} ouvert${p.count === 1 ? '' : 's'} à l’intérieur a${p.count === 1 ? '' : 'ont'} des modifications non enregistrées et sera${p.count === 1 ? '' : ' seront'} supprimé${p.count === 1 ? '' : 's'} aussi.`,
  'confirm.delete.unsavedFile':
    'Ce fichier a des modifications non enregistrées, qui seront supprimées aussi.',
  'confirm.delete.irreversible':
    'La suppression écrit directement sur le disque : pas de corbeille, et aucune façon d’annuler.',
  'confirm.delete.ok': 'Supprimer',
  'confirm.closeRoot.title': (p: { name: string }) => `Retirer ${p.name} ?`,
  'confirm.closeRoot.listOnly':
    'Cela le retire simplement de la liste de gauche. Rien ne change sur le disque.',
  'confirm.closeRoot.openFiles': (p: { count: number }) =>
    `${p.count} fichier${p.count === 1 ? '' : 's'} ouvert${p.count === 1 ? '' : 's'} en sera${p.count === 1 ? '' : 'ont'} fermé${p.count === 1 ? '' : 's'}.`,
  'confirm.closeRoot.openFilesUnsaved': (p: { count: number; unsaved: number }) =>
    `${p.count} fichier${p.count === 1 ? '' : 's'} ouvert${p.count === 1 ? '' : 's'} en sera${p.count === 1 ? '' : 'ont'} fermé${p.count === 1 ? '' : 's'}, et ${p.unsaved} contenant des modifications non enregistrées seront abandonné${p.unsaved === 1 ? '' : 's'}.`,
  'confirm.closeRoot.reauth':
    'Pour l’utiliser à nouveau, il faut choisir le dossier une fois de plus. Pour des raisons de sécurité du navigateur, une page ne peut pas conserver elle-même cette autorisation.',
  'confirm.closeRoot.ok': 'Retirer',
  'confirm.renameDir.title': (p: { from: string; to: string }) =>
    `Renommer ${p.from} en ${p.to} ?`,
  'confirm.renameDir.how':
    'Les navigateurs n’offrent aucune API de renommage de dossier : tout le dossier est copié sous le nouveau nom et l’original n’est supprimé qu’une fois chaque fichier copié.',
  'confirm.renameDir.size': (p: { files: number; size: string }) =>
    `${p.files} fichier${p.files === 1 ? '' : 's'}, ${p.size} au total. Gardez la page ouverte pendant la copie.`,
  'confirm.renameDir.risk':
    'Les fichiers copiés voient leur date de modification remise à maintenant. Si la copie échoue à mi-chemin, l’original reste intact, mais un dossier à moitié copié est laissé sur le disque.',
  'confirm.renameDir.ok': 'Renommer',

  // ---- Panneau de fichiers ----
  'sidebar.title': 'Fichiers',
  'sidebar.expand': 'Afficher le panneau de fichiers',
  'sidebar.collapse': 'Masquer le panneau de fichiers',
  'sidebar.newScratch': 'Nouveau brouillon',
  'sidebar.resize': 'Glisser pour redimensionner (double-clic pour réinitialiser)',
  'sidebar.localDirs': 'Dossiers locaux',
  'sidebar.newFileIn': (p: { target: string }) => `Nouveau fichier dans ${p.target}`,
  'sidebar.newDirIn': (p: { target: string }) => `Nouveau dossier dans ${p.target}`,
  'sidebar.refreshTarget': (p: { target: string }) => `Recharger ${p.target}`,
  'sidebar.openAnother': 'Ouvrir un autre dossier',
  'sidebar.openFolder': 'Ouvrir un dossier',
  'sidebar.unsupported': (p: { label: string }) =>
    `Ce navigateur ne peut pas ouvrir des dossiers locaux — seuls les navigateurs basés sur Chromium comme Chrome et Edge implémentent cette API. Vous pouvez toujours utiliser « ${p.label} » en haut pour ouvrir un fichier unique.`,
  'sidebar.needAuth': 'Nécessite une autorisation',
  'sidebar.reauthHint': (p: { label: string }) =>
    `Les dossiers marqués « ${p.label} » reviennent d’un simple clic — le navigateur redemande à chaque rechargement de page`,
  'sidebar.loading': 'Chargement…',
  'sidebar.unsaved': 'Non enregistré',
  'sidebar.emptyDir': 'Dossier vide',
  'sidebar.truncated': (p: { max: number }) =>
    `Trop d’éléments, seuls les ${p.max} premiers sont affichés`,
  'sidebar.rootLocked': (p: { name: string }) =>
    `Cliquer ici pour redonner l’accès à ${p.name}`,
  'sidebar.rootHint': (p: { name: string }) =>
    `${p.name} (cliquer pour développer / replier et en faire la cible des nouveaux éléments ; clic droit pour plus d’options)`,
  'sidebar.rootMenu': (p: { name: string }) => `Actions pour ${p.name}`,
  'sidebar.renameAria': 'Nouveau nom',
  'sidebar.newFileAria': 'Nouveau nom de fichier',
  'sidebar.newDirAria': 'Nouveau nom de dossier',
  'sidebar.demos': 'Extraits de démos',
  'sidebar.demosDirty': 'Modifications de démo non enregistrées',
  'sidebar.saveDemos': 'Enregistrer chaque démo dans un dossier local',
  'sidebar.cancelSave': 'Annuler l’enregistrement',
  'sidebar.cancellingSave': 'Annulation…',
  'sidebar.savingDemos': (p: { done: number; total: number }) =>
    `Enregistrement local ${p.done}/${p.total}`,
  'sidebar.savingDemosFile': (p: { name: string; done: number; total: number }) =>
    `Écriture de ${p.name} (${p.done}/${p.total})`,
  'sidebar.currentPath': (p: { path: string }) => `Dossier actuel : ${p.path}`,
  'sidebar.uncategorized': 'Non classés',

  // ---- Menu contextuel / déroulant ----
  'menu.rename': 'Renommer',
  'menu.delete': 'Supprimer',
  'menu.copyPath': 'Copier le chemin',
  'menu.newFile': 'Nouveau fichier',
  'menu.newDir': 'Nouveau dossier',
  'menu.refresh': 'Actualiser',
  'menu.removeRoot': 'Retirer le dossier',

  // ---- Console ----
  'console.empty': '// la sortie console s’affiche ici',
  'console.clear': 'Effacer',
  'console.omitted': (n: number) => `${n} premières lignes omises`,

  // ---- Noms par défaut ----
  'file.untitled': (p: { ext: string }) => `Sans titre.${p.ext}`,
  'file.newDir': 'Nouveau dossier',
  'file.scratch': 'Brouillon',

  // ---- Validation des noms ----
  'validate.empty': 'Le nom ne peut pas être vide',
  'validate.tooLong': 'Le nom est trop long — 255 caractères au maximum',
  'validate.dots': '« . » et « .. » ne peuvent pas être utilisés comme nom',
  'validate.slash':
    'Le nom ne peut pas contenir de barre oblique — les nouveaux éléments vont toujours dans le dossier actuel',
  'validate.illegalChars': 'Le nom ne peut pas contenir < > : " | ? * ni de caractères similaires',
  'validate.control': 'Le nom ne peut pas contenir de caractères de contrôle',
  'validate.trailing': 'Le nom ne peut pas se terminer par un point ou une espace',
  'validate.reserved': (p: { name: string }) =>
    `${p.name} entre en conflit avec un nom système réservé, veuillez en choisir un autre`,
  'validate.exists': (p: { name: string }) => `${p.name} existe déjà, choisissez un autre nom`,
  'validate.createExt':
    'Seuls des fichiers texte modifiables peuvent être créés (.js / .ts / .json / .md et similaires)',
  'validate.renameExt':
    'Cette extension rendrait le fichier impossible à ouvrir ici — utilisez .js / .ts / .json / .md ou similaire',

  // ---- Système de fichiers ----
  'err.fs.noPicker': 'Ce navigateur ne peut pas ouvrir des dossiers locaux',
  'err.fs.notAllowed': 'Accès refusé à ce fichier ou dossier (verrouillé par un autre programme, en lecture seule, ou autorisation révoquée)',
  'err.fs.tooLarge': (p: { name: string; size: string; max: string }) =>
    `${p.name} fait ${p.size}, au-delà de la limite de ${p.max} ; il n’a pas été ouvert`,
  'err.fs.binary': (p: { name: string }) =>
    `${p.name} ressemble à un fichier binaire, il n’a pas été ouvert`,
  'err.fs.nameTaken': (p: { name: string; kind: 'file' | 'directory' }) =>
    `${p.name} existe déjà (${p.kind === 'file' ? 'fichier' : 'dossier'}), choisissez un autre nom`,
  'err.fs.uniqueExhausted': (p: { base: string }) =>
    `${p.base} et les 99 noms numérotés qui suivent sont tous pris, nettoyez d’abord le dossier cible`,
  'err.fs.badBundlePath': (p: { path: string }) => `Chemin de fichier invalide : ${p.path}`,
  'err.fs.caseRenameUnsupported':
    'Ce navigateur ne peut pas renommer un élément vers un nom qui ne diffère que par la casse. Renommez-le d’abord autrement, puis vers le nom souhaité.',
  'err.fs.ignoredDirInTree': (p: { name: string }) =>
    `Le dossier contient ${p.name} ; copier un tel dossier n’a pas de sens. Renommez-le plutôt dans le gestionnaire de fichiers du système.`,
  'err.fs.treeTooManyFiles': (p: { max: number }) =>
    `Le dossier contient plus de ${p.max} fichiers, trop à copier en bloc. Renommez-le plutôt dans le gestionnaire de fichiers du système.`,
  'err.fs.treeTooLarge': (p: { max: string }) =>
    `Le dossier dépasse ${p.max}, trop volumineux pour être copié en bloc. Renommez-le plutôt dans le gestionnaire de fichiers du système.`,

  // ---- IndexedDB ----
  'err.idb.open': 'Échec de l’ouverture d’IndexedDB',
  'err.idb.blocked': 'IndexedDB est bloqué par un autre onglet',
  'err.idb.abort': 'La transaction IndexedDB a été interrompue',
  'err.idb.fail': 'La transaction IndexedDB a échoué',

  // ---- Compilation / exécution ----
  'err.compile.failed': (p: { issues: CompileIssue[] }) =>
    `Échec de la compilation TypeScript : ${p.issues
      .map(
        (i) =>
          `${i.text || 'Erreur inconnue'}${i.loc ? ` (ligne ${i.loc.line}, colonne ${i.loc.column})` : ''}`
      )
      .join(' ; ')}`,
  'err.compile.raw': (p: { message: string }) =>
    `Échec de la compilation TypeScript : ${p.message}`,
  'err.imports.unresolved': (p: { specs: string[] }) =>
    `Le code importe ${p.specs.map((s) => `« ${s} »`).join(', ')}, et cet environnement ne peut pas résoudre les imports de modules. L’exécuteur est un Web Worker sans résolveur de modules — intégrez la dépendance dans le même fichier avant d’exécuter.`,

  // ---- Espace de travail ----
  'err.save.cancelled': 'Enregistrement annulé',
  'err.ws.rootMoved': (p: { name: string }) =>
    `Le dossier ${p.name} n’est plus là où il était, il a donc été retiré de la liste`,
  'err.ws.permissionDenied': (p: { name: string }) =>
    `Impossible d’accéder à ${p.name}. Cliquez à nouveau, ou fermez-le et rouvrez-le.`,
  'err.ws.permissionUnavailable':
    'Ce navigateur ne peut pas restaurer le dossier de la dernière fois, veuillez le rouvrir',
  'err.ws.dirStale': (p: { name: string }) =>
    `Le dossier ${p.name} ne peut plus être ouvert, veuillez actualiser`,
  'err.ws.dirGone': 'Ce dossier n’est plus sur le disque, veuillez actualiser et réessayer',
  'err.ws.parentGone': 'Le dossier cible a disparu, actualisez et réessayez',
  'err.ws.parentStale': 'Le dossier cible ne peut plus être ouvert, essayez d’actualiser',
  'err.ws.holderGone':
    'Le dossier qui le contient a disparu, actualisez et réessayez',
  'err.ws.entryStale': (p: { name: string }) =>
    `${p.name} ne peut plus être ouvert, veuillez actualiser`,
  'err.ws.entryMissing': (p: { name: string }) =>
    `${p.name} n’est plus sur le disque, veuillez actualiser`,
  'err.ws.entryFailed': (p: { name: string; message: string }) =>
    `${p.name} : ${p.message}`,
}
