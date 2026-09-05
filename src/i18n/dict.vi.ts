/*
  Từ điển tiếng Việt — khóa khớp chính xác với dict.zh.ts / dict.en.ts.
  Khai báo `: Dict` để tsc bắt lỗi thiếu/thừa khóa hoặc sai kiểu tham số.
*/
import type { Dict, CompileIssue } from './dict.zh.ts'

export const vi: Dict = {
  'html.lang': 'vi',
  'html.title': 'Jotter · Nháp JS / TS',
  'locale.bcp47': 'vi-VN',

  'header.import': 'Nhập',
  'header.theme': 'Đổi giao diện',
  'header.theme.dark': 'Tối',
  'header.theme.light': 'Sáng',
  'header.theme.system': 'Theo hệ thống',
  'header.accent': 'Đổi màu nhấn',
  'header.accent.blue': 'Xanh dương',
  'header.accent.pink': 'Hồng',
  'header.accent.orange': 'Cam',
  'header.accent.green': 'Xanh lá',
  'header.lang': 'Đổi ngôn ngữ',
  'header.lang.system': 'Theo hệ thống',
  'header.github': 'Kho GitHub',

  'notice.close': 'Đóng thông báo',
  'notice.demoLoadFailed': (p: { message: string }) => `Không tải được bản demo: ${p.message}`,
  'notice.notTextFile': (p: { name: string }) =>
    `${p.name} không phải tệp văn bản chỉnh sửa được nên không được mở`,
  'notice.deleted': (p: { name: string }) => `Đã xóa ${p.name}`,
  'notice.rootRemoved': (p: { name: string }) =>
    `Đã gỡ ${p.name}. Không có tệp nào trên đĩa thay đổi.`,
  'notice.renamed': (p: { name: string }) => `Đã đổi tên thành ${p.name}`,
  'notice.saved': (p: { name: string }) => `Đã lưu ${p.name}`,
  'notice.demoReadFailed': (p: { message: string }) =>
    `Không đọc được mã nguồn demo: ${p.message}`,
  'notice.demosSaved': (p: { count: number; label: string }) =>
    `Đã lưu ${p.count} demo vào ${p.label}. Giờ bạn có thể sửa trực tiếp — Ctrl+S ghi về đĩa.`,
  'notice.demosSavedClosed': (p: { count: number; label: string }) =>
    `Đã lưu ${p.count} demo vào ${p.label} nhưng chưa mở ở bên trái. Để sửa trong ứng dụng, dùng « Mở thư mục » mở thư mục này.`,
  'notice.demoSaveCleaned': (p: { count: number }) =>
    `Đã dọn ${p.count} thư mục chưa hoàn tất còn sót từ lần lưu trước`,
  'notice.demoSaveGone': 'Thư mục còn sót từ lần lưu trước không còn nên không cần dọn',
  'notice.pathCopied': (p: { path: string }) => `Đã sao chép đường dẫn: ${p.path}`,
  'notice.copyFailed': 'Không sao chép được, hãy thử lại',
  'notice.fileReadFailed': (p: { message: string }) => `Không đọc được tệp: ${p.message}`,
  'notice.draftWillSaveTo': (p: { path: string }) =>
    `Nhập tên tệp bên trái rồi nhấn Enter để lưu vào ${p.path}`,
  'notice.noWriteTarget':
    'Tệp này không nằm trong thư mục cục bộ nên không có chỗ để ghi lại — đã tải xuống thay thế',
  'notice.saveFailed': (p: { message: string }) => `Không lưu được: ${p.message}`,
  'notice.externalChanged': (p: { name: string }) =>
    `${p.name} đã bị sửa trên đĩa khi bạn còn thay đổi chưa lưu; lưu sẽ ghi đè bản trên đĩa`,
  'notice.reloaded': (p: { name: string }) =>
    `${p.name} đã được tải lại từ bản mới nhất trên đĩa`,
  'notice.createdButEmpty': (p: { name: string; message: string }) =>
    `Đã tạo ${p.name} nhưng không ghi được nội dung: ${p.message}`,

  'editor.noFile': 'Chưa mở tệp nào',
  'editor.dirty': 'Có thay đổi chưa lưu',
  'editor.save': 'Lưu',
  'editor.saving': 'Đang lưu…',
  'editor.download': 'Tải xuống',
  'editor.stop': 'Dừng',
  'editor.runDisabled': 'Trình chạy chỉ thực thi JavaScript / TypeScript',
  'editor.run': 'Chạy',

  'tab.close': 'Đóng tab',
  'tab.scrollLeft': 'Cuộn tab sang trái',
  'tab.scrollRight': 'Cuộn tab sang phải',
  'tab.ctx.close': 'Đóng',
  'tab.ctx.closeOthers': 'Đóng các tab khác',
  'tab.ctx.closeRight': 'Đóng bên phải',
  'tab.ctx.closeAll': 'Đóng tất cả',
  'confirm.closeMany.one': 'Đóng tab chưa lưu?',
  'confirm.closeMany.many': (p: { count: number }) => `Đóng ${p.count} tab chưa lưu?`,
  'confirm.closeMany.unsaved': 'Các thay đổi chưa lưu này sẽ bị mất.',
  'tab.closeAria': (p: { name: string }) => `Đóng tab ${p.name}`,
  'confirm.closeTab.title': (p: { name: string }) => `Đóng ${p.name}?`,
  'confirm.closeTab.unsaved': 'Tệp này có thay đổi chưa lưu sẽ mất nếu bạn đóng nó.',
  'confirm.closeTab.ok': 'Đóng',
  'confirm.newScratch.title': 'Xóa bản nháp?',
  'confirm.newScratch.body': 'Bản nháp có nội dung chưa lưu và sẽ bị thay thế.',
  'confirm.newScratch.ok': 'Xóa và tạo mới',
  'panes.resize': 'Kéo để chỉnh độ rộng trình soạn thảo và kết quả',

  'statusbar.noFile': 'Chưa mở tệp nào',
  'statusbar.ln': (p: { line: number; col: number }) => `Dòng ${p.line}, Cột ${p.col}`,
  'statusbar.spaces': (p: { size: number }) => `Khoảng trắng: ${p.size}`,
  'statusbar.tabSize': (p: { size: number }) => `Cỡ tab: ${p.size}`,
  'statusbar.js': 'JavaScript (tệp .js, biên dịch chạy theo JavaScript)',
  'statusbar.ts': 'TypeScript (tệp .ts, biên dịch chạy theo TypeScript)',

  'confirm.cancel': 'Hủy',
  'confirm.cancelSave.title': 'Dừng việc lưu?',
  'confirm.cancelSave.body':
    'Việc ghi sẽ dừng và các tệp chưa hoàn tất đã ghi sẽ bị xóa, khôi phục về trạng thái trước khi lưu.',
  'confirm.cancelSave.ok': 'Dừng lưu',
  'confirm.cleanupInterrupted.title': 'Dọn lần lưu chưa hoàn tất trước đó?',
  'confirm.cleanupInterrupted.bodyMultiple': (p: { labels: string }) =>
    `Đã thấy trong ${p.labels} các tệp chưa hoàn tất còn sót từ lần lưu chưa xong (có thể do tải lại hoặc đóng trang). Xóa chúng?`,
  'confirm.cleanupInterrupted.bodyRecord': (p: { label: string }) =>
    `Lần lưu trước chưa hoàn tất (có thể do tải lại hoặc đóng trang), để lại tệp chưa hoàn tất trong ${p.label}. Xóa chúng?`,
  'confirm.cleanupInterrupted.ok': 'Dọn dẹp',
  'confirm.saveDemos.title': 'Lưu tất cả demo vào máy?',
  'confirm.saveDemos.body': (p: { count: number }) =>
    `Tất cả ${p.count} demo sẽ được lưu vào thư mục bạn chọn và tạo một thư mục con bên trong. Tiếp tục?`,
  'confirm.saveDemos.ok': 'Chọn thư mục',
  'confirm.openDemos.title': 'Mở thư mục đã lưu ở bên trái?',
  'confirm.openDemos.body': (p: { count: number; label: string }) =>
    `Đã lưu ${p.count} demo vào ${p.label}. Mở thư mục này ở danh sách bên trái để sửa trực tiếp?`,
  'confirm.openDemos.ok': 'Mở',
  'confirm.delete.title': (p: { name: string }) => `Xóa ${p.name}?`,
  'confirm.delete.dir': (p: { path: string }) => `Sẽ xóa ${p.path} và toàn bộ nội dung bên trong.`,
  'confirm.delete.file': (p: { path: string }) => `Sẽ xóa ${p.path}.`,
  'confirm.delete.unsavedInDir': (p: { count: number }) =>
    `${p.count} tệp đang mở bên trong có thay đổi chưa lưu và sẽ bị xóa luôn.`,
  'confirm.delete.unsavedFile': 'Tệp này có thay đổi chưa lưu và sẽ bị xóa luôn.',
  'confirm.delete.irreversible':
    'Việc xóa tác động trực tiếp lên đĩa, không vào thùng rác và không thể hoàn tác.',
  'confirm.delete.ok': 'Xóa',
  'confirm.closeRoot.title': (p: { name: string }) => `Gỡ ${p.name}?`,
  'confirm.closeRoot.listOnly': 'Chỉ gỡ khỏi danh sách bên trái; tệp trên đĩa không thay đổi gì.',
  'confirm.closeRoot.openFiles': (p: { count: number }) =>
    `${p.count} tệp đang mở bên trong cũng sẽ đóng.`,
  'confirm.closeRoot.openFilesUnsaved': (p: { count: number; unsaved: number }) =>
    `${p.count} tệp đang mở sẽ đóng, trong đó ${p.unsaved} tệp có thay đổi chưa lưu sẽ bị bỏ đi.`,
  'confirm.closeRoot.reauth':
    'Để dùng lại, bạn cần chọn lại thư mục đó. Vì giới hạn bảo mật của trình duyệt, trang web không thể tự giữ quyền truy cập này.',
  'confirm.closeRoot.ok': 'Gỡ',
  'confirm.renameDir.title': (p: { from: string; to: string }) =>
    `Đổi tên ${p.from} thành ${p.to}?`,
  'confirm.renameDir.how':
    'Trình duyệt không cung cấp API đổi tên thư mục, nên toàn bộ thư mục được sao chép sang tên mới và bản gốc chỉ bị xóa khi đã sao chép xong toàn bộ.',
  'confirm.renameDir.size': (p: { files: number; size: string }) =>
    `${p.files} tệp, tổng ${p.size}. Đừng đóng trang trong khi đang sao chép.`,
  'confirm.renameDir.risk':
    'Thời gian sửa của tệp sao chép sẽ cập nhật về hiện tại. Nếu thất bại giữa chừng, bản gốc vẫn nguyên vẹn nhưng sẽ còn thư mục mới sao chép dở trên đĩa.',
  'confirm.renameDir.ok': 'Đổi tên',

  'sidebar.title': 'Tệp',
  'sidebar.expand': 'Mở rộng danh sách tệp',
  'sidebar.collapse': 'Thu gọn danh sách tệp',
  'sidebar.newScratch': 'Nháp mới',
  'sidebar.resize': 'Kéo để chỉnh rộng (nhấp đúp để đặt lại)',
  'sidebar.localDirs': 'Thư mục cục bộ',
  'sidebar.newFileIn': (p: { target: string }) => `Tạo tệp mới trong ${p.target}`,
  'sidebar.newDirIn': (p: { target: string }) => `Tạo thư mục mới trong ${p.target}`,
  'sidebar.refreshTarget': (p: { target: string }) => `Đọc lại ${p.target}`,
  'sidebar.openAnother': 'Mở thêm một thư mục',
  'sidebar.openFolder': 'Mở thư mục',
  'sidebar.unsupported': (p: { label: string }) =>
    `Trình duyệt này không mở được thư mục cục bộ — chỉ các trình duyệt nhân Chromium như Chrome / Edge triển khai API này. Bạn vẫn có thể mở tệp đơn lẻ qua « ${p.label} » ở trên.`,
  'sidebar.needAuth': 'Cần cấp quyền',
  'sidebar.reauthHint': (p: { label: string }) =>
    `Thư mục nào ghi « ${p.label} » thì nhấp một cái là trở lại — trình duyệt hỏi lại mỗi lần mở lại trang`,
  'sidebar.loading': 'Đang đọc…',
  'sidebar.unsaved': 'Chưa lưu',
  'sidebar.emptyDir': 'Thư mục trống',
  'sidebar.truncated': (p: { max: number }) => `Quá nhiều mục, chỉ hiển thị ${p.max} mục đầu`,
  'sidebar.rootLocked': (p: { name: string }) =>
    `Nhấp vào đây để cấp lại quyền truy cập ${p.name}`,
  'sidebar.rootHint': (p: { name: string }) =>
    `${p.name} (nhấp để mở rộng / thu gọn và đặt làm nơi tạo mới; nhấp phải để thêm thao tác)`,
  'sidebar.rootMenu': (p: { name: string }) => `Thao tác với ${p.name}`,
  'sidebar.renameAria': 'Tên mới',
  'sidebar.newFileAria': 'Tên tệp mới',
  'sidebar.newDirAria': 'Tên thư mục mới',
  'sidebar.demos': 'Đoạn demo',
  'sidebar.demosDirty': 'Có thay đổi demo chưa lưu',
  'sidebar.saveDemos': 'Lưu mọi demo vào thư mục cục bộ',
  'sidebar.cancelSave': 'Hủy lưu',
  'sidebar.cancellingSave': 'Đang hủy…',
  'sidebar.savingDemos': (p: { done: number; total: number }) => `Đang lưu vào máy ${p.done}/${p.total}`,
  'sidebar.savingDemosFile': (p: { name: string; done: number; total: number }) =>
    `Đang ghi ${p.name} (${p.done}/${p.total})`,
  'sidebar.currentPath': (p: { path: string }) => `Thư mục hiện tại: ${p.path}`,
  'sidebar.uncategorized': 'Chưa phân loại',

  'menu.rename': 'Đổi tên',
  'menu.delete': 'Xóa',
  'menu.copyPath': 'Sao chép đường dẫn',
  'menu.newFile': 'Tệp mới',
  'menu.newDir': 'Thư mục mới',
  'menu.removeRoot': 'Gỡ thư mục',

  'console.empty': '// kết quả console sẽ hiển thị ở đây',

  'console.clear': 'Xóa',

  'console.omitted': (n: number) => `Đã bỏ qua ${n} dòng cũ nhất`,

  'file.untitled': (p: { ext: string }) => `Chưa đặt tên.${p.ext}`,
  'file.newDir': 'Thư mục mới',
  'file.scratch': 'Nháp',

  'validate.empty': 'Tên không được để trống',
  'validate.tooLong': 'Tên quá dài — tối đa 255 ký tự',
  'validate.dots': 'Không dùng được « . » hay « .. » làm tên',
  'validate.slash': 'Tên không chứa được dấu gạch chéo — mục mới luôn tạo trong thư mục hiện tại',
  'validate.illegalChars': 'Tên không chứa được các ký tự < > : " | ? *',
  'validate.control': 'Tên không chứa được ký tự điều khiển',
  'validate.trailing': 'Tên không được kết thúc bằng dấu chấm hoặc khoảng trắng',
  'validate.reserved': (p: { name: string }) =>
    `${p.name} trùng với tên hệ thống dành riêng, hãy chọn tên khác`,
  'validate.exists': (p: { name: string }) => `${p.name} đã tồn tại, hãy chọn tên khác`,
  'validate.createExt': 'Chỉ tạo được tệp văn bản chỉnh sửa được (.js / .ts / .json / .md…)',
  'validate.renameExt': 'Đổi sang đuôi này sẽ không mở được — dùng .js / .ts / .json / .md…',

  'err.fs.noPicker': 'Trình duyệt này không mở được thư mục cục bộ',

  'err.fs.notAllowed': 'Không có quyền truy cập tệp hoặc thư mục này (có thể đang bị chương trình khác khóa, chỉ đọc, hoặc quyền đã bị thu hồi)',
  'err.fs.tooLarge': (p: { name: string; size: string; max: string }) =>
    `${p.name} nặng ${p.size}, vượt giới hạn ${p.max} nên không mở`,
  'err.fs.binary': (p: { name: string }) =>
    `${p.name} trông giống tệp nhị phân nên không mở`,
  'err.fs.nameTaken': (p: { name: string; kind: 'file' | 'directory' }) =>
    `${p.name} đã tồn tại (${p.kind === 'file' ? 'tệp' : 'thư mục'}), hãy chọn tên khác`,
  'err.fs.uniqueExhausted': (p: { base: string }) =>
    `${p.base} và 99 số tiếp theo đều đã dùng, hãy dọn thư mục đích trước`,
  'err.fs.badBundlePath': (p: { path: string }) => `Đường dẫn tệp không hợp lệ: ${p.path}`,
  'err.fs.caseRenameUnsupported':
    'Trình duyệt này không đổi tên được mục sang tên chỉ khác hoa thường. Trước tiên hãy đổi sang tên khác, rồi đổi sang tên bạn muốn.',
  'err.fs.ignoredDirInTree': (p: { name: string }) =>
    `Thư mục chứa ${p.name}; sao chép loại thư mục đó vô nghĩa, hãy đổi tên trong trình quản lý tệp của hệ thống.`,
  'err.fs.treeTooManyFiles': (p: { max: number }) =>
    `Thư mục có hơn ${p.max} tệp, sao chép toàn bộ quá nặng. Hãy đổi tên trong trình quản lý tệp của hệ thống.`,
  'err.fs.treeTooLarge': (p: { max: string }) =>
    `Nội dung thư mục vượt ${p.max}, sao chép toàn bộ quá nặng. Hãy đổi tên trong trình quản lý tệp của hệ thống.`,

  'err.idb.open': 'Không mở được IndexedDB',
  'err.idb.blocked': 'IndexedDB bị tab khác chặn',
  'err.idb.abort': 'Giao dịch IndexedDB bị hủy',
  'err.idb.fail': 'Giao dịch IndexedDB thất bại',
  'err.compile.failed': (p: { issues: CompileIssue[] }) =>
    `Biên dịch TypeScript thất bại: ${p.issues
      .map((i) => `${i.text || 'Lỗi không rõ'}${i.loc ? ` (dòng ${i.loc.line}, cột ${i.loc.column})` : ''}`)
      .join('; ')}`,
  'err.compile.raw': (p: { message: string }) =>
    `Biên dịch TypeScript thất bại: ${p.message}`,
  'err.imports.unresolved': (p: { specs: string[] }) =>
    `Mã nguồn import ${p.specs.map((s) => `« ${s} »`).join(', ')}, nhưng môi trường này không phân giải được import mô-đun. Trình chạy là một Web Worker không có bộ phân giải mô-đun — hãy nhúng phần phụ thuộc vào cùng một tệp rồi chạy.`,

  'err.save.cancelled': 'Đã hủy lưu',
  'err.ws.rootMoved': (p: { name: string }) =>
    `Thư mục ${p.name} không còn ở vị trí cũ nên đã gỡ khỏi danh sách`,
  'err.ws.permissionDenied': (p: { name: string }) =>
    `Không lấy được quyền truy cập ${p.name}. Hãy nhấp lại, hoặc đóng và mở lại.`,
  'err.ws.permissionUnavailable':
    'Trình duyệt này không khôi phục được thư mục lần trước, hãy mở lại thư mục',
  'err.ws.dirStale': (p: { name: string }) => `Không mở được thư mục ${p.name}, hãy tải lại trang`,
  'err.ws.dirGone': 'Thư mục không còn trên đĩa, hãy tải lại rồi thử',
  'err.ws.parentGone': 'Thư mục đích đã biến mất, tải lại rồi thử',
  'err.ws.parentStale': 'Không mở được thư mục đích, hãy thử tải lại',
  'err.ws.holderGone': 'Thư mục chứa nó đã biến mất, tải lại rồi thử',
  'err.ws.entryStale': (p: { name: string }) => `Không mở được mục ${p.name}, hãy tải lại trang`,
  'err.ws.entryMissing': (p: { name: string }) => `Mục ${p.name} không còn trên đĩa, hãy tải lại trang`,
  'err.ws.entryFailed': (p: { name: string; message: string }) => `Mục ${p.name}: ${p.message}`,
}
