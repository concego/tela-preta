# Changelog - Tela Preta 2

Todas as alterações notáveis no projeto Tela Preta 2 serão documentadas neste arquivo.

## [1.1.0] - 2025-07-01

### Adicionado
- **Acessibilidade**:
    - Anúncios dinâmicos com `aria-live` no histórico para TalkBack.
    - Foco automático no editor ao carregar a página.
    - Atalhos de teclado acessíveis (`Alt+S` para salvar, `Alt+E` para exportar ZIP).
    - Seletor de temas (Monokai e Solarized) para alto contraste.
    - Instruções de acessibilidade para TalkBack na seção de ajuda.
- **Funcionalidades**:
    - Linting para JavaScript/JSON com JSHint, destacando erros em tempo real.
    - Pré-visualização para HTML (em `<iframe>`) e Markdown (com Showdown.js).
    - Formatador de código com Prettier para JavaScript, JSON, CSS, e HTML.
    - Snippets personalizados para JavaScript (`for`, `func`) e Python (`def`, `for`).
    - Depurador básico para JavaScript, exibindo saídas de `console.log` em um console.
    - Exportação para `.txt` e `.md` com botões dedicados.
- **Linguagens**:
    - Suporte a PHP, TypeScript, e SQL com modos do CodeMirror.
- **Otimizações**:
    - Carregamento dinâmico de modos do CodeMirror para reduzir tempo de carregamento.
    - Compressão do histórico com `LZString` para otimizar `localStorage`.
    - Lazy loading de `jszip.min.js` para exportação ZIP.
    - Uso de `transform` no CSS para reduzir reflows.

### Alterado
- Interface atualizada com novos botões (`Formatar`, `Pré-visualizar`, `Exportar TXT`, `Exportar MD`) e seletor de temas.
- Botão "Ajuda" agora apenas abre a seção de ajuda, com botão "Fechar" separado.
- Arquivos do CodeMirror mantidos não minificados em `lib/codemirror/mode/`.

### Corrigido
- Corrigido possíveis erros 404 com carregamento dinâmico de modos.
- Melhorada acessibilidade com `aria-label` consistentes.

## [1.0.0] - 2025-07-01

### Adicionado
- Suporte a linguagens: JavaScript, JSON, HTML, CSS, Python, Markdown, XML, C/C++ com realce de sintaxe via CodeMirror 5.
- Autocompletar para JavaScript, HTML, CSS e palavras genéricas.
- Validação de nomes de arquivos, proibindo caracteres inválidos.
- Exportação de código em `.zip` usando JSZip.
- Histórico de arquivos salvo no `localStorage` com opções de carregar e excluir.
- Interface acessível com `aria-label` para TalkBack.
- Botão "Fechar" na seção de ajuda.

### Alterado
- Arquivos do CodeMirror atualizados para versões não minificadas (`clike.js`, `css.js`, etc.).

### Corrigido
- Corrigido erro de carregamento de arquivos minificados ausentes.

## [Unreleased]

- Planejado: Suporte a Ruby e Go.
- Planejado: Modo offline com Service Worker.
- Planejado: Temas personalizáveis pelo usuário.

---

Formato baseado no [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).