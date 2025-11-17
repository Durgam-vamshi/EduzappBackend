const express = require('express');
const router = express.Router();
const controller = require('../controllers/requestController');
// Wrap handlers to pass `io` when available from app.locals
function wrap(handler) {
return (req, res) => handler(req, res, req.app.locals.io);
}
router.post('/request', wrap(controller.create));
router.get('/requests', controller.getAll);
router.get('/requests/sorted', controller.getSorted);
router.get('/requests/search', controller.search);
router.get('/requests/stats', controller.stats);
router.delete('/request/:id', wrap(controller.remove));
module.exports = router;



