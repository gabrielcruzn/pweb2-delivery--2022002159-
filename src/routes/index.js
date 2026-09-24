import { Router } from 'express';
import Database from '../database/Database.js';
import EntregasRepositories from '../repositories/EntregasRepositories.js';
import EntregasService from '../services/EntregasService.js';
import EntregasController from '../controllers/EntregasController.js';

export function criarRotas() {
  const database = new Database();
  const repositories = new EntregasRepositories(database);
  const service = new EntregasService(repositories);
  const controller = new EntregasController(service);

  const router = Router();

  router.post('/entregas', (req, res) => controller.criar(req, res));
  router.get('/entregas', (req, res) => controller.listar(req, res));
  router.get('/entregas/:id', (req, res) => controller.buscarPorId(req, res));
  router.patch('/entregas/:id/avancar', (req, res) => controller.avancar(req, res));
  router.patch('/entregas/:id/cancelar', (req, res) => controller.cancelar(req, res));
  router.get('/entregas/:id/historico', (req, res) => controller.historico(req, res));

  return router;
}