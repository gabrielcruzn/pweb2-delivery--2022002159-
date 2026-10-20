import { criarErro } from '../utils/erros.js';
import { validarId } from '../utils/validarId.js';

export default class EntregasService {
  constructor(entregasRepository, motoristasRepository) {
    this.entregasRepository = entregasRepository;
    this.motoristasRepository = motoristasRepository;
  }

  async criar(dados = {}) {
    const { descricao, origem, destino } = dados ?? {};

    if (!descricao || !origem || !destino) {
      throw criarErro(400, 'descricao, origem e destino são obrigatórios');
    }

    if (origem === destino) {
      throw criarErro(400, 'origem e destino devem ser diferentes');
    }

    const entregas = await this.entregasRepository.listarTodos();
    const duplicada = entregas.some(
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
      evento: { data: new Date().toISOString(), descricao: 'Entrega criada' },
    });
  }

  async listar(filtros = {}) {
    return this.entregasRepository.listarTodos(filtros);
  }

  async buscarPorId(id) {
    validarId(id, 'entrega não encontrada');
    const entrega = await this.entregasRepository.buscarPorId(id);
    if (!entrega) {
      throw criarErro(404, 'entrega não encontrada');
    }
    return entrega;
  }

  async avancar(id) {
    const entrega = await this.buscarPorId(id);

    if (entrega.status === 'CRIADA') {
      return this.mudarStatus(entrega, 'EM_TRANSITO');
    }
    if (entrega.status === 'EM_TRANSITO') {
      return this.mudarStatus(entrega, 'ENTREGUE');
    }
    throw criarErro(422, `não é possível avançar uma entrega ${entrega.status}`);
  }

  async cancelar(id) {
    const entrega = await this.buscarPorId(id);

    if (entrega.status === 'ENTREGUE' || entrega.status === 'CANCELADA') {
      throw criarErro(422, `não é possível cancelar uma entrega ${entrega.status}`);
    }
    return this.mudarStatus(entrega, 'CANCELADA');
  }

  async historico(id) {
    return (await this.buscarPorId(id)).historico;
  }

  async atribuirMotorista(id, motoristaId) {
    validarId(motoristaId, 'motorista não encontrado');

    const entrega = await this.buscarPorId(id);
    if (entrega.status !== 'CRIADA') {
      throw criarErro(422, 'só é possível atribuir motorista a uma entrega CRIADA');
    }

    const motorista = await this.motoristasRepository.buscarPorId(motoristaId);
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
      evento,
    });
  }

  mudarStatus(entrega, novoStatus) {
    const evento = {
      data: new Date().toISOString(),
      descricao: `Status alterado para ${novoStatus}`,
    };
    return this.entregasRepository.atualizar(entrega.id, {
      status: novoStatus,
      evento,
    });
  }
}