const { Schema, model } = require('mongoose');
const RequestSchema = new Schema({
name: { type: String, required: true, trim: true },
phone: { type: String, required: true, trim: true },
title: { type: String, required: true, trim: true, index: true },
image: { type: String, default: '' },
timestamp: { type: Date, default: Date.now, index: true }
});
module.exports = model('Request', RequestSchema);