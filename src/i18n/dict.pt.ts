/*
  Dicionário em português — chaves exatamente como dict.zh.ts / dict.en.ts.
  Anotado `: Dict`: chave faltando, a mais ou assinatura de parâmetro errada
  é erro de compilação (tsc).
*/
import type { Dict, CompileIssue } from './dict.zh.ts'

export const pt: Dict = {
  'html.lang': 'pt',
  'html.title': 'Jotter · Rascunho JS / TS',
  'locale.bcp47': 'pt-BR',

  'header.import': 'Importar',
  'header.theme': 'Trocar tema',
  'header.theme.dark': 'Escuro',
  'header.theme.light': 'Claro',
  'header.theme.system': 'Sistema',
  'header.accent': 'Trocar cor de destaque',
  'header.accent.blue': 'Azul',
  'header.accent.pink': 'Rosa',
  'header.accent.orange': 'Laranja',
  'header.accent.green': 'Verde',
  'header.lang': 'Trocar idioma',
  'header.lang.system': 'Sistema',
  'header.github': 'Repositório GitHub',

  'notice.close': 'Fechar aviso',
  'notice.demoLoadFailed': (p: { message: string }) => `Falha ao carregar a demo: ${p.message}`,
  'notice.notTextFile': (p: { name: string }) =>
    `${p.name} não é um arquivo de texto editável e não foi aberto`,
  'notice.deleted': (p: { name: string }) => `${p.name} excluído`,
  'notice.rootRemoved': (p: { name: string }) =>
    `${p.name} foi removido. Nada mudou no disco.`,
  'notice.renamed': (p: { name: string }) => `Renomeado para ${p.name}`,
  'notice.saved': (p: { name: string }) => `${p.name} salvo`,
  'notice.demoReadFailed': (p: { message: string }) =>
    `Falha ao ler as fontes da demo: ${p.message}`,
  'notice.demosSaved': (p: { count: number; label: string }) =>
    `${p.count} demo${p.count === 1 ? '' : 's'} salva${p.count === 1 ? '' : 's'} em ${p.label}. Agora dá para editar — Ctrl+S grava no disco.`,
  'notice.demosSavedClosed': (p: { count: number; label: string }) =>
    `${p.count} demo${p.count === 1 ? '' : 's'} salva${p.count === 1 ? '' : 's'} em ${p.label}, sem abrir à esquerda. Para editar aqui, use « Abrir pasta » nesse diretório.`,
  'notice.demoSaveCleaned': (p: { count: number }) =>
    `${p.count} pasta${p.count === 1 ? '' : 's'} incompleta${p.count === 1 ? '' : 's'} de um salvamento anterior foi${p.count === 1 ? '' : 'ram'} limpa${p.count === 1 ? '' : 's'}`,
  'notice.demoSaveGone':
    'A pasta incompleta do salvamento anterior já não existe; nada a limpar',
  'notice.pathCopied': (p: { path: string }) => `Caminho copiado: ${p.path}`,
  'notice.copyFailed': 'Falha ao copiar, tente novamente',
  'notice.fileReadFailed': (p: { message: string }) => `Falha ao ler o arquivo: ${p.message}`,
  'notice.draftWillSaveTo': (p: { path: string }) =>
    `Digite um nome de arquivo à esquerda e pressione Enter para salvar em ${p.path}`,
  'notice.noWriteTarget':
    'Este arquivo não está dentro de uma pasta local, então não há onde gravá-lo — baixado em vez disso',
  'notice.saveFailed': (p: { message: string }) => `Falha ao salvar: ${p.message}`,
  'notice.externalChanged': (p: { name: string }) =>
    `${p.name} mudou no disco enquanto você ainda tem alterações não salvas; salvar sobrescreverá a versão do disco`,
  'notice.reloaded': (p: { name: string }) =>
    `${p.name} foi recarregado da versão mais recente no disco`,
  'notice.createdButEmpty': (p: { name: string; message: string }) =>
    `${p.name} foi criado, mas não foi possível gravar o conteúdo: ${p.message}`,

  'editor.noFile': 'Nenhum arquivo aberto',
  'editor.dirty': 'Alterações não salvas',
  'editor.save': 'Salvar',
  'editor.saving': 'Salvando…',
  'editor.download': 'Baixar',
  'editor.stop': 'Parar',
  'editor.runDisabled': 'O executor só roda JavaScript / TypeScript',
  'editor.run': 'Executar',

  'tab.close': 'Fechar aba',
  'tab.scrollLeft': 'Rolar abas para a esquerda',
  'tab.scrollRight': 'Rolar abas para a direita',
  'tab.ctx.close': 'Fechar',
  'tab.ctx.closeOthers': 'Fechar outras',
  'tab.ctx.closeRight': 'Fechar à direita',
  'tab.ctx.closeAll': 'Fechar todas',
  'confirm.closeMany.one': 'Fechar a aba não salva?',
  'confirm.closeMany.many': (p: { count: number }) => `Fechar ${p.count} aba${p.count === 1 ? '' : 's'} não salva${p.count === 1 ? '' : 's'}?`,
  'confirm.closeMany.unsaved': 'Essas alterações não salvas serão perdidas.',
  'tab.closeAria': (p: { name: string }) => `Fechar a aba ${p.name}`,
  'confirm.closeTab.title': (p: { name: string }) => `Fechar ${p.name}?`,
  'confirm.closeTab.unsaved':
    'Este arquivo tem alterações não salvas que serão perdidas ao fechar.',
  'confirm.closeTab.ok': 'Fechar',
  'confirm.newScratch.title': 'Descartar o rascunho?',
  'confirm.newScratch.body': 'O rascunho tem conteúdo não salvo que será substituído.',
  'confirm.newScratch.ok': 'Descartar e criar',
  'panes.resize': 'Arraste para redimensionar editor e saída',

  'statusbar.noFile': 'Nenhum arquivo aberto',
  'statusbar.ln': (p: { line: number; col: number }) => `Linha ${p.line}, Col ${p.col}`,
  'statusbar.spaces': (p: { size: number }) => `Espaços: ${p.size}`,
  'statusbar.tabSize': (p: { size: number }) => `Tamanho da tab: ${p.size}`,
  'statusbar.js': 'JavaScript (arquivo .js, roda como JavaScript)',
  'statusbar.ts': 'TypeScript (arquivo .ts, roda como TypeScript)',

  'confirm.cancel': 'Cancelar',
  'confirm.cancelSave.title': 'Parar o salvamento?',
  'confirm.cancelSave.body':
    'A gravação vai parar e os arquivos incompletos já gravados serão apagados, restaurando o estado anterior ao salvamento.',
  'confirm.cancelSave.ok': 'Parar salvamento',
  'confirm.cleanupInterrupted.title': 'Limpar salvamento interrompido?',
  'confirm.cleanupInterrupted.bodyMultiple': (p: { labels: string }) =>
    `Em ${p.labels} foram encontrados arquivos incompletos de um salvamento interrompido (possível recarga ou fechamento da página). Excluir?`,
  'confirm.cleanupInterrupted.bodyRecord': (p: { label: string }) =>
    `Um salvamento foi interrompido (recarga ou fechamento da página) e deixou arquivos incompletos em ${p.label}. Excluir?`,
  'confirm.cleanupInterrupted.ok': 'Limpar',
  'confirm.saveDemos.title': 'Salvar todas as demos localmente?',
  'confirm.saveDemos.body': (p: { count: number }) =>
    `Todas as ${p.count} demo${p.count === 1 ? '' : 's'} serão salvas na pasta escolhida, criando uma subpasta. Continuar?`,
  'confirm.saveDemos.ok': 'Escolher pasta',
  'confirm.openDemos.title': 'Abrir a pasta salva à esquerda?',
  'confirm.openDemos.body': (p: { count: number; label: string }) =>
    `${p.count} demo${p.count === 1 ? '' : 's'} salva${p.count === 1 ? '' : 's'} em ${p.label}. Abrir esta pasta no painel à esquerda para editar diretamente?`,
  'confirm.openDemos.ok': 'Abrir',
  'confirm.delete.title': (p: { name: string }) => `Excluir ${p.name}?`,
  'confirm.delete.dir': (p: { path: string }) => `Isto excluirá ${p.path} e todo o seu conteúdo.`,
  'confirm.delete.file': (p: { path: string }) => `Isto excluirá ${p.path}.`,
  'confirm.delete.unsavedInDir': (p: { count: number }) =>
    `${p.count} arquivo${p.count === 1 ? '' : 's'} aberto${p.count === 1 ? '' : 's'} dentro tem${p.count === 1 ? '' : ' têm'} alterações não salvas e também será${p.count === 1 ? '' : 'o'} excluído${p.count === 1 ? '' : 's'}.`,
  'confirm.delete.unsavedFile':
    'Este arquivo tem alterações não salvas, que também serão excluídas.',
  'confirm.delete.irreversible':
    'A exclusão age direto no disco: nada de lixeira, e sem como desfazer.',
  'confirm.delete.ok': 'Excluir',
  'confirm.closeRoot.title': (p: { name: string }) => `Remover ${p.name}?`,
  'confirm.closeRoot.listOnly': 'Só remove da lista à esquerda. Nada muda no disco.',
  'confirm.closeRoot.openFiles': (p: { count: number }) =>
    `${p.count} arquivo${p.count === 1 ? '' : 's'} aberto${p.count === 1 ? '' : 's'} nele também será${p.count === 1 ? '' : 'o'} fechado${p.count === 1 ? '' : 's'}.`,
  'confirm.closeRoot.openFilesUnsaved': (p: { count: number; unsaved: number }) =>
    `${p.count} arquivo${p.count === 1 ? '' : 's'} aberto${p.count === 1 ? '' : 's'} será${p.count === 1 ? '' : 'o'} fechado${p.count === 1 ? '' : 's'}, e ${p.unsaved} com alterações não salvas serão descartados.`,
  'confirm.closeRoot.reauth':
    'Para usar de novo, é preciso escolher a pasta outra vez. Por uma limitação de segurança do navegador, uma página não consegue manter essa permissão sozinha.',
  'confirm.closeRoot.ok': 'Remover',
  'confirm.renameDir.title': (p: { from: string; to: string }) =>
    `Renomear ${p.from} para ${p.to}?`,
  'confirm.renameDir.how':
    'O navegador não oferece API de renomear pasta: a pasta inteira é copiada com o novo nome e a original só é apagada depois que cada arquivo for copiado.',
  'confirm.renameDir.size': (p: { files: number; size: string }) =>
    `${p.files} arquivo${p.files === 1 ? '' : 's'}, ${p.size} no total. Mantenha a página aberta durante a cópia.`,
  'confirm.renameDir.risk':
    'Os arquivos copiados ganham a data de modificação atual. Se falhar no meio, a original fica intacta, mas uma pasta copiada pela metade fica no disco.',
  'confirm.renameDir.ok': 'Renomear',

  'sidebar.title': 'Arquivos',
  'sidebar.expand': 'Expandir o painel de arquivos',
  'sidebar.collapse': 'Recolher o painel de arquivos',
  'sidebar.newScratch': 'Novo rascunho',
  'sidebar.resize': 'Arraste para redimensionar (clique duplo redefine)',
  'sidebar.localDirs': 'Pastas locais',
  'sidebar.newFileIn': (p: { target: string }) => `Novo arquivo em ${p.target}`,
  'sidebar.newDirIn': (p: { target: string }) => `Nova pasta em ${p.target}`,
  'sidebar.refreshTarget': (p: { target: string }) => `Recarregar ${p.target}`,
  'sidebar.openAnother': 'Abrir outra pasta',
  'sidebar.openFolder': 'Abrir pasta',
  'sidebar.unsupported': (p: { label: string }) =>
    `Este navegador não abre pastas locais — só navegadores baseados em Chromium, como Chrome e Edge, implementam esta API. Ainda assim dá para abrir um único arquivo com « ${p.label} » no topo.`,
  'sidebar.needAuth': 'Requer permissão',
  'sidebar.reauthHint': (p: { label: string }) =>
    `Pastas marcadas com « ${p.label} » voltam com um clique — o navegador pergunta de novo a cada recarga da página`,
  'sidebar.loading': 'Lendo…',
  'sidebar.unsaved': 'Não salvo',
  'sidebar.emptyDir': 'Pasta vazia',
  'sidebar.truncated': (p: { max: number }) => `Muitos itens, mostrando só os ${p.max} primeiros`,
  'sidebar.rootLocked': (p: { name: string }) =>
    `Clique aqui para devolver o acesso a ${p.name}`,
  'sidebar.rootHint': (p: { name: string }) =>
    `${p.name} (clique para expandir / recolher e definir como destino de novos itens; clique direito para mais opções)`,
  'sidebar.rootMenu': (p: { name: string }) => `Ações para ${p.name}`,
  'sidebar.renameAria': 'Novo nome',
  'sidebar.newFileAria': 'Novo nome de arquivo',
  'sidebar.newDirAria': 'Novo nome de pasta',
  'sidebar.demos': 'Trechos de demo',
  'sidebar.demosDirty': 'Alterações de demo não salvas',
  'sidebar.saveDemos': 'Salvar cada demo em uma pasta local',
  'sidebar.cancelSave': 'Cancelar salvamento',
  'sidebar.cancellingSave': 'Cancelando…',
  'sidebar.savingDemos': (p: { done: number; total: number }) => `Salvando localmente ${p.done}/${p.total}`,
  'sidebar.savingDemosFile': (p: { name: string; done: number; total: number }) =>
    `Gravando ${p.name} (${p.done}/${p.total})`,
  'sidebar.currentPath': (p: { path: string }) => `Pasta atual: ${p.path}`,
  'sidebar.uncategorized': 'Sem categoria',

  'menu.rename': 'Renomear',
  'menu.delete': 'Excluir',
  'menu.copyPath': 'Copiar caminho',
  'menu.newFile': 'Novo arquivo',
  'menu.newDir': 'Nova pasta',
  'menu.removeRoot': 'Remover pasta',

  'console.empty': '// a saída do console aparece aqui',

  'console.clear': 'Limpar',

  'console.omitted': (n: number) => `${n} linhas mais antigas omitidas`,

  'file.untitled': (p: { ext: string }) => `Sem título.${p.ext}`,
  'file.newDir': 'Nova pasta',
  'file.scratch': 'Rascunho',

  'validate.empty': 'O nome não pode ficar vazio',
  'validate.tooLong': 'Nome longo demais — no máximo 255 caracteres',
  'validate.dots': '« . » e « .. » não podem ser usados como nome',
  'validate.slash':
    'O nome não pode conter barra — itens novos sempre entram na pasta atual',
  'validate.illegalChars': 'O nome não pode conter < > : " | ? * e caracteres parecidos',
  'validate.control': 'O nome não pode conter caracteres de controle',
  'validate.trailing': 'O nome não pode terminar com ponto ou espaço',
  'validate.reserved': (p: { name: string }) =>
    `${p.name} colide com um nome reservado do sistema, escolha outro`,
  'validate.exists': (p: { name: string }) => `${p.name} já existe, escolha outro nome`,
  'validate.createExt':
    'Só é possível criar arquivos de texto editáveis (.js / .ts / .json / .md e afins)',
  'validate.renameExt':
    'Essa extensão impediria abrir o arquivo — use .js / .ts / .json / .md e afins',

  'err.fs.noPicker': 'Este navegador não abre pastas locais',

  'err.fs.notAllowed': 'Sem permissão para acessar este arquivo ou pasta (pode estar bloqueado por outro programa, ser somente leitura ou a permissão foi revogada)',
  'err.fs.tooLarge': (p: { name: string; size: string; max: string }) =>
    `${p.name} tem ${p.size}, acima do limite de ${p.max}; não foi aberto`,
  'err.fs.binary': (p: { name: string }) =>
    `${p.name} parece ser um arquivo binário; não foi aberto`,
  'err.fs.nameTaken': (p: { name: string; kind: 'file' | 'directory' }) =>
    `${p.name} já existe (${p.kind === 'file' ? 'arquivo' : 'pasta'}), escolha outro nome`,
  'err.fs.uniqueExhausted': (p: { base: string }) =>
    `${p.base} e os 99 nomes numerados seguintes estão todos ocupados; limpe antes a pasta de destino`,
  'err.fs.badBundlePath': (p: { path: string }) => `Caminho de arquivo inválido: ${p.path}`,
  'err.fs.caseRenameUnsupported':
    'Este navegador não renomeia um item para um nome que só difere por maiúsculas/minúsculas. Renomeie primeiro para outra coisa e depois para o nome desejado.',
  'err.fs.ignoredDirInTree': (p: { name: string }) =>
    `A pasta contém ${p.name}; copiar esse tipo de pasta não faz sentido. Renomeie no gerenciador de arquivos do sistema.`,
  'err.fs.treeTooManyFiles': (p: { max: number }) =>
    `A pasta tem mais de ${p.max} arquivos, custo alto para copiar tudo. Renomeie no gerenciador de arquivos do sistema.`,
  'err.fs.treeTooLarge': (p: { max: string }) =>
    `O conteúdo da pasta passa de ${p.max}, custo alto para copiar tudo. Renomeie no gerenciador de arquivos do sistema.`,

  'err.idb.open': 'Falha ao abrir o IndexedDB',
  'err.idb.blocked': 'IndexedDB bloqueado por outra aba',
  'err.idb.abort': 'A transação do IndexedDB foi abortada',
  'err.idb.fail': 'A transação do IndexedDB falhou',
  'err.compile.failed': (p: { issues: CompileIssue[] }) =>
    `Falha ao compilar TypeScript: ${p.issues
      .map((i) => `${i.text || 'Erro desconhecido'}${i.loc ? ` (linha ${i.loc.line}, coluna ${i.loc.column})` : ''}`)
      .join('; ')}`,
  'err.compile.raw': (p: { message: string }) =>
    `Falha ao compilar TypeScript: ${p.message}`,
  'err.imports.unresolved': (p: { specs: string[] }) =>
    `O código importa ${p.specs.map((s) => `« ${s} »`).join(', ')}, e este ambiente não resolve imports de módulos. O executor é um Web Worker sem resolução de módulos — incorpore a dependência no mesmo arquivo antes de executar.`,

  'err.save.cancelled': 'Salvamento cancelado',
  'err.ws.rootMoved': (p: { name: string }) =>
    `A pasta ${p.name} não está mais onde estava, então foi removida da lista`,
  'err.ws.permissionDenied': (p: { name: string }) =>
    `Não foi possível obter acesso a ${p.name}. Clique novamente, ou feche e abra de novo.`,
  'err.ws.permissionUnavailable':
    'Este navegador não consegue restaurar a pasta da última vez; abra a pasta novamente',
  'err.ws.dirStale': (p: { name: string }) => `A pasta ${p.name} não pode mais ser aberta; atualize`,
  'err.ws.dirGone': 'Essa pasta não está mais no disco; atualize e tente de novo',
  'err.ws.parentGone': 'A pasta de destino sumiu; atualize e tente de novo',
  'err.ws.parentStale': 'A pasta de destino não pode mais ser aberta; tente atualizar',
  'err.ws.holderGone': 'A pasta que a contém sumiu; atualize e tente de novo',
  'err.ws.entryStale': (p: { name: string }) => `O item ${p.name} não pode mais ser aberto; atualize`,
  'err.ws.entryMissing': (p: { name: string }) => `O item ${p.name} não está mais no disco; atualize`,
  'err.ws.entryFailed': (p: { name: string; message: string }) => `Item ${p.name}: ${p.message}`,
}
