# Tela Preta

**Tela Preta** é um editor de código acessível projetado para suportar múltiplos arquivos e linguagens de programação, com foco em acessibilidade para usuários de leitores de tela, como o TalkBack no Android. Ele permite criar, editar, validar, formatar e baixar códigos diretamente no navegador, com suporte a visualização em tempo real e persistência local.

## Funcionalidades

- **Múltiplos Editores**: Adicione vários editores para trabalhar com diferentes arquivos simultaneamente.
- **Suporte a Linguagens**: Inclui HTML (`.html`), CSS (`.css`), JavaScript (`.js`, `.ts`, `.tsx`), Python (`.py`), C (`.c`, `.cpp`, `.h`), Markdown (`.md`), SQL (`.sql`), Java (`.java`), Kotlin (`.kt`), PHP (`.php`), JSON (`.json`) e texto puro (`.txt`).
- **Validação de Código**: Verifica a sintaxe de todos os editores selecionados, com mensagens de erro detalhadas.
- **Formatação de JSON**: Formata JSON no editor ativo com indentação adequada.
- **Visualização**: Exibe HTML, Markdown, JSON ou texto puro em tempo real no editor ativo.
- **Download de Arquivos**: Baixe arquivos individualmente ou como um arquivo ZIP.
- **Acessibilidade**: Compatível com TalkBack, com `aria-label`, `aria-live="polite"` e diálogos acessíveis.
- **Persistência**: Salva códigos e configurações no `localStorage` do navegador.
- **Atalhos**:
  - **Ctrl+S**: Salvar códigos localmente.
  - **Ctrl+V**: Validar todos os editores.
  - **Ctrl+Z**: Baixar como ZIP.
  - **Ctrl+K**: Validar apenas código Kotlin.
- **Versionamento**: Exibe a versão atual (2.4.5) no cabeçalho.

## Como Usar

1. Acesse o [Tela Preta](https://concego.github.io/tela-preta/) no navegador.
2. Clique em “Adicionar Editor” para criar um novo editor.
3. Insira o nome do arquivo (ex.: `src/index.js`) para definir a linguagem pela extensão.
4. Escreva ou cole o código no editor. O conteúdo é salvo automaticamente.
5. Use os botões para:
   - Selecionar o editor ativo.
   - Ver formatos suportados.
   - Formatar JSON (se aplicável).
   - Validar códigos.
   - Baixar arquivos individualmente ou como ZIP.
6. Navegue com TalkBack para interagir com botões, diálogos e mensagens de status.
7. Consulte a [Ajuda](HELP.md) para instruções detalhadas.

## Demonstração

Acesse o projeto em [https://concego.github.io/tela-preta/](https://concego.github.io/tela-preta/).

## Instalação

Não é necessária instalação. O Tela Preta roda diretamente no navegador. Para desenvolvimento local:

1. Clone o repositório:
   ```bash
   git clone https://github.com/concego/tela-preta.git
