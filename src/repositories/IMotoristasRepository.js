/**
 * Contrato de persistência dos motoristas.
 * @typedef {object} IMotoristasRepository
 * @property {() => Promise<object[]>} listarTodos
 * @property {(id: number) => Promise<object | null>} buscarPorId
 * @property {(cpf: string) => Promise<object | null>} buscarPorCpf
 * @property {(dados: object) => Promise<object>} criar
 * @property {(id: number, dados: object) => Promise<object | null>} atualizar
 */
export {};