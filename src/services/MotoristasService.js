import { criarErro } from '../utils/erros.js';
import { validarId } from '../utils/validarId.js';

export default class MotoristasService {
  constructor(motoristasRepository, entregasRepository) {
    this.motoristasRepository = motoristasRepository;
    this.entregasRepository = entregasRepository;
  }

  async criar(dados = {}) {
    const { nome, cpf, placaVeiculo } = dados ?? {};
    if (typeof nome !== 'string' || !nome.trim() || typeof cpf !== 'string' || !cpf.trim()) {
      throw criarErro(400, 'nome e cpf são obrigatórios');
    }
    const cpfNormalizado = cpf.trim();
    if (await this.motoristasRepository.buscarPorCpf(cpfNormalizado)) {
      throw criarErro(409, 'já existe um motorista cadastrado com este CPF');
    }

    return this.motoristasRepository.criar({
      nome: nome.trim(),
      cpf: cpfNormalizado,
      ...(placaVeiculo === undefined ? {} : { placaVeiculo }),
      status: 'ATIVO',
    });
  }

  async listar() {
    return this.motoristasRepository.listarTodos();
  }

  async buscarPorId(id) {
    validarId(id, 'motorista não encontrado');
    const motorista = await this.motoristasRepository.buscarPorId(id);
    if (!motorista) {
      throw criarErro(404, 'motorista não encontrado');
    }
    return motorista;
  }

  async listarEntregas(id, status) {
    await this.buscarPorId(id);
    const entregas = await this.entregasRepository.listarPorMotorista(id);
    return status ? entregas.filter((entrega) => entrega.status === status) : entregas;
  }
}