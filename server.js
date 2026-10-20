// Delivery Tracker — Exercício do Cap. 4.
// Este é o ponto de entrada. Ele deve APENAS configurar o app e montar as rotas.
// A regra de negócio fica no Service; o acesso a dados no Repository; a
// composição das dependências (injeção) fica no seu arquivo de rotas.
//
// Comece implementando as camadas em src/ (veja o README) e vá rodando o
// autograder: `npm run check` (com o servidor no ar) ou pela aba Actions no push.
import express from 'express';
import 'dotenv/config';
import { criarRotas } from './src/routes/index.js';  

const app = express();
app.use(express.json());

// Health check exigido pelo contrato de execução (não remova).
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// TODO: monte aqui o roteador da sua API (composition root em src/routes):
app.use('/api', criarRotas());

// 404 para rotas não mapeadas (mantenha por último, antes do listen).
app.use((req, res) => res.status(404).json({ erro: 'recurso não encontrado' }));

app.use((erro, req, res, next) => {
	const status = Number.isInteger(erro.status) && erro.status >= 400 && erro.status < 500
		? erro.status
		: 500;
	const mensagem = status < 500 ? erro.message : 'erro interno do servidor';
	res.status(status).json({ erro: mensagem });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Delivery Tracker rodando em http://localhost:${PORT}`));
