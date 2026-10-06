export default class EntregasRepository {
  constructor(database) {
    this.database = database;
  }

  listarTodos(filtros = {}) {
    return this.database.entregas.filter((entrega) =>
      Object.entries(filtros).every(([campo, valor]) => entrega[campo] === valor)
    );
  }

  buscarPorId(id) {
    return this.database.entregas.find((entrega) => entrega.id === id) ?? null;
  }

  criar(dados) {
    const entrega = { id: this.database.proximoId, ...dados };
    this.database.proximoId += 1;
    this.database.entregas.push(entrega);
    return entrega;
  }

  atualizar(id, dados) {
    const entrega = this.buscarPorId(id);
    if (!entrega) {
      return null;
    }
    Object.assign(entrega, dados);
    return entrega;
  }
}