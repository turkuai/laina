import express from "express";
import { getUsers } from "../db/users.js";

const router = express.Router();

/* GET users listing. */
router.get('/', async function(req, res, next) {
  res.json(await getUsers());
});

export default router;