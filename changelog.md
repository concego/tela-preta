# Changelog - Tela Preta 2

Todas as alterações notáveis no projeto Tela Preta 2 serão documentadas neste arquivo.

## [1.3.0] - 2025-07-02

### Adicionado
- **Otimização de performance**:
    - Substituição de arquivos locais do CodeMirror por CDNs (cdnjs.cloudflare.com).
    - Carregamento assíncrono de modos do CodeMirror via CDN.
    - Uso de `content-visibility: auto` para `#preview`, `#console`, `#help-section`, `#languages-section`.
    - Uso de `requestAnimationFrame` para atualizações visuais em `updatePreview`.
    - Spinner de carregamento acessível com `aria-live="polite"`.
    - Cache de snippets no `localStorage` para inicialização mais rápida.
- **Funcionalidades**:
    - Suporte para salvar arquivos com extensões personalizadas (ex.: `.json`) no histórico e exportação.
    - Atalhos de teclado: `Alt+D` (Baixar), `Alt+C` (Limpar), `Alt+L` (Linguagens).
- **Acessibilidade**:
    - `aria-live="assertive"` no console JavaScript para feedback imediato.
    - Anúncio de carregamento com spinner acessível.

### Alterado
- Removidas dependências locais do CodeMirror, exceto `jszip.min.js`.
- Atualizado `README.md` com otimizações de performance e suporte a `.json`.

## [1.2.0] - 2025-07-02

### Adicionado
- **Botões**:
    - "Baixar": Permite baixar o arquivo atual com a extensão da linguagem (ex.: `.js`, `.rb`).
    - "Limpar": Apaga o conteúdo do editor com confirmação.
    - "Linguagens": Exibe uma lista de linguagens suportadas.
- **Detecção de linguagem**: Remove o seletor de linguagens e implementa detecção automática com base no conteúdo.
- **Linguagens**:
    - Suporte a Ruby e Go com realce de sintaxe via CodeMirror.
    - Snippets para Ruby (`def`, `each`) e Go (`func`, `for`).
- **Acessibilidade**:
    - `aria-label` e `aria-live` para os novos botões e lista de linguagens.

### Alterado
- Removido o seletor `<select id="language">` do `index.html`.
- Atualizada a interface com novos botões e seção de linguagens.
- Atualizado `README.md` para refletir detecção de linguagem e novas funcionalidades.

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
- Interface atualizada com novos botões e seletor de temas.
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
- Botão "