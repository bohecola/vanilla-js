/*
  日本語辞書 — キーは dict.zh.ts / dict.en.ts と正確に一致。
  `: Dict` 注釈により、キーの欠落や引数の不一致は tsc が検出します。
*/
import type { Dict, CompileIssue } from './dict.zh.ts'

export const ja: Dict = {
  'html.lang': 'ja',
  'html.title': 'Jotter · JS / TS スクラッチパッド',
  'locale.bcp47': 'ja-JP',

  'header.import': 'インポート',
  'header.theme.dark': 'ダーク',
  'header.theme.light': 'ライト',
  'header.theme.system': 'システム',
  'header.accent.blue': '青',
  'header.accent.pink': 'ピンク',
  'header.accent.orange': 'オレンジ',
  'header.accent.green': '緑',
  'header.lang.system': 'システム',
  'header.github': 'GitHub リポジトリ',

  // ---- 设置面板 ----
  'settings.title': '設定',
  'settings.appearance': '外観',
  'settings.mode': 'テーマ',
  'settings.accent': 'アクセント',
  'settings.language': '言語',
  'settings.editor': 'エディター',
  'settings.fontSize': 'フォントサイズ',
  'settings.fontFamily': 'フォント',
  'settings.fontFamily.system': 'システム等幅',
  'settings.fontFamily.hint': 'フォントはアプリに同梱されていません。この端末にインストール済みの場合のみ有効で、未インストールならシステムの等幅フォントが使われます。',
  'settings.editorTheme': 'エディターのテーマ',
  'settings.editorTheme.auto': 'UI に追従',
  'settings.editorTheme.dark': 'ダーク',
  'settings.editorTheme.light': 'ライト',
  'settings.wordWrap': '折り返し',
  'settings.minimap': 'ミニマップ',
  'settings.lineNumbers': '行番号',
  'settings.fontLigatures': 'リガチャ',
  'settings.fontLigatures.hint': '=> や !=、>= のような記号の組み合わせを 1 つのグリフとして表示します。Fira Code や JetBrains Mono などリガチャ対応フォントでのみ有効です。',
  'settings.reset': 'リセット',
  'settings.shortcuts': 'ショートカット',
  'settings.shortcuts.app': 'アプリ',
  'settings.shortcuts.editorBuiltin': 'エディター（組み込み）',
  'settings.shortcuts.rename': '名前の変更（サイドバーで選択時）',
  'settings.shortcuts.palette': 'コマンドパレット',
  'settings.shortcuts.find': '検索',
  'settings.shortcuts.replace': '置換',
  'settings.shortcuts.format': 'ドキュメントのフォーマット',
  'settings.shortcuts.comment': '行コメントの切り替え',
  'settings.shortcuts.moveLine': '行を上 / 下へ移動',
  'settings.shortcuts.copyLine': '行を下へコピー',
  'settings.shortcuts.multiCursor': '次の一致を選択',
  'settings.close': '閉じる',

  'notice.close': '通知を閉じる',
  'notice.demoLoadFailed': (p: { message: string }) => `デモの読み込みに失敗しました: ${p.message}`,
  'notice.notTextFile': (p: { name: string }) =>
    `${p.name} は編集できるテキストファイルではないため開きませんでした`,
  'notice.deleted': (p: { name: string }) => `${p.name} を削除しました`,
  'notice.rootRemoved': (p: { name: string }) =>
    `${p.name} をリストから外しました。ディスク上のファイルは変わりません。`,
  'notice.renamed': (p: { name: string }) => `${p.name} に名前を変更しました`,
  'notice.saved': (p: { name: string }) => `${p.name} を保存しました`,
  'notice.demoReadFailed': (p: { message: string }) =>
    `デモのソースの読み込みに失敗しました: ${p.message}`,
  'notice.demosSaved': (p: { count: number; label: string }) =>
    `${p.count} 個のデモを ${p.label} に保存しました。これで直接編集できます — Ctrl+S でディスクに書き戻します。`,
  'notice.demosSavedClosed': (p: { count: number; label: string }) =>
    `${p.count} 個のデモを ${p.label} に保存しましたが、左側には開いていません。ここで編集するには「フォルダーを開く」でそのフォルダーを開いてください。`,
  'notice.demoSaveCleaned': (p: { count: number }) =>
    `前回の保存が残した不完全なフォルダー ${p.count} 個を掃除しました`,
  'notice.demoSaveGone': '前回の保存が残した不完全なフォルダーはもう存在せず、掃除の必要はありません',
  'notice.pathCopied': (p: { path: string }) => `パスをコピーしました: ${p.path}`,
  'notice.copyFailed': 'コピーに失敗しました。もう一度お試しください',
  'notice.fileReadFailed': (p: { message: string }) => `ファイルの読み込みに失敗しました: ${p.message}`,
  'notice.draftWillSaveTo': (p: { path: string }) =>
    `左側でファイル名を入力して Enter を押すと ${p.path} に保存されます`,
  'notice.noWriteTarget':
    'このファイルはローカルフォルダー内にないため書き戻す場所がありません — 代わりにダウンロードしました',
  'notice.saveFailed': (p: { message: string }) => `保存に失敗しました: ${p.message}`,
  'notice.externalChanged': (p: { name: string }) =>
    `${p.name} はディスク上で変更され、まだ未保存の編集があります。保存するとディスク上の版が上書きされます`,
  'notice.reloaded': (p: { name: string }) =>
    `${p.name} をディスク上の最新版で読み込み直しました`,
  'notice.createdButEmpty': (p: { name: string; message: string }) =>
    `${p.name} は作成されましたが、内容を書き込めませんでした: ${p.message}`,

  'editor.noFile': 'ファイルが開かれていません',
  'editor.dirty': '未保存の変更あり',
  'editor.save': '保存',
  'editor.saving': '保存中…',
  'editor.download': 'ダウンロード',
  'editor.stop': '停止',
  'editor.runDisabled': '実行機能は JavaScript / TypeScript のみ実行できます',
  'editor.run': '実行',

  'tab.close': 'タブを閉じる',
  'tab.scrollLeft': 'タブを左へスクロール',
  'tab.scrollRight': 'タブを右へスクロール',
  'tab.ctx.close': '閉じる',
  'tab.ctx.closeOthers': '他を閉じる',
  'tab.ctx.closeRight': '右側を閉じる',
  'tab.ctx.closeAll': 'すべて閉じる',
  'confirm.closeMany.one': '未保存のタブを閉じますか？',
  'confirm.closeMany.many': (p: { count: number }) =>
    `未保存のタブ ${p.count} 個を閉じますか？`,
  'confirm.closeMany.unsaved': '未保存の変更は失われます。',
  'tab.closeAria': (p: { name: string }) => `タブ ${p.name} を閉じる`,
  'confirm.closeTab.title': (p: { name: string }) => `${p.name} を閉じますか？`,
  'confirm.closeTab.unsaved': 'このファイルには未保存の変更があり、閉じると失われます。',
  'confirm.closeTab.ok': '閉じる',
  'confirm.newScratch.title': '下書きを破棄しますか？',
  'confirm.newScratch.body': '下書きに未保存の内容があります。新規作成すると失われます。',
  'confirm.newScratch.ok': '破棄して新規作成',
  'panes.resize': 'ドラッグしてエディターと出力の幅を調整',

  'statusbar.noFile': 'ファイルが開かれていません',
  'statusbar.ln': (p: { line: number; col: number }) => `Ln ${p.line}, 列 ${p.col}`,
  'statusbar.spaces': (p: { size: number }) => `スペース: ${p.size}`,
  'statusbar.tabSize': (p: { size: number }) => `タブ幅: ${p.size}`,
  'statusbar.js': 'JavaScript（.js ファイル、JavaScript としてコンパイル実行）',
  'statusbar.ts': 'TypeScript（.ts ファイル、TypeScript としてコンパイル実行）',

  'confirm.cancel': 'キャンセル',
  'confirm.cancelSave.title': '保存を中止しますか？',
  'confirm.cancelSave.body':
    '書き込みを止め、書き込まれた不完全なファイルを削除して、保存前の状態に戻します。',
  'confirm.cancelSave.ok': '保存を中止',
  'confirm.cleanupInterrupted.title': '前回の途中保存を掃除しますか？',
  'confirm.cleanupInterrupted.bodyMultiple': (p: { labels: string }) =>
    `${p.labels} 内に、前回の保存が完了しなかった（ページの再読み込みや閉じた可能性）ために残った不完全なファイルがあります。削除しますか？`,
  'confirm.cleanupInterrupted.bodyRecord': (p: { label: string }) =>
    `前回の保存が完了しなかった（ページの再読み込みや閉じた可能性）ため、${p.label} 内に不完全なファイルが残りました。削除しますか？`,
  'confirm.cleanupInterrupted.ok': '掃除',
  'confirm.saveDemos.title': 'すべてのデモをローカルに保存しますか？',
  'confirm.saveDemos.body': (p: { count: number }) =>
    `${p.count} 個のデモをすべて選択したフォルダーに保存し、その中にサブフォルダーを作成します。続けますか？`,
  'confirm.saveDemos.ok': 'フォルダーを選択',
  'confirm.openDemos.title': '保存したフォルダーを左側で開きますか？',
  'confirm.openDemos.body': (p: { count: number; label: string }) =>
    `${p.count} 個のデモを ${p.label} に保存しました。直接編集できるよう、このフォルダーを左側のファイル一覧で開きますか？`,
  'confirm.openDemos.ok': '開く',
  'confirm.delete.title': (p: { name: string }) => `${p.name} を削除しますか？`,
  'confirm.delete.dir': (p: { path: string }) => `${p.path} とその中身をすべて削除します。`,
  'confirm.delete.file': (p: { path: string }) => `${p.path} を削除します。`,
  'confirm.delete.unsavedInDir': (p: { count: number }) =>
    `その中の開いているファイル ${p.count} 個には未保存の変更があり、一緒に削除されます。`,
  'confirm.delete.unsavedFile': 'このファイルには未保存の変更があり、一緒に削除されます。',
  'confirm.delete.irreversible':
    '削除はディスクに直接作用し、ゴミ箱にも入らず元に戻せません。',
  'confirm.delete.ok': '削除',
  'confirm.closeRoot.title': (p: { name: string }) => `${p.name} を取り外しますか？`,
  'confirm.closeRoot.listOnly':
    '左側の一覧から外すだけで、ディスク上のファイルは何も変わりません。',
  'confirm.closeRoot.openFiles': (p: { count: number }) =>
    `開いているファイル ${p.count} 個も閉じられます。`,
  'confirm.closeRoot.openFilesUnsaved': (p: { count: number; unsaved: number }) =>
    `開いているファイル ${p.count} 個が閉じられ、未保存の変更がある ${p.unsaved} 個は破棄されます。`,
  'confirm.closeRoot.reauth':
    '再度使うにはそのフォルダーを選び直す必要があります。ブラウザのセキュリティ制約により、ウェブページはこのアクセス許可を自ら保持できません。',
  'confirm.closeRoot.ok': '取り外す',
  'confirm.renameDir.title': (p: { from: string; to: string }) =>
    `${p.from} を ${p.to} に名前変更しますか？`,
  'confirm.renameDir.how':
    'ブラウザにはフォルダー名変更の API がなく、フォルダー全体を新しい名前でコピーし、すべて成功してから元を削除します。',
  'confirm.renameDir.size': (p: { files: number; size: string }) =>
    `ファイル ${p.files} 個、計 ${p.size}。コピー中はページを閉じないでください。`,
  'confirm.renameDir.risk':
    'コピーされたファイルの更新日時は現在時刻になります。途中で失敗しても元はそのままですが、半分だけコピーした新しいフォルダーがディスクに残ります。',
  'confirm.renameDir.ok': '名前を変更',

  'sidebar.title': 'ファイル',
  'sidebar.expand': 'ファイル一覧を開く',
  'sidebar.collapse': 'ファイル一覧をたたむ',
  'sidebar.newScratch': '新しいスクラッチ',
  'sidebar.resize': 'ドラッグで幅を調整（ダブルクリックで初期化）',
  'sidebar.localDirs': 'ローカルフォルダー',
  'sidebar.newFileIn': (p: { target: string }) => `${p.target} に新しいファイルを作成`,
  'sidebar.newDirIn': (p: { target: string }) => `${p.target} に新しいフォルダーを作成`,
  'sidebar.refreshTarget': (p: { target: string }) => `${p.target} を読み直す`,
  'sidebar.openAnother': 'もうひとつフォルダーを開く',
  'sidebar.openFolder': 'フォルダーを開く',
  'sidebar.unsupported': (p: { label: string }) =>
    `このブラウザはローカルフォルダーを開けません — この API を実装しているのは Chrome / Edge など Chromium 系ブラウザだけです。それでも上部の「${p.label}」で単一ファイルは開けます。`,
  'sidebar.needAuth': '許可が必要',
  'sidebar.reauthHint': (p: { label: string }) =>
    `「${p.label}」と表示されたフォルダーは 1 クリックで戻ります — ブラウザがページを開くたびに確認を求めるためです`,
  'sidebar.loading': '読み込み中…',
  'sidebar.unsaved': '未保存',
  'sidebar.emptyDir': '空のフォルダー',
  'sidebar.truncated': (p: { max: number }) => `項目が多く、先頭 ${p.max} 個だけ表示しています`,
  'sidebar.rootLocked': (p: { name: string }) =>
    `ここをクリックすると ${p.name} に再びアクセス許可を与えます`,
  'sidebar.rootHint': (p: { name: string }) =>
    `${p.name}（クリックで開閉、新規作成の対象にも設定。右クリックでさらに操作）`,
  'sidebar.rootMenu': (p: { name: string }) => `${p.name} の操作`,
  'sidebar.renameAria': '新しい名前',
  'sidebar.newFileAria': '新しいファイル名',
  'sidebar.newDirAria': '新しいフォルダー名',
  'sidebar.demos': 'デモスニペット',
  'sidebar.demosDirty': '未保存のデモ変更あり',
  'sidebar.saveDemos': 'すべてのデモをローカルフォルダーに保存',
  'sidebar.cancelSave': '保存をキャンセル',
  'sidebar.cancellingSave': 'キャンセル中…',
  'sidebar.savingDemos': (p: { done: number; total: number }) =>
    `ローカル保存中 ${p.done}/${p.total}`,
  'sidebar.savingDemosFile': (p: { name: string; done: number; total: number }) =>
    `${p.name} を書き込み中（${p.done}/${p.total}）`,
  'sidebar.uncategorized': '未分類',

  'menu.rename': '名前を変更',
  'menu.delete': '削除',
  'menu.copyPath': 'パスをコピー',
  'menu.newFile': '新しいファイル',
  'menu.newDir': '新しいフォルダー',
  'menu.removeRoot': 'フォルダーを取り外す',

  'console.empty': '// console の出力がここに表示されます',

  'console.clear': 'クリア',

  'console.omitted': (n: number) => `古い ${n} 行を省略しました`,

  'file.untitled': (p: { ext: string }) => `無題.${p.ext}`,
  'file.newDir': '新しいフォルダー',
  'file.scratch': 'スクラッチ',

  'validate.empty': '名前は空にできません',
  'validate.tooLong': '名前が長すぎます — 最大 255 文字',
  'validate.dots': '「.」や「..」を名前には使えません',
  'validate.slash': '名前にスラッシュは使えません — 新規作成は常に現在のフォルダー内です',
  'validate.illegalChars': '名前に < > : " | ? * などの文字は使えません',
  'validate.control': '名前に制御文字は使えません',
  'validate.trailing': '名前をピリオドや空白で終えられません',
  'validate.reserved': (p: { name: string }) =>
    `${p.name} はシステムの予約名と衝突します。別の名前にしてください`,
  'validate.exists': (p: { name: string }) => `${p.name} は既に存在します。別の名前にしてください`,
  'validate.createExt': '編集できるテキストファイルのみ作成できます（.js / .ts / .json / .md など）',
  'validate.renameExt':
    'この拡張子だとここで開けません。.js / .ts / .json / .md などをお使いください',

  'err.fs.noPicker': 'このブラウザはローカルフォルダーを開けません',

  'err.fs.notAllowed': 'このファイルまたはフォルダーにアクセスする権限がありません（他のプログラムが使用中、読み取り専用、または許可が取り消された可能性）',
  'err.fs.tooLarge': (p: { name: string; size: string; max: string }) =>
    `${p.name} は ${p.size} あり、${p.max} の上限を超えているため開きませんでした`,
  'err.fs.binary': (p: { name: string }) => `${p.name} はバイナリファイルのようで開きませんでした`,
  'err.fs.nameTaken': (p: { name: string; kind: 'file' | 'directory' }) =>
    `${p.name} は既に存在します（${p.kind === 'file' ? 'ファイル' : 'フォルダー'}）。別の名前にしてください`,
  'err.fs.uniqueExhausted': (p: { base: string }) =>
    `${p.base} とそれに続く 99 個の連番がすべて使われています。先にフォルダーを掃除してください`,
  'err.fs.badBundlePath': (p: { path: string }) => `無効なファイルパス: ${p.path}`,
  'err.fs.caseRenameUnsupported':
    'このブラウザは大文字小文字だけが違う名前へは変更できません。先に別の名前に変えてから、目的の名前にしてください。',
  'err.fs.ignoredDirInTree': (p: { name: string }) =>
    `フォルダー内に ${p.name} があります。そのようなフォルダーをコピーしても意味がないため、OS のファイルマネージャーで名前を変更してください。`,
  'err.fs.treeTooManyFiles': (p: { max: number }) =>
    `フォルダー内のファイルが ${p.max} 個を超え、一括コピーの負荷が大きすぎます。OS のファイルマネージャーで名前を変更してください。`,
  'err.fs.treeTooLarge': (p: { max: string }) =>
    `フォルダーの内容が ${p.max} を超え、一括コピーの負荷が大きすぎます。OS のファイルマネージャーで名前を変更してください。`,

  'err.idb.open': 'IndexedDB を開けませんでした',
  'err.idb.blocked': 'IndexedDB が別のタブにブロックされています',
  'err.idb.abort': 'IndexedDB のトランザクションが中断されました',
  'err.idb.fail': 'IndexedDB のトランザクションが失敗しました',
  'err.compile.failed': (p: { issues: CompileIssue[] }) =>
    `TypeScript のコンパイルに失敗しました: ${p.issues
      .map((i) => `${i.text || '不明なエラー'}${i.loc ? `（${i.loc.line} 行 ${i.loc.column} 列）` : ''}`)
      .join('；')}`,
  'err.compile.raw': (p: { message: string }) =>
    `TypeScript のコンパイルに失敗しました: ${p.message}`,
  'err.imports.unresolved': (p: { specs: string[] }) =>
    `コードは ${p.specs.map((s) => `「${s}」`).join('、')} を import していますが、この実行環境はモジュール import を解決できません。実行機能はモジュール解決のない Web Worker のため、実行前に依存を同じファイルに取り込んでください。`,

  'err.save.cancelled': '保存はキャンセルされました',
  'err.ws.rootMoved': (p: { name: string }) =>
    `フォルダー ${p.name} は元の場所にないため、一覧から外しました`,
  'err.ws.permissionDenied': (p: { name: string }) =>
    `${p.name} のアクセス許可を得られませんでした。もう一度クリックするか、閉じて開き直してください。`,
  'err.ws.permissionUnavailable':
    'このブラウザは前回のフォルダーを復元できません。フォルダーを開き直してください',
  'err.ws.dirStale': (p: { name: string }) => `フォルダー ${p.name} を開けません。再読み込みしてください`,
  'err.ws.dirGone': 'このフォルダーはディスク上にありません。再読み込みしてからお試しください',
  'err.ws.parentGone': '対象のフォルダーがなくなりました。再読み込みしてからお試しください',
  'err.ws.parentStale': '対象のフォルダーを開けません。再読み込みしてみてください',
  'err.ws.holderGone': 'それがあったフォルダーがなくなりました。再読み込みしてからお試しください',
  'err.ws.entryStale': (p: { name: string }) => `項目 ${p.name} を開けません。再読み込みしてください`,
  'err.ws.entryMissing': (p: { name: string }) =>
    `項目 ${p.name} はディスク上にありません。再読み込みしてください`,
  'err.ws.entryFailed': (p: { name: string; message: string }) => `項目 ${p.name}: ${p.message}`,
}
