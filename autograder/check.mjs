#!/usr/bin/env node
/**
 * Autograder — Delivery Tracker · Atividade 08 (SSR com EJS).
 *
 * Uso: BASE_URL=http://localhost:3000 node autograder/check.mjs
 * Requer Node 18+ e servidor em execução.
 */

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const identificador = Date.now().toString(36);
let cookie = '';
const checks = [];

function check(nome, pontos, executar) {
  checks.push({ nome, pontos, executar });
}

async function req(caminho, metodo = 'GET', dados) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  const opcoes = { method: metodo, headers, redirect: 'manual' };
  if (dados !== undefined) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    opcoes.body = new URLSearchParams(dados);
  }

  const resposta = await fetch(`${BASE}${caminho}`, opcoes);
  const setCookie = resposta.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';', 1)[0];
  return {
    status: resposta.status,
    location: resposta.headers.get('location'),
    type: resposta.headers.get('content-type') || '',
    body: await resposta.text(),
  };
}

function assert(condicao, mensagem) {
  if (!condicao) throw new Error(mensagem);
}

let entregaId;
const descricao = `Entrega SSR ${identificador}`;
const cpf = `cpf-ssr-${identificador}`;

check('GET / redireciona para /entregas', 5, async () => {
  const resposta = await req('/');
  assert(resposta.status === 302, `esperado 302, recebido ${resposta.status}`);
  assert(resposta.location === '/entregas', 'deve redirecionar para /entregas');
});

check('GET /entregas renderiza listagem e filtro', 10, async () => {
  const resposta = await req('/entregas?status=CRIADA');
  assert(resposta.status === 200 && resposta.type.includes('text/html'), 'deve renderizar HTML');
  assert(resposta.body.includes('Lista de entregas'), 'deve exibir a tabela de entregas');
  assert(resposta.body.includes('/entregas/nova'), 'deve oferecer o formulário de nova entrega');
  assert(resposta.body.includes('Todos os status'), 'deve exibir o filtro de status');
});

check('GET /entregas/nova exibe formulário', 10, async () => {
  const resposta = await req('/entregas/nova');
  assert(resposta.status === 200, `esperado 200, recebido ${resposta.status}`);
  for (const campo of ['descricao', 'origem', 'destino']) {
    assert(resposta.body.includes(`name="${campo}"`), `formulário sem campo ${campo}`);
  }
});

check('POST /entregas inválida reexibe dados com status 400', 10, async () => {
  const resposta = await req('/entregas', 'POST', {
    descricao: `Inválida ${identificador}`,
    origem: 'Recife',
    destino: 'Recife',
  });
  assert(resposta.status === 400, `esperado 400, recebido ${resposta.status}`);
  assert(resposta.body.includes(`Inválida ${identificador}`), 'deve preservar os dados digitados');
  assert(resposta.body.includes('diferentes'), 'deve explicar o erro de validação');
});

check('POST /entregas cria e redireciona (PRG)', 10, async () => {
  const resposta = await req('/entregas', 'POST', {
    descricao,
    origem: 'Maceio',
    destino: 'Arapiraca',
  });
  assert(resposta.status === 303, `esperado 303, recebido ${resposta.status}`);
  assert(/^\/entregas\/\d+$/.test(resposta.location || ''), 'deve redirecionar para os detalhes');
  entregaId = resposta.location.split('/').pop();
});

check('GET /entregas/:id exibe status, histórico e flash', 10, async () => {
  const resposta = await req(`/entregas/${entregaId}`);
  assert(resposta.status === 200, `esperado 200, recebido ${resposta.status}`);
  assert(resposta.body.includes(descricao), 'detalhe não exibe a descrição');
  assert(resposta.body.includes('CRIADA'), 'detalhe não exibe o status');
  assert(resposta.body.includes('Entrega criada'), 'detalhe não exibe o histórico');
  assert(resposta.body.includes('Entrega criada com sucesso'), 'mensagem flash não foi exibida');
});

check('PATCH /entregas/:id/avancar usa method-override e PRG', 10, async () => {
  const acao = await req(`/entregas/${entregaId}/avancar?_method=PATCH`, 'POST');
  assert(acao.status === 303, `esperado 303, recebido ${acao.status}`);
  const detalhe = await req(acao.location);
  assert(detalhe.body.includes('EM TRANSITO'), 'status não avançou para EM_TRANSITO');
  assert(detalhe.body.includes('status da entrega foi'), 'mensagem flash do avanço não foi exibida');
});

