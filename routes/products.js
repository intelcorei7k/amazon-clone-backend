const express = require('express');
const pool = require('../database/pool');
const config =
  require('../config/config')[process.env.NODE_ENV || 'development'];

const router = express.Router();

const logger = config.logger();

router.get('/:quantity?', async (req, res) => {
  try {
    let quantity = req.query.quantity ? req.query.quantity : undefined;

    !quantity
      ? (quantity = 6)
      : (quantity = parseInt(num.trim().split(',')[0].split('.')[0]));

    let result = await pool.query(
      'SELECT id, title, price, rating, imageUrl FROM products LIMIT ?',
      [quantity]
    );

    result.forEach((element) => {
      element.price = (Math.round(element.price * 100) / 100).toFixed(2);
    });

    res.send(JSON.stringify(result));
  } catch (error) {
    logger.fatal(error);
    res.status(500).send(JSON.stringify({ error: config.errors.INTERNAL }));
  }
});

module.exports = router;
