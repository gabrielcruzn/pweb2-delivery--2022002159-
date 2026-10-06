/**
 * @typedef {object} EntregaFiltros
 * @property {number} [motoristaId]
 * @property {string} [status]
 */

/**
 * Contrato de persistência das entregas.
 * @typedef {object} IEntregasRepository
 * @property {(filtros?: EntregaFiltros) => object[]} listarTodos
 * @property {(id: number) => object | null} buscarPorId
 * @property {(dados: object) => object} criar
 * @property {(id: number, dados: object) => object | null} atualizar
 */
export {};