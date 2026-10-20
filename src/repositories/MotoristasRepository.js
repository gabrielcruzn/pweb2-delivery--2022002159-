export default class MotoristasRepository {
  constructor(database) {
    this.database = database;
  }

  async listarTodos() {
    return this.database.motoristas;
  }

  async buscarPorId(id) {
    return this.database.motoristas.find((motorista) => motorista.id === id) ?? null;
  }

  async buscarPorCpf(cpf) {
    return this.database.motoristas.find((motorista) => motorista.cpf === cpf) ?? null;
  }

  async criar(dados) {
    const motorista = { id: this.database.proximoMotoristaId, ...dados };
    this.database.proximoMotoristaId += 1;
    this.database.motoristas.push(motorista);
    return motorista;
  }

  async atualizar(id, dados) {
    const motorista = await this.buscarPorId(id);
    if (!motorista) {
      return null;
    }
    Object.assign(motorista, dados);
    return motorista;
  }
}