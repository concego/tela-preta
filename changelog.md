# Changelog

## [1.9.0] - 2025-06-25

### Adicionado
- Suporte a múltiplos editores, cada um com seleção de linguagem e botão “Selecionar” para definir o editor ativo.
- Botão “Baixar como ZIP” para exportar o código do editor ativo com nome/caminho personalizado.
- Botão “Adicionar Editor” para criar novos editores dinamicamente.
- Estilos para múltiplos editores com destaque visual do editor ativo.

### Removido
- Botões “Exportar” e “Exportar Múltiplos”.

## [1.8.0] - 2025-06-23

### Adicionado
- Suporte a PHP com validação, exportação (incluindo `composer.json`), e visualização acessível.
- Campo para especificar nome/caminho do arquivo (ex.: `word/src/scripts.js`) no diálogo de download.

## [1.7.1] - 2025-06-23

### Removido
- Botão "Limpar Dados" e lógica de expiração do `localStorage`.
- Referências a `savedTimestamp`.

### Alterado
- Restaurado comportamento original de `localStorage` (persistência indefinida).
- Atualizado `README.md` para remover menção a gestão de dados.

## [1.7.0] - 2025-06-20

### Adicionado
- Suporte a Kotlin com validação, exportação (incluindo `build.gradle.kts`), e visualização acessível.
- Atalho Ctrl+K para validar Kotlin.

### Removido
- Tutorial interativo.

## [1.6.0] - 2025-06-15

### Adicionado
- Suporte a Java com validação, exportação (`pom.xml`), e visualização.
- Botão "Executar" para JavaScript; Java usa compilador externo.
- Atalhos de teclado (Ctrl+S, Ctrl+V, Ctrl+E).

## [1.5.0] - 2025-06-10

### Adicionado
- Validação em tempo real com `debounce`.
- Visualização Markdown com `marked`.
- Suporte a TypeScript e SQL.
- Botão para carregar arquivos.
- Tutorial interativo (removido em 1.7.0).

## [1.4.0] - 2025-06-05

### Adicionado
- Diálogo acessível para download.
- Validação otimizada.
- Variáveis CSS.

## [1.3.0] - 2025-05-30

### Adicionado
- Suporte para Python, C, Markdown.
- Validação para Python, C, Markdown.

## [1.2.0] - 2025-05-25

### Adicionado
- Download separado.
- Validação com JSHint.

## [1.1.0] - 2025-05-20

### Adicionado
- Fallback `<textarea>`.
- Exportação ZIP.

## [1.0.0] - 2025-05-15

### Adicionado
- Editor com múltiplas linguagens.
- Visualização HTML.
- Temas escuro/claro.
- Acessibilidade ARIA.