import { mostrarMsg, limparMsg, rota } from './global.js';

window.onload = function () {
  const btnAdicionar = document.querySelector('#btn-adicionar');
  const painelFormulario = document.getElementById('painel-formulario');
  const formulario = document.getElementById('formulario');

  const id = document.getElementById('id');
  const disciplina = document.getElementById('disciplina');
  const diaDaSemana = document.getElementById('dia-da-semana');
  const sala = document.getElementById('sala');
  const professor = document.getElementById('professor');

  const msgForm = document.getElementById('msg-form');
  const btnCancelar = document.querySelector('#btn-cancelar');
  const formPesquisa = document.getElementById('form-pesquisa');
  const pesquisa = document.querySelector('#pesquisa');
  const msgListar = document.getElementById('msg-listar');
  const tbody = document.querySelector('#lista-cadastro tbody');

  // Inicia com o foco no campo pesquisar
  pesquisa.focus();

  // Botão Adicionar da barra de ferramentas
  btnAdicionar.addEventListener('click', function (event) {
    event.preventDefault();
    // Sinalizar que o formulário vai ser usado para adicionar
    formulario.setAttribute('class', "Adicionar");
    // Mostrar o formulário
    painelFormulario.style.display = 'block';
    // Focar no campo disciplina
    disciplina.focus();
  });

  // Botão salvar do Formulário
  formulario.addEventListener('submit', function (event) {
    event.preventDefault();

    if (formulario.getAttribute('class') == 'Adicionar')
      adicionar();
    else if (formulario.getAttribute('class') == 'Alterar')
      alterar();
  });

  // Adicionar dados do formulário
  function adicionar() {
    const endPoint = rota.base + rota.v.geral;
    // Pegar os dados do formulário
    const dados = {
      disciplina: document.getElementById('disciplina').value,
      diaDaSemana: document.getElementById('dia-da-semana').value,
      sala: document.getElementById('sala').value,
      professor: document.getElementById('professor').value
    };
    // Enviar dados para a API
    fetch(endPoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('O servidor não respondeu adequadamente.');
        }
        return response.json();
      })
      .then(data => {
        // Limpar o formulário
        document.getElementById('formulario').reset();
        // Mostrar msg-form de sucesso
        mostrarMsg(msgForm, 'Adicionado com sucesso.', 'sucesso');
        // Limpar a linha de carregamento
        tbody.innerHTML = "";
        // Mostrar msg-listar de adicionado com sucesso
        mostrarMsg(msgListar, 'Refaça sua pesquisa.', 'aviso');
      })
      .catch(error => {
        // Mostrar msg-form de erro
        mostrarMsg(msgForm, 'Erro ao adicionar os dados: ', 'erro');
        console.error(error);
      });
  }

  // Botão cancelar do Adicionar
  btnCancelar.addEventListener('click', function (event) {
    // Limpar o formulário
    document.getElementById('formulario').reset();
    // Limpar a msg
    limparMsg(msgForm);
    // Esconder o form
    painelFormulario.style.display = 'none';
    // Inicia com o foco no campo pesquisar
    pesquisa.focus();
  });

  // Botão pesquisar da barra de pesquisa
  formPesquisa.addEventListener('submit', function (event) {
    event.preventDefault();

    let endPoint = rota.base + rota.v.doFiltro + "/" + pesquisa.value;
    let tr;
    // Mostrar msg-listar de Carregando...
    mostrarMsg(msgListar, 'Carregando...', 'aviso');
    // Fazer requisição por filtro
    fetch(endPoint)
      .then(res => res.json())
      .then(data => {
        // Limpar a linha de carregamento
        tbody.innerHTML = "";
        // Verificar se há resultados
        if (data.length === 0) {
          // Mostrar msg-listar de erro
          mostrarMsg(msgListar, 'Nenhum dado encontrado.', 'erro');
          return;
        }
        // Popular a tabela com os dados
        data.forEach(item => {
          tr = document.createElement("tr");
          tr.innerHTML = `
            <td>
              <button id="btn-alterar" class="btn-alterar w3-button w3-deep-orange w3-border w3-hover-orange w3-round-large" title="Alterar" data-id="${item.id}" data-disciplina="${item.disciplina}" data-dia_da_semana="${item.dia_da_semana}" data-professor="${item.professor}" data-sala="${item.sala}">
                &#9998;
              </button>

              <button id="btn-remover" class="btn-excluir w3-button w3-deep-orange w3-border w3-hover-orange w3-round-large" title="Remover" data-id="${item.id}">
                ─
              </button>
            </td>
            <td>${item.disciplina}</td>
            <td>${item.dia_da_semana}</td>
            <td>${item.professor}</td>
            <td>${item.sala}</td>
          `;
          tbody.appendChild(tr);
        });
        // Adicionar event listeners para botões de excluir
        document.querySelectorAll('.btn-excluir').forEach(btn => {
          btn.addEventListener('click', excluirLinha);
        });
        // Adicionar event listeners para botões de alterar
        document.querySelectorAll('.btn-alterar').forEach(btn => {
          formulario.setAttribute('class', "Alterar");
          btn.addEventListener('click', alterarLinha);
        });
        // Esconder msg-listar de Carregando...
        limparMsg(msgListar);
      })
      .catch(error => {
        // Mostrar msg-listar de erro
        mostrarMsg(msgListar, 'Erro ao listar os dados: ' + error.message, 'erro');
        console.error(error);
      });
  });

  // Botão excluir da lista
  function excluirLinha(event) {
    const btn = event.target;
    const id = btn.getAttribute('data-id');
    const endPoint = rota.base + rota.v.geral + "/" + id;

    fetch(endPoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok)
          throw new Error('O servidor não respondeu adequadamente.');
        // Remover linha da tabela
        btn.closest('tr').remove();
      })
      .then(data => {
        // Mostrar msg-listar de removido com sucesso
        mostrarMsg(msgListar, 'Dados removidos com sucesso.', 'sucesso');
      })
      .catch(error => {
        // Mostrar msg-listar de erro
        mostrarMsg(msgListar, 'Erro ao remover os dados.', 'erro');
        console.error(error);
      });
  }

  // Botão alterar da lista
  function alterarLinha(event) {
    const btn = event.target;
    // Pegar dados da lista
    const item = {
      id: btn.getAttribute('data-id'),
      disciplina: btn.getAttribute('data-disciplina'),
      diaDaSemana: btn.getAttribute('data-dia_da_semana'),
      professor: btn.getAttribute('data-professor'),
      sala: btn.getAttribute('data-sala')
    }
    // Colocar os dados no formulário
    document.getElementById('id').value = item.id;
    document.getElementById('disciplina').value = item.disciplina;
    document.getElementById('sala').value = item.sala;
    document.getElementById('professor').value = item.professor;
    document.getElementById('dia-da-semana').value = item.diaDaSemana;
    // Mostrar o formulário
    painelFormulario.style.display = 'block';
    // Focar no campo disciplina
    disciplina.focus();
  }

  // Alterar dados do formulário
  function alterar() {
    // const endPoint = rota.base + rota.v.geral + "/" + dados.id;
    const endPoint = rota.base + rota.v.geral + "/" + id.value;
    // Pegar os dados do formulário
    const dados = {
      id: id.value,
      disciplina: disciplina.value,
      diaDaSemana: diaDaSemana.value,
      sala: sala.value,
      professor: professor.value
    };

    fetch(endPoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    })
      .then(response => {
        if (!response.ok)
          throw new Error('O servidor não respondeu adequadamente.');
        return response.json();
      })
      .then(data => {
        // Mostrar msg-form de sucesso
        mostrarMsg(msgForm, 'Alterado com sucesso.', 'sucesso');        
        // Limpar a linha de carregamento
        tbody.innerHTML = "";
        // Mostrar msg-listar de refazer pesquisa
        mostrarMsg(msgListar, 'Refaça sua pesquisa.', 'aviso');
      })
      .catch(error => {
        // Mostrar msg-form de erro
        mostrarMsg(msgForm, 'Erro ao alterar os dados: ', 'erro');
        console.error(error);
      });
  }

}
