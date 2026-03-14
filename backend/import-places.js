/**
 * Google Places importer for matcha cafes
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=your_key node import-places.js
 *   GOOGLE_PLACES_API_KEY=your_key node import-places.js --cities "New York,Los Angeles,Chicago"
 *   GOOGLE_PLACES_API_KEY=your_key node import-places.js --city "Austin, TX" --max 20
 */

require('dotenv').config();
const fetch = require('node-fetch');
const db = require('./db');

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error('❌  Set GOOGLE_PLACES_API_KEY in your .env file or environment.');
  process.exit(1);
}

// ─── CLI ARGS ───
const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const MAX_PER_CITY = parseInt(getArg('--max') || '20');
const CITIES = getArg('--cities')
  ? getArg('--cities').split(',').map(s => s.trim())
  : getArg('--city')
  ? [getArg('--city')]
  : [
      'New York, NY',
      'Los Angeles, CA',
      'San Francisco, CA',
      'Chicago, IL',
      'Seattle, WA',
      'Miami, FL',
      'Austin, TX',
      'Portland, OR',
      'Boston, MA',
      'Washington, DC',
      'Denver, CO',
      'Nashville, TN'
    ];

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

// ─── HELPERS ───
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function extractCity(addressComponents) {
  const locality = addressComponents.find(c => c.types.includes('locality'));
  const area = addressComponents.find(c => c.types.includes('administrative_area_level_1'));
  return locality ? locality.short_name : area ? area.short_name : 'Unknown';
}

function extractNeighborhood(addressComponents) {
  const n = addressComponents.find(c =>
    c.types.includes('neighborhood') || c.types.includes('sublocality_level_1')
  );
  return n ? n.long_name : null;
}

function priceLevel(level) {
  if (level === undefined || level === null) return '$$';
  if (level <= 1) return '$';
  if (level === 2) return '$$';
  return '$$$';
}

// Derive basic tags from place types, name, and rating
function deriveTags(place) {
  const tags = [];
  const name = (place.name || '').toLowerCase();
  const types = place.types || [];

  if (types.includes('cafe') || types.includes('coffee_shop')) tags.push('café');
  if (name.includes('matcha')) tags.push('matcha focused');
  if (name.includes('tea')) tags.push('tea house');
  if (name.includes('japanese') || name.includes('japan')) tags.push('japanese');
  if (name.includes('uji')) tags.push('uji japan');
  if (place.price_level !== undefined) {
    if (place.price_level <= 1) tags.push('affordable');
    if (place.price_level >= 3) tags.push('premium');
  }
  if (place.rating >= 4.5) tags.push('highly rated');

  return tags;
}

function photoUrl(photoRef, maxWidth = 800) {
  return `${PLACES_BASE}/photo?maxwidth=${maxWidth}&photoreference=${photoRef}&key=${API_KEY}`;
}

// ─── API CALLS ───
async function searchMatcha(city, pageToken) {
  const query = encodeURIComponent(`matcha cafe in ${city}`);
  let url = `${PLACES_BASE}/textsearch/json?query=${query}&type=cafe&key=${API_KEY}`;
  if (pageToken) url += `&pagetoken=${pageToken}`;

  const res = await fetch(url);
  return res.json();
}

async function getPlaceDetails(placeId) {
  const fields = [
    'place_id', 'name', 'formatted_address', 'address_components',
    'website', 'formatted_phone_number', 'rating', 'user_ratings_total',
    'price_level', 'photos', 'types', 'url', 'opening_hours',
    'editorial_summary'
  ].join(',');

  const url = `${PLACES_BASE}/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.result;
}

// ─── IMPORT ───
async function importCity(city) {
  console.log(`\n📍 Searching: ${city}`);
  const existing = db.get('cafes').map('name').value().map(n => n.toLowerCase());
  let imported = 0;
  let pageToken = null;

  do {
    if (pageToken) await sleep(2000); // Google requires delay before using next_page_token

    const searchRes = await searchMatcha(city, pageToken);

    if (searchRes.status === 'REQUEST_DENIED') {
      console.error('❌  API key error:', searchRes.error_message);
      process.exit(1);
    }

    if (!searchRes.results?.length) break;

    for (const place of searchRes.results) {
      if (imported >= MAX_PER_CITY) break;

      // Skip if already in DB (by name match)
      if (existing.includes(place.name.toLowerCase())) {
        console.log(`  ⏭  Already have: ${place.name}`);
        continue;
      }

      await sleep(200); // Gentle rate limiting
      const detail = await getPlaceDetails(place.place_id);
      if (!detail) continue;

      const ac = detail.address_components || [];
      const cityName = extractCity(ac);
      const neighborhood = extractNeighborhood(ac);

      // Build photo URLs (first = hero, rest = secondary)
      const photos = (detail.photos || []).slice(0, 4);
      const imageUrl = photos[0] ? photoUrl(photos[0].photo_reference) : 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80';
      const secondaryImages = photos.slice(1).map(p => photoUrl(p.photo_reference));

      const nextId = db.get('_nextCafeId').value();
      const tags = deriveTags(detail);

      const cafe = {
        id: nextId,
        name: detail.name,
        city: cityName,
        address: detail.formatted_address || '',
        neighborhood: neighborhood || '',
        description: detail.editorial_summary?.overview || `${detail.name} — matcha café in ${cityName}.`,
        long_description: detail.editorial_summary?.overview || '',
        image_url: imageUrl,
        secondary_images: secondaryImages,
        matcha_quality: 'good', // Default — can be updated manually or via AI
        price_range: priceLevel(detail.price_level),
        tags,
        flavors: [],
        vibe: [],
        rating: detail.rating || 4.0,
        review_count: detail.user_ratings_total || 0,
        website: detail.website || '',
        instagram: '',
        google_place_id: place.place_id,
        google_maps_url: detail.url || ''
      };

      db.get('cafes').push(cafe).write();
      db.set('_nextCafeId', nextId + 1).write();

      console.log(`  ✅  ${detail.name} (${cityName}) — ${detail.rating}★ · ${detail.user_ratings_total} reviews`);
      imported++;
    }

    pageToken = searchRes.next_page_token;
  } while (pageToken && imported < MAX_PER_CITY);

  return imported;
}

// ─── MAIN ───
async function main() {
  console.log(`🍵  Matcha Cafe Importer`);
  console.log(`   Cities: ${CITIES.join(', ')}`);
  console.log(`   Max per city: ${MAX_PER_CITY}`);
  console.log(`   Existing cafes in DB: ${db.get('cafes').size().value()}`);

  let total = 0;
  for (const city of CITIES) {
    const count = await importCity(city);
    total += count;
    await sleep(500);
  }

  console.log(`\n✅  Done! Imported ${total} cafes. Total in DB: ${db.get('cafes').size().value()}`);
}

main().catch(err => {
  console.error('❌ ', err.message);
  process.exit(1);
});
