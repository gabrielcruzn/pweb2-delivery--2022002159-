export default class EntregasRepositories {
  constructor(database) {
    this.database = database;
  }

  listar() {
    return this.database.entregas;
  }

  buscarPorId(id) {
    return this.database.entregas.find((entrega) => entrega.id === id);
  }

  criar(dados) {
    const entrega = { id: this.database.proximoId, ...dados };
    this.database.proximoId += 1;
    this.database.entregas.push(entrega);
    return entrega;
  }

  atualizar(id, dados) {
    const entrega = this.buscarPorId(id);
    Object.assign(entrega, dados);
    return entrega;
  }
}