const express = require('express');
const router = express.Router();
const db = require('../db');

// ─── SEARCH HELPER ───
function matchesQuery(cafe, q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = [
    cafe.name,
    cafe.city,
    cafe.neighborhood,
    cafe.description,
    cafe.long_description,
    ...(cafe.tags || []),
    ...(cafe.flavors || []),
    ...(cafe.vibe || []),
    cafe.matcha_quality
  ].join(' ').toLowerCase();

  return terms.every(term => haystack.includes(term));
}

// GET /api/cafes — list all or search
router.get('/', (req, res) => {
  const { q, city, quality, price } = req.query;

  let cafes = db.get('cafes').value();

  if (q && q.trim()) {
    cafes = cafes.filter(c => matchesQuery(c, q.trim()));
  }
  if (city) {
    cafes = cafes.filter(c => c.city.toLowerCase() === city.toLowerCase());
  }
  if (quality) {
    cafes = cafes.filter(c => c.matcha_quality === quality);
  }
  if (price) {
    cafes = cafes.filter(c => c.price_range === price);
  }

  // Sort by rating desc
  cafes = cafes.slice().sort((a, b) => b.rating - a.rating || b.review_count - a.review_count);

  res.json({ cafes, total: cafes.length });
});

// GET /api/cafes/cities — distinct cities
router.get('/cities', (req, res) => {
  const cities = [...new Set(db.get('cafes').map('city').value())].sort();
  res.json(cities);
});

// GET /api/cafes/:id — single cafe with reviews
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cafe = db.get('cafes').find({ id }).value();
  if (!cafe) return res.status(404).json({ error: 'Cafe not found' });

  const reviews = db.get('reviews').filter({ cafe_id: id }).value();

  res.json({ ...cafe, reviews });
});

// POST /api/cafes/:id/reviews — add review
router.post('/:id/reviews', (req, res) => {
  const id = parseInt(req.params.id);
  const cafe = db.get('cafes').find({ id }).value();
  if (!cafe) return res.status(404).json({ error: 'Cafe not found' });

  const { author, body, rating, tags } = req.body;
  if (!body) return res.status(400).json({ error: 'body is required' });
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1–5' });

  const nextId = db.get('_nextReviewId').value();
  const review = {
    id: nextId,
    cafe_id: id,
    author: author || 'anonymous',
    body,
    rating: parseInt(rating),
    tags: tags || [],
    created_at: new Date().toISOString()
  };

  db.get('reviews').push(review).write();
  db.set('_nextReviewId', nextId + 1).write();

  // Recalculate rating
  const allReviews = db.get('reviews').filter({ cafe_id: id }).value();
  const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
  db.get('cafes').find({ id }).assign({
    rating: Math.round(avg * 10) / 10,
    review_count: allReviews.length
  }).write();

  res.status(201).json(review);
});

module.exports = router;
