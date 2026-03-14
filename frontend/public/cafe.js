const API = '/api';

// ─── GET ID FROM URL ───
const params = new URLSearchParams(window.location.search);
const cafeId = params.get('id');

// ─── STAR RATING STATE ───
let selectedRating = 0;

// ─── INIT ───
async function init() {
  if (!cafeId) {
    document.getElementById('cafe-detail').innerHTML = '<p style="padding:3rem;color:var(--text-muted)">Café not found.</p>';
    return;
  }

  const cafe = await fetch(`${API}/cafes/${cafeId}`).then(r => r.json()).catch(() => null);
  if (!cafe || cafe.error) {
    document.getElementById('cafe-detail').innerHTML = '<p style="padding:3rem;color:var(--text-muted)">Café not found.</p>';
    return;
  }

  document.title = `${cafe.name} — matcha`;
  renderDetail(cafe);
  document.getElementById('loading').style.display = 'none';
  document.getElementById('review-section').style.display = 'block';
  bindReviewForm(cafe.id);
}

// ─── RENDER DETAIL ───
function renderDetail(cafe) {
  const detail = document.getElementById('cafe-detail');
  const secondaryImgs = (cafe.secondary_images || []).slice(0, 3);
  const stars = starsHTML(cafe.rating);

  detail.innerHTML = `
    <!-- HERO -->
    <div class="detail-hero">
      <div class="detail-hero-image">
        <img src="${cafe.image_url}" alt="${cafe.name}" />
      </div>
      <div class="detail-hero-info">
        <p class="detail-location">${cafe.neighborhood ? cafe.neighborhood + ' · ' : ''}${cafe.city}</p>
        <h1 class="detail-name">${cafe.name}</h1>
        <div class="detail-quality-row">
          <span class="detail-badge badge-quality">${cafe.matcha_quality}</span>
          <span class="detail-badge badge-price">${cafe.price_range}</span>
        </div>
        <div class="detail-rating">
          <span class="score">${cafe.rating.toFixed(1)}</span>
          <span class="stars">${stars}</span>
          <span class="count">${cafe.review_count.toLocaleString()} notes</span>
        </div>
        <p class="detail-description">${cafe.description}</p>
        <div class="detail-tags">
          ${cafe.tags.slice(0, 8).map(t => `<span class="detail-tag">${t}</span>`).join('')}
        </div>
        ${linksHTML(cafe)}
      </div>
    </div>

    <!-- BODY -->
    <div class="detail-body">
      <div>
        <p class="detail-long-desc">${cafe.long_description || cafe.description}</p>
      </div>
      <aside class="detail-sidebar">
        ${cafe.flavors && cafe.flavors.length ? `
          <div class="detail-sidebar-section">
            <h4>on the menu</h4>
            <div class="sidebar-flavors">
              ${cafe.flavors.map(f => `<span class="sidebar-flavor">${f}</span>`).join('')}
            </div>
          </div>` : ''}
        ${cafe.vibe && cafe.vibe.length ? `
          <div class="detail-sidebar-section">
            <h4>the vibe</h4>
            <div class="sidebar-vibe">
              ${cafe.vibe.map(v => `<span class="sidebar-vibe-tag">${v}</span>`).join('')}
            </div>
          </div>` : ''}
        ${cafe.address ? `
          <div class="detail-sidebar-section">
            <h4>address</h4>
            <p style="font-size:0.85rem;color:var(--text-muted);line-height:1.6">${cafe.address}</p>
          </div>` : ''}
      </aside>
    </div>

    <!-- SECONDARY IMAGES -->
    ${secondaryImgs.length ? `
      <div class="detail-images">
        ${secondaryImgs.map(img => `<img src="${img}" alt="café photo" loading="lazy" />`).join('')}
      </div>` : ''}

    <!-- REVIEWS -->
    <div class="reviews-section">
      <h3>community notes</h3>
      <div class="reviews-list" id="reviews-list">
        ${reviewsHTML(cafe.reviews || [])}
      </div>
    </div>
  `;
}

function reviewsHTML(reviews) {
  if (!reviews.length) return '<p style="color:var(--text-muted);font-size:0.85rem">no notes yet — be the first to leave one below.</p>';
  return reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <span class="review-author">${r.author || 'anonymous'}</span>
        <span class="review-stars">${starsHTML(r.rating)}</span>
      </div>
      <p class="review-body">${r.body}</p>
      ${r.tags && r.tags.length ? `
        <div class="review-tags-row">
          ${r.tags.map(t => `<span class="review-tag">${t}</span>`).join('')}
        </div>` : ''}
    </div>
  `).join('');
}

function linksHTML(cafe) {
  const links = [];
  if (cafe.website) links.push(`<a class="detail-link" href="${cafe.website}" target="_blank">website ↗</a>`);
  if (cafe.instagram) links.push(`<span class="detail-link">${cafe.instagram}</span>`);
  if (!links.length) return '';
  return `<div class="detail-links">${links.join('')}</div>`;
}

function starsHTML(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => i < full ? '★' : '☆').join('');
}

// ─── REVIEW FORM ───
function bindReviewForm(id) {
  const stars = document.querySelectorAll('.star');
  const form = document.getElementById('review-form');
  const errEl = document.getElementById('review-error');

  // Star hover / click
  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const v = parseInt(star.dataset.v);
      stars.forEach(s => s.classList.toggle('hovered', parseInt(s.dataset.v) <= v));
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hovered'));
    });
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.v);
      stars.forEach(s => s.classList.toggle('selected', parseInt(s.dataset.v) <= selectedRating));
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.style.display = 'none';

    const author = document.getElementById('review-author').value.trim();
    const body = document.getElementById('review-body').value.trim();

    if (!body) { showError('please write something about the matcha.'); return; }
    if (!selectedRating) { showError('please pick a star rating.'); return; }

    const btn = document.getElementById('submit-review');
    btn.textContent = 'submitting…';
    btn.disabled = true;

    const res = await fetch(`${API}/cafes/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, body, rating: selectedRating })
    });

    if (res.ok) {
      const review = await res.json();
      // Prepend new review
      const list = document.getElementById('reviews-list');
      const existingEmpty = list.querySelector('p');
      if (existingEmpty) list.innerHTML = '';
      list.insertAdjacentHTML('afterbegin', reviewsHTML([review]));

      // Reset form
      document.getElementById('review-author').value = '';
      document.getElementById('review-body').value = '';
      selectedRating = 0;
      stars.forEach(s => s.classList.remove('selected'));
      btn.textContent = 'submitted ✓';
      setTimeout(() => { btn.textContent = 'submit'; btn.disabled = false; }, 2000);
    } else {
      const err = await res.json();
      showError(err.error || 'something went wrong');
      btn.textContent = 'submit';
      btn.disabled = false;
    }
  });

  function showError(msg) {
    errEl.textContent = msg;
    errEl.style.display = 'block';
  }
}

// ─── START ───
init();
