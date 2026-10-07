// Estado global da aplicação
let state = {
    jogos: [],
    times: [],
    competidores: [],
    confrontos: [],
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    configurarNavegacao();
    renderizarTudo();
});

// Busca todos os dados via service
async function carregarDados() {
    try {
        const [jogos, times, competidores, confrontos] = await Promise.all([
            getJogos(),
            getTimes(),
            getCompetidores(),
            getConfrontos(),
        ]);

        state.jogos = jogos;
        state.times = times;
        state.competidores = competidores;
        state.confrontos = confrontos;
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
        alert(`Tivemos problemas ao carregar os dados. ERRO: ${erro.message}`);
    }
}

// Evita que texto digitado pelo usuário quebre o HTML (XSS)
function esc(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

// Botões Editar / Excluir de cada card
function botoesAcao(tipo, id) {
    return `
        <div class="card-actions">
            <button class="btn-small" onclick="abrirFormulario('${tipo}', ${id})">Editar</button>
            <button class="btn-small btn-danger" onclick="excluirItem('${tipo}', ${id})">Excluir</button>
        </div>`;
}

// Configura cliques na navegação lateral
function configurarNavegacao() {
    const itens = document.querySelectorAll('#sidebar-nav li');

    itens.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            trocarView(view);
            itens.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function trocarView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
}

function renderizarTudo() {
    renderizarDashboard();
    renderizarJogos();
    renderizarTimes();
    renderizarCompetidores();
    renderizarConfrontos();
}

// --- Funções de renderização ---

function renderizarDashboard() {
    const stats = document.getElementById('dashboard-stats');
    const proximos = document.getElementById('upcoming-matches');

    const encerrados = state.confrontos.filter(c => c.status === 'finished').length;
    const agendados = state.confrontos.filter(c => c.status === 'scheduled').length;

    stats.innerHTML = `
        <div class="card">
            <span class="card-tag">Torneio</span>
            <h3>${state.times.length}</h3>
            <p class="subtitle">Equipes</p>
        </div>
        <div class="card">
            <span class="card-tag">Atletas</span>
            <h3>${state.competidores.length}</h3>
            <p class="subtitle">Competidores</p>
        </div>
        <div class="card">
            <span class="card-tag">Encerrados</span>
            <h3>${encerrados}</h3>
            <p class="subtitle">Resultados</p>
        </div>
        <div class="card">
            <span class="card-tag">Pendentes</span>
            <h3>${agendados}</h3>
            <p class="subtitle">Agendamentos</p>
        </div>
    `;

    const lista = state.confrontos.filter(c => c.status === 'scheduled').slice(0, 3);

    proximos.innerHTML = lista.map(c => {
        const jogo = state.jogos.find(j => j.id == c.gameId);
        const time1 = state.times.find(t => t.id == c.team1Id);
        const time2 = state.times.find(t => t.id == c.team2Id);
        return `
            <div class="card">
                <span class="card-tag">${esc(jogo?.name || 'Jogo')}</span>
                <div class="match-card">
                    <div class="team-score"><strong>${esc(time1?.name || 'TBD')}</strong></div>
                    <div class="vs">VS</div>
                    <div class="team-score"><strong>${esc(time2?.name || 'TBD')}</strong></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderizarJogos() {
    const lista = document.getElementById('list-jogos');
    lista.innerHTML = state.jogos.map(j => `
        <div class="card">
            <span class="card-tag">${esc(j.genre)}</span>
            <h3>${esc(j.name)}</h3>
            <p class="subtitle">ID: ${j.id}</p>
            ${botoesAcao('jogo', j.id)}
        </div>
    `).join('');
}

function renderizarTimes() {
    const lista = document.getElementById('list-times');
    lista.innerHTML = state.times.map(t => `
        <div class="card" style="border-right: 4px solid ${esc(t.color)}">
            <span class="card-tag">EQUIPE</span>
            <h3>${esc(t.name)}</h3>
            <p class="subtitle">${state.competidores.filter(c => c.teamId == t.id).length} Jogadores</p>
            ${botoesAcao('time', t.id)}
        </div>
    `).join('');
}

function renderizarCompetidores() {
    const lista = document.getElementById('list-competidores');
    lista.innerHTML = state.competidores.map(c => {
        const time = state.times.find(t => t.id == c.teamId);
        return `
            <div class="card">
                <span class="card-tag">${esc(time?.name || 'Sem Time')}</span>
                <h3>${esc(c.nickname)}</h3>
                <p class="subtitle">${esc(c.name)}</p>
                ${botoesAcao('competidor', c.id)}
            </div>
        `;
    }).join('');
}

function renderizarConfrontos() {
    const lista = document.getElementById('list-confrontos');
    lista.innerHTML = state.confrontos.map(c => {
        const jogo = state.jogos.find(j => j.id == c.gameId);
        const time1 = state.times.find(t => t.id == c.team1Id);
        const time2 = state.times.find(t => t.id == c.team2Id);
        const data = new Date(c.date).toLocaleString('pt-BR');

        return `
            <div class="card">
                <span class="card-tag">${esc(jogo?.name || 'Jogo')} | ${data}</span>
                <div class="match-card">
                    <div class="team-score">
                        <strong>${esc(time1?.name || '???')}</strong>
                        <div class="score">${c.score1}</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team-score">
                        <strong>${esc(time2?.name || '???')}</strong>
                        <div class="score">${c.score2}</div>
                    </div>
                </div>
                <div style="margin-top: 1rem; text-align: center;">
                    <span class="card-tag" style="background: ${c.status === 'finished' ? '#10b981' : '#f59e0b'}">
                        ${c.status === 'finished' ? 'FINALIZADO' : 'AGENDADO'}
                    </span>
                    ${c.status === 'scheduled'
                        ? `<button class="btn-small" onclick="encerrarConfrontos(${c.id})">Finalizar</button>`
                        : ''}
                </div>
                ${botoesAcao('confronto', c.id)}
            </div>
        `;
    }).join('');
}

// --- Modal e formulários ---

const modal = document.getElementById('modal-container');
const formContent = document.getElementById('form-content');

// Tipo do formulário -> coleção no state e nome em português
const TIPOS = {
    jogo: { colecao: 'jogos', titulo: 'Jogo' },
    time: { colecao: 'times', titulo: 'Time' },
    competidor: { colecao: 'competidores', titulo: 'Competidor' },
    confronto: { colecao: 'confrontos', titulo: 'Confronto' },
};

// Data/hora local no formato do input datetime-local
function agoraLocal() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

// Monta <option> marcando o selecionado
function opcoes(lista, selecionado) {
    return lista.map(i => `<option value="${i.id}" ${i.id == selecionado ? 'selected' : ''}>${esc(i.name)}</option>`).join('');
}

// Abre o modal. Sem "id" = criar (POST). Com "id" = editar (PUT).
window.abrirFormulario = function (tipo, id = null) {
    const { colecao, titulo } = TIPOS[tipo];
    const item = id !== null ? state[colecao].find(i => i.id == id) : null;
    const editando = !!item;
    const v = item || {};

    const botoes = `
        <div style="display:flex; gap: 1rem;">
            <button type="submit" class="btn-primary">${editando ? 'Salvar alterações' : 'Salvar'}</button>
            <button type="button" onclick="fecharModal()">Cancelar</button>
        </div>`;

    const campos = {
        jogo: `
            <div class="form-group">
                <label>Nome do Jogo</label>
                <input type="text" name="name" required placeholder="Ex: CS2" value="${esc(v.name)}">
            </div>
            <div class="form-group">
                <label>Gênero</label>
                <input type="text" name="genre" required placeholder="Ex: FPS" value="${esc(v.genre)}">
            </div>`,
        time: `
            <div class="form-group">
                <label>Nome da Equipe</label>
                <input type="text" name="name" required placeholder="Ex: Ninjas da Noite" value="${esc(v.name)}">
            </div>
            <div class="form-group">
                <label>Cor Identidade</label>
                <input type="color" name="color" value="${esc(v.color || '#6366f1')}">
            </div>`,
        competidor: `
            <div class="form-group">
                <label>Nome Completo</label>
                <input type="text" name="name" required value="${esc(v.name)}">
            </div>
            <div class="form-group">
                <label>Nickname</label>
                <input type="text" name="nickname" required value="${esc(v.nickname)}">
            </div>
            <div class="form-group">
                <label>Time</label>
                <select name="teamId" required>${opcoes(state.times, v.teamId)}</select>
            </div>`,
        confronto: `
            <div class="form-group">
                <label>Jogo</label>
                <select name="gameId" required>${opcoes(state.jogos, v.gameId)}</select>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label>Time A</label>
                    <select name="team1Id" required>${opcoes(state.times, v.team1Id)}</select>
                </div>
                <div class="form-group">
                    <label>Time B</label>
                    <select name="team2Id" required>${opcoes(state.times, v.team2Id)}</select>
                </div>
            </div>
            <div class="form-group">
                <label>Data/Hora</label>
                <input type="datetime-local" name="date" required value="${esc(v.date || agoraLocal())}">
            </div>
            ${editando ? `
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label>Placar A</label>
                        <input type="number" name="score1" min="0" value="${v.score1}">
                    </div>
                    <div class="form-group">
                        <label>Placar B</label>
                        <input type="number" name="score2" min="0" value="${v.score2}">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="scheduled" ${v.status === 'scheduled' ? 'selected' : ''}>Agendado</option>
                            <option value="finished" ${v.status === 'finished' ? 'selected' : ''}>Finalizado</option>
                        </select>
                    </div>
                </div>` : `
                <input type="hidden" name="score1" value="0">
                <input type="hidden" name="score2" value="0">
                <input type="hidden" name="status" value="scheduled">`}`,
    };

    formContent.innerHTML = `
        <h2>${editando ? 'Editar' : 'Adicionar'} ${titulo}</h2>
        <form onsubmit="salvarItem(event, '${tipo}', ${editando ? id : 'null'})">
            ${campos[tipo]}
            ${botoes}
        </form>`;

    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'all';
    }, 10);
};

window.fecharModal = function () {
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
};

// Funções da API por tipo
const OPERACOES = {
    jogo: { criar: criarJogo, atualizar: atualizarJogo, deletar: deletarJogo },
    time: { criar: criarTime, atualizar: atualizarTime, deletar: deletarTime },
    competidor: { criar: criarCompetidor, atualizar: atualizarCompetidor, deletar: deletarCompetidor },
    confronto: { criar: criarConfronto, atualizar: atualizarConfronto, deletar: deletarConfronto },
};

// Recarrega tudo da API (a fonte da verdade é o banco) e redesenha a tela
async function atualizarTela() {
    await carregarDados();
    renderizarTudo();
}

// Salvar: POST (id nulo) ou PUT (id preenchido)
window.salvarItem = async function (event, tipo, id) {
    event.preventDefault();
    const dados = Object.fromEntries(new FormData(event.target).entries());

    ['teamId', 'gameId', 'team1Id', 'team2Id', 'score1', 'score2'].forEach(campo => {
        if (dados[campo] !== undefined) dados[campo] = Number(dados[campo]);
    });

    try {
        if (id === null) {
            await OPERACOES[tipo].criar(dados);
        } else {
            await OPERACOES[tipo].atualizar(id, dados);
        }
        fecharModal();
        await atualizarTela();
    } catch (erro) {
        alert(`Não foi possível salvar: ${erro.message}`);
    }
};

// Excluir: DELETE com confirmação
window.excluirItem = async function (tipo, id) {
    const avisos = {
        jogo: 'Os confrontos deste jogo também serão excluídos.',
        time: 'Os confrontos deste time também serão excluídos e os competidores ficarão sem time.',
        competidor: '',
        confronto: '',
    };

    if (!confirm(`Excluir este ${TIPOS[tipo].titulo.toLowerCase()}? ${avisos[tipo]}`.trim())) return;

    try {
        await OPERACOES[tipo].deletar(id);
        await atualizarTela();
    } catch (erro) {
        alert(`Não foi possível excluir: ${erro.message}`);
    }
};

// Finalizar confronto: PUT com placar e status "finished"
window.encerrarConfrontos = async function (id) {
    const confronto = state.confrontos.find(c => c.id == id);
    if (!confronto) return;

    const time1 = state.times.find(t => t.id == confronto.team1Id);
    const time2 = state.times.find(t => t.id == confronto.team2Id);

    const placar1 = prompt(`Placar para ${time1?.name}:`, '0');
    if (placar1 === null) return;
    const placar2 = prompt(`Placar para ${time2?.name}:`, '0');
    if (placar2 === null) return;

    try {
        await atualizarConfronto(id, {
            ...confronto,
            score1: Number(placar1),
            score2: Number(placar2),
            status: 'finished',
        });
        await atualizarTela();
    } catch (erro) {
        alert(`Não foi possível finalizar: ${erro.message}`);
    }
};
