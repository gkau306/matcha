/**
 * Google Places importer for matcha cafes
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=your_key node import-places.js
 *   GOOGLE_PLACES_API_KEY=your_key node import-places.js --city "Auckland" --max 50
 *   GOOGLE_PLACES_API_KEY=your_key node import-places.js --cities "New York,Los Angeles" --max 20
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

// ─── MATCHA KEYWORD FILTER ───
// A place must match at least one of these to be included
const MATCHA_KEYWORDS = [
  'matcha', 'maccha', 'green tea', 'ceremonial', 'uji', 'hojicha',
  'japanese tea', 'tea house', 'tea bar', 'tencha', 'koicha', 'usucha'
];

// These search queries are run per city to cast a wide net and hit 50+
const SEARCH_QUERIES = [
  'matcha cafe',
  'matcha latte',
  'matcha bar',
  'matcha drink',
  'japanese matcha',
  'ceremonial matcha',
  'matcha tea'
];

// Matcha-specific tags derived from name/description/types
const MATCHA_TAG_RULES = [
  { match: ['uji'],                     tag: 'uji japan' },
  { match: ['ceremonial'],              tag: 'ceremonial grade' },
  { match: ['oat', 'oat milk'],         tag: 'oat milk' },
  { match: ['coconut'],                 tag: 'coconut milk' },
  { match: ['sweet', 'sweetened'],      tag: 'sweet' },
  { match: ['hojicha', 'houjicha'],     tag: 'hojicha' },
  { match: ['soft serve', 'ice cream'], tag: 'soft serve' },
  { match: ['traditional', 'ceremony'], tag: 'traditional' },
  { match: ['japanese', 'japan'],       tag: 'japanese' },
  { match: ['vegan'],                   tag: 'vegan friendly' },
  { match: ['organic'],                 tag: 'organic' },
  { match: ['specialty', 'artisan'],    tag: 'specialty' },
  { match: ['iced', 'cold'],            tag: 'iced' },
];

function isMatchaCafe(name, summary) {
  const text = `${name} ${summary || ''}`.toLowerCase();
  return MATCHA_KEYWORDS.some(kw => text.includes(kw));
}

function deriveTags(detail) {
  const text = [
    detail.name,
    detail.editorial_summary?.overview || ''
  ].join(' ').toLowerCase();

  const tags = [];

  for (const rule of MATCHA_TAG_RULES) {
    if (rule.match.some(m => text.includes(m))) {
      tags.push(rule.tag);
    }
  }

  // Always tag with matcha if name contains it
  if (detail.name.toLowerCase().includes('matcha')) tags.unshift('matcha focused');

  if (detail.rating >= 4.5) tags.push('highly rated');
  if (detail.price_level !== undefined) {
    if (detail.price_level <= 1) tags.push('affordable');
    if (detail.price_level >= 3) tags.push('premium');
  }

  // Deduplicate
  return [...new Set(tags)];
}

// ─── HELPERS ───
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function extractCity(addressComponents) {
  const locality = addressComponents.find(c => c.types.includes('locality'));
  const area = addressComponents.find(c => c.types.includes('administrative_area_level_1'));
  return locality ? locality.long_name : area ? area.long_name : 'Unknown';
}

function extractNeighborhood(addressComponents) {
  const n = addressComponents.find(c =>
    c.types.includes('neighborhood') ||
    c.types.includes('sublocality_level_1') ||
    c.types.includes('sublocality')
  );
  return n ? n.long_name : null;
}

function priceLevel(level) {
  if (level === undefined || level === null) return '$$';
  if (level <= 1) return '$';
  if (level === 2) return '$$';
  return '$$$';
}

function photoUrl(photoRef, maxWidth = 800) {
  return `${PLACES_BASE}/photo?maxwidth=${maxWidth}&photoreference=${photoRef}&key=${API_KEY}`;
}

// ─── API CALLS ───
async function searchQuery(query, city, pageToken) {
  const q = encodeURIComponent(`${query} in ${city}`);
  let url = `${PLACES_BASE}/textsearch/json?query=${q}&key=${API_KEY}`;
  if (pageToken) url += `&pagetoken=${pageToken}`;
  const res = await fetch(url);
  return res.json();
}

async function getPlaceDetails(placeId) {
  const fields = [
    'place_id', 'name', 'formatted_address', 'address_components',
    'website', 'rating', 'user_ratings_total',
    'price_level', 'photos', 'types', 'url', 'editorial_summary'
  ].join(',');
  const url = `${PLACES_BASE}/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.result;
}

// ─── IMPORT ONE CITY ───
async function importCity(city, max) {
  console.log(`\n📍  ${city} — targeting ${max} matcha cafes`);

  // Track by place_id to deduplicate across multiple search queries
  const seenPlaceIds = new Set(
    db.get('cafes').map('google_place_id').value().filter(Boolean)
  );
  const existingNames = new Set(
    db.get('cafes').map('name').value().map(n => n.toLowerCase())
  );

  let imported = 0;

  for (const query of SEARCH_QUERIES) {
    if (imported >= max) break;

    let pageToken = null;
    let page = 0;

    do {
      if (pageToken) await sleep(2200); // Google requires ~2s before next_page_token works

      const searchRes = await searchQuery(query, city, pageToken);

      if (searchRes.status === 'REQUEST_DENIED') {
        console.error('❌  API key denied:', searchRes.error_message);
        process.exit(1);
      }
      if (searchRes.status === 'ZERO_RESULTS' || !searchRes.results?.length) break;

      for (const place of searchRes.results) {
        if (imported >= max) break;
        if (seenPlaceIds.has(place.place_id)) continue;
        if (existingNames.has(place.name.toLowerCase())) continue;

        seenPlaceIds.add(place.place_id);

        // Pre-filter: must look matcha-related before spending a Details call
        if (!isMatchaCafe(place.name, place.formatted_address)) {
          console.log(`  ✗  skipped (not matcha): ${place.name}`);
          continue;
        }

        await sleep(250);
        const detail = await getPlaceDetails(place.place_id);
        if (!detail) continue;

        // Post-filter with full details
        const summary = detail.editorial_summary?.overview || '';
        if (!isMatchaCafe(detail.name, summary)) {
          console.log(`  ✗  skipped (not matcha): ${detail.name}`);
          continue;
        }

        const ac = detail.address_components || [];
        const cityName = extractCity(ac);
        const neighborhood = extractNeighborhood(ac);

        const photos = (detail.photos || []).slice(0, 4);
        const imageUrl = photos[0]
          ? photoUrl(photos[0].photo_reference)
          : 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80';
        const secondaryImages = photos.slice(1).map(p => photoUrl(p.photo_reference));

        const nextId = db.get('_nextCafeId').value();

        const cafe = {
          id: nextId,
          name: detail.name,
          city: cityName,
          address: detail.formatted_address || '',
          neighborhood: neighborhood || '',
          description: summary || `${detail.name} — matcha café in ${cityName}.`,
          long_description: summary || '',
          image_url: imageUrl,
          secondary_images: secondaryImages,
          matcha_quality: 'good',
          price_range: priceLevel(detail.price_level),
          tags: deriveTags(detail),
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
        existingNames.add(detail.name.toLowerCase());

        console.log(`  ✅  [${imported + 1}/${max}] ${detail.name} (${neighborhood || cityName}) — ${detail.rating}★`);
        imported++;
      }

      pageToken = searchRes.next_page_token;
      page++;
    } while (pageToken && imported < max && page < 3);
  }

  console.log(`\n  → ${imported} cafes imported for ${city}`);
  return imported;
}

// ─── MAIN ───
async function main() {
  console.log('🍵  Matcha Cafe Importer');
  console.log(`   Cities : ${CITIES.join(', ')}`);
  console.log(`   Max    : ${MAX_PER_CITY} per city`);
  console.log(`   Queries: ${SEARCH_QUERIES.length} search terms per city`);
  console.log(`   DB now : ${db.get('cafes').size().value()} cafes\n`);

  let total = 0;
  for (const city of CITIES) {
    const count = await importCity(city, MAX_PER_CITY);
    total += count;
    await sleep(500);
  }

  console.log(`\n✅  Done! Imported ${total} new cafes.`);
  console.log(`   Total in DB: ${db.get('cafes').size().value()}`);
}

main().catch(err => {
  console.error('❌ ', err.message);
  process.exit(1);
});