check('PATCH /entregas/:id/atribuir atribui motorista via formulário', 10, async () => {
  const motorista = await req('/motoristas', 'POST', {
    nome: `Motorista ${identificador}`,
    cpf,
  });
  assert(motorista.status === 303, `esperado 303 ao criar motorista, recebido ${motorista.status}`);

  const lista = await req(motorista.location);
  assert(lista.body.includes('Motorista cadastrado com sucesso'), 'mensagem flash do cadastro ausente');
  const match = lista.body.match(/name="motoristaId"[^>]*|<td><strong>Motorista [^<]+<\/strong><\/td>/);
  assert(match, 'motorista criado não apareceu na interface');

  const novaEntrega = await req('/entregas', 'POST', {
    descricao: `Atribuicao ${identificador}`,
    origem: 'Maceio',
    destino: 'Penedo',
  });
  assert(novaEntrega.status === 303, `esperado 303, recebido ${novaEntrega.status}`);
  const detalhe = await req(novaEntrega.location);
  const id = novaEntrega.location.split('/').pop();
  const opcao = detalhe.body.match(/<option value="(\d+)"\s*>Motorista /);
  assert(opcao, 'motorista ativo não disponível no formulário de atribuição');
  const atribuicao = await req(`/entregas/${id}/atribuir?_method=PATCH`, 'POST', {
    motoristaId: opcao[1],
  });
  assert(atribuicao.status === 303, `esperado 303, recebido ${atribuicao.status}`);
  const detalheAtribuido = await req(atribuicao.location);
  assert(detalheAtribuido.body.includes('Motorista atribuído à entrega'), 'flash da atribuição ausente');
  assert(detalheAtribuido.body.includes(`Motorista ${identificador}`), 'motorista não aparece nos detalhes');
});

check('POST /motoristas rejeita CPF duplicado e preserva o formulário', 10, async () => {
  const resposta = await req('/motoristas', 'POST', {
    nome: `Outro nome ${identificador}`,
    cpf,
  });
  assert(resposta.status === 409, `esperado 409, recebido ${resposta.status}`);
  assert(resposta.body.includes(`Outro nome ${identificador}`), 'deve preservar o nome digitado');
  assert(resposta.body.includes('CPF'), 'deve exibir mensagem de CPF duplicado');
});

check('GET /motoristas/novo exibe formulário', 10, async () => {
  const resposta = await req('/motoristas/novo');
  assert(resposta.status === 200, `esperado 200, recebido ${resposta.status}`);
  assert(resposta.body.includes('name="nome"'), 'formulário sem campo nome');
  assert(resposta.body.includes('name="cpf"'), 'formulário sem campo cpf');
});

check('PATCH /entregas/:id/cancelar redireciona com flash', 5, async () => {
  const nova = await req('/entregas', 'POST', {
    descricao: `Cancelamento ${identificador}`,
    origem: 'Maceio',
    destino: 'Palmeira dos Indios',
  });
  assert(nova.status === 303, `esperado 303, recebido ${nova.status}`);
  const id = nova.location.split('/').pop();
  const acao = await req(`/entregas/${id}/cancelar?_method=PATCH`, 'POST');
  assert(acao.status === 303, `esperado 303, recebido ${acao.status}`);
  const detalhe = await req(acao.location);
  assert(detalhe.body.includes('CANCELADA'), 'entrega não foi cancelada');
  assert(detalhe.body.includes('Entrega cancelada'), 'mensagem flash do cancelamento ausente');
});

check('GET /entregas/:id inexistente renderiza HTML 404', 10, async () => {
  const resposta = await req('/entregas/99999999');
  assert(resposta.status === 404, `esperado 404, recebido ${resposta.status}`);
  assert(resposta.type.includes('text/html'), 'erro deve ser uma página HTML');
  assert(resposta.body.includes('Página não encontrada'), 'página 404 não foi renderizada');
  assert(!resposta.body.includes('stack trace'), 'resposta não deve revelar stack trace');
});

check('GET /api/health preserva readiness', 5, async () => {
  const resposta = await req('/api/health');
  assert(resposta.status === 200, `esperado 200, recebido ${resposta.status}`);
  assert(resposta.body.includes('"status":"ok"'), 'health check deve retornar status ok');
});

let obtido = 0;
const total = checks.reduce((soma, item) => soma + item.pontos, 0);
console.log(`\nAutograder — Delivery Tracker · Atividade 08`);
console.log(`BASE_URL: ${BASE}\n`);

for (const item of checks) {
  try {
    await item.executar();
    obtido += item.pontos;
    console.log(`✓ [${String(item.pontos).padStart(2)}/${item.pontos}] ${item.nome}`);
  } catch (erro) {
    console.log(`✗ [ 0/${item.pontos}] ${item.nome}`);
    console.log(`  ${erro.message}`);
  }
}

const percentual = Math.round((obtido / total) * 100);
console.log(`\nNOTA: ${obtido}/${total}  (${percentual}%)`);
if (percentual !== 100) process.exitCode = 1;
