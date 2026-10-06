export default class MotoristasController {
  constructor(service) {
    this.service = service;
  }

  criar(req, res) {
    try {
      res.status(201).json(this.service.criar(req.body ?? {}));
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  listar(req, res) {
    try {
      res.status(200).json(this.service.listar());
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  buscarPorId(req, res) {
    try {
      res.status(200).json(this.service.buscarPorId(Number(req.params.id)));
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  listarEntregas(req, res) {
    try {
      const entregas = this.service.listarEntregas(Number(req.params.id), req.query.status);
      res.status(200).json(entregas);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }
}