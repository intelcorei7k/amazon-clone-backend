const express = require("express");
const pool = require("../../database/pool");
const config = require("../../config/config")[
  process.env.NODE_ENV || "development"
];

const router = express.Router();

const logger = config.logger();

router.post("/", async (req, res) => {
  const product = req.body.productid ? req.body.productid : undefined;
  const quantity = req.body.quantity ? req.body.quantity : 1;

  if (!product) {
    logger.info(`${config.errors.BADREQUEST}, product:${product}`);
    res.status(400).send(JSON.stringify({ error: config.errors.BADREQUEST }));
    return;
  }

  try {
    let result = await pool.query(
      "SELECT quantity FROM basket WHERE username=? AND product=?",
      [req.username, product]
    );

    if (Object.keys(result).length < 2) {
      res.sendStatus(204);
      return;
    }

    result[0].quantity <= quantity
      ? pool
          .query("DELETE FROM basket WHERE username=? AND product=?", [
            req.username,
            product,
          ])
          .then(() => res.sendStatus(200))
          .catch((error) => {
            logger.fatal(error);
            res
              .status(500)
              .send(JSON.stringify({ error: config.errors.INTERNAL }));
          })
      : pool
          .query(
            "UPDATE basket SET quantity = quantity - ?  WHERE username=? AND product=?",
            [quantity, req.username, product]
          )
          .then(() => res.sendStatus(200))
          .catch((error) => {
            logger.fatal(error);
            res
              .status(500)
              .send(JSON.stringify({ error: config.errors.INTERNAL }));
          });
  } catch (error) {
    logger.fatal(error);
    res.status(500).send(JSON.stringify({ error: config.errors.INTERNAL }));
  }
});

module.exports = router;
