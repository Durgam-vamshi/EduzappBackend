const Request = require('../models/Request');
const cache = require('../utils/cache');

module.exports = {
  // POST /request
  async create(req, res, io) {
    try {
      const { name, phone, title, image, timestamp } = req.body;

      if (!name || !phone || !title) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const doc = await Request.create({
        name,
        phone,
        title,
        image: image || '',
        timestamp: timestamp ? new Date(timestamp) : new Date()
      });

      // invalidate cache
      cache.clear();

      // Emit socket event if io exists
      if (io) io.emit('request:created', doc);

      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      console.error('Create Error:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  },

  // GET /requests?page=1&limit=10
  async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page || '1'));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10')));
      const cacheKey = `all:${page}:${limit}`;

      const cached = cache.get(cacheKey);
      if (cached) return res.json(cached);

      const skip = (page - 1) * limit;
      const [list, total] = await Promise.all([
        Request.find().sort({ timestamp: -1 }).skip(skip).limit(limit),
        Request.countDocuments()
      ]);

      const response = { data: list, page, limit, total };
      cache.set(cacheKey, response);

      res.json(response);
    } catch (err) {
      console.error('GetAll Error:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  },

  // GET /requests/sorted?field=timestamp&order=asc
  async getSorted(req, res) {
    try {
      const { field = 'timestamp', order = 'desc', page = 1, limit = 10 } = req.query;
      const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;

      const skip = (page - 1) * limit;
      const list = await Request.find()
        .sort({ [field]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Request.countDocuments();
      res.json({ data: list, page: parseInt(page), limit: parseInt(limit), total });
    } catch (err) {
      console.error('GetSorted Error:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  },

  // GET /requests/search?query=someText
  async search(req, res) {
    try {
      const { query = '', page = 1, limit = 10 } = req.query;
      const regex = new RegExp(query, 'i'); // case-insensitive search

      const skip = (page - 1) * limit;
      const [list, total] = await Promise.all([
        Request.find({
          $or: [
            { name: regex },
            { phone: regex },
            { title: regex }
          ]
        })
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Request.countDocuments({
          $or: [
            { name: regex },
            { phone: regex },
            { title: regex }
          ]
        })
      ]);

      res.json({ data: list, page: parseInt(page), limit: parseInt(limit), total });
    } catch (err) {
      console.error('Search Error:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  },

  // GET /requests/stats
  async stats(req, res) {
    try {
      const total = await Request.countDocuments();
      const latest = await Request.find().sort({ timestamp: -1 }).limit(5); // last 5 requests
      res.json({ totalRequests: total, latestRequests: latest });
    } catch (err) {
      console.error('Stats Error:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  },

  // DELETE /request/:id
  async remove(req, res, io) {
    try {
      const { id } = req.params;
      const doc = await Request.findByIdAndDelete(id);

      if (!doc) return res.status(404).json({ error: 'Request not found' });

      cache.clear();

      if (io) io.emit('request:deleted', { id });

      res.json({ success: true, message: 'Request deleted', id });
    } catch (err) {
      console.error('Remove Error:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  }
};
