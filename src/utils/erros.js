export function criarErro(status, mensagem) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}