const API = '/api';

let state = {
  q: '',
  city: '',
  quality: '',
  price: '',
  debounceTimer: null
};

// ─── INIT ───
async function init() {
  await loadCities();
  loadCafes();
  bindEvents();
}

// ─── LOAD CITIES ───
async function loadCities() {
  const cities = await fetch(`${API}/cafes/cities`).then(r => r.json());
  const sel = document.getElementById('filter-city');
  cities.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

// ─── LOAD CAFES ───
async function loadCafes() {
  showLoading(true);
  const params = new URLSearchParams();
  if (state.q)       params.set('q', state.q);
  if (state.city)    params.set('city', state.city);
  if (state.quality) params.set('quality', state.quality);
  if (state.price)   params.set('price', state.price);

  const data = await fetch(`${API}/cafes?${params}`).then(r => r.json()).catch(() => ({ cafes: [], total: 0 }));
  renderGrid(data.cafes);
  updateResultsMeta(data.total, data.cafes.length);
  showLoading(false);
}

// ─── RENDER GRID ───
function renderGrid(cafes) {
  const grid = document.getElementById('cafe-grid');
  const none = document.getElementById('no-results');

  if (!cafes.length) {
    grid.innerHTML = '';
    none.style.display = 'block';
    return;
  }

  none.style.display = 'none';
  grid.innerHTML = cafes.map(cafe => cardHTML(cafe)).join('');

  // Attach click handlers
  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = `/cafe.html?id=${card.dataset.id}`;
    });
  });
}

function cardHTML(cafe) {
  const tags = cafe.tags.slice(0, 4);
  const stars = renderStars(cafe.rating);
  return `
    <article class="card" data-id="${cafe.id}">
      <div class="card-image">
        <img src="${cafe.image_url}" alt="${cafe.name}" loading="lazy" />
        <span class="card-quality-badge quality-${cafe.matcha_quality}">${cafe.matcha_quality}</span>
      </div>
      <div class="card-body">
        <p class="card-location">${cafe.neighborhood ? cafe.neighborhood + ' · ' : ''}${cafe.city}</p>
        <h2 class="card-name">${cafe.name}</h2>
        <p class="card-description">${cafe.description}</p>
        <div class="card-tags">
          ${tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
        </div>
        <div class="card-footer">
          <div class="card-rating">
            <span class="score">${cafe.rating.toFixed(1)}</span>
            <span class="count">(${cafe.review_count.toLocaleString()})</span>
          </div>
          <span class="card-price">${cafe.price_range}</span>
        </div>
      </div>
    </article>
  `;
}

function renderStars(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => i < full ? '★' : '☆').join('');
}

// ─── META ───
function updateResultsMeta(total, shown) {
  const meta = document.getElementById('results-meta');
  const count = document.getElementById('results-count');
  if (state.q || state.city || state.quality || state.price) {
    meta.style.display = 'block';
    count.textContent = `${shown} café${shown !== 1 ? 's' : ''} found`;
  } else {
    meta.style.display = 'none';
  }
}

// ─── LOADING ───
function showLoading(on) {
  document.getElementById('loading').style.display = on ? 'block' : 'none';
  document.getElementById('cafe-grid').style.opacity = on ? '0.3' : '1';
}

// ─── EVENTS ───
function bindEvents() {
  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-btn');
  const cityFilter = document.getElementById('filter-city');
  const qualityFilter = document.getElementById('filter-quality');
  const priceFilter = document.getElementById('filter-price');
  const clearBtn = document.getElementById('clear-filters');

  // Debounced search
  input.addEventListener('input', () => {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(() => {
      state.q = input.value.trim();
      deactivatePills();
      loadCafes();
    }, 350);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      clearTimeout(state.debounceTimer);
      state.q = input.value.trim();
      deactivatePills();
      loadCafes();
    }
  });

  btn.addEventListener('click', () => {
    state.q = input.value.trim();
    deactivatePills();
    loadCafes();
  });

  cityFilter.addEventListener('change', () => { state.city = cityFilter.value; loadCafes(); });
  qualityFilter.addEventListener('change', () => { state.quality = qualityFilter.value; loadCafes(); });
  priceFilter.addEventListener('change', () => { state.price = priceFilter.value; loadCafes(); });

  clearBtn.addEventListener('click', () => {
    state.q = ''; state.city = ''; state.quality = ''; state.price = '';
    input.value = '';
    cityFilter.value = '';
    qualityFilter.value = '';
    priceFilter.value = '';
    deactivatePills();
    loadCafes();
  });

  // Quick tag pills
  document.querySelectorAll('.tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const q = pill.dataset.q;
      const isActive = pill.classList.contains('active');
      deactivatePills();
      if (!isActive) {
        pill.classList.add('active');
        state.q = q;
        input.value = q;
      } else {
        state.q = '';
        input.value = '';
      }
      loadCafes();
    });
  });
}

function deactivatePills() {
  document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
}

// ─── START ───
init();
