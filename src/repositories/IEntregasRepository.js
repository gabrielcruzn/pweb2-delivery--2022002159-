/**
 * @typedef {object} EntregaFiltros
 * @property {number} [motoristaId]
 * @property {string} [status]
 */

/**
 * Contrato de persistência das entregas.
 * @typedef {object} IEntregasRepository
 * @property {(filtros?: EntregaFiltros) => Promise<object[]>} listarTodos
 * @property {(id: number) => Promise<object | null>} buscarPorId
 * @property {(dados: object) => Promise<object>} criar
 * @property {(id: number, dados: object) => Promise<object | null>} atualizar
 * @property {(id: number) => Promise<object[]>} listarPorMotorista
 */
export {};