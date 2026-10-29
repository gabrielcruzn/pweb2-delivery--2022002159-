import { validationResult } from 'express-validator';

export default class EntregasController {
  constructor(service, motoristasService) {
    this.service = service;
    this.motoristasService = motoristasService;
  }

  async listar(req, res) {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status : '';
      const entregas = await this.service.listar(status ? { status } : {});
      res.render('entregas/index', { title: 'Entregas', entregas, statusFiltro: status });
    } catch (erro) {
      this.renderarErro(erro, req, res);
    }
  }

  nova(req, res) {
    res.render('entregas/form', {
      title: 'Nova entrega',
      entrega: {},
      erros: [],
    });
  }

  async criar(req, res) {
    const erros = validationResult(req).array().map((erro) => erro.msg);
    if (erros.length) {
      return res.status(400).render('entregas/form', {
        title: 'Nova entrega',
        entrega: req.body,
        erros,
      });
    }

    try {
      const entrega = await this.service.criar(req.body);
      req.flash('success', 'Entrega criada com sucesso.');
      return res.redirect(303, `/entregas/${entrega.id}`);
    } catch (erro) {
      if (erro.status === 400 || erro.status === 409) {
        return res.status(erro.status).render('entregas/form', {
          title: 'Nova entrega',
          entrega: req.body,
          erros: [erro.message],
        });
      }
      return this.renderarErro(erro, req, res);
    }
  }

  async buscarPorId(req, res) {
    try {
      const id = Number(req.params.id);
      const entrega = await this.service.buscarPorId(id);
      const motoristas = await this.motoristasService.listar();
      const motorista = motoristas.find((item) => item.id === entrega.motoristaId) ?? null;
      res.render('entregas/show', {
        title: `Entrega #${entrega.id}`,
        entrega,
        motorista,
        motoristas: motoristas.filter((item) => item.status === 'ATIVO'),
      });
    } catch (erro) {
      this.renderarErro(erro, req, res);
    }
  }

  async avancar(req, res) {
    try {
      await this.service.avancar(Number(req.params.id));
      req.flash('success', 'O status da entrega foi avançado.');
      return res.redirect(303, `/entregas/${req.params.id}`);
    } catch (erro) {
      return this.tratarErroDeAcao(erro, req, res);
    }
  }

  async cancelar(req, res) {
    try {
      await this.service.cancelar(Number(req.params.id));
      req.flash('success', 'Entrega cancelada.');
      return res.redirect(303, `/entregas/${req.params.id}`);
    } catch (erro) {
      return this.tratarErroDeAcao(erro, req, res);
    }
  }

  async atribuirMotorista(req, res) {
    const erros = validationResult(req).array().map((erro) => erro.msg);
    if (erros.length) {
      req.flash('error', erros.join(' '));
      return res.redirect(303, `/entregas/${req.params.id}`);
    }

    try {
      await this.service.atribuirMotorista(
        Number(req.params.id),
        Number(req.body.motoristaId)
      );
      req.flash('success', 'Motorista atribuído à entrega.');
      return res.redirect(303, `/entregas/${req.params.id}`);
    } catch (erro) {
      return this.tratarErroDeAcao(erro, req, res);
    }
  }

  tratarErroDeAcao(erro, req, res) {
    if (erro.status === 404) {
      return res.status(404).render('errors/404', { title: 'Entrega não encontrada' });
    }
    if (erro.status && erro.status < 500) {
      req.flash('error', erro.message);
      return res.redirect(303, `/entregas/${req.params.id}`);
    }
    return this.renderarErro(erro, req, res);
  }

  renderarErro(erro, req, res) {
    if (erro.status === 404) {
      return res.status(404).render('errors/404', { title: 'Entrega não encontrada' });
    }
    console.error(erro);
    return res.status(500).render('errors/500', {
      title: 'Não foi possível carregar as entregas',
    });
  }
}