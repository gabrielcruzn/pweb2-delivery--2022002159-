/**
 * Contrato de persistência dos motoristas.
 * @typedef {object} IMotoristasRepository
 * @property {() => object[]} listarTodos
 * @property {(id: number) => object | null} buscarPorId
 * @property {(cpf: string) => object | null} buscarPorCpf
 * @property {(dados: object) => object} criar
 */
export {};