# Tela Preta 2

Tela Preta 2 é um editor de código online leve e acessível, projetado para escrever, salvar e exportar código em várias linguagens de programação. Desenvolvido para ser usado em navegadores, incluindo dispositivos móveis, com suporte a leitores de tela como o TalkBack.

## Funcionalidades

- **Linguagens suportadas**: JavaScript, JSON, HTML, CSS, Python, Markdown, XML, C/C++, PHP, TypeScript, SQL.
- **Realce de sintaxe**: Usando CodeMirror 5.
- **Autocompletar**: Sugestões para JavaScript, HTML, CSS, e snippets personalizados (ex.: `for`, `def`).
- **Validação de sintaxe**: Linting para JavaScript/JSON com JSHint.
- **Pré-visualização**: Renderização em tempo real para HTML e Markdown, console para JavaScript.
- **Formatação**: Formata código com Prettier (JavaScript, JSON, CSS, HTML).
- **Exportação**: Gera arquivos `.zip`, `.txt` ou `.md` com o código atual e histórico.
- **Histórico**: Salva e gerencia arquivos localmente com compressão (`localStorage` + LZString).
- **Acessibilidade**: Interface otimizada para TalkBack com `aria-label`, `aria-live`, atalhos (`Alt+S`, `Alt+E`).

## Como usar

1. Acesse [https://concego.github.io/tela-preta/](https://concego.github.io/tela-preta/).
2. Selecione a linguagem e tema no menu suspenso.
3. Escreva ou edite código no editor.
4. Use os botões:
    - **Salvar (Alt+S)**: Armazena o código no histórico.
    - **Exportar ZIP (Alt+E)**: Baixa um arquivo `.zip`.
    - **Exportar TXT/MD**: Baixa como `.txt` ou `.md`.
    - **Formatar**: Formata o código com Prettier.
    - **Pré-visualizar**: Exibe HTML/Markdown ou console JavaScript.
    - **Ajuda**: Exibe ajuda e histórico.
    - **Autocompletar (Ctrl+Espaço)**: Sugere completions.
    - **Fechar**: Esconde a seção de ajuda.
5. No histórico, carregue ou exclua arquivos salvos.

## Instalação (para desenvolvedores)

1. Clone o repositório:
    ```bash
    git clone https://github.com/concego/tela-preta.git
    ```
2. Abra `index.html` em um navegador ou hospede em um servidor (ex.: GitHub Pages).
3. Dependências (já incluídas em `lib/` ou via CDN):
    - [CodeMirror 5](https://codemirror.net/5/)
    - [JSZip](https://stuk.github.io/jszip/)
    - [JSHint](https://jshint.com/)
    - [Prettier](https://prettier.io/)
    - [Showdown](https://showdownjs.com/)
    - [LZString](https://pieroxy.net/blog/pages/lz-string/index.html)

## Estrutura do projeto