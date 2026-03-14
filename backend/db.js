const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'matcha.json'));
const db = low(adapter);

// Defaults
db.defaults({ cafes: [], reviews: [], _nextCafeId: 1, _nextReviewId: 1 }).write();

module.exports = db;
