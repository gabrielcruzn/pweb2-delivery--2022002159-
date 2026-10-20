import prisma from '../config/database.js';
import { criarErro } from '../utils/erros.js';

function mapearMotorista(motorista) {
  const { placaVeiculo, ...dados } = motorista;
  return placaVeiculo === null ? dados : { ...dados, placaVeiculo };
}

function converterErro(erro) {
  if (erro.code === 'P2002') {
    throw criarErro(409, 'já existe um motorista cadastrado com este CPF');
  }
  throw erro;
}

export default class MotoristasRepositoryPrisma {
  async listarTodos() {
    const motoristas = await prisma.motorista.findMany();
    return motoristas.map(mapearMotorista);
  }

  async buscarPorId(id) {
    const motorista = await prisma.motorista.findUnique({ where: { id } });
    return motorista ? mapearMotorista(motorista) : null;
  }

  async buscarPorCpf(cpf) {
    const motorista = await prisma.motorista.findUnique({ where: { cpf } });
    return motorista ? mapearMotorista(motorista) : null;
  }

  async criar(dados) {
    try {
      const motorista = await prisma.motorista.create({ data: dados });
      return mapearMotorista(motorista);
    } catch (erro) {
      converterErro(erro);
    }
  }

  async atualizar(id, dados) {
    try {
      const motorista = await prisma.motorista.update({ where: { id }, data: dados });
      return mapearMotorista(motorista);
    } catch (erro) {
      if (erro.code === 'P2025') {
        return null;
      }
      converterErro(erro);
    }
  }
}