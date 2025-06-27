# Changelog do Tela Preta

Todas as mudanças notáveis no projeto **Tela Preta** são documentadas neste arquivo.

## [2.4.2] - 2025-06-27

### Adicionado
- Validação de nomes de arquivo (permite apenas letras, números, `/`, `-`, `_`, e `.`).
- Limite de 500.000 caracteres por editor para melhor desempenho.
- Debounce na visualização para reduzir chamadas com arquivos grandes.
- Resumo de erros de validação em `#validationErrors`.

### Corrigido
- Mensagens de validação TSX com exemplos práticos.
- `checkPastedCode` para normalizar quebras de linha e espaços.
- Acessibilidade: `aria-describedby` nos botões, `autofocus` nos diálogos.

### Otimizado
- Desempenho para arquivos grandes com limite e debounce.
- Estilo de `#validationErrors` com `max-height` e `overflow`.

## [2.4.1] - 2025-06-27

### Removido
- Integração com GitHub (botão “Conectar com GitHub”, diálogo de repositórios, e funções de carregamento/salvamento).
- Arquivo `callback.html`.
- Documentação relacionada no `README.md` e `HELP.md`.

## [2.4.0] - 2025-06-26

### Adicionado
- Suporte a múltiplos editores com CodeMirror.
- Validação de código para HTML, CSS, JavaScript, TypeScript, Python, C, Markdown, SQL, Java, Kotlin, PHP, JSON.
- Formatação de JSON no editor ativo.
- Download de arquivos individuais ou como ZIP.
- Visualização de HTML, Markdown, JSON e texto puro.
- Persistência de código no `localStorage`.
- Acessibilidade com TalkBack: `aria-label`, `aria-live="polite"`, `role="dialog"`.
- Atalhos: Ctrl+S (salvar), Ctrl+V (validar), Ctrl+Z (baixar ZIP), Ctrl+K (validar Kotlin).
- Documentação em `HELP.md`.

### Corrigido
- Navegação com TalkBack em diálogos e botões.
- Erros de validação exibidos corretamente.

## [2.3.0] - 2025-06-20

### Adicionado
- Suporte inicial a TypeScript (`.ts`, `.tsx`) com validação básica.
- Área de visualização para HTML e Markdown.

### Corrigido
- Estilos responsivos para dispositivos móveis.

## [2.2.0] - 2025-06-15

### Adicionado
- Suporte a Python, C, SQL, Java, Kotlin, PHP.
- Validação básica para novas linguagens.

## [2.1.0] - 2025-06-10

### Adicionado
- Suporte a múltiplos editores.
- Download de arquivos como ZIP usando JSZip.

## [2.0.0] - 2025-06-01

### Adicionado
- Interface inicial com CodeMirror.
- Suporte a HTML, CSS, JavaScript, JSON.
- Validação básica com JSHint para JavaScript.

### Corrigido
- Problemas de layout em navegadores móveis.