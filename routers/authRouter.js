import express from "express";
const router = express.Router();
import  authController from "../controllers/authController.js";

// Register route
router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/login', (req, res) => {
  res.send('/auth/login route is working.');
});



export default router;