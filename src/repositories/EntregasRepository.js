export default class EntregasRepository {
  constructor(database) {
    this.database = database;
  }

  async listarTodos(filtros = {}) {
    return this.database.entregas.filter((entrega) =>
      Object.entries(filtros).every(([campo, valor]) => entrega[campo] === valor)
    );
  }

  async buscarPorId(id) {
    return this.database.entregas.find((entrega) => entrega.id === id) ?? null;
  }

  async criar(dados) {
    const { evento, historico = [], ...campos } = dados;
    const entrega = {
      id: this.database.proximoId,
      ...campos,
      historico: evento ? [this.normalizarEvento(evento)] : historico,
    };
    this.database.proximoId += 1;
    this.database.entregas.push(entrega);
    return entrega;
  }

  async atualizar(id, dados) {
    const entrega = await this.buscarPorId(id);
    if (!entrega) {
      return null;
    }
    const { evento, historico, ...campos } = dados;
    Object.assign(entrega, campos);
    if (evento) {
      entrega.historico.push(this.normalizarEvento(evento));
    } else if (historico) {
      entrega.historico = historico;
    }
    return entrega;
  }

  async listarPorMotorista(id) {
    return this.database.entregas.filter((entrega) => entrega.motoristaId === id);
  }

  normalizarEvento(evento) {
    return {
      data: evento.data ? new Date(evento.data).toISOString() : new Date().toISOString(),
      descricao: evento.descricao,
    };
  }
}