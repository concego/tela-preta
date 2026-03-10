const { ipcRenderer } = require('electron');
const fs = require('fs'); 
const path = require('path'); 

const editor = document.getElementById('editor');
const leitorStatus = document.getElementById('leitor-status');

// Elementos da paleta de texto
const paleta = document.getElementById('paleta-comandos');
const paletaLabel = document.getElementById('paleta-label');
const paletaInput = document.getElementById('paleta-input');

// Elementos da paleta de botões
const paletaConfirmacao = document.getElementById('paleta-confirmacao');
const confirmacaoLabel = document.getElementById('confirmacao-label');
const btnSim = document.getElementById('btn-sim');
const btnNao = document.getElementById('btn-nao');

// --- MEMÓRIAS ---
let pastasAbertas = []; 
let pastaAtualIndex = -1; 
let guiasAbertas = []; 
let guiaAtualIndex = -1;
let arquivoAtual = null; 

let promptAtivo = false;
let ultimoTermoBusca = '';
let ultimoIndiceBusca = -1;

editor.readOnly = true;

function falar(texto) {
    leitorStatus.textContent = texto;
    setTimeout(() => { leitorStatus.textContent = ''; }, 1000); 
}

// --- CENTRAL DE MARCAÇÃO DE ARQUIVO MODIFICADO ---
function marcarAbaComoSuja() {
    if (guiaAtualIndex >= 0 && guiaAtualIndex < guiasAbertas.length) {
        guiasAbertas[guiaAtualIndex].conteudo = editor.value;
        if (!guiasAbertas[guiaAtualIndex].isDirty) {
            guiasAbertas[guiaAtualIndex].isDirty = true;
            document.title = `Tela Preta - *${guiasAbertas[guiaAtualIndex].nome}`;
        }
    }
}

// O ato de digitar normalmente já aciona a sujeira
editor.addEventListener('input', marcarAbaComoSuja);

// --- O NOVO MOTOR DE EDIÇÃO (TAB, AUTO-CLOSE E GHOST TYPING) ---
editor.addEventListener('keydown', (e) => {
    // 1. Bloqueio de Ghost Typing
    if (guiaAtualIndex === -1 && !e.ctrlKey && !e.altKey && !promptAtivo) {
        if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace') {
            e.preventDefault(); 
            falar('Modo leitura. Abra ou crie um arquivo com Control N para começar a digitar.');
        }
        return;
    }

    // Se a IDE tá trancada pra leitura, não faz mais nada
    if (editor.readOnly) return;

    // 2. A Mágica da Indentação (Tab e Shift+Tab)
    if (e.key === 'Tab') {
        e.preventDefault(); // Impede o foco de fugir do editor
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const value = editor.value;

        if (!e.shiftKey) {
            // Injeta 4 espaços de uma vez
            editor.value = value.substring(0, start) + "    " + value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 4;
        } else {
            // Remove até 4 espaços do começo da linha atual
            let lineStart = value.lastIndexOf('\n', start - 1) + 1;
            let spacesToRemove = 0;
            while (spacesToRemove < 4 && value[lineStart + spacesToRemove] === ' ') {
                spacesToRemove++;
            }
            if (spacesToRemove > 0) {
                editor.value = value.substring(0, lineStart) + value.substring(lineStart + spacesToRemove);
                editor.selectionStart = editor.selectionEnd = Math.max(lineStart, start - spacesToRemove);
            }
        }
        marcarAbaComoSuja();
        return;
    }

    // 3. O Guarda-Costas de Chaves e Aspas (Auto-Close)
    const pares = { '{': '}', '[': ']', '(': ')', '"': '"', "'": "'", '`': '`' };
    const fechamentos = ['}', ']', ')', '"', "'", '`'];

    // Se você tentar digitar o fechamento e ele já estiver lá, a IDE só pula por cima!
    if (fechamentos.includes(e.key) && editor.value[editor.selectionStart] === e.key) {
        e.preventDefault();
        editor.selectionStart = editor.selectionEnd = editor.selectionStart + 1;
        return;
    }

    // Se digitou abertura, injeta o fechamento na frente
    if (pares[e.key]) {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + e.key + pares[e.key] + editor.value.substring(end);
        
        // Coloca o cursor no meio certinho!
        editor.selectionStart = editor.selectionEnd = start + 1;
        marcarAbaComoSuja();
        return;
    }
});

