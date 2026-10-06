import { criarErro } from '../utils/erros.js';

export default class MotoristasService {
  constructor(motoristasRepository, entregasRepository) {
    this.motoristasRepository = motoristasRepository;
    this.entregasRepository = entregasRepository;
  }

  criar(dados) {
    const { nome, cpf, placaVeiculo } = dados;
    if (typeof nome !== 'string' || !nome.trim() || typeof cpf !== 'string' || !cpf.trim()) {
      throw criarErro(400, 'nome e cpf são obrigatórios');
    }
    const cpfNormalizado = cpf.trim();
    if (this.motoristasRepository.buscarPorCpf(cpfNormalizado)) {
      throw criarErro(409, 'já existe um motorista cadastrado com este CPF');
    }

    return this.motoristasRepository.criar({
      nome: nome.trim(),
      cpf: cpfNormalizado,
      ...(placaVeiculo === undefined ? {} : { placaVeiculo }),
      status: 'ATIVO',
    });
  }

  listar() {
    return this.motoristasRepository.listarTodos();
  }

  buscarPorId(id) {
    const motorista = this.motoristasRepository.buscarPorId(id);
    if (!motorista) {
      throw criarErro(404, 'motorista não encontrado');
    }
    return motorista;
  }

  listarEntregas(id, status) {
    this.buscarPorId(id);
    return this.entregasRepository.listarTodos({
      motoristaId: id,
      ...(status ? { status } : {}),
    });
  }
}