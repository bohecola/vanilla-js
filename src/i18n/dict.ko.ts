/*
  한국어 사전 — 키는 dict.zh.ts / dict.en.ts와 정확히 동일합니다.
  `: Dict` 주석 덕분에 키가 빠지거나 잘못된 파라미터면 tsc가 잡아냅니다.
*/
import type { Dict, CompileIssue } from './dict.zh.ts'

export const ko: Dict = {
  'html.lang': 'ko',
  'html.title': 'Jotter · JS / TS 메모장',
  'locale.bcp47': 'ko-KR',

  'header.import': '가져오기',
  'header.theme': '테마 변경',
  'header.theme.dark': '다크',
  'header.theme.light': '라이트',
  'header.theme.system': '시스템',
  'header.accent': '색상 변경',
  'header.accent.blue': '파랑',
  'header.accent.pink': '분홍',
  'header.accent.orange': '주황',
  'header.accent.green': '초록',
  'header.lang': '언어 변경',
  'header.lang.system': '시스템',
  'header.github': 'GitHub 저장소',

  'notice.close': '알림 닫기',
  'notice.demoLoadFailed': (p: { message: string }) => `데모를 불러오지 못했습니다: ${p.message}`,
  'notice.notTextFile': (p: { name: string }) =>
    `${p.name}은(는) 편집 가능한 텍스트 파일이 아니라 열리지 않았습니다`,
  'notice.deleted': (p: { name: string }) => `${p.name}을(를) 삭제했습니다`,
  'notice.rootRemoved': (p: { name: string }) =>
    `${p.name}을(를) 제거했습니다. 디스크의 파일은 바뀌지 않았습니다.`,
  'notice.renamed': (p: { name: string }) => `${p.name}(으)로 이름을 바꿨습니다`,
  'notice.saved': (p: { name: string }) => `${p.name}을(를) 저장했습니다`,
  'notice.demoReadFailed': (p: { message: string }) =>
    `데모 소스를 읽지 못했습니다: ${p.message}`,
  'notice.demosSaved': (p: { count: number; label: string }) =>
    `데모 ${p.count}개를 ${p.label}에 저장했습니다. 이제 바로 고칠 수 있습니다 — Ctrl+S로 디스크에 씁니다.`,
  'notice.demosSavedClosed': (p: { count: number; label: string }) =>
    `데모 ${p.count}개를 ${p.label}에 저장했지만 왼쪽에 열지 않았습니다. 여기서 편집하려면 해당 폴더를 '폴더 열기'로 여세요.`,
  'notice.demoSaveCleaned': (p: { count: number }) =>
    `이전 저장이 남긴 불완전한 폴더 ${p.count}개를 정리했습니다`,
  'notice.demoSaveGone': '이전 저장이 남긴 불완전한 폴더가 이미 없어서 정리할 게 없습니다',
  'notice.pathCopied': (p: { path: string }) => `경로를 복사했습니다: ${p.path}`,
  'notice.copyFailed': '복사하지 못했습니다. 다시 시도하세요',
  'notice.fileReadFailed': (p: { message: string }) => `파일을 읽지 못했습니다: ${p.message}`,
  'notice.draftWillSaveTo': (p: { path: string }) =>
    `왼쪽에 파일 이름을 입력하고 Enter를 누르면 ${p.path}에 저장됩니다`,
  'notice.noWriteTarget':
    '이 파일은 로컬 폴더 안에 없어서 써 넣을 곳이 없습니다 — 대신 다운로드했습니다',
  'notice.saveFailed': (p: { message: string }) => `저장하지 못했습니다: ${p.message}`,
  'notice.externalChanged': (p: { name: string }) =>
    `${p.name}이(가) 디스크에서 바뀌었고 아직 저장하지 않은 수정이 있습니다. 저장하면 디스크의 버전을 덮어씁니다.`,
  'notice.reloaded': (p: { name: string }) =>
    `${p.name}을(를) 디스크의 최신 내용으로 다시 불러왔습니다`,
  'notice.createdButEmpty': (p: { name: string; message: string }) =>
    `${p.name}을(를) 만들었지만 내용을 쓸 수 없었습니다: ${p.message}`,

  'editor.noFile': '열린 파일 없음',
  'editor.dirty': '저장하지 않은 변경 있음',
  'editor.save': '저장',
  'editor.saving': '저장 중…',
  'editor.download': '다운로드',
  'editor.stop': '중지',
  'editor.runDisabled': '실행기는 JavaScript / TypeScript만 실행합니다',
  'editor.run': '실행',

  'tab.close': '탭 닫기',
  'tab.scrollLeft': '탭을 왼쪽으로 스크롤',
  'tab.scrollRight': '탭을 오른쪽으로 스크롤',
  'tab.ctx.close': '닫기',
  'tab.ctx.closeOthers': '다른 탭 닫기',
  'tab.ctx.closeRight': '오른쪽 닫기',
  'tab.ctx.closeAll': '모두 닫기',
  'confirm.closeMany.one': '저장하지 않은 탭을 닫을까요?',
  'confirm.closeMany.many': (p: { count: number }) =>
    `저장하지 않은 탭 ${p.count}개를 닫을까요?`,
  'confirm.closeMany.unsaved': '저장하지 않은 변경은 사라집니다.',
  'tab.closeAria': (p: { name: string }) => `탭 ${p.name} 닫기`,
  'confirm.closeTab.title': (p: { name: string }) => `${p.name}을(를) 닫을까요?`,
  'confirm.closeTab.unsaved': '이 파일에는 저장하지 않은 변경이 있어 닫으면 잃게 됩니다.',
  'confirm.closeTab.ok': '닫기',
  'confirm.newScratch.title': '초안을 비울까요?',
  'confirm.newScratch.body': '초안에 저장하지 않은 내용이 있어 새로 만들면 사라집니다.',
  'confirm.newScratch.ok': '비우고 새로 만들기',
  'panes.resize': '드래그해 편집기와 출력 너비 조절',

  'statusbar.noFile': '열린 파일 없음',
  'statusbar.ln': (p: { line: number; col: number }) => `Ln ${p.line}, 열 ${p.col}`,
  'statusbar.spaces': (p: { size: number }) => `공백: ${p.size}`,
  'statusbar.tabSize': (p: { size: number }) => `탭 크기: ${p.size}`,
  'statusbar.js': 'JavaScript(.js 파일, JavaScript로 컴파일 실행)',
  'statusbar.ts': 'TypeScript(.ts 파일, TypeScript로 컴파일 실행)',

  'confirm.cancel': '취소',
  'confirm.cancelSave.title': '저장을 중지할까요?',
  'confirm.cancelSave.body':
    '쓰기를 중지하고 이미 쓴 불완전한 파일을 삭제해 저장 전 상태로 되돌립니다.',
  'confirm.cancelSave.ok': '저장 중지',
  'confirm.cleanupInterrupted.title': '이전에 끝내지 못한 저장을 정리할까요?',
  'confirm.cleanupInterrupted.bodyMultiple': (p: { labels: string }) =>
    `${p.labels}에서 지난 저장이 끝나지 않아(새로고침이나 페이지 닫기 가능성) 남은 불완전한 파일을 발견했습니다. 삭제할까요?`,
  'confirm.cleanupInterrupted.bodyRecord': (p: { label: string }) =>
    `지난 저장이 끝나지 않아(새로고침이나 페이지 닫기) ${p.label}에 불완전한 파일이 남았습니다. 삭제할까요?`,
  'confirm.cleanupInterrupted.ok': '정리',
  'confirm.saveDemos.title': '데모를 모두 로컬에 저장할까요?',
  'confirm.saveDemos.body': (p: { count: number }) =>
    `데모 ${p.count}개를 모두 선택한 폴더에 저장하고 하위 폴더를 만듭니다. 계속할까요?`,
  'confirm.saveDemos.ok': '폴더 선택',
  'confirm.openDemos.title': '저장한 폴더를 왼쪽에서 열까요?',
  'confirm.openDemos.body': (p: { count: number; label: string }) =>
    `데모 ${p.count}개를 ${p.label}에 저장했습니다. 바로 편집할 수 있게 이 폴더를 왼쪽 파일 목록에서 열까요?`,
  'confirm.openDemos.ok': '열기',
  'confirm.delete.title': (p: { name: string }) => `${p.name}을(를) 삭제할까요?`,
  'confirm.delete.dir': (p: { path: string }) => `${p.path}와 그 내용 전체를 삭제합니다.`,
  'confirm.delete.file': (p: { path: string }) => `${p.path}을(를) 삭제합니다.`,
  'confirm.delete.unsavedInDir': (p: { count: number }) =>
    `그 안에 열린 파일 ${p.count}개에는 저장하지 않은 변경이 있어 함께 삭제됩니다.`,
  'confirm.delete.unsavedFile': '이 파일에는 저장하지 않은 변경이 있어 함께 삭제됩니다.',
  'confirm.delete.irreversible':
    '삭제는 디스크에 바로 적용되며 휴지통에도 안 가고 되돌릴 수도 없습니다.',
  'confirm.delete.ok': '삭제',
  'confirm.closeRoot.title': (p: { name: string }) => `${p.name}을(를) 제거할까요?`,
  'confirm.closeRoot.listOnly':
    '왼쪽 목록에서만 제거하며 디스크의 파일은 아무것도 바뀌지 않습니다.',
  'confirm.closeRoot.openFiles': (p: { count: number }) =>
    `열린 파일 ${p.count}개도 함께 닫힙니다.`,
  'confirm.closeRoot.openFilesUnsaved': (p: { count: number; unsaved: number }) =>
    `열린 파일 ${p.count}개가 함께 닫히고, 저장하지 않은 변경이 있는 ${p.unsaved}개는 버려집니다.`,
  'confirm.closeRoot.reauth':
    '다시 쓰려면 해당 폴더를 다시 선택해야 합니다. 브라우저 보안상 웹페이지가 스스로 이 접근 권한을 보관할 수 없습니다.',
  'confirm.closeRoot.ok': '제거',
  'confirm.renameDir.title': (p: { from: string; to: string }) =>
    `${p.from}을(를) ${p.to}(으)로 이름을 바꿀까요?`,
  'confirm.renameDir.how':
    '브라우저에는 폴더 이름 변경 API가 없어서, 폴더 전체를 새 이름으로 복사하고 모두 성공한 뒤 원본을 삭제합니다.',
  'confirm.renameDir.size': (p: { files: number; size: string }) =>
    `파일 ${p.files}개, ${p.size}. 복사하는 동안 페이지를 닫지 마세요.`,
  'confirm.renameDir.risk':
    '복사된 파일의 수정 시간은 현재 시간으로 바뀝니다. 중간에 실패하면 원본은 그대로지만, 절반만 복사된 새 폴더가 디스크에 남습니다.',
  'confirm.renameDir.ok': '이름 바꾸기',

  'sidebar.title': '파일',
  'sidebar.expand': '파일 목록 펼치기',
  'sidebar.collapse': '파일 목록 접기',
  'sidebar.newScratch': '새 초안',
  'sidebar.resize': '드래그로 너비 조절(더블클릭 시 초기화)',
  'sidebar.localDirs': '로컬 폴더',
  'sidebar.newFileIn': (p: { target: string }) => `${p.target}에 새 파일 만들기`,
  'sidebar.newDirIn': (p: { target: string }) => `${p.target}에 새 폴더 만들기`,
  'sidebar.refreshTarget': (p: { target: string }) => `${p.target} 다시 읽기`,
  'sidebar.openAnother': '폴더 하나 더 열기',
  'sidebar.openFolder': '폴더 열기',
  'sidebar.unsupported': (p: { label: string }) =>
    `이 브라우저는 로컬 폴더를 열 수 없습니다 — 이 API는 Chrome, Edge 같은 Chromium 계열만 구현했습니다. 그래도 위쪽의 '${p.label}'으로 단일 파일은 열 수 있습니다.`,
  'sidebar.needAuth': '권한 필요',
  'sidebar.reauthHint': (p: { label: string }) =>
    `'${p.label}' 표시된 폴더는 한 번 클릭하면 돌아옵니다 — 브라우저가 페이지를 새로 열 때마다 다시 물어보기 때문입니다`,
  'sidebar.loading': '읽는 중…',
  'sidebar.unsaved': '저장 안 됨',
  'sidebar.emptyDir': '빈 폴더',
  'sidebar.truncated': (p: { max: number }) => `항목이 많아 처음 ${p.max}개만 보여줍니다`,
  'sidebar.rootLocked': (p: { name: string }) =>
    `여기를 클릭하면 ${p.name}에 다시 접근 권한을 부여합니다`,
  'sidebar.rootHint': (p: { name: string }) =>
    `${p.name}(클릭해 펼치기/접기 및 새 항목의 대상으로 지정, 오른쪽 클릭으로 추가 작업)`,
  'sidebar.rootMenu': (p: { name: string }) => `${p.name}에 대한 작업`,
  'sidebar.renameAria': '새 이름',
  'sidebar.newFileAria': '새 파일 이름',
  'sidebar.newDirAria': '새 폴더 이름',
  'sidebar.demos': '데모 스니펫',
  'sidebar.demosDirty': '저장하지 않은 데모 변경 있음',
  'sidebar.saveDemos': '모든 데모를 로컬 폴더에 저장',
  'sidebar.cancelSave': '저장 취소',
  'sidebar.cancellingSave': '취소하는 중…',
  'sidebar.savingDemos': (p: { done: number; total: number }) =>
    `로컬 저장 중 ${p.done}/${p.total}`,
  'sidebar.savingDemosFile': (p: { name: string; done: number; total: number }) =>
    `${p.name} 쓰는 중(${p.done}/${p.total})`,
  'sidebar.currentPath': (p: { path: string }) => `현재 폴더: ${p.path}`,
  'sidebar.uncategorized': '분류 안 됨',

  'menu.rename': '이름 바꾸기',
  'menu.delete': '삭제',
  'menu.copyPath': '경로 복사',
  'menu.newFile': '새 파일',
  'menu.newDir': '새 폴더',
  'menu.removeRoot': '폴더 제거',

  'console.empty': '// console 출력이 여기에 표시됩니다',

  'console.clear': '지우기',

  'console.omitted': (n: number) => `가장 오래된 ${n}줄 생략됨`,

  'file.untitled': (p: { ext: string }) => `제목 없음.${p.ext}`,
  'file.newDir': '새 폴더',
  'file.scratch': '초안',

  'validate.empty': '이름은 비어 있을 수 없습니다',
  'validate.tooLong': '이름이 너무 깁니다 — 최대 255자',
  'validate.dots': '이름으로 「.」이나 「..」은 사용할 수 없습니다',
  'validate.slash': '이름에 슬래시를 넣을 수 없습니다 — 새 항목은 항상 현재 폴더에 만들어집니다',
  'validate.illegalChars': '이름에 < > : " | ? * 같은 문자를 넣을 수 없습니다',
  'validate.control': '이름에 제어 문자를 넣을 수 없습니다',
  'validate.trailing': '이름은 점이나 공백으로 끝날 수 없습니다',
  'validate.reserved': (p: { name: string }) =>
    `${p.name}은(는) 시스템 예약 이름과 충돌합니다. 다른 이름을 쓰세요`,
  'validate.exists': (p: { name: string }) =>
    `${p.name}은(는) 이미 있습니다. 다른 이름을 쓰세요`,
  'validate.createExt': '편집 가능한 텍스트 파일만 만들 수 있습니다(.js / .ts / .json / .md 등)',
  'validate.renameExt':
    '이 확장자로는 여기서 열 수 없습니다. .js / .ts / .json / .md 등을 쓰세요',

  'err.fs.noPicker': '이 브라우저는 로컬 폴더를 열 수 없습니다',

  'err.fs.notAllowed': '이 파일 또는 폴더에 접근할 권한이 없습니다 (다른 프로그램이 사용 중이거나 읽기 전용이거나 권한이 취소됨)',
  'err.fs.tooLarge': (p: { name: string; size: string; max: string }) =>
    `${p.name}은(는) ${p.size}로 ${p.max} 한도를 넘어 열지 않았습니다`,
  'err.fs.binary': (p: { name: string }) =>
    `${p.name}은(는) 이진 파일로 보여 열지 않았습니다`,
  'err.fs.nameTaken': (p: { name: string; kind: 'file' | 'directory' }) =>
    `${p.name}이(가) 이미 있습니다(${p.kind === 'file' ? '파일' : '폴더'}). 다른 이름을 쓰세요`,
  'err.fs.uniqueExhausted': (p: { base: string }) =>
    `${p.base}과 뒤따르는 99개 번호가 모두 사용 중입니다. 먼저 대상 폴더를 정리하세요`,
  'err.fs.badBundlePath': (p: { path: string }) => `잘못된 파일 경로: ${p.path}`,
  'err.fs.caseRenameUnsupported':
    '이 브라우저는 대소문자만 다른 이름으로는 바꿀 수 없습니다. 먼저 다른 이름으로 바꾼 뒤 원하는 이름으로 바꾸세요.',
  'err.fs.ignoredDirInTree': (p: { name: string }) =>
    `폴더 안에 ${p.name}이(가) 있습니다. 그런 폴더를 복사하는 건 의미가 없으니 시스템 파일 관리자에서 이름을 바꾸세요.`,
  'err.fs.treeTooManyFiles': (p: { max: number }) =>
    `폴더 안 파일이 ${p.max}개가 넘어 한꺼번에 복사하기엔 부담이 큽니다. 시스템 파일 관리자에서 이름을 바꾸세요.`,
  'err.fs.treeTooLarge': (p: { max: string }) =>
    `폴더 내용이 ${p.max}를 넘어 한꺼번에 복사하기엔 부담이 큽니다. 시스템 파일 관리자에서 이름을 바꾸세요.`,

  'err.idb.open': 'IndexedDB를 열지 못했습니다',
  'err.idb.blocked': 'IndexedDB가 다른 탭에 막혀 있습니다',
  'err.idb.abort': 'IndexedDB 트랜잭션이 중단되었습니다',
  'err.idb.fail': 'IndexedDB 트랜잭션이 실패했습니다',
  'err.compile.failed': (p: { issues: CompileIssue[] }) =>
    `TypeScript 컴파일 실패: ${p.issues
      .map((i) => `${i.text || '알 수 없는 오류'}${i.loc ? `(${i.loc.line}행 ${i.loc.column}열)` : ''}`)
      .join('; ')}`,
  'err.compile.raw': (p: { message: string }) => `TypeScript 컴파일 실패: ${p.message}`,
  'err.imports.unresolved': (p: { specs: string[] }) =>
    `코드가 ${p.specs.map((s) => `「${s}」`).join(', ')}을(를) import하는데 이 실행 환경은 모듈 import를 풀 수 없습니다. 실행기는 모듈 해석이 없는 Web Worker이므로, 실행 전에 의존 코드를 같은 파일에 넣으세요.`,

  'err.save.cancelled': '저장이 취소되었습니다',
  'err.ws.rootMoved': (p: { name: string }) =>
    `폴더 ${p.name}이(가) 원래 위치에 없어 목록에서 제거했습니다`,
  'err.ws.permissionDenied': (p: { name: string }) =>
    `${p.name}에 접근 권한을 얻지 못했습니다. 다시 클릭하거나 닫았다가 다시 여세요.`,
  'err.ws.permissionUnavailable':
    '이 브라우저는 지난번의 폴더를 복원하지 못합니다. 폴더를 다시 여세요',
  'err.ws.dirStale': (p: { name: string }) => `폴더 ${p.name}을(를) 열 수 없습니다. 새로고침하세요`,
  'err.ws.dirGone': '이 폴더는 디스크에 없습니다. 새로고침 후 다시 시도하세요',
  'err.ws.parentGone': '대상 폴더가 사라졌습니다. 새로고침 후 다시 시도하세요',
  'err.ws.parentStale': '대상 폴더를 열 수 없습니다. 새로고침해 보세요',
  'err.ws.holderGone': '그 폴더가 있던 곳이 사라졌습니다. 새로고침 후 다시 시도하세요',
  'err.ws.entryStale': (p: { name: string }) =>
    `항목 ${p.name}을(를) 열 수 없습니다. 새로고침하세요`,
  'err.ws.entryMissing': (p: { name: string }) =>
    `항목 ${p.name}이(가) 디스크에 없습니다. 새로고침하세요`,
  'err.ws.entryFailed': (p: { name: string; message: string }) => `항목 ${p.name}: ${p.message}`,
}
