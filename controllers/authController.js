import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateJwtToken } from "../utility/index.js";
const prisma = new PrismaClient();

const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const isUserAlreadyExists = await prisma.user.findUnique({
      where: { username },
    });
    if (isUserAlreadyExists) {
      return res.status(409).json({ success: false, message: `${username} already exists` });
    }
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const accessToken = generateJwtToken(user);
    res.json({ success: true, message: "Login successful", user:{id:user.id, username:user.username}, accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};


const authController = {
  register,
  login
};

export default authController;
