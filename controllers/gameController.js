import gameModel from "../models/gameModel.js";

const gameController = {
  updateGame: async(req, res) => {
    // Logic to update the game state
    try {
      const { id } = req.params;
      const updatedGame = await gameModel.updateGame(id, req.body);
      res.status(201).json({ success: true, message: "Game updated successfully", data: updatedGame });
    } catch (error) {
      console.error("Error updating game:", error);
      res.status(500).json({ error: "Failed to update game" });
    }
  },
  
  getGameByUser: async(req, res) => {
    // Logic to get games played by a specific user
    try {
      const { userId } = req.params;
      const games = await gameModel.getGamePlayedByUser(parseInt(userId));
      res.json({ success: true, data: games });
    } catch (error) {
      console.error("Error fetching games for user:", error);
      res.status(500).json({ error: "Failed to fetch games for user" });
    }
  }
};

export default gameController;
