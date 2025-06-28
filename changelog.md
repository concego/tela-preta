# Changelog do Tela Preta

Todas as mudanças notáveis no projeto **Tela Preta** são documentadas neste arquivo.

## [2.4.5] - 2025-06-27

### Corrigido
- Corrigido download de arquivos individuais no diálogo `#downloadDialog` com verificação de arquivos vazios e melhor feedback.
- Corrigido download como ZIP com verificação de conteúdo vazio e compatibilidade em navegadores móveis.
- Melhorada acessibilidade do diálogo de download com foco automático e mensagens claras.
- Atualizado versionamento para 2.4.5 no cabeçalho.

### Documentação
- Atualizado `HELP.md` com instruções detalhadas sobre downloads e resolução de problemas.

## [2.4.4] - 2025-06-27

### Corrigido
- Atualizado o link do canal para [https://www.youtube.com/@euconcegojogar](https://www.youtube.com/@euconcegojogar).
- Atualizado os créditos para: “Desenvolvedor, Anderson Carvalho, coocriador do canal Euconcegojogar. Licenciado sob MIT.”
- Atualizado o versionamento para 2.4.4 no cabeçalho.

### Documentação
- Atualizado `HELP.md` e `README.md` com o novo link do canal e créditos.

## [2.4.3] - 2025-06-27

### Adicionado
- Link para o canal no YouTube no rodapé.
- Seção de créditos no rodapé.
- Exibição da versão (2.4.3) no cabeçalho.
- Mensagem de boas-vindas preservada por 3 segundos ao carregar.

### Corrigido
- Visibilidade da mensagem de boas-vindas com estilo `visibility: visible`.
- Acessibilidade para link do canal, créditos e versionamento com `aria-label`.

### Documentação
- Atualizado `HELP.md` com informações sobre canal, créditos, versionamento e mensagem de boas-vindas.

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
- Persistência de código no
