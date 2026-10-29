# Delivery Tracker — Atividade 08 (SSR com EJS)

Interface web renderizada no servidor para o Delivery Tracker. As regras de negócio,
services e repositories Prisma do exercício anterior foram preservados; controllers e
views agora entregam páginas HTML com EJS.

## Requisitos

- Node.js 18 ou superior
- npm
- SQLite e Prisma (já configurados no projeto)

## Como executar

```powershell
npm install
Copy-Item .env.example .env
npx prisma migrate dev
npm start
```

Abra `http://localhost:3000`. Para desenvolvimento com reinicialização automática,
use `npm run dev`. O servidor respeita `PORT` e `DATABASE_URL` definidos no `.env`.
Configure `SESSION_SECRET` com um valor aleatório antes de publicar o sistema.

O health check continua disponível em `GET /api/health`.
Com o servidor em execução, valide as páginas e ações com `npm run check` (ou
`BASE_URL=http://localhost:3000 node autograder/check.mjs`).

## Páginas e ações

| Método | Caminho | Comportamento |
|---|---|---|
| `GET` | `/` | Redireciona para `/entregas` |
| `GET` | `/entregas` | Lista entregas e filtra por `?status=` |
| `GET` | `/entregas/nova` | Formulário de nova entrega |
| `POST` | `/entregas` | Cria entrega e redireciona; erros reexibem o formulário |
| `GET` | `/entregas/:id` | Detalhes, status, histórico e ações disponíveis |
| `PATCH` | `/entregas/:id/avancar` | Avança o status e redireciona |
| `PATCH` | `/entregas/:id/cancelar` | Cancela e redireciona |
| `PATCH` | `/entregas/:id/atribuir` | Atribui motorista e redireciona |
| `GET` | `/motoristas` | Lista motoristas cadastrados |
| `GET` | `/motoristas/novo` | Formulário de novo motorista |
| `POST` | `/motoristas` | Cadastra motorista e redireciona |

As ações `PATCH` são enviadas por formulários HTML usando method-override. Escritas
bem-sucedidas seguem Post-Redirect-Get (PRG), e mensagens flash aparecem na página
seguinte. Erros de validação reexibem o formulário com os valores digitados e uma
explicação; uma entrega inexistente apresenta uma página HTML 404.

## Organização

- `src/views/layouts/` e `src/views/partials/`: layout EJS e navegação/mensagens reutilizáveis.
- `src/views/entregas/` e `src/views/motoristas/`: listagens, formulários e detalhes.
- `src/controllers/`: renderização, redirects e tradução de erros para a interface.
- `src/services/` e `src/repositories/`: regras de negócio e acesso Prisma preservados.
- `src/routes/index.js`: composition root e validação das entradas dos formulários.

![Tela de listagem de entregas](./docs/tela-entregas.png)
