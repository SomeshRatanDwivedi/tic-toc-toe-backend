import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const createGame = async (gameData) => {
  try {
    const { playerX, playerO, current, status } = gameData;
    const newGame = await prisma.game.create({
      data: {
        playerXId: playerX.id,
        playerOId: playerO.id,
        board: JSON.stringify(Array(9).fill(null)),
        current: current,
        status: status,
      }
    });
    return newGame;
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

const updateGame = async (id, gameData) => {
  try {
    gameData.board = JSON.stringify(gameData.board);
    const updatedGame = await prisma.game.update({
      where: { id: +id },
      data: gameData
    });
    return updatedGame;
  } catch (error) {
    console.error("Error updating game:", error);
    throw error;
  }
};

const getGamePlayedByUser = async (userId) => {
  try {
    const games = await prisma.game.findMany({
      where: {
        OR: [
          { playerXId: userId },
          { playerOId: userId }
        ]
      },
      include: {
        playerX: {
          select: { id: true, username: true }
        },
        playerO: {
          select: { id: true, username: true }
        },
        winner: {
          select: { id: true, username: true }
        }
      }
    });
    return games;
  } catch (error) {
    console.error("Error fetching games for user:", error);
    throw error;
  }
};

const gameModel = {
  createGame,
  updateGame,
  getGamePlayedByUser
};

export default gameModel;