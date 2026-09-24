export default class EntregasController {
  constructor(service) {
    this.service = service;
  }

  criar(req, res) {
    try {
      const entrega = this.service.criar(req.body);
      res.status(201).json(entrega);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  listar(req, res) {
    try {
      const status = req.query.status;
      const entregas = this.service.listar(status);
      res.status(200).json(entregas);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  buscarPorId(req, res) {
    try {
      const id = Number(req.params.id);
      const entrega = this.service.buscarPorId(id);
      res.status(200).json(entrega);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  avancar(req, res) {
    try {
      const id = Number(req.params.id);
      const entrega = this.service.avancar(id);
      res.status(200).json(entrega);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  cancelar(req, res) {
    try {
      const id = Number(req.params.id);
      const entrega = this.service.cancelar(id);
      res.status(200).json(entrega);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  historico(req, res) {
    try {
      const id = Number(req.params.id);
      const historico = this.service.historico(id);
      res.status(200).json(historico);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }
}