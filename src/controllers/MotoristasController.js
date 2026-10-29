import { validationResult } from 'express-validator';

export default class MotoristasController {
  constructor(service) {
    this.service = service;
  }

  async listar(req, res) {
    try {
      const motoristas = await this.service.listar();
      res.render('motoristas/index', { title: 'Motoristas', motoristas });
    } catch (erro) {
      console.error(erro);
      res.status(500).render('errors/500', { title: 'Não foi possível carregar os motoristas' });
    }
  }

  novo(req, res) {
    res.render('motoristas/form', {
      title: 'Novo motorista',
      motorista: {},
      erros: [],
    });
  }

  async criar(req, res) {
    const erros = validationResult(req).array().map((erro) => erro.msg);
    if (erros.length) {
      return res.status(400).render('motoristas/form', {
        title: 'Novo motorista',
        motorista: req.body,
        erros,
      });
    }

    try {
      await this.service.criar(req.body ?? {});
      req.flash('success', 'Motorista cadastrado com sucesso.');
      return res.redirect(303, '/motoristas');
    } catch (erro) {
      if (erro.status === 400 || erro.status === 409) {
        return res.status(erro.status).render('motoristas/form', {
          title: 'Novo motorista',
          motorista: req.body,
          erros: [erro.message],
        });
      }
      console.error(erro);
      return res.status(500).render('errors/500', {
        title: 'Não foi possível cadastrar o motorista',
      });
    }
  }
}