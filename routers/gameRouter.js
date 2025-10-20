import express from "express";
const router = express.Router();
import gameController from "../controllers/gameController.js";

// Game routes
router.post('/create', gameController.createGame);
router.post('/join', gameController.joinGame);
router.post('/move', gameController.makeMove);
router.get('/:id', gameController.getGameState);

router.put('/:id', gameController.updateGame);

router.get("/user/:userId", gameController.getGameByUser);

router.get('/', (req, res) => {
  res.send('/api/games route is working.');
});



export default router;