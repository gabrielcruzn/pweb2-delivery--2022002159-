export default class MotoristasController {
  constructor(service) {
    this.service = service;
  }

  async criar(req, res) {
    try {
      res.status(201).json(await this.service.criar(req.body ?? {}));
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  async listar(req, res) {
    try {
      res.status(200).json(await this.service.listar());
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  async buscarPorId(req, res) {
    try {
      res.status(200).json(await this.service.buscarPorId(Number(req.params.id)));
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  async listarEntregas(req, res) {
    try {
      const entregas = await this.service.listarEntregas(Number(req.params.id), req.query.status);
      res.status(200).json(entregas);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }
}