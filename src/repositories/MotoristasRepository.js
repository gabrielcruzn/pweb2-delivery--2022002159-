export default class MotoristasRepository {
  constructor(database) {
    this.database = database;
  }

  listarTodos() {
    return this.database.motoristas;
  }

  buscarPorId(id) {
    return this.database.motoristas.find((motorista) => motorista.id === id) ?? null;
  }

  buscarPorCpf(cpf) {
    return this.database.motoristas.find((motorista) => motorista.cpf === cpf) ?? null;
  }

  criar(dados) {
    const motorista = { id: this.database.proximoMotoristaId, ...dados };
    this.database.proximoMotoristaId += 1;
    this.database.motoristas.push(motorista);
    return motorista;
  }
}