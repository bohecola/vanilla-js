/*
  القاموس العربي — المفاتيح مطابقة تمامًا لـ dict.zh.ts / dict.en.ts.
  الترميز `: Dict` يجعل أي مفتاح ناقص أو زائد أو خطأ في نوع المعامل خطأَ تثبيت (tsc).
  اتجاه النص من اليمين لليسار يديره كود آخر (سمة dir)، هنا الترجمة فقط.
*/
import type { Dict, CompileIssue } from './dict.zh.ts'

export const ar: Dict = {
  'html.lang': 'ar',
  'html.title': 'Jotter · مسوّدة JS / TS',
  'locale.bcp47': 'ar-SA',

  'header.import': 'استيراد',
  'header.theme.dark': 'داكن',
  'header.theme.light': 'فاتح',
  'header.theme.system': 'النظام',
  'header.accent.blue': 'أزرق',
  'header.accent.pink': 'وردي',
  'header.accent.orange': 'برتقالي',
  'header.accent.green': 'أخضر',
  'header.lang.system': 'النظام',
  'header.github': 'مستودع GitHub',

  // ---- 设置面板 ----
  'settings.title': 'الإعدادات',
  'settings.appearance': 'المظهر',
  'settings.mode': 'السمة',
  'settings.accent': 'لون التمييز',
  'settings.language': 'اللغة',
  'settings.editor': 'المحرر',
  'settings.fontSize': 'حجم الخط',
  'settings.fontFamily': 'الخط',
  'settings.fontFamily.system': 'خط النظام أحادي المسافة',
  'settings.fontFamily.hint': 'الخطوط غير مضمّنة في التطبيق. لا يُطبَّق الخط إلا إذا كان مثبتًا على هذا الجهاز؛ وإلا يُستخدم خط النظام أحادي المسافة.',
  'settings.editorTheme': 'سمة المحرر',
  'settings.editorTheme.auto': 'اتباع الواجهة',
  'settings.editorTheme.dark': 'داكن',
  'settings.editorTheme.light': 'فاتح',
  'settings.wordWrap': 'التفاف النص',
  'settings.minimap': 'الخريطة المصغرة',
  'settings.lineNumbers': 'أرقام الأسطر',
  'settings.fontLigatures': 'الحروف المركبة',
  'settings.fontLigatures.hint': 'يعرض تركيبات الرموز مثل => و != و >= كرمز واحد. يعمل فقط مع الخطوط التي تدعم الحروف المركبة مثل Fira Code أو JetBrains Mono.',
  'settings.reset': 'إعادة التعيين',
  'settings.shortcuts': 'الاختصارات',
  'settings.shortcuts.app': 'التطبيق',
  'settings.shortcuts.editorBuiltin': 'المحرر (مدمج)',
  'settings.shortcuts.rename': 'إعادة التسمية (عند التحديد في الشريط الجانبي)',
  'settings.shortcuts.palette': 'لوحة الأوامر',
  'settings.shortcuts.find': 'بحث',
  'settings.shortcuts.replace': 'استبدال',
  'settings.shortcuts.format': 'تنسيق المستند',
  'settings.shortcuts.comment': 'تبديل تعليق السطر',
  'settings.shortcuts.moveLine': 'نقل السطر لأعلى / لأسفل',
  'settings.shortcuts.copyLine': 'نسخ السطر لأسفل',
  'settings.shortcuts.multiCursor': 'تحديد التطابق التالي',
  'settings.close': 'إغلاق',

  'notice.close': 'إغلاق التنبيه',
  'notice.demoLoadFailed': (p: { message: string }) => `فشل تحميل العرض التجريبي: ${p.message}`,
  'notice.notTextFile': (p: { name: string }) =>
    `${p.name} ليس ملفًا نصيًا قابلًا للتحرير، لذلك لم يُفتح`,
  'notice.deleted': (p: { name: string }) => `تم حذف ${p.name}`,
  'notice.rootRemoved': (p: { name: string }) =>
    `تمت إزالة ${p.name}. لم تتغير أي ملفات على القرص.`,
  'notice.renamed': (p: { name: string }) => `تمت إعادة التسمية إلى ${p.name}`,
  'notice.saved': (p: { name: string }) => `تم حفظ ${p.name}`,
  'notice.demoReadFailed': (p: { message: string }) =>
    `فشل قراءة مصادر العرض التجريبي: ${p.message}`,
  'notice.demosSaved': (p: { count: number; label: string }) =>
    `تم حفظ ${p.count} من العروض التجريبية في ${p.label}. يمكنك الآن تعديلها مباشرة — Ctrl+S للكتابة إلى القرص.`,
  'notice.demosSavedClosed': (p: { count: number; label: string }) =>
    `تم حفظ ${p.count} من العروض التجريبية في ${p.label} دون فتحها على اليسار. للتحرير هنا استخدم « فتح مجلد » لهذا الدليل.`,
  'notice.demoSaveCleaned': (p: { count: number }) =>
    `تم تنظيف ${p.count} من المجلدات غير المكتملة المتبقية من حفظ سابق`,
  'notice.demoSaveGone': 'المجلد غير المكتمل من الحفظ السابق لم يعد موجودًا، لا شيء للتنظيف',
  'notice.pathCopied': (p: { path: string }) => `تم نسخ المسار: ${p.path}`,
  'notice.copyFailed': 'فشل النسخ، حاول مجددًا',
  'notice.fileReadFailed': (p: { message: string }) => `فشل قراءة الملف: ${p.message}`,
  'notice.draftWillSaveTo': (p: { path: string }) =>
    `اكتب اسم ملف على اليسار واضغط Enter لحفظه في ${p.path}`,
  'notice.noWriteTarget':
    'هذا الملف ليس داخل مجلد محلي فلا يوجد مكان للكتابة إليه — تم تنزيله بدلًا من ذلك',
  'notice.saveFailed': (p: { message: string }) => `فشل الحفظ: ${p.message}`,
  'notice.externalChanged': (p: { name: string }) =>
    `تغيّر ${p.name} على القرص بينما لديك تعديلات غير محفوظة؛ الحفظ سيستبدل النسخة الموجودة على القرص`,
  'notice.reloaded': (p: { name: string }) =>
    `أُعيد تحميل ${p.name} من أحدث نسخة على القرص`,
  'notice.createdButEmpty': (p: { name: string; message: string }) =>
    `أُنشئ ${p.name} لكن تعذّرت كتابة المحتوى: ${p.message}`,

  'editor.noFile': 'لا يوجد ملف مفتوح',
  'editor.dirty': 'تغييرات غير محفوظة',
  'editor.save': 'حفظ',
  'editor.saving': 'جارٍ الحفظ…',
  'editor.download': 'تنزيل',
  'editor.stop': 'إيقاف',
  'editor.runDisabled': 'المشغّل ينفّذ JavaScript / TypeScript فقط',
  'editor.run': 'تشغيل',

  'tab.close': 'إغلاق التبويب',
  'tab.scrollLeft': 'تمرير التبويبات إلى اليسار',
  'tab.scrollRight': 'تمرير التبويبات إلى اليمين',
  'tab.ctx.close': 'إغلاق',
  'tab.ctx.closeOthers': 'إغلاق البقية',
  'tab.ctx.closeRight': 'إغلاق ما على اليمين',
  'tab.ctx.closeAll': 'إغلاق الكل',
  'confirm.closeMany.one': 'إغلاق التبويب غير المحفوظ؟',
  'confirm.closeMany.many': (p: { count: number }) => `إغلاق ${p.count} تبويب غير محفوظ؟`,
  'confirm.closeMany.unsaved': 'ستُفقد هذه التغييرات غير المحفوظة.',
  'tab.closeAria': (p: { name: string }) => `إغلاق التبويب ${p.name}`,
  'confirm.closeTab.title': (p: { name: string }) => `إغلاق ${p.name}؟`,
  'confirm.closeTab.unsaved': 'لهذا الملف تغييرات غير محفوظة ستضيع إذا أغلقته.',
  'confirm.closeTab.ok': 'إغلاق',
  'confirm.newScratch.title': 'تجاهل المسودة؟',
  'confirm.newScratch.body': 'تحتوي المسودة على محتوى غير محفوظ سيتم استبداله.',
  'confirm.newScratch.ok': 'تجاهل وإنشاء',
  'panes.resize': 'اسحب لتغيير عرض المحرِّر والمخرجات',

  'statusbar.noFile': 'لا يوجد ملف مفتوح',
  'statusbar.ln': (p: { line: number; col: number }) => `سطر ${p.line}، عمود ${p.col}`,
  'statusbar.spaces': (p: { size: number }) => `مسافات: ${p.size}`,
  'statusbar.tabSize': (p: { size: number }) => `حجم التبويب: ${p.size}`,
  'statusbar.js': 'JavaScript (ملف .js، يعمل وفق JavaScript)',
  'statusbar.ts': 'TypeScript (ملف .ts، يعمل وفق TypeScript)',

  'confirm.cancel': 'إلغاء',
  'confirm.cancelSave.title': 'إيقاف الحفظ؟',
  'confirm.cancelSave.body':
    'ستتوقف الكتابة وتُحذف الملفات غير المكتملة المكتوبة، ليعود الوضع كما كان قبل الحفظ.',
  'confirm.cancelSave.ok': 'إيقاف الحفظ',
  'confirm.cleanupInterrupted.title': 'تنظيف حفظ غير مكتمل؟',
  'confirm.cleanupInterrupted.bodyMultiple': (p: { labels: string }) =>
    `عُثر داخل ${p.labels} على ملفات غير مكتملة خلفها حفظ لم يكتمل (ربما إعادة تحميل الصفحة أو إغلاقها). حذفها؟`,
  'confirm.cleanupInterrupted.bodyRecord': (p: { label: string }) =>
    `توقف حفظ سابق (ربما إعادة تحميل الصفحة أو إغلاقها) وترك ملفات غير مكتملة داخل ${p.label}. حذفها؟`,
  'confirm.cleanupInterrupted.ok': 'تنظيف',
  'confirm.saveDemos.title': 'حفظ كل العروض التجريبية محليًا؟',
  'confirm.saveDemos.body': (p: { count: number }) =>
    `ستُحفظ العروض التجريبية الـ${p.count} كلها في المجلد الذي تختاره مع إنشاء مجلد فرعي. متابعة؟`,
  'confirm.saveDemos.ok': 'اختيار مجلد',
  'confirm.openDemos.title': 'فتح المجلد المحفوظ على اليسار؟',
  'confirm.openDemos.body': (p: { count: number; label: string }) =>
    `حُفظت ${p.count} من العروض التجريبية في ${p.label}. فتح هذا المجلد في لوحة الملفات لتحريرها مباشرة؟`,
  'confirm.openDemos.ok': 'فتح',
  'confirm.delete.title': (p: { name: string }) => `حذف ${p.name}؟`,
  'confirm.delete.dir': (p: { path: string }) => `سيُحذف ${p.path} وكل ما بداخله.`,
  'confirm.delete.file': (p: { path: string }) => `سيُحذف ${p.path}.`,
  'confirm.delete.unsavedInDir': (p: { count: number }) =>
    `يوجد بداخله ${p.count} ملف مفتوح بتغييرات غير محفوظة وسيُحذف معه.`,
  'confirm.delete.unsavedFile': 'لهذا الملف تغييرات غير محفوظة وسيُحذف معه.',
  'confirm.delete.irreversible':
    'الحذف يعمل مباشرة على القرص: لا سلة مهملات ولا تراجع ممكن.',
  'confirm.delete.ok': 'حذف',
  'confirm.closeRoot.title': (p: { name: string }) => `إزالة ${p.name}؟`,
  'confirm.closeRoot.listOnly': 'تُزاله فقط من القائمة على اليسار. لا يتغير شيء على القرص.',
  'confirm.closeRoot.openFiles': (p: { count: number }) =>
    `سيُغلق أيضًا ${p.count} ملف مفتوح بداخله.`,
  'confirm.closeRoot.openFilesUnsaved': (p: { count: number; unsaved: number }) =>
    `سيُغلق ${p.count} ملف مفتوح، وسيُتجاهل ${p.unsaved} منها بتغييرات غير محفوظة.`,
  'confirm.closeRoot.reauth':
    'لاستخدامه مجددًا عليك اختيار المجلد مرة أخرى. وبسبب قيود أمان المتصفح لا يمكن لصفحة الويب الاحتفاظ بهذا الإذن بنفسها.',
  'confirm.closeRoot.ok': 'إزالة',
  'confirm.renameDir.title': (p: { from: string; to: string }) =>
    `إعادة تسمية ${p.from} إلى ${p.to}؟`,
  'confirm.renameDir.how':
    'لا يوفر المتصفح واجهة لإعادة تسمية المجلد، لذلك يُنسَخ المجلد كاملًا بالاسم الجديد ولا يُحذف الأصلي إلا بعد نجاح نسخ كل ملف.',
  'confirm.renameDir.size': (p: { files: number; size: string }) =>
    `${p.files} ملفًا بحجم ${p.size} إجمالًا. لا تغلق الصفحة أثناء النسخ.`,
  'confirm.renameDir.risk':
    'سيتحدّث وقت تعديل الملفات المنسوخة إلى الوقت الحالي. وإذا فشل النسخ منتصف الطريق يبقى الأصلي كما هو لكن يبقى مجلد جديد منسوخ جزئيًا على القرص.',
  'confirm.renameDir.ok': 'إعادة تسمية',

  'sidebar.title': 'الملفات',
  'sidebar.expand': 'توسيع لوحة الملفات',
  'sidebar.collapse': 'طي لوحة الملفات',
  'sidebar.newScratch': 'مسوّدة جديدة',
  'sidebar.resize': 'اسحب لتغيير العرض (نقرة مزدوجة للاستعادة)',
  'sidebar.localDirs': 'المجلدات المحلية',
  'sidebar.newFileIn': (p: { target: string }) => `ملف جديد داخل ${p.target}`,
  'sidebar.newDirIn': (p: { target: string }) => `مجلد جديد داخل ${p.target}`,
  'sidebar.refreshTarget': (p: { target: string }) => `إعادة قراءة ${p.target}`,
  'sidebar.openAnother': 'فتح مجلد آخر',
  'sidebar.openFolder': 'فتح مجلد',
  'sidebar.unsupported': (p: { label: string }) =>
    `لا يستطيع هذا المتصفح فتح المجلدات المحلية — المتصفحات المبنية على Chromium مثل Chrome وEdge فقط هي التي تنفّذ هذه الواجهة. ومع ذلك يمكنك فتح ملف واحد عبر « ${p.label} » في الأعلى.`,
  'sidebar.needAuth': 'يلزم إذن',
  'sidebar.reauthHint': (p: { label: string }) =>
    `المجلدات الموسومة بـ« ${p.label} » تعود بنقرة واحدة — فالمتصفح يسأل مجددًا عند كل فتح للصفحة`,
  'sidebar.loading': 'جارٍ القراءة…',
  'sidebar.unsaved': 'غير محفوظ',
  'sidebar.emptyDir': 'مجلد فارغ',
  'sidebar.truncated': (p: { max: number }) => `عناصر كثيرة، نعرض أول ${p.max} فقط`,
  'sidebar.rootLocked': (p: { name: string }) => `انقر هنا لمنح الوصول إلى ${p.name} مجددًا`,
  'sidebar.rootHint': (p: { name: string }) =>
    `${p.name} (انقر للطي/الفتح واجعله هدفًا للعناصر الجديدة؛ وانقر بزر الفأرة الأيمن لمزيد من الخيارات)`,
  'sidebar.rootMenu': (p: { name: string }) => `إجراءات لـ ${p.name}`,
  'sidebar.renameAria': 'اسم جديد',
  'sidebar.newFileAria': 'اسم ملف جديد',
  'sidebar.newDirAria': 'اسم مجلد جديد',
  'sidebar.demos': 'مقتطفات العروض',
  'sidebar.demosDirty': 'تغييرات عرض غير محفوظة',
  'sidebar.saveDemos': 'حفظ كل عرض في مجلد محلي',
  'sidebar.cancelSave': 'إلغاء الحفظ',
  'sidebar.cancellingSave': 'جارٍ الإلغاء…',
  'sidebar.savingDemos': (p: { done: number; total: number }) => `حفظ محلي ${p.done}/${p.total}`,
  'sidebar.savingDemosFile': (p: { name: string; done: number; total: number }) =>
    `كتابة ${p.name} (${p.done}/${p.total})`,
  'sidebar.uncategorized': 'غير مصنَّف',

  'menu.rename': 'إعادة تسمية',
  'menu.delete': 'حذف',
  'menu.copyPath': 'نسخ المسار',
  'menu.newFile': 'ملف جديد',
  'menu.newDir': 'مجلد جديد',
  'menu.removeRoot': 'إزالة المجلد',

  'console.empty': '// سيعرض إخراج console هنا',

  'console.clear': 'مسح',

  'console.omitted': (n: number) => `تم حذف أقدم ${n} سطرًا`,

  'file.untitled': (p: { ext: string }) => `بدون عنوان.${p.ext}`,
  'file.newDir': 'مجلد جديد',
  'file.scratch': 'مسوّدة',

  'validate.empty': 'لا يمكن أن يكون الاسم فارغًا',
  'validate.tooLong': 'الاسم طويل جدًا — 255 حرفًا كحد أقصى',
  'validate.dots': 'لا يمكن استخدام « . » أو « .. » كاسم',
  'validate.slash': 'لا يمكن أن يحتوي الاسم على شرطة مائلة — العناصر الجديدة تُنشأ في المجلد الحالي دائمًا',
  'validate.illegalChars': 'لا يمكن أن يحتوي الاسم على < > : " | ? * وأحرف مشابهة',
  'validate.control': 'لا يمكن أن يحتوي الاسم على أحرف تحكم',
  'validate.trailing': 'لا يمكن أن ينتهي الاسم بنقطة أو مسافة',
  'validate.reserved': (p: { name: string }) =>
    `يتعارض الاسم ${p.name} مع اسم محجوز للنظام، اختر اسمًا آخر`,
  'validate.exists': (p: { name: string }) => `الاسم ${p.name} موجود مسبقًا، اختر اسمًا آخر`,
  'validate.createExt': 'لا يمكن إنشاء إلا ملفات نصية قابلة للتحرير (.js / .ts / .json / .md وغيرها)',
  'validate.renameExt':
    'بهذه اللاحقة لن يفتح الملف — استخدم .js / .ts / .json / .md وما شابه',

  'err.fs.noPicker': 'لا يستطيع هذا المتصفح فتح مجلدات محلية',

  'err.fs.notAllowed': 'لا يوجد إذن للوصول إلى هذا الملف أو المجلد (قد يكون مقفلاً من برنامج آخر، أو للقراءة فقط، أو تم إلغاء الإذن)',
  'err.fs.tooLarge': (p: { name: string; size: string; max: string }) =>
    `${p.name} حجمه ${p.size}، ما يتجاوز حد ${p.max}؛ لم يُفتح`,
  'err.fs.binary': (p: { name: string }) =>
    `${p.name} يبدو ملفًا ثنائيًا؛ لم يُفتح`,
  'err.fs.nameTaken': (p: { name: string; kind: 'file' | 'directory' }) =>
    `الاسم ${p.name} موجود مسبقًا (${p.kind === 'file' ? 'ملف' : 'مجلد'})، اختر اسمًا آخر`,
  'err.fs.uniqueExhausted': (p: { base: string }) =>
    `${p.base} والأرقام الـ99 التالية كلها مستخدمة؛ نظّف المجلد الهدف أولًا`,
  'err.fs.badBundlePath': (p: { path: string }) => `مسار ملف غير صالح: ${p.path}`,
  'err.fs.caseRenameUnsupported':
    'لا يستطيع هذا المتصفح إعادة تسمية عنصر إلى اسم لا يختلف إلا في حالة الأحرف. أعد تسميته إلى اسم آخر أولًا ثم إلى الاسم المطلوب.',
  'err.fs.ignoredDirInTree': (p: { name: string }) =>
    `يحتوي المجلد على ${p.name}؛ نسخ مثل هذا المجلد غير مجدٍ. أعد تسميته في مدير ملفات النظام.`,
  'err.fs.treeTooManyFiles': (p: { max: number }) =>
    `يحتوي المجلد على أكثر من ${p.max} ملف، وهو عبء كبير للنسخ الكامل. أعد التسمية في مدير ملفات النظام.`,
  'err.fs.treeTooLarge': (p: { max: string }) =>
    `يتجاوز محتوى المجلد ${p.max}، وهو عبء كبير للنسخ الكامل. أعد التسمية في مدير ملفات النظام.`,

  'err.idb.open': 'فشل فتح IndexedDB',
  'err.idb.blocked': 'IndexedDB محجوب بواسطة تبويب آخر',
  'err.idb.abort': 'أُلغيت معاملة IndexedDB',
  'err.idb.fail': 'فشلت معاملة IndexedDB',
  'err.compile.failed': (p: { issues: CompileIssue[] }) =>
    `فشل ترجمة TypeScript: ${p.issues
      .map((i) => `${i.text || 'خطأ غير معروف'}${i.loc ? ` (سطر ${i.loc.line}، عمود ${i.loc.column})` : ''}`)
      .join('؛ ')}`,
  'err.compile.raw': (p: { message: string }) => `فشل ترجمة TypeScript: ${p.message}`,
  'err.imports.bare': (p) =>
    `${p.from} يستورد "${p.spec}" وهي حزمة npm. استيراد حزم الطرف الثالث غير مدعوم بعد؛ يعمل فقط الاستيراد بمسار نسبي لملفات داخل المجلد المفتوح.`,
  'err.imports.noRoot':
    'هذا الملف ليس داخل مجلد مفتوح (مسودة أو عرض مدمج أو ملف مستورد)، لذا لا يمكن حل الاستيراد النسبي. احفظه في مجلد ثم شغّله.',
  'err.imports.notFound': (p) =>
    `لم يُعثر على "${p.spec}" الذي يستورده ${p.from}. تمت المحاولة: ${p.tried.join('، ')}.`,
  'err.imports.outsideRoot': (p) =>
    `"${p.spec}" الذي يستورده ${p.from} يشير إلى خارج المجلد المفتوح ولا يمكن استيراده.`,
  'err.imports.unsupportedType': (p) =>
    `"${p.spec}" الذي يستورده ${p.from} ليس ملف JS / TS قابلًا للتشغيل. المدعوم فقط: .js و .mjs و .ts و .mts.`,
  'err.imports.cycle': (p) =>
    `استيراد دائري: ${p.chain.join(' → ')}. بيئة التشغيل هذه لا تدعم الاعتماديات الدائرية؛ اكسر إحدى حلقات الدورة.`,
  'err.imports.tooMany': (p) =>
    `تم استيراد أكثر من ${p.limit} ملفًا، فتوقف التشغيل. تحقق مما إذا كان يتم استيراد مجلد مثل node_modules.`,

  'err.save.cancelled': 'أُلغي الحفظ',
  'err.ws.rootMoved': (p: { name: string }) =>
    `لم يعد المجلد ${p.name} في موضعه، لذلك أُزيل من القائمة`,
  'err.ws.permissionDenied': (p: { name: string }) =>
    `تعذّر الوصول إلى ${p.name}. انقر مجددًا أو أغلقه وافتحه من جديد.`,
  'err.ws.permissionUnavailable':
    'لا يستطيع هذا المتصفح استعادة مجلد الجلسة السابقة، افتح المجلد مجددًا',
  'err.ws.dirStale': (p: { name: string }) => `تعذّر فتح المجلد ${p.name}، حدّث الصفحة`,
  'err.ws.dirGone': 'لم يعد هذا المجلد على القرص، حدّث ثم حاول مجددًا',
  'err.ws.parentGone': 'اختفى المجلد الهدف، حدّث ثم حاول مجددًا',
  'err.ws.parentStale': 'تعذّر فتح المجلد الهدف، جرّب تحديث الصفحة',
  'err.ws.holderGone': 'اختفى المجلد الذي يضمّه، حدّث ثم حاول مجددًا',
  'err.ws.entryStale': (p: { name: string }) => `تعذّر فتح العنصر ${p.name}، حدّث الصفحة`,
  'err.ws.entryMissing': (p: { name: string }) => `لم يعد العنصر ${p.name} على القرص، حدّث الصفحة`,
  'err.ws.entryFailed': (p: { name: string; message: string }) => `العنصر ${p.name}: ${p.message}`,
}
