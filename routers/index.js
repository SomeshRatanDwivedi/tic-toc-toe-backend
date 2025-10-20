import express from "express";
import authRouter from "./authRouter.js";
import gameRouter from "./gameRouter.js";
const router = express.Router();


router.use('/auth', authRouter);
router.use('/games', gameRouter);


router.get('/', (req, res) => {
  res.send('/api route is working.');
});















export default router;