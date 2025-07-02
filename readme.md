# Tela Preta 2

Tela Preta 2 é um editor de código online leve e acessível, projetado para escrever, salvar e exportar código em várias linguagens de programação. Desenvolvido para ser usado em navegadores, incluindo dispositivos móveis, com suporte a leitores de tela como o TalkBack.

## Funcionalidades

- **Linguagens suportadas**: JavaScript, JSON, HTML, CSS, Python, Markdown, XML, C/C++, PHP, TypeScript, SQL, Ruby, Go.
- **Detecção automática de linguagem**: Identifica a linguagem com base no conteúdo do editor.
- **Realce de sintaxe**: Usando CodeMirror 5 via CDN.
- **Autocompletar**: Sugestões para JavaScript, HTML, CSS, e snippets personalizados (ex.: `for`, `def`, `select`).
- **Validação de sintaxe**: Linting para JavaScript/JSON com JSHint.
- **Pré-visualização**: Renderização em tempo real para HTML e Markdown, console para JavaScript.
- **Formatação**: Formata código com Prettier (JavaScript, JSON, CSS, HTML).
- **Exportação**: Gera arquivos `.zip`, `.txt`, `.md`, ou arquivo atual com extensões como `.js`, `.json`, `.rb`, etc.
- **Histórico**: Salva e gerencia arquivos localmente com compressão (`localStorage` + LZString), suportando extensões personalizadas (ex.: `.json`).
- **Acessibilidade**: Interface otimizada para TalkBack com `aria-label`, `aria-live`, atalhos (`Alt+S`, `Alt+E`, `Alt+D`, `Alt+C`, `Alt+L`).
- **Otimização de performance**:
  - Uso de CDNs para CodeMirror e dependências.
  - Carregamento assíncrono de modos do CodeMirror.
  - `content-visibility: auto` para seções não visíveis.
  - `requestAnimationFrame` para atualizações visuais.
  - Spinner de carregamento acessível.

## Como usar

1. Acesse [https://concego.github.io/tela-preta/](https://concego.github.io/tela-preta/).
2. Escreva ou edite código no editor; a linguagem é detectada automaticamente.
3. Selecione o tema no menu suspenso.
4. Use os botões:
    - **Salvar (Alt+S)**: Armazena o código no histórico com extensão personalizada (ex.: `.js`, `.json`).
    - **Baixar (Alt+D)**: Baixa o código atual com extensão específica.
    - **Exportar ZIP (Alt+E)**: Baixa um arquivo `.zip`.
    - **Exportar TXT/MD**: Baixa como `.txt` ou `.md`.
    - **Formatar**: Formata o código com Prettier.
    - **Pré-visualizar**: Exibe HTML/Markdown ou console JavaScript.
    - **Limpar (Alt+C)**: Apaga o conteúdo do editor com confirmação.
    - **Linguagens (Alt+L)**: Exibe a lista de linguagens suportadas.
    - **Ajuda**: Exibe ajuda e histórico.
    - **Autocompletar (Ctrl+Espaço)**: Sugere completions.
    - **Fechar**: Esconde a seção de ajuda ou linguagens.
5. No histórico, carregue ou exclua arquivos salvos.

## Instalação (para desenvolvedores)

1. Clone o repositório:
    ```bash
    git clone https://github.com/concego/tela-preta.git
    ```
2. Abra `index.html` em um navegador ou hospede em um servidor (ex.: GitHub Pages).
3. Dependências (via CDN ou incluídas em `lib/`):
    - [CodeMirror 5](https://cdnjs.com/libraries/codemirror)
    - [JSZip](https://stuk.github.io/jszip/)
    - [JSHint](https://jshint.com/)
    - [Prettier](https://prettier.io/)
    - [Showdown](https://showdownjs.com/)
    - [LZString](https://pieroxy.net/blog/pages/lz-string/index.html)

## Estrutura do projeto