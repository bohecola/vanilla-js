/*
  繁體中文字典 —— 以簡體字庫（dict.zh.ts）為唯一鍵源，取值改為台灣/香港用語的繁體中文。

  與 dict.en.ts 相同，宣告 `: Dict`：少一條鍵、多一條鍵、參數形狀不對都是 tsc 編譯錯誤。
  繁簡差異重點：檔案/資料夾、儲存、滑鼠、標籤/分頁、迴圈、資源回收桶、重新載入等。

  鍵名按出處分組，順序與 dict.zh.ts 完全一致。
*/

import type { Dict, CompileIssue } from './dict.zh.ts'

export const zhHant: Dict = {
  // ---- 文件層級 ----
  'html.lang': 'zh-Hant',
  'html.title': 'Jotter · JS / TS 程式草稿紙',
  /** toLocaleTimeString 等 Intl API 用的 BCP 47 標籤 */
  'locale.bcp47': 'zh-Hant',

  // ---- 頂欄 ----
  'header.import': '匯入',
  'header.theme.dark': '深色',
  'header.theme.light': '淺色',
  'header.theme.system': '跟隨系統',
  'header.accent.blue': '藍色',
  'header.accent.pink': '粉紅',
  'header.accent.orange': '橘色',
  'header.accent.green': '綠色',
  'header.lang.system': '跟隨系統',
  'header.github': 'GitHub 儲存庫',

  // ---- 设置面板 ----
  'settings.title': '設定',
  'settings.appearance': '外觀',
  'settings.mode': '明暗',
  'settings.accent': '配色',
  'settings.language': '語言',
  'settings.editor': '編輯器',
  'settings.fontSize': '字號',
  'settings.fontFamily': '字型',
  'settings.fontFamily.system': '系統等寬字型',
  'settings.fontFamily.hint': '網頁無法自帶字型，清單裡的字型要本機已安裝才會生效，沒裝時退回系統等寬字型',
  'settings.editorTheme': '編輯器主題',
  'settings.editorTheme.auto': '跟隨介面',
  'settings.editorTheme.dark': '深色',
  'settings.editorTheme.light': '淺色',
  'settings.wordWrap': '自動換行',
  'settings.minimap': '縮圖',
  'settings.lineNumbers': '行號',
  'settings.fontLigatures': '連字',
  'settings.fontLigatures.hint': '將 =>、!=、>= 這類符號組合連成一個整體圖形，只對 Fira Code、JetBrains Mono 等支援連字的字型有效',
  'settings.reset': '恢復預設',
  'settings.shortcuts': '快捷鍵',
  'settings.shortcuts.app': '應用',
  'settings.shortcuts.editorBuiltin': '編輯器內建',
  'settings.shortcuts.rename': '重新命名（側邊欄選取時）',
  'settings.shortcuts.palette': '命令面板',
  'settings.shortcuts.find': '尋找',
  'settings.shortcuts.replace': '取代',
  'settings.shortcuts.format': '格式化文件',
  'settings.shortcuts.comment': '切換行註解',
  'settings.shortcuts.moveLine': '上下移動行',
  'settings.shortcuts.copyLine': '向下複製行',
  'settings.shortcuts.multiCursor': '逐個選取相同字',
  'settings.close': '關閉',

  // ---- 提示條 ----
  'notice.close': '關閉提示',
  'notice.demoLoadFailed': (p: { message: string }) => `載入 Demo 失敗：${p.message}`,
  'notice.notTextFile': (p: { name: string }) =>
    `${p.name} 不是可編輯的文字檔，所以沒有開啟`,
  'notice.deleted': (p: { name: string }) => `已刪除 ${p.name}`,
  'notice.rootRemoved': (p: { name: string }) => `已移除 ${p.name}，磁碟上的檔案沒有變動`,
  'notice.renamed': (p: { name: string }) => `已改名為 ${p.name}`,
  'notice.saved': (p: { name: string }) => `已儲存 ${p.name}`,
  'notice.demoReadFailed': (p: { message: string }) => `讀取 Demo 原始碼失敗：${p.message}`,
  'notice.demosSaved': (p: { count: number; label: string }) =>
    `已把 ${p.count} 個 Demo 存到 ${p.label}，現在可以直接修改，Ctrl+S 寫回磁碟`,
  'notice.demosSavedClosed': (p: { count: number; label: string }) =>
    `已把 ${p.count} 個 Demo 存到 ${p.label}，未在左側開啟。如需在應用程式內編輯，可用「開啟資料夾」開啟該目錄`,
  'notice.demoSaveCleaned': (p: { count: number }) =>
    `已清理 ${p.count} 處上次未完成的 Demo 殘留`,
  'notice.demoSaveGone': '上次未完成的殘留目錄已不存在，無需清理',
  'notice.pathCopied': (p: { path: string }) => `已複製路徑：${p.path}`,
  'notice.copyFailed': '複製失敗，請重試',
  'notice.fileReadFailed': (p: { message: string }) => `讀取檔案失敗：${p.message}`,
  'notice.draftWillSaveTo': (p: { path: string }) =>
    `在左側輸入檔名並按 Enter 後，將儲存到 ${p.path}`,
  'notice.noWriteTarget': '該檔案不在本地資料夾中，沒有可寫回的位置，已改為下載',
  'notice.saveFailed': (p: { message: string }) => `儲存失敗：${p.message}`,
  'notice.externalChanged': (p: { name: string }) =>
    `${p.name} 在磁碟上已被修改，而目前仍有未儲存的修改；儲存將覆蓋磁碟上的版本`,
  'notice.reloaded': (p: { name: string }) => `${p.name} 已依磁碟上的最新內容重新載入`,
  'notice.createdButEmpty': (p: { name: string; message: string }) =>
    `${p.name} 建立好了，但內容沒寫進去：${p.message}`,

  // ---- 編輯器工具列 ----
  'editor.noFile': '未開啟檔案',
  'editor.dirty': '有未儲存的修改',
  'editor.save': '儲存',
  'editor.saving': '儲存中…',
  'editor.download': '下載',
  'editor.stop': '停止',
  'editor.runDisabled': '執行器只能執行 JavaScript / TypeScript',
  'editor.run': '執行',

  // ---- 頂部分頁列 ----
  'tab.close': '關閉分頁',
  'tab.scrollLeft': '向左捲動分頁',
  'tab.scrollRight': '向右捲動分頁',
  'tab.ctx.close': '關閉',
  'tab.ctx.closeOthers': '關閉其他',
  'tab.ctx.closeRight': '關閉右側',
  'tab.ctx.closeAll': '關閉全部',
  'confirm.closeMany.one': '關閉未儲存的分頁？',
  'confirm.closeMany.many': (p: { count: number }) => `關閉 ${p.count} 個未儲存的分頁？`,
  'confirm.closeMany.unsaved': '這些未儲存的修改將遺失。',
  'tab.closeAria': (p: { name: string }) => `關閉分頁 ${p.name}`,
  'confirm.closeTab.title': (p: { name: string }) => `關閉 ${p.name}？`,
  'confirm.closeTab.unsaved': '該檔案有未儲存的修改，關閉將遺失這些修改。',
  'confirm.closeTab.ok': '關閉',
  'confirm.newScratch.title': '清空草稿？',
  'confirm.newScratch.body': '草稿裡有未儲存的內容，新建會把它清掉。',
  'confirm.newScratch.ok': '清空並新建',
  'panes.resize': '拖曳調整編輯器與輸出的寬度',

  // ---- 底部狀態列 ----
  'statusbar.noFile': '未開啟檔案',
  'statusbar.ln': (p: { line: number; col: number }) => `Ln ${p.line}, Col ${p.col}`,
  'statusbar.spaces': (p: { size: number }) => `Spaces: ${p.size}`,
  'statusbar.tabSize': (p: { size: number }) => `Tab Size: ${p.size}`,
  'statusbar.js': 'JavaScript（.js 檔案，依 JavaScript 編譯執行）',
  'statusbar.ts': 'TypeScript（.ts 檔案，依 TypeScript 編譯執行）',

  // ---- 確認對話框 ----
  'confirm.cancel': '取消',
  'confirm.cancelSave.title': '停止儲存？',
  'confirm.cancelSave.body':
    '將停止寫入，並刪除已寫入的不完整檔案，回復到儲存前的狀態。',
  'confirm.cancelSave.ok': '停止儲存',
  'confirm.cleanupInterrupted.title': '清理上次未完成的儲存？',
  'confirm.cleanupInterrupted.bodyMultiple': (p: { labels: string }) =>
    `偵測到 ${p.labels} 裡有上次儲存未完成（可能重新整理或關閉頁面）留下的不完整檔案。是否刪除它們？`,
  'confirm.cleanupInterrupted.bodyRecord': (p: { label: string }) =>
    `上次儲存未完成（可能重新整理或關閉了頁面），${p.label} 裡留下了不完整的檔案。是否刪除它們？`,
  'confirm.cleanupInterrupted.ok': '清理',
  'confirm.saveDemos.title': '將所有 Demo 儲存到本機？',
  'confirm.saveDemos.body': (p: { count: number }) =>
    `將把全部 ${p.count} 個 Demo 儲存到你選擇的資料夾，並在其中建立子目錄。繼續嗎？`,
  'confirm.saveDemos.ok': '選擇資料夾',
  'confirm.openDemos.title': '在左側開啟儲存的資料夾？',
  'confirm.openDemos.body': (p: { count: number; label: string }) =>
    `已把 ${p.count} 個 Demo 存到 ${p.label}。是否在左側檔案欄中開啟這個資料夾，方便直接編輯？`,
  'confirm.openDemos.ok': '開啟',
  'confirm.delete.title': (p: { name: string }) => `刪除 ${p.name}？`,
  'confirm.delete.dir': (p: { path: string }) => `將刪除 ${p.path} 及其全部內容。`,
  'confirm.delete.file': (p: { path: string }) => `將刪除 ${p.path}。`,
  'confirm.delete.unsavedInDir': (p: { count: number }) =>
    `其中 ${p.count} 個已開啟的檔案包含未儲存的修改，將一併刪除。`,
  'confirm.delete.unsavedFile': '該檔案包含未儲存的修改，將一併刪除。',
  'confirm.delete.irreversible': '刪除將直接作用於磁碟，不會進入資源回收桶，也無法回復。',
  'confirm.delete.ok': '刪除',
  'confirm.closeRoot.title': (p: { name: string }) => `移除 ${p.name}？`,
  'confirm.closeRoot.listOnly':
    '僅將其從左側清單中移除，磁碟上的檔案不會發生任何變動。',
  'confirm.closeRoot.openFiles': (p: { count: number }) =>
    `其中開啟的 ${p.count} 個檔案將一併關閉。`,
  'confirm.closeRoot.openFilesUnsaved': (p: { count: number; unsaved: number }) =>
    `其中開啟的 ${p.count} 個檔案將一併關閉，${p.unsaved} 個含未儲存的修改會被捨棄。`,
  'confirm.closeRoot.reauth':
    '如需再次使用，需重新選擇該資料夾。基於瀏覽器安全限制，網頁無法自行保留此存取授權。',
  'confirm.closeRoot.ok': '移除',
  'confirm.renameDir.title': (p: { from: string; to: string }) =>
    `將 ${p.from} 改名為 ${p.to}？`,
  'confirm.renameDir.how':
    '瀏覽器不提供目錄重新命名的介面，因此需要將整個目錄複製為新名稱，待全部複製成功後再刪除原目錄。',
  'confirm.renameDir.size': (p: { files: number; size: string }) =>
    `目錄內共 ${p.files} 個檔案、${p.size}，複製期間請勿關閉頁面。`,
  'confirm.renameDir.risk':
    '複製出的檔案修改時間會更新為目前時間；若中途失敗，原目錄保持不變，但磁碟上會殘留一個未複製完成的新目錄。',
  'confirm.renameDir.ok': '改名',

  // ---- 檔案欄 ----
  'sidebar.title': '檔案',
  'sidebar.expand': '展開檔案欄',
  'sidebar.collapse': '收起檔案欄',
  'sidebar.newScratch': '新增草稿',
  'sidebar.resize': '拖曳調整寬度（按兩下復位）',
  'sidebar.localDirs': '本機資料夾',
  'sidebar.newFileIn': (p: { target: string }) => `在 ${p.target} 中新增檔案`,
  'sidebar.newDirIn': (p: { target: string }) => `在 ${p.target} 中新增資料夾`,
  'sidebar.refreshTarget': (p: { target: string }) => `重新讀取 ${p.target}`,
  'sidebar.openAnother': '再開啟一個資料夾',
  'sidebar.openFolder': '開啟資料夾',
  // 說明文字裡引用了頂欄那個按鈕的名字，所以收一個 label 參數，由呼叫處傳 t('header.import')
  'sidebar.unsupported': (p: { label: string }) =>
    `目前瀏覽器不支援開啟本機資料夾（只有 Chrome / Edge 等 Chromium 核心瀏覽器實作了這個 API）。可以用頂部的「${p.label}」開啟單一檔案。`,
  'sidebar.needAuth': '需要授權',
  'sidebar.reauthHint': (p: { label: string }) =>
    `標著「${p.label}」的目錄按一下就能回復 —— 瀏覽器要求每次重開頁面都確認一次`,
  'sidebar.loading': '讀取中…',
  'sidebar.unsaved': '未儲存',
  'sidebar.emptyDir': '空目錄',
  'sidebar.truncated': (p: { max: number }) => `檔案太多，只顯示了前 ${p.max} 個`,
  'sidebar.rootLocked': (p: { name: string }) =>
    `按一下此處重新取得 ${p.name} 的存取權限`,
  'sidebar.rootHint': (p: { name: string }) =>
    `${p.name}（按一下展開 / 收起，同時設為新增目標；按右鍵有更多操作）`,
  'sidebar.rootMenu': (p: { name: string }) => `對 ${p.name} 的操作`,
  'sidebar.renameAria': '新名稱',
  'sidebar.newFileAria': '新檔名',
  'sidebar.newDirAria': '新目錄名',
  'sidebar.demos': 'Demo 片段',
  'sidebar.demosDirty': '有未儲存的 Demo',
  'sidebar.saveDemos': '把所有 Demo 存到本機資料夾',
  'sidebar.cancelSave': '取消儲存',
  'sidebar.cancellingSave': '正在取消…',
  'sidebar.savingDemos': (p: { done: number; total: number }) =>
    `正在儲存到本機 ${p.done}/${p.total}`,
  'sidebar.savingDemosFile': (p: { name: string; done: number; total: number }) =>
    `正在寫入 ${p.name}（${p.done}/${p.total}）`,
  'sidebar.uncategorized': '未分類',

  // ---- 右鍵 / 下拉選單 ----
  'menu.rename': '重新命名',
  'menu.delete': '刪除',
  'menu.copyPath': '複製路徑',
  'menu.newFile': '新增檔案',
  'menu.newDir': '新增資料夾',
  'menu.removeRoot': '移除目錄',

  // ---- Console ----
  'console.empty': '// console 輸出會顯示在這裡',
  'console.clear': '清空',
  'console.omitted': (n: number) => `已省略最早的 ${n} 條`,

  /* ---- 預設名稱 ----
     這三條會真的落到磁碟上（新增時的預填名）。 */
  'file.untitled': (p: { ext: string }) => `未命名.${p.ext}`,
  'file.newDir': '新增資料夾',
  'file.scratch': '草稿',

  // ---- 名稱驗證（輸入框下面那行紅字） ----
  'validate.empty': '名稱不能為空',
  'validate.tooLong': '名稱過長，最多 255 個字元',
  'validate.dots': '不能使用「.」或「..」作為名稱',
  'validate.slash': '名稱中不能包含斜線，只能建立在目前目錄下',
  'validate.illegalChars': '名稱中不能包含 < > : " | ? * 等字元',
  'validate.control': '名稱中不能包含控制字元',
  'validate.trailing': '名稱不能以點或空格結尾',
  'validate.reserved': (p: { name: string }) =>
    `名稱 ${p.name} 與系統保留名衝突，請更換其他名稱`,
  'validate.exists': (p: { name: string }) => `名稱 ${p.name} 已存在，請更換其他名稱`,
  'validate.createExt': '只能新增可編輯的文字檔（.js / .ts / .json / .md 等）',
  'validate.renameExt': '改成這個副檔名就打不開了，用 .js / .ts / .json / .md 這類',

  // ---- 檔案系統 ----
  'err.fs.noPicker': '目前瀏覽器不支援開啟本機目錄',
  'err.fs.notAllowed': '沒有權限存取該檔案或目錄（可能被其他程式佔用、唯讀，或授權已被撤銷）',
  'err.fs.tooLarge': (p: { name: string; size: string; max: string }) =>
    `${p.name} 有 ${p.size}，超過 ${p.max} 上限，沒有開啟`,
  'err.fs.binary': (p: { name: string }) => `${p.name} 看起來是二進位檔，未開啟`,
  'err.fs.nameTaken': (p: { name: string; kind: 'file' | 'directory' }) =>
    `名稱 ${p.name} 已存在（${p.kind === 'file' ? '檔案' : '目錄'}），請更換其他名稱`,
  'err.fs.uniqueExhausted': (p: { base: string }) =>
    `${p.base} 以及它後面 99 個編號都被佔了，請先清理一下目標資料夾`,
  'err.fs.badBundlePath': (p: { path: string }) => `無效的檔案路徑：${p.path}`,
  'err.fs.caseRenameUnsupported':
    '目前瀏覽器不支援僅大小寫不同的名稱修改，請先改為其他名稱，再改為目標名稱',
  'err.fs.ignoredDirInTree': (p: { name: string }) =>
    `目錄內包含 ${p.name}，複製這種目錄沒有意義，請在系統的檔案管理員中重新命名`,
  'err.fs.treeTooManyFiles': (p: { max: number }) =>
    `目錄內檔案超過 ${p.max} 個，整體複製的開銷過大，請在系統的檔案管理員中重新命名`,
  'err.fs.treeTooLarge': (p: { max: string }) =>
    `目錄內容超過 ${p.max}，整體複製的開銷過大，請在系統的檔案管理員中重新命名`,

  // ---- IndexedDB ----
  'err.idb.open': 'IndexedDB 開啟失敗',
  'err.idb.blocked': 'IndexedDB 被其他分頁阻塞',
  'err.idb.abort': 'IndexedDB 交易被中止',
  'err.idb.fail': 'IndexedDB 交易失敗',

  // ---- 編譯 / 執行 ----
  'err.compile.failed': (p: { issues: CompileIssue[] }) =>
    `TypeScript 編譯失敗：${p.issues
      .map(
        (i) =>
          `${i.text || '未知錯誤'}${i.loc ? `（第 ${i.loc.line} 行第 ${i.loc.column} 列）` : ''}`
      )
      .join('；')}`,
  'err.compile.raw': (p: { message: string }) => `TypeScript 編譯失敗：${p.message}`,
  'err.imports.bare': (p) =>
    `${p.from} 匯入了「${p.spec}」：它是 npm 套件，目前還不支援匯入第三方套件，只支援以相對路徑匯入已開啟目錄裡的檔案。`,
  'err.imports.noRoot':
    '這個檔案不在已開啟的目錄裡（草稿、內建範例或匯入的檔案），無法解析相對路徑匯入。把它儲存到目錄裡再執行。',
  'err.imports.notFound': (p) => `${p.from} 匯入的「${p.spec}」找不到，試過：${p.tried.join('、')}。`,
  'err.imports.outsideRoot': (p) => `${p.from} 匯入的「${p.spec}」超出了已開啟的目錄，不能匯入。`,
  'err.imports.unsupportedType': (p) =>
    `${p.from} 匯入的「${p.spec}」不是可執行的 JS / TS 檔案，目前只支援 .js、.mjs、.ts、.mts。`,
  'err.imports.cycle': (p) =>
    `存在循環匯入：${p.chain.join(' → ')}。目前的執行環境不支援循環相依，請打斷其中一環。`,
  'err.imports.tooMany': (p) => `匯入的檔案超過 ${p.limit} 個，已停止。檢查是否匯入了 node_modules 之類的目錄。`,

  // ---- 工作區 ----
  'err.save.cancelled': '儲存已取消',
  'err.ws.rootMoved': (p: { name: string }) =>
    `目錄 ${p.name} 已不在原位置，已將其從清單中移除`,
  'err.ws.permissionDenied': (p: { name: string }) =>
    `無法取得 ${p.name} 的存取權限，可再次按一下，或將其關閉後重新開啟`,
  'err.ws.permissionUnavailable': '目前瀏覽器無法回復上次的目錄，請重新開啟資料夾',
  'err.ws.dirStale': (p: { name: string }) => `目錄 ${p.name} 已無法開啟，請重新整理`,
  'err.ws.dirGone': '該目錄已不在磁碟上，請重新整理後再試',
  'err.ws.parentGone': '目標目錄已經不在了，重新整理一下再試',
  'err.ws.parentStale': '目標目錄已經打不開了，試試重新整理',
  'err.ws.holderGone': '它所屬的目錄已經不在了，重新整理一下再試',
  'err.ws.entryStale': (p: { name: string }) => `項目 ${p.name} 已無法開啟，請重新整理`,
  'err.ws.entryMissing': (p: { name: string }) => `項目 ${p.name} 已不在磁碟上，請重新整理`,
  'err.ws.entryFailed': (p: { name: string; message: string }) =>
    `項目 ${p.name}：${p.message}`,
}
