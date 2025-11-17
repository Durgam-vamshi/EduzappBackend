const cache = new Map();
const MAX_ITEMS = 100; // Keep a bit more


module.exports = {
get(key) {
if (!cache.has(key)) return null;
const value = cache.get(key);
// refresh LRU
cache.delete(key);
cache.set(key, value);
return value;
},


set(key, value) {
if (cache.size >= MAX_ITEMS) {
const firstKey = cache.keys().next().value;
cache.delete(firstKey);
}
cache.set(key, value);
},


delete(key) {
cache.delete(key);
},


clear() {
cache.clear();
}
};

