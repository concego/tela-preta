# Ajuda do Tela Preta

Bem-vindo à documentação de ajuda do **Tela Preta**, um editor de código acessível projetado para suportar múltiplos arquivos e linguagens de programação, com foco em acessibilidade para usuários de leitores de tela, como o TalkBack no Android.

## Como Usar

1. **Adicionar um Editor**:
   - Clique no botão “Adicionar Editor” para criar um novo editor de código.
   - Cada editor suporta uma linguagem específica, definida pelo nome do arquivo.

2. **Definir o Nome do Arquivo**:
   - Insira o nome do arquivo (ex.: `src/index.js`) no campo de texto acima do editor.
   - Use apenas letras, números, `/`, `-`, `_`, e `.` (ex.: `index.html`, não `file*.js`).
   - A extensão do arquivo (ex.: `.js`, `.html`) define a linguagem automaticamente.

3. **Escrever Código**:
   - Digite ou cole o código no editor. O conteúdo é salvo automaticamente no armazenamento local do navegador.
   - Use atalhos como Ctrl+S para salvar manualmente os editores marcados.

4. **Selecionar Editor Ativo**:
   - Clique em “Selecionar” em um editor para torná-lo ativo, atualizando a visualização.

5. **Formatos Suportados**:
   - Clique em “Formatos Suportados” para ver a lista de linguagens disponíveis (ex.: HTML, CSS, JavaScript, JSON).
   - Selecione uma linguagem para aplicar ao editor ativo.

6. **Formatar Código**:
   - Clique em “Formatar” para formatar JSON no editor ativo (outros formatos não são suportados para formatação).

7. **Validar Código**:
   - Clique em “Validar” para verificar a sintaxe dos editores marcados.
   - Erros são exibidos abaixo de cada editor e na área de validação geral.

8. **Baixar Arquivos**:
   - Clique em “Baixar Arquivos” para abrir um diálogo e selecionar arquivos a baixar individualmente.
   - Marque os arquivos desejados no diálogo e clique em “Confirmar”. Arquivos vazios são ignorados.
   - Clique em “Baixar como ZIP” para baixar todos os editores marcados em um arquivo ZIP (atalho: Ctrl+Z).
   - Certifique-se de que os editores incluídos têm conteúdo válido e nomes de arquivo corretos.

9. **Visualizar Código**:
   - O código do editor ativo é exibido na área de visualização (suporta HTML, Markdown, JSON, e texto puro).

10. **Explorar o Projeto**:
    - Acesse o canal no YouTube, créditos, e versionamento no rodapé da página.
    - A mensagem de boas-vindas é exibida ao carregar a página.

## Funcionalidades

### 1. Múltiplos Editores
- Adicione vários editores para trabalhar com diferentes arquivos simultaneamente.
- Cada editor tem um campo para nome de arquivo, um seletor de linguagem, e uma caixa de seleção para incluir em salvamentos/downloads.

### 2. Suporte a Linguagens
- Suporta: HTML (`.html`), CSS (`.css`), JavaScript (`.js`, `.ts`, `.tsx`), Python (`.py`), C (`.c`, `.cpp`, `.h`), Markdown (`.md`), SQL (`.sql`), Java (`.java`), Kotlin (`.kt`), PHP (`.php`), JSON (`.json`), Texto (`.txt`).
- A linguagem é inferida pela extensão do arquivo ou selecionada manualmente.

### 3. Validação de Código
- Clique em “Validar” para verificar a sintaxe de todos os editores marcados.
- Erros são exibidos abaixo de cada editor e resumidos na área de validação geral.
- Nomes de arquivo são validados (apenas letras, números, `/`, `-`, `_`, e `.` são permitidos).
- Para TSX, erros incluem exemplos práticos (ex.: "TSX requer importação do React: import React from 'react';").
- Suporte a: HTML, CSS, JavaScript, TypeScript, Python, C, Markdown, SQL, Java, Kotlin, PHP, JSON.

### 4. Formatação de JSON
- Clique em “Formatar” para formatar JSON no editor ativo com indentação adequada.

### 5. Visualização
- Visualize HTML diretamente no iframe, Markdown renderizado, JSON formatado, ou texto puro.
- A visualização é atualizada automaticamente quando o editor ativo é alterado.

### 6. Download de Arquivos
- Baixe arquivos individualmente via “Baixar Arquivos” ou como um ZIP contendo todos os editores marcados via “Baixar como ZIP”.
- Arquivos vazios são ignorados, com mensagens de aviso no status.

### 7. Acessibilidade
- Compatível com TalkBack: botões com `aria-label`, mensagens de status com `aria-live="polite"`, diálogos com `role="dialog"`.
- Navegue pelos editores, botões e diálogos usando gestos do TalkBack.
- Feche diálogos com a tecla Esc.
- Mensagem de boas-vindas, versionamento, e créditos são acessíveis no carregamento.

### 8. Persistência
- O código e as configurações de cada editor são salvos no `localStorage` do navegador.
- Os editores são restaurados automaticamente ao recarregar a página.

### 9. Informações do Projeto
- **Canal no YouTube**: Acesse tutoriais e atualizações em [https://www.youtube.com/@euconcegojogar](https://www.youtube.com/@euconcegojogar).
- **Créditos**: Desenvolvedor, Anderson Carvalho, coocriador do canal Euconcegojogar. Licenciado sob MIT.
- **Versionamento**: A versão atual (ex.: 2.4.5) é exibida no cabeçalho.

## Dicas
- Use atalhos para produtividade:
  - **Ctrl+S**: Salvar códigos dos editores marcados localmente.
  - **Ctrl+V**: Validar todos os editores (mesmo os não marcados).
  - **Ctrl+Z**: Baixar editores marcados como ZIP.
  - **Ctrl+K**: Validar apenas código Kotlin nos editores marcados.
- Evite arquivos com mais de 500.000 caracteres para melhor desempenho em dispositivos móveis.
- Use nomes de arquivo válidos (ex.: `src/index.js`, não `file*.js`).
- Para TSX, inclua `import React from 'react';` e elementos JSX (ex.: `<div>Hello</div>`) para evitar erros de validação.
- Verifique o canal no YouTube para tutoriais detalhados.

## Resolução de Problemas
- **Editor não carrega**: Verifique se o JavaScript está habilitado no navegador.
- **Visualização não atualiza**: Certifique-se de que o editor ativo está selecionado.
- **Erro de validação**: Leia as mensagens de erro abaixo de cada editor ou na área de validação geral.
- **Mensagem de boas-vindas não aparece**: Recarregue a página e aguarde 3 segundos.
- **Link, créditos ou versão não visíveis**: Verifique o cabeçalho e rodapé da página.
- **Download não funciona**:
  - Certifique-se de que os editores têm conteúdo válido (não vazios).
  - Verifique se o navegador permite downloads automáticos (desative bloqueadores de pop-ups).
  - No diálogo de download, marque os arquivos desejados e clique em “Confirmar”.
  - Para ZIP, use Ctrl+Z ou o botão “Baixar como ZIP” e verifique as mensagens de status.
  - Consulte o canal no YouTube para tutoriais sobre downloads.
- **Navegação com TalkBack**:
  - Deslize com um dedo para navegar.
  - Toque longo para opções (ex.: “Copiar”, “Colar”).
  - Ajuste a granularidade com dois dedos para cima/baixo.

## Contato
Para sugestões ou problemas, abra uma issue em [https://github.com/concego/tela-preta](https://github.com/concego/tela-preta).
