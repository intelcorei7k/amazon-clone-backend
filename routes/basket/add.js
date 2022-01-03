const express = require("express");
const pool = require("../../database/pool");
const config = require("../../config/config")[
  process.env.NODE_ENV || "development"
];

const router = express.Router();

const logger = config.logger();

router.post("/", (req, res) => {
  const product = req.body.productid ? req.body.productid : undefined;
  const quantity = req.body.quantity ? req.body.quantity : 1;

  if (!product) {
    logger.info(`${config.errors.BADREQUEST}, product:${product}`);
    res.status(400).send(JSON.stringify({ error: config.errors.BADREQUEST }));
    return;
  }

  pool
    .query(
      "INSERT INTO basket (product, username, quantity) VALUES (?,?,?) ON DUPLICATE KEY UPDATE quantity = quantity + ?",
      [product, req.username, quantity, quantity]
    )
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      logger.fatal(error);
      res.status(500).send(JSON.stringify({ error: config.errors.INTERNAL }));
    });
});

module.exports = router;
