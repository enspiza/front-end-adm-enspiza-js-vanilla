import { mostrarMsg, limparMsg, rota } from './global.js';

window.onload = function () {
  const fileInput = document.getElementById('tsvFileInput');
  const periodoM = document.getElementById('periodoM');
  const periodoV = document.getElementById('periodoV');
  const periodoN = document.getElementById('periodoN');
  let periodoChecado = '';
  const msg = document.getElementById('msg');
  let tsvText;
  let jsonResult;
  let linhas = 0;
  const msgCarregamento = document.getElementById("msg-carregamento");
  const progresso1 = document.getElementById("progresso1");
  const total1 = document.getElementById("total1");
  const msgTruncamento = document.getElementById("msg-truncamento");
  const msgInsercao = document.getElementById("msg-insercao");
  const progresso2 = document.getElementById("progresso2");
  const total2 = document.getElementById("total2");

  inicializarPagina();

  function inicializarPagina(){
    // Esconder msg-carregamento
    msgCarregamento.style.display = "none";
    // Esconder msg-truncamento
    msgTruncamento.style.display = "none";
    // Esconder msg-importacao
    msgInsercao.style.display = "none";
    limparMsg(msg);
  }

  function validarCampos(){
    // Se nenhum arquivo foi selecionado
    if (!fileInput.files.length)
      throw new Error('Por favor, selecione um arquivo TSV.');
    // Se e qual radio foi selecionado
    if (periodoM.checked) 
      periodoChecado = 'M';
    else if (periodoV.checked)
      periodoChecado = 'V';
    else if (periodoN.checked)
      periodoChecado = 'N';
    else
      throw new Error('Por favor, selecione um período.');
  }

  // Botão importar
  document.getElementById('btn-importar').addEventListener('click', () => {
    try {
      inicializarPagina();
      validarCampos();
      carregarTSV();
      truncarTabela();
      inserirDados();
    } catch (error) {
      // Mostrar msg de erro
      mostrarMsg(msg, error, 'erro');
      console.error(error);
    }
  });

  // Carregar o TSV
  function carregarTSV() {
    // Criar um objeto Carregador de arquivos
    const reader = new FileReader();
    // Carrega o 1º arquivo selecionado
    reader.readAsText( fileInput.files[0] );
    // Se tiver havido erro na carga do arquivo
    reader.onerror = function () {
      throw new Error("Erro ao carregar o arquivo.");
    }
    // Processa o conteúdo do arquivo após a carga
    reader.onload = function (event) {
      const tsvText = event.target.result;
      // Converte o arquivo carregado, de TSV para JSON
      jsonResult = tsvToJson(tsvText);
    };
  }

  // Função para converter TSV para JSON
  function tsvToJson(tsv) {
    // Divide em linhas e remove linhas vazias
    const lines = tsv.split('\n').filter(line => line.trim() !== '');
    linhas = lines.length;
    // Contador de linhas do arquivo
    let numLinha = 1;
    // Mostrar msg-carregamento
    msgCarregamento.style.display = "";
    progresso1.textContent = numLinha;
    total1.textContent = "de " + linhas + " linhas.";
    // Assume que a primeira linha contém os cabeçalhos
    const headers = lines[0].split('\t');
    const json = lines.slice(1).map(line => {
      const values = line.split('\t');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim();
      });
      numLinha++;
      progresso1.textContent = numLinha;
      return obj;
    });
    msgCarregamento.textContent = "Ok - Arquivo carregado com sucesso.";
    return json;
  }

  // Truncar tabela
  function truncarTabela() {
    // let endPoint = rota.base + rota.m.truncate;
    // Configurar endPoint por período
    let endPoint = rota.base;
    if(periodoChecado === 'M')
      endPoint += rota.m.truncate;
    else if(periodoChecado === 'V')
      endPoint += rota.v.truncate;
    else if(periodoChecado === 'N')
      endPoint += rota.n.truncate;
    // Mostrar msg-truncamento
    msgTruncamento.style.display = "";
    // Requisitar remoção de todas as linhas, para a API
    fetch(endPoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok)
          throw new Error('O servidor não respondeu adequadamente.');
      })
      .then(data => {
        msgTruncamento.textContent = "Ok - Tabela apagada com sucesso.";
      })
      .catch(error => {
        // Mostrar msg de erro
        mostrarMsg(msg, 'Erro ao remover todos os dados.', 'erro');
        console.error(error);
      });
  };

  // Inserir dados do JSON
  function inserirDados() {
    // Configurar endPoint por período
    let endPoint = rota.base;
    if(periodoChecado === 'M')
      endPoint += rota.m.geral;
    else if(periodoChecado === 'V')
      endPoint += rota.v.geral;
    else if(periodoChecado === 'N')
      endPoint += rota.n.geral;
    // Contador de linhas do arquivo
    let numLinha = 1;
    // Mostrar msg-inserção
    msgInsercao.style.display = "";
    progresso2.textContent = numLinha;
    total2.textContent = "de " + linhas + " linhas.";
    // Para cada dado dos dados (jsonResult) convertidos para JSON
    for (let dado of jsonResult) {
      // let endPoint = rota.base + rota.m.geral;
      // Requisitar inserção de linha-por-linha, para a API
      fetch(endPoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dado)
      })
        .then(response => {
          if (!response.ok)
            throw new Error('O servidor não respondeu adequadamente.');
          return response.json();
        })
        .then(data => {
        })
        .catch(error => {
          // Mostrar msg de erro
          mostrarMsg(msg, 'Erro ao inserir os dados.', 'erro');
          console.error(error);
        });

      // output.textContent = `Inserindo ${numLinha} de ${dados.length} linhas.`;
      numLinha++;
      progresso2.textContent = numLinha;
    }
    msgInsercao.textContent = "Ok - Dados inseridos com sucesso.";
    // Mostrar msg de sucesso
    mostrarMsg(msg, 'Importação concluída com sucesso.', 'sucesso');
  };

}
