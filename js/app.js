'use strict';

const API_URL = 'https://rickandmortyapi.com/api/character';

const elements = {
  form: document.querySelector('#filter-form'),
  nameInput: document.querySelector('#name-input'),
  statusFilter: document.querySelector('#status-filter'),
  speciesInput: document.querySelector('#species-input'),
  clearButton: document.querySelector('#clear-filters'),
  characterGrid: document.querySelector('#character-grid'),
  feedbackArea: document.querySelector('#feedback-area'),
  resultsCount: document.querySelector('#results-count'),
  previousButton: document.querySelector('#previous-page'),
  nextButton: document.querySelector('#next-page'),
  pageIndicator: document.querySelector('#page-indicator')
};

const state = {
  page: 1,
  totalPages: 1,
  totalCharacters: 0,
  requestId: 0,
  loading: false
};

const translations = {
  status: {
    Alive: 'Vivo',
    Dead: 'Morto',
    unknown: 'Desconhecido'
  },
  gender: {
    Female: 'Feminino',
    Male: 'Masculino',
    Genderless: 'Sem gênero',
    unknown: 'Desconhecido'
  },
  species: {
    Human: 'Humano',
    Alien: 'Alienígena',
    Humanoid: 'Humanoide',
    Animal: 'Animal',
    Robot: 'Robô'
  }
};

function translate(value, dictionary) {
  if (!value) return 'Não informado';
  return dictionary[value] || value;
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createDetail(label, value) {
  const row = createElement('div', 'character-detail');
  const labelElement = createElement('strong', '', label);
  const valueElement = createElement('span', '', value || 'Não informado');
  row.appendChild(labelElement);
  row.appendChild(valueElement);
  return row;
}

function createCharacterCard(character, index) {
  const card = createElement('article', 'character-card');
  card.style.animationDelay = `${Math.min(index * 35, 280)}ms`;

  const media = createElement('div', 'character-media');
  const image = createElement('img', 'character-image');
  image.src = character.image;
  image.alt = `Imagem de ${character.name}`;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    image.alt = `Imagem indisponível para ${character.name}`;
    image.style.visibility = 'hidden';
  }, { once: true });

  const id = createElement('span', 'character-id', `ID #${character.id}`);
  const statusClass = character.status === 'Alive' ? 'status-alive' : character.status === 'Dead' ? 'status-dead' : 'status-unknown';
  const status = createElement('span', `character-status ${statusClass}`);
  const statusDot = createElement('span', 'status-dot');
  const statusText = createElement('span', '', translate(character.status, translations.status));
  status.appendChild(statusDot);
  status.appendChild(statusText);

  media.appendChild(image);
  media.appendChild(id);
  media.appendChild(status);

  const body = createElement('div', 'character-body');
  const species = createElement('p', 'character-species', translate(character.species, translations.species));
  const name = createElement('h3', 'character-name', character.name);
  const divider = createElement('div', 'character-divider');
  const details = createElement('div', 'character-details');
  details.appendChild(createDetail('Gênero', translate(character.gender, translations.gender)));
  details.appendChild(createDetail('Origem', character.origin?.name));
  details.appendChild(createDetail('Localização', character.location?.name));

  body.appendChild(species);
  body.appendChild(name);
  body.appendChild(divider);
  body.appendChild(details);

  card.appendChild(media);
  card.appendChild(body);
  return card;
}

function renderCharacters(characters) {
  elements.characterGrid.replaceChildren();
  elements.feedbackArea.replaceChildren();

  if (!characters || characters.length === 0) {
    showFeedback('Nenhum personagem encontrado', 'Tente alterar o nome ou os filtros selecionados para fazer uma nova busca.');
    return;
  }

  characters.forEach((character, index) => {
    const card = createCharacterCard(character, index);
    elements.characterGrid.appendChild(card);
  });
}

function showFeedback(title, message, isError = false) {
  elements.feedbackArea.replaceChildren();
  const box = createElement('div', 'feedback-card');
  if (isError) box.style.borderColor = 'rgba(240, 125, 121, .35)';
  const heading = createElement('strong', '', title);
  const description = createElement('p', '', message);
  box.appendChild(heading);
  box.appendChild(description);
  elements.feedbackArea.appendChild(box);
}

