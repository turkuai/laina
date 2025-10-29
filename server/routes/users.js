import express from "express";

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('user output');
});

export default router;
