# Tela Preta 💻🎙️

**A IDE forjada na acessibilidade e construída para a autonomia.**

A Tela Preta é um ambiente de desenvolvimento construído do zero com foco absoluto em usuários de leitores de tela (como o NVDA). Ela elimina a poluição visual e as distrações das IDEs tradicionais, oferecendo um fluxo de trabalho baseado inteiramente em comandos de teclado e respostas semânticas.

## 🚀 Diferenciais Técnicos

* **Caixa Preta (Terminal Nativo):** Terminal integrado que utiliza o motor do PowerShell em background. Filtra automaticamente códigos de cores ANSI para entregar logs de texto puros e fluidos.
* **Navegação de Alta Performance:** Sistema de alternância de arquivos e abas otimizado para atalhos de teclado, eliminando a necessidade de exploração por mouse.
* **Ambiente Destravado:** Configuração automática de políticas de execução para garantir que o `npm` e scripts de desenvolvimento funcionem sem barreiras.

## ⌨️ Atalhos de Comando (Guia de Referência)

**Gestão de Workspace e Arquivos:**
* `Ctrl + N` : Criar novo arquivo.
* `Shift + Ctrl + N` : Criar nova pasta.
* `Ctrl + O` : Abrir um arquivo específico.
* `Shift + Ctrl + O` : Abrir pasta de projeto (Workspace).
* `Ctrl + S` : Salvar alterações.
* `Alt + Delete` : Deletar arquivo selecionado.

**Navegação entre Arquivos e Abas:**
* `Alt + 1` até `Alt + 0` : Alternar entre arquivos abertos.
* `Alt + Backspace` : Fechar o arquivo atual.
* `Alt + Seta Cima/Baixo` : Navegar na lista de arquivos.
* `Alt + Seta Direita/Esquerda` : Alternar entre guias de pastas.

**Ferramentas:**
* `Alt + T` : Abre a **Caixa Preta** (Terminal Integrado).
* `Alt + F4` : Fecha a janela ativa (IDE ou Terminal).
* `F1` : Abre a Paleta de Comandos.

## 📦 Instalação (Para Desenvolvedores)

1. Clone o repositório: `git clone https://github.com/concego/tela-preta.git`
2. Instale as dependências: `npm install`
3. Inicie: `npm start`

---
Desenvolvido com foco em autonomia por **Anderson Carvalho**.