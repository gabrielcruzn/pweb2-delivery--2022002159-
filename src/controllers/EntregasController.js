export default class EntregasController {
  constructor(service) {
    this.service = service;
  }

  async criar(req, res) {
    try {
      const entrega = await this.service.criar(req.body);
      res.status(201).json(entrega);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  async listar(req, res) {
    try {
      const status = req.query.status;
      const entregas = await this.service.listar(status ? { status } : {});
      res.status(200).json(entregas);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  async buscarPorId(req, res) {
    try {
      const id = Number(req.params.id);
      const entrega = await this.service.buscarPorId(id);
      res.status(200).json(entrega);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  async avancar(req, res) {
    try {
      const id = Number(req.params.id);
      const entrega = await this.service.avancar(id);
      res.status(200).json(entrega);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  async cancelar(req, res) {
    try {
      const id = Number(req.params.id);
      const entrega = await this.service.cancelar(id);
      res.status(200).json(entrega);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  async historico(req, res) {
    try {
      const id = Number(req.params.id);
      const historico = await this.service.historico(id);
      res.status(200).json(historico);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }

  async atribuirMotorista(req, res) {
    try {
      const id = Number(req.params.id);
      const motoristaId = Number(req.body?.motoristaId);
      const entrega = await this.service.atribuirMotorista(id, motoristaId);
      res.status(200).json(entrega);
    } catch (erro) {
      res.status(erro.status || 500).json({ erro: erro.message });
    }
  }
}