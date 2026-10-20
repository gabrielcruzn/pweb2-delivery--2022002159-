import prisma from '../config/database.js';
import { criarErro } from '../utils/erros.js';

function mapearEntrega(entrega) {
  const { eventos, ...dados } = entrega;
  return {
    ...dados,
    historico: eventos
      .sort((primeiro, segundo) => primeiro.id - segundo.id)
      .map(({ data, descricao }) => ({ data: data.toISOString(), descricao })),
  };
}

function dadosEvento(evento) {
  return {
    descricao: evento.descricao,
    ...(evento.data ? { data: new Date(evento.data) } : {}),
  };
}

function converterErro(erro) {
  if (erro.code === 'P2002') {
    throw criarErro(409, 'já existe um registro com esse valor único');
  }
  throw erro;
}

export default class EntregasRepositoryPrisma {
  async listarTodos(filtros = {}) {
    const entregas = await prisma.entrega.findMany({
      where: filtros,
      include: { eventos: { orderBy: { id: 'asc' } } },
    });
    return entregas.map(mapearEntrega);
  }

  async buscarPorId(id) {
    const entrega = await prisma.entrega.findUnique({
      where: { id },
      include: { eventos: { orderBy: { id: 'asc' } } },
    });
    return entrega ? mapearEntrega(entrega) : null;
  }

  async criar(dados) {
    const { evento, historico = [], ...campos } = dados;
    const eventos = evento ? [evento] : historico;
    try {
      const entrega = await prisma.entrega.create({
        data: {
          ...campos,
          eventos: { create: eventos.map(dadosEvento) },
        },
        include: { eventos: { orderBy: { id: 'asc' } } },
      });
      return mapearEntrega(entrega);
    } catch (erro) {
      converterErro(erro);
    }
  }

  async atualizar(id, dados) {
    const { evento, historico: _historico, ...campos } = dados;
    const data = { ...campos };
    if (evento) {
      data.eventos = { create: dadosEvento(evento) };
    }

    try {
      const entrega = await prisma.entrega.update({
        where: { id },
        data,
        include: { eventos: { orderBy: { id: 'asc' } } },
      });
      return mapearEntrega(entrega);
    } catch (erro) {
      if (erro.code === 'P2025') {
        return null;
      }
      converterErro(erro);
    }
  }

  async listarPorMotorista(id) {
    const entregas = await prisma.entrega.findMany({
      where: { motoristaId: id },
      include: { eventos: { orderBy: { id: 'asc' } } },
    });
    return entregas.map(mapearEntrega);
  }
}