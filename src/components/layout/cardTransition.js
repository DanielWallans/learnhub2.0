// Passa a posição do card clicado no Painel para a tela de entrada do módulo,
// que usa esse retângulo como ponto de partida da expansão.
let pending = null;

export function setCardTransition(id, rect) {
  pending = { id, rect: { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom }, at: Date.now() };
}

// Só lê (não consome): o StrictMode do React roda efeitos duas vezes em desenvolvimento
export function peekCardTransition(id) {
  if (pending && pending.id === id && Date.now() - pending.at < 1500) return pending.rect;
  return null;
}

export function clearCardTransition() {
  pending = null;
}
