/*
  中文字典 —— 界面文案的唯一真源，改文案先改这里。

  值有两种形态：
  - 字符串：固定文案。
  - 函数：带插值 / 带条件 / 带数量的文案。中文这侧的实现就是原先散在各文件里的那些模板串。

  标点也归字典管。「」、顿号、全角冒号都是语言的一部分，硬拼在业务代码里就只能是中文，
  所以 compile / imports 那几处原来在代码里 join 出来的句子，这里改成收结构化参数、
  由字典自己拼（英文那侧换成 "…" 和 ", "）。

  英文字典见 dict.en.ts，它显式标注 `: Dict` —— 少一条键、多一条键、参数形状不对，
  都是 tsc 报错，不会静悄悄漏掉。

  键名按出处分组：html / locale / header / notice / editor / confirm / sidebar / menu /
  console / file / validate / err.*。
*/

/** esbuild 的一条编译错误。位置的写法（「第 N 行第 M 列」）由字典决定，所以只传数字。 */
export interface CompileIssue {
  text: string
  loc: { line: number; column: number } | null
}

export const zh = {
  // ---- 文档级 ----
  'html.lang': 'zh-CN',
  'html.title': 'Jotter · JS / TS 代码草稿纸',
  /** toLocaleTimeString 等 Intl API 用的 BCP 47 标签 */
  'locale.bcp47': 'zh-CN',

  // ---- 顶栏 ----
  'header.import': '导入',
  'header.theme': '切换主题',
  'header.theme.dark': '深色',
  'header.theme.light': '浅色',
  'header.theme.system': '跟随系统',
  'header.lang': '切换语言',
  'header.lang.system': '跟随系统',
  'header.github': 'GitHub 仓库',

  // ---- 提示条 ----
  'notice.close': '关闭提示',
  'notice.demoLoadFailed': (p: { message: string }) => `加载 Demo 失败：${p.message}`,
  'notice.notTextFile': (p: { name: string }) => `${p.name} 不是能编辑的文本文件，没有打开`,
  'notice.deleted': (p: { name: string }) => `已删除 ${p.name}`,
  'notice.rootRemoved': (p: { name: string }) => `已移除 ${p.name}，磁盘上的文件没有变化`,
  'notice.renamed': (p: { name: string }) => `已改名为 ${p.name}`,
  'notice.saved': (p: { name: string }) => `已保存 ${p.name}`,
  'notice.demoReadFailed': (p: { message: string }) => `读取 Demo 源码失败：${p.message}`,
  'notice.demosSaved': (p: { count: number; label: string }) =>
    `已把 ${p.count} 个 Demo 存到 ${p.label}，现在可以直接改，Ctrl+S 写回磁盘`,
  'notice.demosSavedClosed': (p: { count: number; label: string }) =>
    `已把 ${p.count} 个 Demo 存到 ${p.label}，未在左侧打开。如需在应用内编辑，可用「打开文件夹」打开该目录`,
  'notice.demoSaveCleaned': (p: { count: number }) =>
    `已清理 ${p.count} 处上次未完成的 Demo 残留`,
  'notice.demoSaveGone': '上次未完成的残留目录已不存在，无需清理',
  'notice.pathCopied': (p: { path: string }) => `已复制路径：${p.path}`,
  'notice.copyFailed': '复制失败，请重试',
  'notice.fileReadFailed': (p: { message: string }) => `读取文件失败：${p.message}`,
  'notice.draftWillSaveTo': (p: { path: string }) => `在左侧输入文件名并回车后，将保存到 ${p.path}`,
  'notice.noWriteTarget': '该文件不在本地目录中，没有可写回的位置，已改为下载',
  'notice.saveFailed': (p: { message: string }) => `保存失败：${p.message}`,
  'notice.externalChanged': (p: { name: string }) =>
    `${p.name} 在磁盘上已被修改，而当前仍有未保存的修改；保存将覆盖磁盘上的版本`,
  'notice.reloaded': (p: { name: string }) => `${p.name} 已按磁盘上的最新内容重新加载`,
  'notice.createdButEmpty': (p: { name: string; message: string }) =>
    `${p.name} 建好了，但内容没写进去：${p.message}`,

  // ---- 编辑器工具栏 ----
  'editor.noFile': '未打开文件',
  'editor.dirty': '有未保存的修改',
  'editor.save': '保存',
  'editor.saving': '保存中…',
  'editor.download': '下载',
  'editor.stop': '停止',
  'editor.runDisabled': '运行器只能执行 JavaScript / TypeScript',
  'editor.run': '运行',

  // ---- 顶部标签栏 ----
  'tab.close': '关闭标签',
  'tab.scrollLeft': '向左滚动标签',
  'tab.scrollRight': '向右滚动标签',
  'tab.ctx.close': '关闭',
  'tab.ctx.closeOthers': '关闭其他',
  'tab.ctx.closeRight': '关闭右侧',
  'tab.ctx.closeAll': '关闭全部',
  'confirm.closeMany.one': '关闭未保存的标签？',
  'confirm.closeMany.many': (p: { count: number }) =>
    `关闭 ${p.count} 个未保存的标签？`,
  'confirm.closeMany.unsaved': '这些未保存的修改将丢失。',
  'tab.closeAria': (p: { name: string }) => `关闭标签 ${p.name}`,
  'confirm.closeTab.title': (p: { name: string }) => `关闭 ${p.name}？`,
  'confirm.closeTab.unsaved': '该文件有未保存的修改，关闭将丢失这些修改。',
  'confirm.closeTab.ok': '关闭',
  'panes.resize': '拖拽调整编辑器与输出的宽度',

  // ---- 底部状态栏 ----
  'statusbar.noFile': '未打开文件',
  'statusbar.ln': (p: { line: number; col: number }) => `Ln ${p.line}, Col ${p.col}`,
  'statusbar.spaces': (p: { size: number }) => `Spaces: ${p.size}`,
  'statusbar.tabSize': (p: { size: number }) => `Tab Size: ${p.size}`,
  'statusbar.js': 'JavaScript（.js 文件，按 JavaScript 编译运行）',
  'statusbar.ts': 'TypeScript（.ts 文件，按 TypeScript 编译运行）',

  // ---- 确认弹窗 ----
  'confirm.cancel': '取消',
  'confirm.cancelSave.title': '停止保存？',
  'confirm.cancelSave.body': '将停止写入，并删除已写入的不完整文件，恢复到保存前的状态。',
  'confirm.cancelSave.ok': '停止保存',
  'confirm.cleanupInterrupted.title': '清理上次未完成的保存？',
  'confirm.cleanupInterrupted.bodyMultiple': (p: { labels: string }) =>
    `检测到 ${p.labels} 里有上次保存未完成（可能刷新或关闭页面）留下的不完整文件。是否删除它们？`,
  'confirm.cleanupInterrupted.bodyRecord': (p: { label: string }) =>
    `上次保存未完成（可能刷新或关闭了页面），${p.label} 里留下了不完整的文件。是否删除它们？`,
  'confirm.cleanupInterrupted.ok': '清理',
  'confirm.saveDemos.title': '保存全部 Demo 到本地？',
  'confirm.saveDemos.body': (p: { count: number }) =>
    `将把全部 ${p.count} 个 Demo 保存到你选择的文件夹，并在其中创建子目录。继续吗？`,
  'confirm.saveDemos.ok': '选择文件夹',
  'confirm.openDemos.title': '在左侧打开保存的文件夹？',
  'confirm.openDemos.body': (p: { count: number; label: string }) =>
    `已把 ${p.count} 个 Demo 存到 ${p.label}。是否在左侧文件栏中打开这个文件夹，方便直接编辑？`,
  'confirm.openDemos.ok': '打开',
  'confirm.delete.title': (p: { name: string }) => `删除 ${p.name}？`,
  'confirm.delete.dir': (p: { path: string }) => `将删除 ${p.path} 及其全部内容。`,
  'confirm.delete.file': (p: { path: string }) => `将删除 ${p.path}。`,
  'confirm.delete.unsavedInDir': (p: { count: number }) =>
    `其中 ${p.count} 个已打开的文件包含未保存的修改，将一并删除。`,
  'confirm.delete.unsavedFile': '该文件包含未保存的修改，将一并删除。',
  'confirm.delete.irreversible': '删除将直接作用于磁盘，不会进入回收站，也无法撤销。',
  'confirm.delete.ok': '删除',
  'confirm.closeRoot.title': (p: { name: string }) => `移除 ${p.name}？`,
  'confirm.closeRoot.listOnly': '仅将其从左侧列表中移除，磁盘上的文件不会发生任何变动。',
  'confirm.closeRoot.openFiles': (p: { count: number }) =>
    `其中打开的 ${p.count} 个文件将一并关闭。`,
  'confirm.closeRoot.openFilesUnsaved': (p: { count: number; unsaved: number }) =>
    `其中打开的 ${p.count} 个文件将一并关闭，${p.unsaved} 个含未保存的修改会被丢弃。`,
  'confirm.closeRoot.reauth':
    '如需再次使用，需重新选择该文件夹。出于浏览器安全限制，网页无法自行保留此访问授权。',
  'confirm.closeRoot.ok': '移除',
  'confirm.renameDir.title': (p: { from: string; to: string }) => `将 ${p.from} 改名为 ${p.to}？`,
  'confirm.renameDir.how':
    '浏览器不提供目录重命名接口，因此需要将整个目录复制为新名称，待全部复制成功后再删除原目录。',
  'confirm.renameDir.size': (p: { files: number; size: string }) =>
    `目录内共 ${p.files} 个文件、${p.size}，复制期间请勿关闭页面。`,
  'confirm.renameDir.risk':
    '复制出的文件修改时间会更新为当前时间；若中途失败，原目录保持不变，但磁盘上会残留一个未复制完成的新目录。',
  'confirm.renameDir.ok': '改名',

  // ---- 文件栏 ----
  'sidebar.title': '文件',
  'sidebar.expand': '展开文件栏',
  'sidebar.collapse': '收起文件栏',
  'sidebar.newScratch': '新建草稿',
  'sidebar.resize': '拖动调整宽度（双击复位）',
  'sidebar.localDirs': '本地目录',
  'sidebar.newFileIn': (p: { target: string }) => `在 ${p.target} 中新建文件`,
  'sidebar.newDirIn': (p: { target: string }) => `在 ${p.target} 中新建文件夹`,
  'sidebar.refreshTarget': (p: { target: string }) => `重新读取 ${p.target}`,
  'sidebar.openAnother': '再打开一个文件夹',
  'sidebar.openFolder': '打开文件夹',
  // 说明文字里引用了顶栏那个按钮的名字，所以收一个 label 参数，由调用处传 t('header.import')
  'sidebar.unsupported': (p: { label: string }) =>
    `当前浏览器不支持打开本地文件夹（只有 Chrome / Edge 等 Chromium 内核浏览器实现了这个 API）。可以用顶部的「${p.label}」打开单个文件。`,
  'sidebar.needAuth': '需要授权',
  'sidebar.reauthHint': (p: { label: string }) =>
    `标着「${p.label}」的目录点一下就能恢复 —— 浏览器要求每次重开页面都确认一次`,
  'sidebar.loading': '读取中…',
  'sidebar.unsaved': '未保存',
  'sidebar.emptyDir': '空目录',
  'sidebar.truncated': (p: { max: number }) => `文件太多，只显示了前 ${p.max} 个`,
  'sidebar.rootLocked': (p: { name: string }) => `点击此处重新获取 ${p.name} 的访问权限`,
  'sidebar.rootHint': (p: { name: string }) =>
    `${p.name}（点击展开 / 收起，同时设为新建目标；右键有更多操作）`,
  'sidebar.rootMenu': (p: { name: string }) => `对 ${p.name} 的操作`,
  'sidebar.renameAria': '新名字',
  'sidebar.newFileAria': '新文件名',
  'sidebar.newDirAria': '新目录名',
  'sidebar.demos': 'Demo 片段',
  'sidebar.demosDirty': '有未保存的 Demo',
  'sidebar.saveDemos': '把全部 Demo 存到本地文件夹',
  'sidebar.cancelSave': '取消保存',
  'sidebar.cancellingSave': '正在取消…',
  'sidebar.savingDemos': (p: { done: number; total: number }) =>
    `正在保存到本地 ${p.done}/${p.total}`,
  'sidebar.savingDemosFile': (p: { name: string; done: number; total: number }) =>
    `正在写入 ${p.name}（${p.done}/${p.total}）`,
  'sidebar.uncategorized': '未分类',
  // ---- 右键 / 下拉菜单 ----
  'menu.rename': '重命名',
  'menu.delete': '删除',
  'menu.copyPath': '复制路径',
  'sidebar.currentPath': (p: { path: string }) => `当前目录：${p.path}`,
  'menu.newFile': '新建文件',
  'menu.newDir': '新建文件夹',
  'menu.refresh': '刷新',
  'menu.removeRoot': '移除目录',

  // ---- Console ----
  'console.empty': '// console 输出会显示在这里',

  /* ---- 默认名字 ----
     这三条会真的落到磁盘上（新建时的预填名）。与 VS Code、资源管理器一致：
     界面是英文，新建出来的就叫 Untitled.js，而不是硬留一个中文名。 */
  'file.untitled': (p: { ext: string }) => `未命名.${p.ext}`,
  'file.newDir': '新建文件夹',
  'file.scratch': '草稿',

  // ---- 命名校验（输入框下面那行红字） ----
  'validate.empty': '名称不能为空',
  'validate.tooLong': '名称过长，最多 255 个字符',
  'validate.dots': '不能使用「.」或「..」作为名称',
  'validate.slash': '名称中不能包含斜杠，只能创建在当前目录下',
  'validate.illegalChars': '名称中不能包含 < > : " | ? * 等字符',
  'validate.control': '名称中不能包含控制字符',
  'validate.trailing': '名称不能以点或空格结尾',
  'validate.reserved': (p: { name: string }) => `名称 ${p.name} 与系统保留名冲突，请更换其他名称`,
  'validate.exists': (p: { name: string }) => `名称 ${p.name} 已存在，请更换其他名称`,
  'validate.createExt': '只能新建可编辑的文本文件（.js / .ts / .json / .md 等）',
  'validate.renameExt': '改成这个后缀就打不开了，用 .js / .ts / .json / .md 这类',

  // ---- 文件系统 ----
  'err.fs.noPicker': '当前浏览器不支持打开本地目录',
  'err.fs.tooLarge': (p: { name: string; size: string; max: string }) =>
    `${p.name} 有 ${p.size}，超过 ${p.max} 上限，没有打开`,
  'err.fs.binary': (p: { name: string }) => `${p.name} 看起来是二进制文件，未打开`,
  'err.fs.nameTaken': (p: { name: string; kind: 'file' | 'directory' }) =>
    `名称 ${p.name} 已存在（${p.kind === 'file' ? '文件' : '目录'}），请更换其他名称`,
  'err.fs.uniqueExhausted': (p: { base: string }) =>
    `${p.base} 以及它后面 99 个编号都被占了，请先清理一下目标文件夹`,
  'err.fs.badBundlePath': (p: { path: string }) => `无效的文件路径：${p.path}`,
  'err.fs.caseRenameUnsupported':
    '当前浏览器不支持仅大小写不同的名称修改，请先改为其他名称，再改为目标名称',
  'err.fs.ignoredDirInTree': (p: { name: string }) =>
    `目录内包含 ${p.name}，复制这种目录没有意义，请在系统的文件管理器中重命名`,
  'err.fs.treeTooManyFiles': (p: { max: number }) =>
    `目录内文件超过 ${p.max} 个，整体复制的开销过大，请在系统的文件管理器中重命名`,
  'err.fs.treeTooLarge': (p: { max: string }) =>
    `目录内容超过 ${p.max}，整体复制的开销过大，请在系统的文件管理器中重命名`,

  // ---- IndexedDB（调用点全都 catch 掉了，实际到不了界面，仍走字典是为了 lib 里不留中文） ----
  'err.idb.open': 'IndexedDB 打开失败',
  'err.idb.blocked': 'IndexedDB 被其他标签页阻塞',
  'err.idb.abort': 'IndexedDB 事务被中止',
  'err.idb.fail': 'IndexedDB 事务失败',

  // ---- 编译 / 运行 ----
  'err.compile.initFailed': (p: { message: string }) =>
    `TypeScript 编译器初始化失败（esbuild wasm 加载失败）：${p.message}`,
  // 逐条错误的位置写法和条目之间的分隔符都在这儿，compile.ts 只负责把结构化的 issues 传进来
  'err.compile.failed': (p: { issues: CompileIssue[] }) =>
    `TypeScript 编译失败：${p.issues
      .map(
        (i) =>
          `${i.text || '未知错误'}${i.loc ? `（第 ${i.loc.line} 行第 ${i.loc.column} 列）` : ''}`
      )
      .join('；')}`,
  'err.compile.raw': (p: { message: string }) => `TypeScript 编译失败：${p.message}`,
  'err.imports.unresolved': (p: { specs: string[] }) =>
    `代码里有 import ${p.specs.map((s) => `“${s}”`).join('、')}，当前运行环境无法解析模块导入。` +
    `运行器是一个不带模块解析的 Web Worker，请把依赖内联到同一个文件里再运行。`,

  // ---- 工作区（目录授权、句柄失效） ----
  'err.save.cancelled': '保存已取消',
  'err.ws.rootMoved': (p: { name: string }) => `目录 ${p.name} 已不在原位置，已将其从列表中移除`,
  'err.ws.permissionDenied': (p: { name: string }) =>
    `未能获取 ${p.name} 的访问权限，可再次点击，或将其关闭后重新打开`,
  'err.ws.permissionUnavailable': '当前浏览器无法恢复上次的目录，请重新打开文件夹',
  'err.ws.dirStale': (p: { name: string }) => `目录 ${p.name} 已无法打开，请刷新`,
  'err.ws.dirGone': '该目录已不在磁盘上，请刷新后再试',
  'err.ws.parentGone': '目标目录已经不在了，刷新一下再试',
  'err.ws.parentStale': '目标目录已经打不开了，试试刷新',
  'err.ws.holderGone': '它所在的目录已经不在了，刷新一下再试',
  'err.ws.entryStale': (p: { name: string }) => `条目 ${p.name} 已无法打开，请刷新`,
  'err.ws.entryMissing': (p: { name: string }) => `条目 ${p.name} 已不在磁盘上，请刷新`,
  // 原来是 `条目 ${name}${message}` 直接相接，渲染成「条目 foo目录内包含…」，这里补上分隔
  'err.ws.entryFailed': (p: { name: string; message: string }) => `条目 ${p.name}：${p.message}`,
}

export type Dict = typeof zh
