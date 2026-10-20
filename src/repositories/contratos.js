/**
 * @typedef {object} EntregaFiltros
 * @property {number} [motoristaId]
 * @property {string} [status]
 */

/**
 * @typedef {object} EventoEntrega
 * @property {string|Date} [data]
 * @property {string} descricao
 */

/**
 * Contrato assíncrono para persistência das entregas.
 * @typedef {object} EntregasRepositoryContrato
 * @property {(filtros?: EntregaFiltros) => Promise<object[]>} listarTodos
 * @property {(id: number) => Promise<object|null>} buscarPorId
 * @property {(dados: object & {evento?: EventoEntrega}) => Promise<object>} criar
 * @property {(id: number, dados: object & {evento?: EventoEntrega}) => Promise<object|null>} atualizar
 * @property {(id: number) => Promise<object[]>} listarPorMotorista
 */

/**
 * Contrato assíncrono para persistência dos motoristas.
 * @typedef {object} MotoristasRepositoryContrato
 * @property {() => Promise<object[]>} listarTodos
 * @property {(id: number) => Promise<object|null>} buscarPorId
 * @property {(cpf: string) => Promise<object|null>} buscarPorCpf
 * @property {(dados: object) => Promise<object>} criar
 * @property {(id: number, dados: object) => Promise<object|null>} atualizar
 */
export {};