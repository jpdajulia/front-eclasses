// URL da API. Em produção, troque pela URL onde a API foi publicada
// (ex.: 'https://minha-api.onrender.com/api/').
const BASE_URL = 'http://localhost:3000/api/';

// Função central: faz a requisição e devolve o JSON.
// Se a API responder com erro, lança um Error com a mensagem dela.
async function request(method, endpoint, body) {
    const opcoes = { method, headers: {} };

    if (body !== undefined) {
        opcoes.headers['Content-Type'] = 'application/json';
        opcoes.body = JSON.stringify(body);
    }

    let response;
    try {
        response = await fetch(`${BASE_URL}${endpoint}`, opcoes);
    } catch (e) {
        throw new Error('Não foi possível conectar à API. Ela está rodando?');
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.erro || `Erro ${response.status}: ${response.statusText}`);
    }
    return data;
}

// ---------- GET ----------
const getJogos = () => request('GET', 'jogos');
const getTimes = () => request('GET', 'times');
const getCompetidores = () => request('GET', 'competidores');
const getConfrontos = () => request('GET', 'confrontos');

// ---------- POST ----------
const criarJogo = (dados) => request('POST', 'jogos', dados);
const criarTime = (dados) => request('POST', 'times', dados);
const criarCompetidor = (dados) => request('POST', 'competidores', dados);
const criarConfronto = (dados) => request('POST', 'confrontos', dados);

// ---------- PUT ----------
const atualizarJogo = (id, dados) => request('PUT', `jogos/${id}`, dados);
const atualizarTime = (id, dados) => request('PUT', `times/${id}`, dados);
const atualizarCompetidor = (id, dados) => request('PUT', `competidores/${id}`, dados);
const atualizarConfronto = (id, dados) => request('PUT', `confrontos/${id}`, dados);

// ---------- DELETE ----------
const deletarJogo = (id) => request('DELETE', `jogos/${id}`);
const deletarTime = (id) => request('DELETE', `times/${id}`);
const deletarCompetidor = (id) => request('DELETE', `competidores/${id}`);
const deletarConfronto = (id) => request('DELETE', `confrontos/${id}`);
