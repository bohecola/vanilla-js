/*
  英文字典。

  `: Dict` 这个显式标注是这套方案的全部机器保障 —— 少一条键、多一条键、参数名或参数类型
  和中文那侧不一致，都会在 `tsc --noEmit` 里报出来，不会静悄悄漏出一句中文。
  所以函数的参数不用（也不该）再写类型，由 Dict 推出来。

  两个语言项的名字刻意不翻译：dict.zh 里的「中文」和这里的 English 都写死在切换器里，
  见 App.tsx —— 用户看不懂当前语言时，正需要用目标语言认出自己那一项。
*/
import type { Dict } from './dict.zh'

export const en: Dict = {
  // ---- 文档级 ----
  'html.lang': 'en',
  'html.title': 'Jotter · JS / TS scratchpad',
  'locale.bcp47': 'en-US',

  // ---- 顶栏 ----
  'header.import': 'Import',
  'header.theme': 'Theme',
  'header.theme.dark': 'Dark',
  'header.theme.light': 'Light',
  'header.theme.system': 'System',
  'header.lang': 'Language',
  'header.lang.system': 'System',
  'header.github': 'GitHub repository',

  // ---- 提示条 ----
  'notice.close': 'Dismiss',
  'notice.demoLoadFailed': (p) => `Failed to load the demo: ${p.message}`,
  'notice.notTextFile': (p) => `${p.name} is not an editable text file, so it was not opened`,
  'notice.deleted': (p) => `Deleted ${p.name}`,
  'notice.rootRemoved': (p) => `Removed ${p.name}. Nothing on disk changed.`,
  'notice.renamed': (p) => `Renamed to ${p.name}`,
  'notice.saved': (p) => `Saved ${p.name}`,
  'notice.demoReadFailed': (p) => `Failed to read the demo sources: ${p.message}`,
  'notice.demosSaved': (p) =>
    `Saved ${p.count} demo${p.count === 1 ? '' : 's'} to ${p.label}. You can edit them now — Ctrl+S writes back to disk.`,
  'notice.demosSavedClosed': (p) =>
    `Saved ${p.count} demo${p.count === 1 ? '' : 's'} to ${p.label}; not opened on the left. To edit them here, use "Open folder" on that directory.`,
  'notice.demoSaveCleaned': (p) =>
    `Cleaned up ${p.count} incomplete demo folder${p.count === 1 ? '' : 's'} left from a previous save`,
  'notice.demoSaveGone': 'The incomplete folder from the previous save is already gone; nothing to clean up',
  'notice.pathCopied': (p: { path: string }) => `Copied path: ${p.path}`,
  'notice.copyFailed': 'Copy failed, please try again',
  'notice.fileReadFailed': (p) => `Failed to read the file: ${p.message}`,
  'notice.draftWillSaveTo': (p) =>
    `Type a file name on the left and press Enter to save it to ${p.path}`,
  'notice.noWriteTarget':
    'This file is not inside a local folder, so there is nowhere to write it back — downloaded instead',
  'notice.saveFailed': (p) => `Save failed: ${p.message}`,
  'notice.externalChanged': (p) =>
    `${p.name} changed on disk while you still have unsaved edits; saving will overwrite the version on disk`,
  'notice.reloaded': (p) => `${p.name} was reloaded from the latest version on disk`,
  'notice.createdButEmpty': (p) =>
    `${p.name} was created, but its content could not be written: ${p.message}`,
  // ---- 编辑器工具栏 ----
  'editor.noFile': 'No file open',
  'editor.dirty': 'Unsaved changes',
  'editor.save': 'Save',
  'editor.saving': 'Saving…',
  'editor.download': 'Download',
  'editor.stop': 'Stop',
  'editor.runDisabled': 'The runner only executes JavaScript / TypeScript',

  // ---- 确认弹窗 ----
  'confirm.cancel': 'Cancel',
  'confirm.cancelSave.title': 'Stop the save?',
  'confirm.cancelSave.body':
    'Writing will stop and the incomplete files already written will be deleted, restoring to before the save.',
  'confirm.cancelSave.ok': 'Stop save',
  'confirm.cleanupInterrupted.title': 'Clean up an incomplete save?',
  'confirm.cleanupInterrupted.bodyMultiple': (p) =>
    `Incomplete files from an interrupted save were found in ${p.labels}. Delete them?`,
  'confirm.cleanupInterrupted.bodyRecord': (p) =>
    `A previous save was interrupted (page refresh or close); incomplete files were left in ${p.label}. Delete them?`,
  'confirm.cleanupInterrupted.ok': 'Clean up',
  'confirm.saveDemos.title': 'Save all demos locally?',
  'confirm.saveDemos.body': (p) =>
    `All ${p.count} demo${p.count === 1 ? '' : 's'} will be saved into the folder you pick, creating a subfolder there. Continue?`,
  'confirm.saveDemos.ok': 'Choose folder',
  'confirm.openDemos.title': 'Open the saved folder on the left?',
  'confirm.openDemos.body': (p) =>
    `Saved ${p.count} demo${p.count === 1 ? '' : 's'} to ${p.label}. Open this folder in the file panel on the left to edit them?`,
  'confirm.openDemos.ok': 'Open',
  'confirm.delete.title': (p) => `Delete ${p.name}?`,
  'confirm.delete.dir': (p) => `This will delete ${p.path} and everything inside it.`,
  'confirm.delete.file': (p) => `This will delete ${p.path}.`,
  'confirm.delete.unsavedInDir': (p) =>
    `${p.count} open file${p.count === 1 ? '' : 's'} inside it ${p.count === 1 ? 'has' : 'have'} unsaved changes and will be deleted too.`,
  'confirm.delete.unsavedFile': 'This file has unsaved changes, which will be deleted too.',
  'confirm.delete.irreversible':
    'Deleting writes straight to disk: no recycle bin, and no way to undo it.',
  'confirm.delete.ok': 'Delete',
  'confirm.closeRoot.title': (p) => `Remove ${p.name}?`,
  'confirm.closeRoot.listOnly':
    'This only takes it off the list on the left. Nothing on disk changes.',
  'confirm.closeRoot.openFiles': (p) =>
    `${p.count} open file${p.count === 1 ? '' : 's'} from it will be closed.`,
  'confirm.closeRoot.openFilesUnsaved': (p) =>
    `${p.count} open file${p.count === 1 ? '' : 's'} from it will be closed, and ${p.unsaved} with unsaved changes will be discarded.`,
  'confirm.closeRoot.reauth':
    'To use it again you have to pick the folder once more. Browser security rules keep a page from holding on to that permission by itself.',
  'confirm.closeRoot.ok': 'Remove',
  'confirm.renameDir.title': (p) => `Rename ${p.from} to ${p.to}?`,
  'confirm.renameDir.how':
    'Browsers offer no directory rename API, so the whole folder is copied under the new name and the original is deleted only once every file has been copied.',
  'confirm.renameDir.size': (p) =>
    `${p.files} file${p.files === 1 ? '' : 's'}, ${p.size} in total. Please keep this page open while it copies.`,
  'confirm.renameDir.risk':
    'Copied files get their modification time reset to now. If the copy fails halfway the original stays untouched, but a half-copied folder is left on disk.',
  'confirm.renameDir.ok': 'Rename',
  // ---- 文件栏 ----
  'sidebar.title': 'Files',
  'sidebar.expand': 'Show file panel',
  'sidebar.collapse': 'Hide file panel',
  'sidebar.newScratch': 'New scratch',
  'sidebar.resize': 'Drag to resize (double-click to reset)',
  'sidebar.localDirs': 'Local folders',
  'sidebar.newFileIn': (p) => `New file in ${p.target}`,
  'sidebar.newDirIn': (p) => `New folder in ${p.target}`,
  'sidebar.refreshTarget': (p) => `Reload ${p.target}`,
  'sidebar.openAnother': 'Open another folder',
  'sidebar.openFolder': 'Open folder',
  'sidebar.unsupported': (p) =>
    `This browser cannot open local folders — only Chromium-based browsers such as Chrome and Edge implement that API. You can still use "${p.label}" at the top to open a single file.`,
  'sidebar.needAuth': 'Needs access',
  'sidebar.reauthHint': (p) =>
    `Folders marked "${p.label}" come back with a single click — the browser asks again every time the page reloads`,
  'sidebar.loading': 'Loading…',
  'sidebar.unsaved': 'Unsaved',
  'sidebar.emptyDir': 'Empty folder',
  'sidebar.truncated': (p) => `Too many entries, showing the first ${p.max}`,
  'sidebar.rootLocked': (p) => `Click here to grant access to ${p.name} again`,
  'sidebar.rootHint': (p) =>
    `${p.name} (click to expand / collapse and make it the target for new entries; right-click for more)`,
  'sidebar.rootMenu': (p) => `Actions for ${p.name}`,
  'sidebar.renameAria': 'New name',
  'sidebar.newFileAria': 'New file name',
  'sidebar.newDirAria': 'New folder name',
  'sidebar.demos': 'Demo snippets',
  'sidebar.demosDirty': 'Unsaved demo changes',
  'sidebar.saveDemos': 'Save every demo to a local folder',
  'sidebar.cancelSave': 'Cancel save',
  'sidebar.cancellingSave': 'Cancelling…',
  'sidebar.savingDemos': (p) => `Saving to local ${p.done}/${p.total}`,
  'sidebar.savingDemosFile': (p) => `Writing ${p.name} (${p.done}/${p.total})`,
  'sidebar.uncategorized': 'Uncategorized',

  // ---- 右键 / 下拉菜单 ----
  'menu.rename': 'Rename',
  'menu.delete': 'Delete',
  'menu.copyPath': 'Copy path',
  'sidebar.currentPath': (p: { path: string }) => `Current folder: ${p.path}`,
  'menu.newFile': 'New file',
  'menu.newDir': 'New folder',
  'menu.refresh': 'Refresh',
  'menu.removeRoot': 'Remove folder',

  // ---- Console ----
  'console.empty': '// console output shows up here',

  // ---- 默认名字（会写到磁盘上） ----
  'file.untitled': (p) => `Untitled.${p.ext}`,
  'file.newDir': 'New Folder',
  'file.scratch': 'Scratch',
  // ---- 命名校验 ----
  'validate.empty': 'The name cannot be empty',
  'validate.tooLong': 'The name is too long — 255 characters at most',
  'validate.dots': '"." and ".." cannot be used as a name',
  'validate.slash':
    'The name cannot contain a slash — new entries always go into the current folder',
  'validate.illegalChars': 'The name cannot contain < > : " | ? * or similar characters',
  'validate.control': 'The name cannot contain control characters',
  'validate.trailing': 'The name cannot end with a dot or a space',
  'validate.reserved': (p) => `${p.name} collides with a reserved system name, please pick another`,
  'validate.exists': (p) => `${p.name} already exists, please pick another name`,
  'validate.createExt':
    'Only editable text files can be created (.js / .ts / .json / .md and the like)',
  'validate.renameExt':
    'That extension would make the file unopenable here — use .js / .ts / .json / .md or similar',

  // ---- 文件系统 ----
  'err.fs.noPicker': 'This browser cannot open local folders',
  'err.fs.tooLarge': (p) => `${p.name} is ${p.size}, over the ${p.max} limit, so it was not opened`,
  'err.fs.binary': (p) => `${p.name} looks like a binary file, so it was not opened`,
  'err.fs.nameTaken': (p) =>
    `${p.name} already exists (${p.kind === 'file' ? 'file' : 'folder'}), please pick another name`,
  'err.fs.uniqueExhausted': (p) =>
    `${p.base} and the 99 numbered names after it are all taken, clean up the target folder first`,
  'err.fs.badBundlePath': (p) => `Invalid file path: ${p.path}`,
  'err.fs.caseRenameUnsupported':
    'This browser cannot rename an entry to a name that differs only in case. Rename it to something else first, then to the name you want.',
  'err.fs.ignoredDirInTree': (p) =>
    `The folder contains ${p.name}; copying a folder like that makes no sense. Rename it in your system file manager instead.`,
  'err.fs.treeTooManyFiles': (p) =>
    `The folder holds more than ${p.max} file${p.max === 1 ? '' : 's'}, which is too much to copy wholesale. Rename it in your system file manager instead.`,
  'err.fs.treeTooLarge': (p) =>
    `The folder holds more than ${p.max}, which is too much to copy wholesale. Rename it in your system file manager instead.`,

  // ---- IndexedDB ----
  'err.idb.open': 'Failed to open IndexedDB',
  'err.idb.blocked': 'IndexedDB is blocked by another tab',
  'err.idb.abort': 'The IndexedDB transaction was aborted',
  'err.idb.fail': 'The IndexedDB transaction failed',
  // ---- 编译 / 运行 ----
  'err.compile.initFailed': (p) =>
    `Could not start the TypeScript compiler (esbuild wasm failed to load): ${p.message}`,
  'err.compile.failed': (p) =>
    `TypeScript compilation failed: ${p.issues
      .map(
        (i) =>
          `${i.text || 'Unknown error'}${i.loc ? ` (line ${i.loc.line}, column ${i.loc.column})` : ''}`
      )
      .join('; ')}`,
  'err.compile.raw': (p) => `TypeScript compilation failed: ${p.message}`,
  'err.imports.unresolved': (p) =>
    `The code imports ${p.specs.map((s) => `"${s}"`).join(', ')}, and this runtime cannot resolve module imports. ` +
    `The runner is a Web Worker with no module resolver — inline the dependency into the same file before running.`,

  // ---- 工作区 ----
  'err.save.cancelled': 'Save cancelled',
  'err.ws.rootMoved': (p) =>
    `The folder ${p.name} is no longer where it was, so it has been taken off the list`,
  'err.ws.permissionDenied': (p) =>
    `Could not get access to ${p.name}. Click it again, or close it and open it anew.`,
  'err.ws.permissionUnavailable':
    'This browser cannot restore the folder from last time, please open it again',
  'err.ws.dirStale': (p) => `The folder ${p.name} can no longer be opened, please refresh`,
  'err.ws.dirGone': 'That folder is no longer on disk, please refresh and try again',
  'err.ws.parentGone': 'The target folder is gone, refresh and try again',
  'err.ws.parentStale': 'The target folder can no longer be opened, try refreshing',
  'err.ws.holderGone': 'The folder it lives in is gone, refresh and try again',
  'err.ws.entryStale': (p) => `${p.name} can no longer be opened, please refresh`,
  'err.ws.entryMissing': (p) => `${p.name} is no longer on disk, please refresh`,
  'err.ws.entryFailed': (p) => `${p.name}: ${p.message}`,
}
