# Tela Preta IDE

Um IDE (Ambiente de Desenvolvimento Integrado) leve e baseado em navegador, projetado para desenvolvimento web (HTML, CSS, JavaScript). O Tela Preta oferece gerenciamento de projetos, edição de código com realce de sintaxe e autocompletar, pré-visualização em tempo real e um console integrado.

## Funcionalidades

* **Gerenciamento de Projetos:** Crie, abra, renomeie e exclua projetos diretamente no navegador.
* **Gerenciamento de Arquivos:** Adicione, renomeie e exclua arquivos e pastas dentro dos seus projetos.
* **Editor de Código Avançado:**
    * Baseado em [CodeMirror](https://codemirror.net/).
    * Realce de sintaxe para HTML, CSS, JavaScript e muitas outras linguagens.
    * Autocompletar (Intellisense) para HTML, CSS e JavaScript.
    * Funcionalidades de busca (Ctrl+F / Cmd+F) e substituição (Ctrl+H / Cmd+H).
    * Fechamento automático de chaves/parênteses e auto-indentação.
    * **NOVO:** Botão para limpar o conteúdo do arquivo atual.
    * **NOVO:** Botão para salvar manualmente o conteúdo do arquivo atual.
* **Interface Multi-Abas:** Trabalhe em vários arquivos simultaneamente, alternando entre eles com facilidade.
* **Pré-visualização em Tempo Real (Live Reload):** Veja as mudanças no seu código HTML, CSS e JavaScript instantaneamente no painel de pré-visualização.
* **Console Integrado:** Monitore logs e erros do seu JavaScript diretamente no IDE.
* **Persistência de Dados:** Todos os seus projetos e arquivos são salvos automaticamente no armazenamento local do seu navegador.
* **Exportação de Projetos:** Exporte seus projetos completos como arquivos `.zip` para compartilhar ou fazer backup.
* **Acessibilidade:** Elementos semânticos e atributos ARIA para melhorar a navegação com tecnologias assistivas.

## Como Usar

1.  **Abra o `index.html`** no seu navegador web (Google Chrome, Mozilla Firefox, Microsoft Edge, etc.).
2.  **Crie um Novo Projeto:**
    * Na barra lateral (esquerda), clique em `Novo Projeto`.
    * Digite um nome para o seu projeto. Ele será criado vazio.
3.  **Adicione Arquivos:**
    * Com um projeto aberto, clique em `Novo Arquivo/Pasta`.
    * Digite o nome do arquivo (ex: `index.html`, `style.css`, `script.js`) ou da pasta (ex: `assets/`, `js/`).
4.  **Edite seus Arquivos:**
    * Clique em um arquivo na **Árvore de Arquivos** na barra lateral para abri-lo no editor.
    * A aba do arquivo selecionado ficará ativa na barra de abas superior.
    * Digite seu código. As alterações são salvas automaticamente e o preview é atualizado em tempo real.
    * Use o botão **"Salvar Arquivo"** para salvar manualmente as alterações.
    * Use o botão **"Limpar Arquivo"** para apagar o conteúdo do arquivo atualmente aberto.
5.  **Pré-visualização e Console:**
    * O painel inferior mostra o `Preview` do seu código.
    * Clique na aba `Console` para ver os `console.log`s e erros do seu JavaScript.
    * Clique em `Executar Código` para forçar uma atualização do preview e do console a qualquer momento.
6.  **Gerenciamento Adicional:**
    * Use os botões na barra lateral para `Renomear` ou `Excluir` projetos, arquivos e pastas.
    * Clique em `Exportar Projeto` para baixar um `.zip` com todos os arquivos do projeto atual.

## Estrutura de Pastas Esperada

Para que o logo do Concego apareça corretamente, a estrutura de pastas do seu projeto deve ser a seguinte:

