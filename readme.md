# Tela Preta

## Boas-vindas

Bem-vindo ao **Tela Preta**, um editor de código online acessível projetado para programadores cegos e iniciantes! Criado pelo canal [Euconcegojogar](https://youtube.com/@euconcegojogar), este editor suporta múltiplas linguagens e edição simultânea de vários arquivos.

## Créditos

Desenvolvido por [concego](https://github.com/concego). Agradecimentos à comunidade de programadores cegos e ao canal Euconcegojogar por promover a inclusão na tecnologia.

## Versionamento

O Tela Preta segue versionamento semântico. A versão atual é **1.9.0** (lançada em 25/06/2025). Consulte o [CHANGELOG.md](CHANGELOG.md) para detalhes.

## Como Usar

1. Acesse [https://concego.github.io/tela-preta/](https://concego.github.io/tela-preta/).
2. Adicione editores clicando em “Adicionar Editor”.
3. Escolha uma linguagem para cada editor no menu suspenso.
4. Clique em “Selecionar” para definir o editor ativo.
5. Digite ou carregue código no editor ativo.
6. Use os botões para salvar, baixar como ZIP, baixar arquivos, validar ou executar.
7. Especifique nomes e caminhos (ex.: `word/src/scripts.js`) ao baixar.

## Recursos

- **Linguagens Suportadas**: HTML, CSS, JavaScript, Python, C, Markdown, TypeScript, SQL, Java, Kotlin, PHP, Texto Simples.
- **Múltiplos Editores**: Edite vários arquivos simultaneamente, cada um com linguagem independente.
- **Exportação ZIP**: Baixe o código do editor ativo como ZIP, com nome/caminho personalizado e arquivos de configuração (ex.: `pom.xml` para Java).
- **Download Personalizado**: Baixe arquivos individuais via diálogo acessível, com nome/caminho personalizado.
- **Validação**: Verificação em tempo real para o editor ativo.
- **Visualização**: Visualização em tempo real para HTML/Markdown, destaque de sintaxe para Java/Kotlin/PHP.
- **Execução**: Suporte experimental para JavaScript; outras linguagens requerem compiladores externos (ex.: JDoodle).
- **Carregamento de Arquivos**: Importe arquivos para o editor ativo.
- **Acessibilidade**: Otimizado para TalkBack e leitores de tela.

## Acessibilidade

- Rótulos ARIA e mensagens `aria-live` para feedback dinâmico.
- Fallback `<textarea>` para cada editor, compatível com TalkBack.
- Visualização de texto alternativa.
- Diálogo acessível para downloads com campo para nome/caminho.
- Atalhos de teclado: Ctrl+S (salvar), Ctrl+V (validar), Ctrl+Z (baixar ZIP), Ctrl+K (validar Kotlin).

## Licença

Licenciado sob a [MIT License](LICENSE).

## Contato

Visite o canal [Euconcegojogar](https://youtube.com/@euconcegojogar) para mais conteúdos. Para sugestões ou problemas, abra uma [issue](https://github.com/concego/tela-preta/issues).