function showLoading() {
  elements.characterGrid.replaceChildren();
  elements.feedbackArea.replaceChildren();
  elements.characterGrid.setAttribute('aria-busy', 'true');
  elements.resultsCount.textContent = 'Consultando o banco de dados...';

  for (let index = 0; index < 8; index += 1) {
    const skeleton = createElement('div', 'loading-card');
    skeleton.setAttribute('aria-hidden', 'true');
    elements.characterGrid.appendChild(skeleton);
  }

  setControlsDisabled(true);
}

function setControlsDisabled(disabled) {
  state.loading = disabled;
  elements.previousButton.disabled = disabled || state.page <= 1;
  elements.nextButton.disabled = disabled || state.page >= state.totalPages;
  elements.form.querySelectorAll('input, select, button').forEach((control) => {
    control.disabled = disabled;
  });
  elements.previousButton.disabled = disabled || state.page <= 1;
  elements.nextButton.disabled = disabled || state.page >= state.totalPages;
}

function updatePagination(info) {
  state.totalPages = info.pages || 1;
  state.totalCharacters = info.count || 0;
  elements.pageIndicator.replaceChildren();
  elements.pageIndicator.append('Página ');
  const currentPage = createElement('strong', '', String(state.page));
  const totalPages = createElement('strong', '', String(state.totalPages));
  elements.pageIndicator.appendChild(currentPage);
  elements.pageIndicator.append(' de ');
  elements.pageIndicator.appendChild(totalPages);
  elements.previousButton.disabled = state.loading || state.page <= 1;
  elements.nextButton.disabled = state.loading || state.page >= state.totalPages;
}

function buildRequestUrl() {
  const params = new URLSearchParams();
  params.set('page', String(state.page));

  const name = elements.nameInput.value.trim();
  const status = elements.statusFilter.value;
  const species = elements.speciesInput.value.trim();

  if (name) params.set('name', name);
  if (status) params.set('status', status);
  if (species) params.set('species', species);

  return `${API_URL}?${params.toString()}`;
}

function loadCharacters() {
  const currentRequest = ++state.requestId;
  showLoading();

  fetch(buildRequestUrl())
    .then((response) => {
      if (!response.ok) {
        const error = new Error(response.status === 404 ? 'NOT_FOUND' : `HTTP_${response.status}`);
        error.status = response.status;
        throw error;
      }
      return response.json();
    })
    .then((data) => {
      if (currentRequest !== state.requestId) return;

      updatePagination(data.info);
      renderCharacters(data.results);
      elements.resultsCount.textContent = `${data.info.count.toLocaleString('pt-BR')} personagem(ns) encontrado(s)`;
    })
    .catch((error) => {
      if (currentRequest !== state.requestId) return;

      elements.characterGrid.replaceChildren();
      if (error.status === 404 || error.message === 'NOT_FOUND') {
        state.totalPages = 1;
        state.totalCharacters = 0;
        elements.resultsCount.textContent = '0 personagens encontrados';
        showFeedback('Nenhum personagem encontrado', 'A API não encontrou resultados para essa combinação de filtros. Tente outra pesquisa.');
      } else {
        elements.resultsCount.textContent = 'Não foi possível carregar os personagens';
        showFeedback('Falha na conexão com a API', 'Verifique sua conexão com a internet e tente novamente. A API pode estar temporariamente indisponível.', true);
      }
      updatePagination({ pages: 1, count: 0 });
    })
    .finally(() => {
      if (currentRequest !== state.requestId) return;
      elements.characterGrid.setAttribute('aria-busy', 'false');
      setControlsDisabled(false);
      updatePagination({ pages: state.totalPages, count: state.totalCharacters });
    });
}

elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  state.page = 1;
  loadCharacters();
});

elements.clearButton.addEventListener('click', () => {
  elements.form.reset();
  state.page = 1;
  loadCharacters();
});

elements.previousButton.addEventListener('click', () => {
  if (state.page > 1 && !state.loading) {
    state.page -= 1;
    loadCharacters();
    document.querySelector('#personagens').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

elements.nextButton.addEventListener('click', () => {
  if (state.page < state.totalPages && !state.loading) {
    state.page += 1;
    loadCharacters();
    document.querySelector('#personagens').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

loadCharacters();
