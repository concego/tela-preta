# Tela Preta

Tela Preta é um editor de código acessível baseado em navegador, projetado para suportar múltiplos arquivos e linguagens de programação, com foco em acessibilidade para usuários de leitores de tela, como o TalkBack no Android.

## Recursos

- **Múltiplos Editores**: Adicione e gerencie vários editores de código simultaneamente.
- **Suporte a Linguagens**: HTML, CSS, JavaScript, TypeScript (`.ts`, `.tsx`), Python, C, Markdown, SQL, Java, Kotlin, PHP, JSON, e texto puro.
- **Validação de Código**: Verifique a sintaxe de todos os editores marcados, com mensagens de erro detalhadas.
- **Formatação de JSON**: Formate JSON no editor ativo com indentação adequada.
- **Visualização**: Visualize HTML, Markdown, JSON ou texto puro em tempo real.
- **Download de Arquivos**: Baixe arquivos individualmente ou como um arquivo ZIP.
- **Acessibilidade**: Compatível com TalkBack, com `aria-label`, `aria-live="polite"`, e diálogos acessíveis.
- **Persistência**: Salve códigos automaticamente no `localStorage` do navegador.
- **Atalhos**:
  - Ctrl+S: Salvar códigos localmente.
  - Ctrl+V: Validar todos os editores.
  - Ctrl+Z: Baixar editores marcados como ZIP.
  - Ctrl+K: Validar apenas código Kotlin.

## Como Usar

1. Acesse [https://concego.github.io/tela-preta/](https://concego.github.io/tela-preta/).
2. Clique em “Adicionar Editor” para criar um novo editor.
3. Insira o nome do arquivo (ex.: `src/index.js`) para definir a linguagem.
4. Escreva ou cole o código. Use “Formatar” para JSON ou “Validar” para verificar erros.
5. Clique em “Baixar Arquivos” ou “Baixar como ZIP” para exportar.
6. Use “Formatos Suportados” para ver as linguagens disponíveis.
7. Consulte a [Ajuda](HELP.md) para mais detalhes.

## Instalação

Nenhuma instalação é necessária! O Tela Preta é executado diretamente no navegador em [https://concego.github.io/tela-preta/](https://concego.github.io/tela-preta/).

Para desenvolvimento local:
1. Clone o repositório: `git clone https://github.com/concego/tela-preta.git`.
2. Abra `index.html` em um navegador.
3. Todas as dependências (CodeMirror, JSZip, JSHint) são carregadas via CDN.

## Contribuindo

Contribuições são bem-vindas! Siga estas etapas:
1. Faça um fork do repositório.
2. Crie uma branch: `git checkout -b minha-nova-funcionalidade`.
3. Faça suas alterações e commit: `git commit -m 'Adicionar nova funcionalidade'`.
4. Envie para o repositório: `git push origin minha-nova-funcionalidade`.
5. Abra um pull request.

Por favor, siga o [Código de Conduta](CODE_OF_CONDUCT.md) e consulte o [CHANGELOG](CHANGELOG.md) para o histórico de versões.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## Contato

Para sugestões ou problemas, abra uma issue em [https://github.com/concego/tela-preta](https://github.com/concego/tela-preta).