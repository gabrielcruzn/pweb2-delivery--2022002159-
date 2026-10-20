import { criarErro } from './erros.js';

export function validarId(id, mensagem) {
  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    throw criarErro(404, mensagem);
  }
}