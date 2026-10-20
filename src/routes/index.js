import { Router } from 'express';
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
  const entregasController = new EntregasController(entregasService);
  const motoristasController = new MotoristasController(motoristasService);

  const router = Router();

  router.post('/entregas', (req, res) => entregasController.criar(req, res));
  router.get('/entregas', (req, res) => entregasController.listar(req, res));
  router.get('/entregas/:id', (req, res) => entregasController.buscarPorId(req, res));
  router.patch('/entregas/:id/avancar', (req, res) => entregasController.avancar(req, res));
  router.patch('/entregas/:id/cancelar', (req, res) => entregasController.cancelar(req, res));
  router.patch('/entregas/:id/atribuir', (req, res) => entregasController.atribuirMotorista(req, res));
  router.get('/entregas/:id/historico', (req, res) => entregasController.historico(req, res));

  router.post('/motoristas', (req, res) => motoristasController.criar(req, res));
  router.get('/motoristas', (req, res) => motoristasController.listar(req, res));
  router.get('/motoristas/:id/entregas', (req, res) => motoristasController.listarEntregas(req, res));
  router.get('/motoristas/:id', (req, res) => motoristasController.buscarPorId(req, res));

  return router;
}