// --- PALETA DE TEXTO ---
function solicitarEntrada(mensagem, valorPadrao = '') {
    return new Promise((resolve) => {
        if (promptAtivo) {
            resolve(null);
            return;
        }
        promptAtivo = true;

        paletaLabel.textContent = mensagem;
        paletaInput.value = valorPadrao; 
        paletaInput.setAttribute('aria-label', mensagem);
        
        paleta.style.display = 'flex';
        paleta.setAttribute('aria-hidden', 'false');

        const finalizar = (valor) => {
            paleta.style.display = 'none';
            paleta.setAttribute('aria-hidden', 'true');
            promptAtivo = false;
            editor.focus();
            
            paletaInput.removeEventListener('keydown', onKeyDown);
            resolve(valor);
        };

        const onKeyDown = (e) => {
            e.stopPropagation(); 
            if (e.key === 'Enter') {
                e.preventDefault();
                finalizar(paletaInput.value.trim());
            } else if (e.key === 'Escape') {
                e.preventDefault();
                finalizar(null);
            }
        };

        paletaInput.addEventListener('keydown', onKeyDown);

        setTimeout(() => {
            paletaInput.focus();
            if (valorPadrao) {
                paletaInput.setSelectionRange(0, valorPadrao.length); 
            }
            falar(mensagem);
        }, 100);
    });
}

// --- PALETA DE BOTÕES ---
function solicitarConfirmacao(mensagem) {
    return new Promise((resolve) => {
        if (promptAtivo) {
            resolve(false);
            return;
        }
        promptAtivo = true;

        confirmacaoLabel.textContent = mensagem;
        paletaConfirmacao.style.display = 'flex';
        paletaConfirmacao.setAttribute('aria-hidden', 'false');

        const finalizar = (resultado) => {
            paletaConfirmacao.style.display = 'none';
            paletaConfirmacao.setAttribute('aria-hidden', 'true');
            promptAtivo = false;
            editor.focus();

            btnSim.removeEventListener('click', onSimClick);
            btnNao.removeEventListener('click', onNaoClick);
            paletaConfirmacao.removeEventListener('keydown', onKeyDown);

            resolve(resultado);
        };

        const onSimClick = () => finalizar(true);
        const onNaoClick = () => finalizar(false);

        const onKeyDown = (e) => {
            e.stopPropagation(); 
            
            if (e.key === 'Escape') {
                e.preventDefault();
                finalizar(false);
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Tab') {
                e.preventDefault(); 
                if (document.activeElement === btnSim) {
                    btnNao.focus();
                } else {
                    btnSim.focus();
                }
            }
        };

        btnSim.addEventListener('click', onSimClick);
        btnNao.addEventListener('click', onNaoClick);
        paletaConfirmacao.addEventListener('keydown', onKeyDown);

        setTimeout(() => {
            btnNao.focus();
            falar(mensagem + " Pressione Tab ou setas para alternar entre Sim e Não.");
        }, 100);
    });
}

function carregarGuiaArquivo(index) {
    if (index < 0 || index >= guiasAbertas.length) return;
    guiaAtualIndex = index;
    const guia = guiasAbertas[index];
    editor.value = guia.conteudo;
    arquivoAtual = guia.caminho; 
    
    const statusModificado = guia.isDirty ? ' (Não salvo)' : '';
    document.title = `Tela Preta - ${guia.isDirty ? '*' : ''}${guia.nome}`;
    
    const numeroAtalho = (index + 1) === 10 ? 0 : (index + 1);
    
    ultimoTermoBusca = '';
    ultimoIndiceBusca = -1;
    editor.readOnly = false;
    
    falar(`Editando ${guia.nome}${statusModificado}. Atalho Alt ${numeroAtalho}`);
    editor.focus();
}

function lerConteudoDaPasta(caminhoPasta, nomePasta) {
    try {
        const itensBrutos = fs.readdirSync(caminhoPasta, { withFileTypes: true });
        const items = itensBrutos.map(dirent => ({
            nome: dirent.name,
            caminhoCompleto: path.join(caminhoPasta, dirent.name),
            isDiretorio: dirent.isDirectory() 
        }));

        items.sort((a, b) => {
            if (a.isDiretorio && !b.isDiretorio) return -1;
            if (!a.isDiretorio && b.isDiretorio) return 1;
            return a.nome.localeCompare(b.nome);
        });

        return { caminho: caminhoPasta, nome: nomePasta, items, indiceItemAtual: -1 };
    } catch (erro) {
        return null;
    }
}

