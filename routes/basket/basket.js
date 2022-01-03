const express = require("express");
const pool = require("../../database/pool");
const config = require("../../config/config")[
  process.env.NODE_ENV || "development"
];

const add = require("./add");
const remove = require("./remove");

const router = express.Router();

const logger = config.logger();

router.get("/", async (req, res) => {
  try {
    let result = await pool.query(
      "SELECT id, title, price, rating, imageUrl, quantity FROM products INNER JOIN basket ON products.id=basket.product WHERE basket.username=?",
      [req.username]
    );

    if (Object.keys(result).length <= 1) {
      res.sendStatus(204);
      return;
    }

    delete result["meta"];

    res.send(JSON.stringify(result));
  } catch (error) {
    logger.fatal(error);
    res.status(500).send(JSON.stringify({ error: config.errors.INTERNAL }));
  }
});

router.use("/add", add);
router.use("/remove", remove);

module.exports = router;
