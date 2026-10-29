import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import EntregasRepository from '../repositories/entregas.repository.prisma.js';
import MotoristasRepository from '../repositories/motoristas.repository.prisma.js';
import EntregasService from '../services/EntregasService.js';
import MotoristasService from '../services/MotoristasService.js';
import EntregasController from '../controllers/EntregasController.js';
import MotoristasController from '../controllers/MotoristasController.js';

export function criarRotas() {
  const entregasRepository = new EntregasRepository();
  const motoristasRepository = new MotoristasRepository();
  const entregasService = new EntregasService(entregasRepository, motoristasRepository);
  const motoristasService = new MotoristasService(motoristasRepository, entregasRepository);
  const entregasController = new EntregasController(entregasService, motoristasService);
  const motoristasController = new MotoristasController(motoristasService);

  const router = Router();

  const validarEntrega = [
    body('descricao').trim().notEmpty().withMessage('A descrição é obrigatória.'),
    body('origem').trim().notEmpty().withMessage('A origem é obrigatória.'),
    body('destino')
      .trim()
      .notEmpty()
      .withMessage('O destino é obrigatório.')
      .bail()
      .custom((destino, { req }) => destino !== req.body.origem)
      .withMessage('A origem e o destino devem ser diferentes.'),
  ];
  const validarMotorista = [
    body('nome').trim().notEmpty().withMessage('O nome é obrigatório.'),
    body('cpf').trim().notEmpty().withMessage('O CPF é obrigatório.'),
  ];
  const validarAtribuicao = [
    body('motoristaId')
      .notEmpty()
      .withMessage('Selecione um motorista.')
      .bail()
      .isInt({ min: 1 })
      .withMessage('Selecione um motorista válido.')
      .toInt(),
  ];

  router.get('/', (req, res) => res.redirect('/entregas'));
  router.get('/entregas', (req, res) => entregasController.listar(req, res));
  router.get('/entregas/nova', (req, res) => entregasController.nova(req, res));
  router.post('/entregas', validarEntrega, (req, res) => entregasController.criar(req, res));
  router.get('/entregas/:id', (req, res) => entregasController.buscarPorId(req, res));
  router.patch('/entregas/:id/avancar', (req, res) => entregasController.avancar(req, res));
  router.patch('/entregas/:id/cancelar', (req, res) => entregasController.cancelar(req, res));
  router.patch(
    '/entregas/:id/atribuir',
    validarAtribuicao,
    (req, res) => entregasController.atribuirMotorista(req, res)
  );

  router.get('/motoristas', (req, res) => motoristasController.listar(req, res));
  router.get('/motoristas/novo', (req, res) => motoristasController.novo(req, res));
  router.post('/motoristas', validarMotorista, (req, res) => motoristasController.criar(req, res));

  return router;
}