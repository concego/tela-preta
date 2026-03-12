# Changelog

Todas as mudanças notáveis no projeto Tela Preta serão documentadas neste arquivo.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2026-03-12

### Adicionado
- **Caixa Preta:** Lançamento do novo terminal integrado com motor V8 nativo rodando PowerShell em background.
- Injeção automática de privilégios de execução (`ExecutionPolicy`) para garantir o funcionamento nativo de gerenciadores de pacotes (como o `npm`) sem bloqueios do Windows.
- Filtro de higienização de texto em tempo real, que remove códigos de cores ANSI (Escape Codes) para garantir uma leitura 100% limpa e fluida com o NVDA.

### Corrigido
- O terminal não trava mais ao executar comandos de fluxo contínuo ou pesados, como instalações de pacotes do Frontend e servidores locais.
- Correção de codificação (UTF-8) para garantir que caracteres acentuados vindos do sistema operacional sejam lidos corretamente pelo leitor de telas.

### Removido
- Antigo motor de terminal baseado em `child_process.exec`, que criava gargalos de comunicação e impedia a execução de scripts interativos.