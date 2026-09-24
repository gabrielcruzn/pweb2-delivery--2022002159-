import { criarErro } from '../utils/erros.js';

export default class EntregasService {
  constructor(repositories) {
    this.repositories = repositories;
  }

  criar(dados) {
    const { descricao, origem, destino } = dados;

    if (!descricao || !origem || !destino) {
      throw criarErro(400, 'descricao, origem e destino são obrigatórios');
    }

    if (origem === destino) {
      throw criarErro(400, 'origem e destino devem ser diferentes');
    }

    const duplicada = this.repositories.listar().some(
      (entrega) =>
        entrega.descricao === descricao &&
        entrega.origem === origem &&
        entrega.destino === destino &&
        entrega.status !== 'ENTREGUE' &&
        entrega.status !== 'CANCELADA'
    );

    if (duplicada) {
      throw criarErro(409, 'já existe uma entrega ativa igual a esta');
    }

    return this.repositories.criar({
      descricao,
      origem,
      destino,
      status: 'CRIADA',
      motoristaId: null,
      historico: [{ data: new Date().toISOString(), descricao: 'Entrega criada' }],
    });
  }

  listar(status) {
    const entregas = this.repositories.listar();
    if (!status) {
      return entregas;
    }
    return entregas.filter((entrega) => entrega.status === status);
  }

  buscarPorId(id) {
    const entrega = this.repositories.buscarPorId(id);
    if (!entrega) {
      throw criarErro(404, 'entrega não encontrada');
    }
    return entrega;
  }

  avancar(id) {
    const entrega = this.buscarPorId(id);

    if (entrega.status === 'CRIADA') {
      return this.mudarStatus(entrega, 'EM_TRANSITO');
    }
    if (entrega.status === 'EM_TRANSITO') {
      return this.mudarStatus(entrega, 'ENTREGUE');
    }
    throw criarErro(422, `não é possível avançar uma entrega ${entrega.status}`);
  }

  cancelar(id) {
    const entrega = this.buscarPorId(id);

    if (entrega.status === 'ENTREGUE' || entrega.status === 'CANCELADA') {
      throw criarErro(422, `não é possível cancelar uma entrega ${entrega.status}`);
    }
    return this.mudarStatus(entrega, 'CANCELADA');
  }

  historico(id) {
    return this.buscarPorId(id).historico;
  }

  mudarStatus(entrega, novoStatus) {
    const evento = {
      data: new Date().toISOString(),
      descricao: `Status alterado para ${novoStatus}`,
    };
    return this.repositories.atualizar(entrega.id, {
      status: novoStatus,
      historico: [...entrega.historico, evento],
    });
  }
}