function mudarPastaAtiva(index) {
    if (index < 0 || index >= pastasAbertas.length) return;
    pastaAtualIndex = index;
    const pasta = pastasAbertas[pastaAtualIndex];
    falar(`Guia de pasta: ${pasta.nome}. Use Alt e setas para cima ou baixo para explorar.`);
}

function inicializarWorkspace(caminho, nomePasta, silencioso = false) {
    pastasAbertas = [];
    guiasAbertas = [];
    guiaAtualIndex = -1;
    arquivoAtual = null;  
    editor.value = '';    
    editor.readOnly = true;

    const pastaRaiz = lerConteudoDaPasta(caminho, nomePasta);
    
    if (pastaRaiz) {
        pastasAbertas.push(pastaRaiz);
        pastaAtualIndex = 0;
        document.title = `Tela Preta - ${nomePasta}`;
        
        localStorage.setItem('ultimoWorkspace', caminho);
        localStorage.setItem('ultimoNomeWorkspace', nomePasta);

        if (!silencioso) {
            falar(`Workspace carregado: ${nomePasta}.`);
        }
        editor.focus(); 
    } else {
        if (!silencioso) falar('Erro ao tentar ler a pasta.');
    }
}

function executarBuscaProxima() {
    if (!ultimoTermoBusca) return;
    
    const texto = editor.value.toLowerCase();
    const termo = ultimoTermoBusca.toLowerCase();
    
    const indexEncontrado = texto.indexOf(termo, ultimoIndiceBusca + 1);

    if (indexEncontrado !== -1) {
        ultimoIndiceBusca = indexEncontrado;
        editor.focus();
        editor.setSelectionRange(indexEncontrado, indexEncontrado + termo.length);
        falar(`Encontrado. Pressione F3 para o próximo.`);
    } else {
        falar('Fim do arquivo. Pressione F3 para buscar do início.');
        ultimoIndiceBusca = -1; 
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const ultimoPath = localStorage.getItem('ultimoWorkspace');
    const ultimoNome = localStorage.getItem('ultimoNomeWorkspace');
    
    if (ultimoPath && ultimoNome && fs.existsSync(ultimoPath)) {
        inicializarWorkspace(ultimoPath, ultimoNome, true);
        setTimeout(() => falar(`Workspace restaurado: ${ultimoNome}`), 800);
    } else {
        setTimeout(() => falar('Tela Preta iniciada. Pressione Control Shift O para abrir um projeto.'), 800);
    }
});

