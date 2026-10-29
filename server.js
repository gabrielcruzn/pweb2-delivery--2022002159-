import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import connectFlash from 'connect-flash';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import methodOverride from 'method-override';
import session from 'express-session';
import { criarRotas } from './src/routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(expressLayouts);
app.set('layout', 'layouts/base');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'delivery-tracker-development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  })
);
app.use(connectFlash());
app.use(methodOverride('_method'));
app.use((req, res, next) => {
  res.locals.mensagens = {
    sucesso: req.flash('success'),
    erro: req.flash('error'),
  };
  res.locals.caminhoAtual = req.path;
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/', criarRotas());

app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Página não encontrada' });
});

app.use((erro, req, res, next) => {
  if (res.headersSent) {
    next(erro);
    return;
  }
  const status =
    Number.isInteger(erro.status) && erro.status >= 400 && erro.status < 500
      ? erro.status
      : 500;
  if (status === 500) {
    console.error(erro);
  }
  res.status(status).render('errors/500', {
    title: 'Não foi possível concluir a solicitação',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Delivery Tracker rodando em http://localhost:${PORT}`));
