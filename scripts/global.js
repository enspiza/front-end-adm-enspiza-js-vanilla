export const rota = {
  // Usar o URL abaixo em produção
  base: "https://back-end-enspiza-nodejs.onrender.com",
  // base: 'http://localhost:3333',
  m: {
    geral: '/matutino',
    doFiltro: '/ensalamentoM',
    truncate: '/matutinotodos'
  },
  v: {
    geral: '/vespertino',
    doFiltro: '/ensalamentoV',
    truncate: '/vespertinotodos'
  },
  n: {
    geral: '/noturno',
    doFiltro: '/ensalamentoN',
    truncate: '/noturnotodos'
  }
};

// Limpar a msg
export function limparMsg(tag) {
  tag.textContent = '';
  tag.setAttribute('class', "");
}
  
// Mostrar msg
export function mostrarMsg(tag, mensagem, tipo) {
  tag.textContent = mensagem;
  let classe = "w3-panel w3-border w3-round-large w3-center w3-padding-large";
  if(tipo === 'sucesso')
    classe += " w3-green";
  else if(tipo === 'aviso')
    classe += " w3-yellow";
  else if(tipo === 'erro')
    classe += " w3-red";
  tag.setAttribute('class', classe);
}