document.addEventListener('keydown', async (e) => {
    
    if (promptAtivo) return; 
    
    // --- ATUALIZAR A IDE (F5) ---
    if (e.key === 'F5') {
        e.preventDefault();
        falar('Recarregando a Tela Preta...');
        setTimeout(() => window.location.reload(), 500);
        return;
    }

    // --- NOVO: IR PARA A LINHA (Ctrl + G) ---
    if (e.ctrlKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (guiaAtualIndex === -1) return falar('Nenhum arquivo aberto.');
        
        const numLinhaStr = await solicitarEntrada('Ir para a linha:');
        if (numLinhaStr && !isNaN(numLinhaStr)) {
            const linhaDesejada = parseInt(numLinhaStr, 10);
            const linhas = editor.value.split('\n');
            
            if (linhaDesejada > 0 && linhaDesejada <= linhas.length) {
                let charsAteLinha = 0;
                for (let i = 0; i < linhaDesejada - 1; i++) {
                    charsAteLinha += linhas[i].length + 1; // +1 conta a quebra de linha invisível
                }
                editor.focus();
                editor.setSelectionRange(charsAteLinha, charsAteLinha);
                
                // Manda o leitor avisar qual linha ele encontrou
                falar(`Linha ${linhaDesejada}: ${linhas[linhaDesejada - 1]}`);
            } else {
                falar(`Linha ${linhaDesejada} não existe. O arquivo tem ${linhas.length} linhas.`);
            }
        } else if (numLinhaStr) {
            falar('Número de linha inválido.');
        }
        return;
    }

    // --- NOVO: BUSCAR E SUBSTITUIR (Ctrl + H) ---
    else if (e.ctrlKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        if (guiaAtualIndex === -1) return falar('Nenhum arquivo aberto.');
        
        const termoBusca = await solicitarEntrada('Substituir o quê?');
        if (!termoBusca) return falar('Operação cancelada.');
        
        const termoSubstituto = await solicitarEntrada(`Substituir "${termoBusca}" por:`);
        if (termoSubstituto === null) return falar('Operação cancelada.'); // Se der Esc, cancela
        
        const textoAntigo = editor.value;
        // O split().join() é a forma mais segura de substituir TUDO no JavaScript sem problemas de Regex
        const novoTexto = textoAntigo.split(termoBusca).join(termoSubstituto);
        
        if (textoAntigo !== novoTexto) {
            const ocorrencias = textoAntigo.split(termoBusca).length - 1;
            editor.value = novoTexto;
            marcarAbaComoSuja();
            falar(`${ocorrencias} substituições feitas com sucesso.`);
        } else {
            falar('Nenhuma ocorrência encontrada para substituir.');
        }
        return;
    }

    // --- BUSCAR NO ARQUIVO (Ctrl + F) ---
    else if (e.ctrlKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (guiaAtualIndex === -1) return falar('Nenhum arquivo aberto para pesquisar.');
        
        const termo = await solicitarEntrada('Pesquisar por:', ultimoTermoBusca);
        if (termo) {
            ultimoTermoBusca = termo;
            ultimoIndiceBusca = -1; 
            executarBuscaProxima();
        } else {
            falar('Busca cancelada.');
        }
        return;
    }

    // --- BUSCAR O PRÓXIMO (F3) ---
    else if (e.key === 'F3') {
        e.preventDefault();
        if (guiaAtualIndex === -1) return;
        if (!ultimoTermoBusca) return falar('Use Control F para pesquisar algo primeiro.');
        executarBuscaProxima();
        return;
    }

    // --- RENOMEAR ARQUIVO OU PASTA (F2) ---
    else if (e.key === 'F2') {
        e.preventDefault();
        if (pastasAbertas.length === 0) return falar('Nenhum workspace aberto.');
        const pasta = pastasAbertas[pastaAtualIndex];

        if (pasta.indiceItemAtual >= 0 && pasta.indiceItemAtual < pasta.items.length) {
            const item = pasta.items[pasta.indiceItemAtual];
            
            const novoNome = await solicitarEntrada(`Renomear para:`, item.nome);
            
            if (novoNome && novoNome !== item.nome) {
                const novoCaminho = path.join(pasta.caminho, novoNome);
                if (fs.existsSync(novoCaminho)) return falar('Já existe um arquivo ou pasta com esse nome.');
                
                try {
                    fs.renameSync(item.caminhoCompleto, novoCaminho);
                    
                    const indexAba = guiasAbertas.findIndex(g => g.caminho === item.caminhoCompleto);
                    if (indexAba !== -1) {
                        guiasAbertas[indexAba].nome = novoNome;
                        guiasAbertas[indexAba].caminho = novoCaminho;
                        if (guiaAtualIndex === indexAba) {
                            arquivoAtual = novoCaminho;
                            document.title = `Tela Preta - ${novoNome}`;
                        }
                    }

                    const pastaAtualizada = lerConteudoDaPasta(pasta.caminho, pasta.nome);
                    if (pastaAtualizada) {
                        pastasAbertas[pastaAtualIndex] = pastaAtualizada;
                        const novoIndex = pastaAtualizada.items.findIndex(i => i.nome === novoNome);
                        if(novoIndex !== -1) pastasAbertas[pastaAtualIndex].indiceItemAtual = novoIndex;
                    }

                    falar(`Renomeado para ${novoNome}.`);
                } catch (erro) {
                    falar('Erro ao renomear. O arquivo pode estar aberto em outro programa.');
                }
            } else if (novoNome === item.nome) {
                falar('Nome mantido.');
            } else {
                falar('Operação cancelada.');
            }
        } else {
            falar('Nenhum item selecionado na lista para renomear.');
        }
        return;
    }

    // --- CRIAR ARQUIVO (Ctrl + N) ---
    else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (pastasAbertas.length === 0) return falar('Abra um projeto primeiro para criar arquivos.');
        
        const nomeArquivo = await solicitarEntrada('Nome do novo arquivo com extensão:');
        
        if (!nomeArquivo) return falar('Operação cancelada.');

        const pastaAlvo = pastasAbertas[pastaAtualIndex].caminho;
        const caminhoCompleto = path.join(pastaAlvo, nomeArquivo);
        
        if (fs.existsSync(caminhoCompleto)) return falar('Já existe um arquivo ou pasta com esse nome.');
        
        try {
            fs.writeFileSync(caminhoCompleto, '', 'utf-8');
            
            const pastaAtualizada = lerConteudoDaPasta(pastaAlvo, pastasAbertas[pastaAtualIndex].nome);
            if (pastaAtualizada) pastasAbertas[pastaAtualIndex] = pastaAtualizada;
            
            if (guiasAbertas.length >= 10) {
                falar('Arquivo criado. Limite de 10 guias atingido. Feche alguma para abrir.');
            } else {
                guiasAbertas.push({ nome: nomeArquivo, caminho: caminhoCompleto, conteudo: '', isDirty: false });
                carregarGuiaArquivo(guiasAbertas.length - 1);
                falar(`Arquivo ${nomeArquivo} criado e pronto para edição.`);
            }
        } catch (erro) {
            falar('Erro ao criar o arquivo.');
        }
        return;
    }

    // --- CRIAR PASTA (Ctrl + Shift + N) ---
    else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (pastasAbertas.length === 0) return falar('Abra um projeto primeiro para criar pastas.');
        
        const nomePasta = await solicitarEntrada('Nome da nova pasta:');
        
        if (!nomePasta) return falar('Operação cancelada.');

        const pastaAlvo = pastasAbertas[pastaAtualIndex].caminho;
        const caminhoCompleto = path.join(pastaAlvo, nomePasta);
        
        if (fs.existsSync(caminhoCompleto)) return falar('Já existe um arquivo ou pasta com esse nome.');
        
        try {
            fs.mkdirSync(caminhoCompleto);
            
            const pastaAtualizada = lerConteudoDaPasta(pastaAlvo, pastasAbertas[pastaAtualIndex].nome);
            if (pastaAtualizada) pastasAbertas[pastaAtualIndex] = pastaAtualizada;
            
            falar(`Pasta ${nomePasta} criada com sucesso. Use as setas para explorar.`);
        } catch (erro) {
            falar('Erro ao criar a pasta.');
        }
        return;
    }

    // --- EXCLUIR ARQUIVO OU PASTA (Alt + Delete) ---
    else if (e.altKey && e.key === 'Delete') {
        e.preventDefault();
        if (pastasAbertas.length === 0) return falar('Nenhum workspace aberto.');
        const pasta = pastasAbertas[pastaAtualIndex];

        if (pasta.indiceItemAtual >= 0 && pasta.indiceItemAtual < pasta.items.length) {
            const item = pasta.items[pasta.indiceItemAtual];
            
            const confirmacao = await solicitarConfirmacao(`Excluir ${item.nome}?`);
            
            if (confirmacao) {
                try {
                    if (item.isDiretorio) {
                        fs.rmSync(item.caminhoCompleto, { recursive: true, force: true });
                    } else {
                        fs.unlinkSync(item.caminhoCompleto);
                        
                        const indexAba = guiasAbertas.findIndex(g => g.caminho === item.caminhoCompleto);
                        if (indexAba !== -1) {
                            guiasAbertas.splice(indexAba, 1);
                            if (guiaAtualIndex === indexAba) {
                                guiaAtualIndex = -1;
                                arquivoAtual = null;
                                editor.value = '';
                                editor.readOnly = true; 
                                document.title = `Tela Preta - Workspace`;
                                if (guiasAbertas.length > 0) {
                                    carregarGuiaArquivo(guiasAbertas.length - 1);
                                }
                            } else if (guiaAtualIndex > indexAba) {
                                guiaAtualIndex--; 
                            }
                        }
                    }

                    const pastaAtualizada = lerConteudoDaPasta(pasta.caminho, pasta.nome);
                    if (pastaAtualizada) pastasAbertas[pastaAtualIndex] = pastaAtualizada;

                    falar(`${item.isDiretorio ? 'Pasta' : 'Arquivo'} ${item.nome} excluído com sucesso.`);
                } catch (erro) {
                    falar(`Erro ao excluir ${item.nome}.`);
                }
            } else {
                falar('Exclusão cancelada.');
            }
        } else {
            falar('Nenhum item selecionado na lista para excluir.');
        }
        return;
    }

    // --- GERENCIAMENTO DE ARQUIVOS (FECHAR E NAVEGAR) ---
    else if (e.altKey && e.key === 'Backspace') {
        e.preventDefault();
        if (guiaAtualIndex >= 0 && guiasAbertas.length > 0) {
            const guiaAlvo = guiasAbertas[guiaAtualIndex];
            
            if (guiaAlvo.isDirty) {
                const confirmar = await solicitarConfirmacao(`O arquivo ${guiaAlvo.nome} não foi salvo. Fechar e perder as alterações?`);
                if (!confirmar) {
                    return falar('Ação cancelada. Use Control S para salvar.');
                }
            }
            
            const nomeFechado = guiaAlvo.nome;
            guiasAbertas.splice(guiaAtualIndex, 1); 
            
            falar(`Arquivo ${nomeFechado} fechado.`);
            
            if (guiasAbertas.length === 0) {
                guiaAtualIndex = -1;
                arquivoAtual = null;
                editor.value = '';
                editor.readOnly = true; 
                document.title = `Tela Preta - Workspace`;
                setTimeout(() => falar('Nenhum arquivo aberto.'), 1200);
            } else {
                if (guiaAtualIndex >= guiasAbertas.length) {
                    guiaAtualIndex = guiasAbertas.length - 1;
                }
                setTimeout(() => carregarGuiaArquivo(guiaAtualIndex), 1200);
            }
        } else {
            falar('Nenhum arquivo aberto para fechar.');
        }
        return;
    }

    else if (e.altKey && e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        if (guiasAbertas.length === 0) return falar('Nenhum arquivo aberto.');
        
        const num = parseInt(e.key);
        const indexDesejado = num === 0 ? 9 : num - 1; 
        
        if (indexDesejado < guiasAbertas.length) {
            carregarGuiaArquivo(indexDesejado);
        } else {
            falar(`Guia ${num === 0 ? 10 : num} vazia.`);
        }
        return;
    }
    
    // --- NAVEGAÇÃO ENTRE PASTAS (O Carrossel) ---
    else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        if (pastasAbertas.length === 0) return falar('Nenhum workspace aberto.');
        
        if (pastaAtualIndex < pastasAbertas.length - 1) {
            mudarPastaAtiva(pastaAtualIndex + 1);
        } else {
            falar('Última guia de pasta.');
        }
        return;
    } 
    
    else if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (pastasAbertas.length === 0) return falar('Nenhum workspace aberto.');
        
        if (pastaAtualIndex > 0) {
            mudarPastaAtiva(pastaAtualIndex - 1);
        } else {
            falar('Primeira guia de pasta.');
        }
        return;
    }

    // --- NAVEGAÇÃO DENTRO DA PASTA ATUAL ---
    else if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault(); 
        if (pastasAbertas.length === 0) return falar('Nenhum workspace aberto.');
        const pasta = pastasAbertas[pastaAtualIndex];
        if (pasta.items.length === 0) return falar('Pasta vazia.');
        
        if (pasta.indiceItemAtual < pasta.items.length - 1) {
            pasta.indiceItemAtual++;
        }
        const item = pasta.items[pasta.indiceItemAtual];
        falar(`${pasta.indiceItemAtual + 1} de ${pasta.items.length}. ${item.isDiretorio ? 'Pasta' : 'Arquivo'}: ${item.nome}`);
        return;
    }
    
    else if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        if (pastasAbertas.length === 0) return falar('Nenhum workspace aberto.');
        const pasta = pastasAbertas[pastaAtualIndex];
        if (pasta.items.length === 0) return falar('Pasta vazia.');
        
        if (pasta.indiceItemAtual > 0) {
            pasta.indiceItemAtual--;
        }
        const item = pasta.items[pasta.indiceItemAtual];
        falar(`${pasta.indiceItemAtual + 1} de ${pasta.items.length}. ${item.isDiretorio ? 'Pasta' : 'Arquivo'}: ${item.nome}`);
        return;
    }

    // --- ABRIR PASTA OU ABRIR ARQUIVO VIA LISTA (Alt + Enter) ---
    else if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        if (pastasAbertas.length === 0) return falar('Nenhum workspace aberto.');
        const pasta = pastasAbertas[pastaAtualIndex];

        if (pasta.indiceItemAtual >= 0 && pasta.indiceItemAtual < pasta.items.length) {
            const item = pasta.items[pasta.indiceItemAtual];
            
            if (item.isDiretorio) {
                const indexExistente = pastasAbertas.findIndex(p => p.caminho === item.caminhoCompleto);
                if (indexExistente !== -1) {
                    mudarPastaAtiva(indexExistente); 
                } else {
                    const novaPasta = lerConteudoDaPasta(item.caminhoCompleto, item.nome);
                    if (novaPasta) {
                        pastasAbertas.push(novaPasta);
                        mudarPastaAtiva(pastasAbertas.length - 1); 
                    } else {
                        falar('Erro ao abrir subpasta.');
                    }
                }
            } else {
                const indexExistente = guiasAbertas.findIndex(g => g.caminho === item.caminhoCompleto);
                if (indexExistente !== -1) {
                    carregarGuiaArquivo(indexExistente);
                } else {
                    if (guiasAbertas.length >= 10) {
                        return falar('Limite de 10 arquivos abertos. Feche algum com Alt Backspace.');
                    }
                    try {
                        const conteudo = fs.readFileSync(item.caminhoCompleto, 'utf-8');
                        guiasAbertas.push({ nome: item.nome, caminho: item.caminhoCompleto, conteudo: conteudo, isDirty: false });
                        carregarGuiaArquivo(guiasAbertas.length - 1);
                    } catch (erro) {
                        falar(`Erro ao ler o arquivo.`);
                    }
                }
            }
        } else {
            falar('Nenhum item selecionado na lista.');
        }
        return;
    }

    // --- SALVAR ARQUIVO ---
    else if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (arquivoAtual && guiaAtualIndex !== -1) {
            try {
                fs.writeFileSync(arquivoAtual, editor.value, 'utf-8');
                
                guiasAbertas[guiaAtualIndex].isDirty = false;
                document.title = `Tela Preta - ${guiasAbertas[guiaAtualIndex].nome}`;
                
                falar('Arquivo salvo com sucesso.');
            } catch (erro) {
                falar('Erro ao salvar o arquivo.');
            }
        } else {
            falar('Nenhum arquivo aberto para salvar.');
        }
        return;
    }

    // --- TERMINAL ---
    else if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        falar('Abrindo terminal');
        ipcRenderer.send('abrir-terminal');
    }
    
    // --- ABRIR WORKSPACE (Ctrl + Shift + O) ---
    else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        falar('Abrindo seletor de pastas...');
        
        const pastaResult = await ipcRenderer.invoke('abrir-pasta-workspace');
        
        if (pastaResult) {
            if (pastaResult.erro) {
                falar('Erro ao abrir a pasta.');
            } else {
                inicializarWorkspace(pastaResult.caminho, pastaResult.nomePasta);
            }
        } else {
            falar('Seleção cancelada.');
            editor.focus();
        }
    }

    // --- ABRIR ARQUIVO AVULSO (Ctrl + O) ---
    else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        falar('Abrindo seletor de arquivos...');
        
        const caminhoArquivo = await ipcRenderer.invoke('abrir-arquivo-avulso');
        
        if (caminhoArquivo) {
            const nomeArquivo = path.basename(caminhoArquivo);
            const indexExistente = guiasAbertas.findIndex(g => g.caminho === caminhoArquivo);
            
            if (indexExistente !== -1) {
                carregarGuiaArquivo(indexExistente); 
            } else {
                if (guiasAbertas.length >= 10) {
                    return falar('Limite de 10 arquivos abertos. Feche algum com Alt Backspace.');
                }
                try {
                    const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
                    guiasAbertas.push({ nome: nomeArquivo, caminho: caminhoArquivo, conteudo: conteudo, isDirty: false });
                    carregarGuiaArquivo(guiasAbertas.length - 1); 
                } catch (erro) {
                    falar('Erro ao tentar ler o arquivo solto.');
                }
            }
        } else {
            falar('Seleção cancelada.');
            editor.focus();
        }
    }
});