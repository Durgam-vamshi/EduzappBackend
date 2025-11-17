const mongoose = require('mongoose');
async function connectDB() {
try {
await mongoose.connect(process.env.MONGO_URL, {
dbName: 'requestApp'
});
console.log('MongoDB Connected');
} catch (err) {
console.log('MongoDB Error:', err.message);
}
}
module.exports = connectDB;

