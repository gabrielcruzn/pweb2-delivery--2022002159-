import { criarErro } from '../utils/erros.js';

export default class EntregasService {
  constructor(entregasRepository, motoristasRepository) {
    this.entregasRepository = entregasRepository;
    this.motoristasRepository = motoristasRepository;
  }

  criar(dados) {
    const { descricao, origem, destino } = dados;

    if (!descricao || !origem || !destino) {
      throw criarErro(400, 'descricao, origem e destino são obrigatórios');
    }

    if (origem === destino) {
      throw criarErro(400, 'origem e destino devem ser diferentes');
    }

    const duplicada = this.entregasRepository.listarTodos().some(
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

    return this.entregasRepository.criar({
      descricao,
      origem,
      destino,
      status: 'CRIADA',
      motoristaId: null,
      historico: [{ data: new Date().toISOString(), descricao: 'Entrega criada' }],
    });
  }

  listar(filtros = {}) {
    return this.entregasRepository.listarTodos(filtros);
  }

  buscarPorId(id) {
    const entrega = this.entregasRepository.buscarPorId(id);
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

  atribuirMotorista(id, motoristaId) {
    if (!Number.isInteger(motoristaId) || motoristaId <= 0) {
      throw criarErro(400, 'motoristaId é obrigatório');
    }

    const entrega = this.buscarPorId(id);
    if (entrega.status !== 'CRIADA') {
      throw criarErro(422, 'só é possível atribuir motorista a uma entrega CRIADA');
    }

    const motorista = this.motoristasRepository.buscarPorId(motoristaId);
    if (!motorista) {
      throw criarErro(404, 'motorista não encontrado');
    }
    if (motorista.status !== 'ATIVO') {
      throw criarErro(422, 'não é possível atribuir um motorista INATIVO');
    }

    const evento = {
      data: new Date().toISOString(),
      descricao: `Motorista ${motorista.nome} atribuído`,
    };
    return this.entregasRepository.atualizar(id, {
      motoristaId,
      historico: [...entrega.historico, evento],
    });
  }

  mudarStatus(entrega, novoStatus) {
    const evento = {
      data: new Date().toISOString(),
      descricao: `Status alterado para ${novoStatus}`,
    };
    return this.entregasRepository.atualizar(entrega.id, {
      status: novoStatus,
      historico: [...entrega.historico, evento],
    });
  }
}