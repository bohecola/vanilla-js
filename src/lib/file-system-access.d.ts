/*
  File System Access API 里 lib.dom 尚未收录的部分。

  TypeScript 6.0 的 lib.dom 已经有 FileSystemHandle / FileSystemFileHandle /
  FileSystemDirectoryHandle / createWritable / entries()（后者需要在 tsconfig 的
  lib 里打开 "DOM.AsyncIterable"），但缺三样：

  1. window.showDirectoryPicker —— 目录选择器，至今只有 Chromium 系实现，
     标准化停在 WICG 阶段，所以没进 lib.dom。
  2. FileSystemHandle 的 queryPermission / requestPermission —— 权限查询与再授权，
     同样来自那份 WICG 规范。
  3. FileSystemFileHandle 的 move —— 文件改名 / 移动。规范里有（whatwg/fs），
     但 lib.dom 还没跟上；目录那边连规范都还没有，所以只声明在文件 handle 上。

  三者在 lib.dom 里完全不存在，所以这里的声明合并不会和内置声明冲突。

  这个文件刻意不写 import / export：没有顶层模块语法时它是「全局脚本」声明文件，
  下面的类型直接进全局作用域，用的地方不需要 import（也就不会出现 import 一个
  .d.ts 路径这种别扭写法）。文件名也刻意不叫 fs-access.d.ts —— 那会被 TS 当成
  同目录 fs-access.ts 的声明文件，把真正的实现遮掉。

  两个方法都声明为可选（?）：在不支持的浏览器上它们确实是 undefined，
  声明成必有会让「特性检测」在类型层面被抹平。move 同理 —— 它到得比前两个晚，
  还有浏览器只在 OPFS 上给，代码里必须真的做 `if (handle.move)` 这道检测。
*/

type FileSystemPermissionMode = 'read' | 'readwrite'

interface FileSystemHandlePermissionDescriptor {
  mode?: FileSystemPermissionMode
}

interface DirectoryPickerOptions {
  /** 区分不同用途的选择器：浏览器会分别记住各自「上次打开的位置」 */
  id?: string
  /** 起始位置，可以是常见目录名，也可以是一个已有的 handle */
  startIn?:
    | FileSystemHandle
    | 'desktop'
    | 'documents'
    | 'downloads'
    | 'music'
    | 'pictures'
    | 'videos'
  mode?: FileSystemPermissionMode
}

interface FileSystemHandle {
  queryPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
  requestPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
}

interface FileSystemFileHandle {
  /**
   * 改名（只传 name）或移动到别的目录（传目标目录，可选新名字）。
   * 成功后这个 handle 自己就指向新位置了，不用重新取。
   *
   * 会静默覆盖同名的目标文件 —— 没有 { create: false } 之类的开关，
   * 所以调用前必须自己探一遍同名。
   */
  move?(nameOrParent: string | FileSystemDirectoryHandle, name?: string): Promise<void>
}

interface Window {
  showDirectoryPicker?(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>
}
