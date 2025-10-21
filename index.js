import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import router from "./routers/index.js";
import gameModel from "./models/gameModel.js";

const app = express();
app.use(express.json()); // <-- parses JSON body
app.use(express.urlencoded({ extended: true })); // <-- parses form data
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const queue = [];  // waiting players
const games = {};  // { gameId: { board, players, current, status } }

function checkWinner(board) {
  // All possible winning combinations
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  // Check each winning combination
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c])
      return { symbol: board[a], winningLine : [a, b, c] };
  }
  // Check for draw or ongoing game
  return board.includes(null) ? null : "draw";
}

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("find_match", async (user) => {
    console.log("Finding match for user:", user);
    queue.push({...user, socketId: socket.id});
    if (queue.length >= 2) {
     //Getting first two players from the queue to start a game and delete them from the queue for next matches
      const [p1, p2] = queue.splice(0, 2);
      const newGame = await gameModel.createGame({
        playerX: p1,
        playerO: p2,
        current: "X",
        status: "playing"
      });
      const gameId = newGame.id;
      games[gameId] = {
        board: Array(9).fill(null),
        players: { X: {...p1, symbol: "X"}, O: {...p2, symbol: "O"} },
        current: "X",
        status: "playing"
      };
      io.to(p1.socketId).emit("match_found", { gameId, opponent: { ...p2, symbol: "O" } });
      io.to(p2.socketId).emit("match_found", { gameId, opponent: { ...p1, symbol: "X" } });
      io.to(p1.socketId).emit("game_update", games[gameId]);
      io.to(p2.socketId).emit("game_update", games[gameId]);
    }
  });

  socket.on("make_move", ({ gameId, index }) => {
    const game = games[gameId];
    if (!game) return;
    const { board, players, current } = game;
    //Getting the symbol of the player making the move
    const playerSymbol = socket.id === players.X.socketId ? "X" : socket.id === players.O.socketId ? "O" : null;
    //Validating the move by checking if it's the player's turn, if the cell is empty, and if the game is still ongoing
    if (playerSymbol !== current || board[index] || game.status !== "playing") return;
    board[index] = playerSymbol;
    const result = checkWinner(board);
    if (result) {
      game.status = "finished";
      game.winner = result === "draw" ? null : result.board;
      game.winningLine = result === "draw" ? null : result.winningLine;
    } else {
      game.current = current === "X" ? "O" : "X";
    }
    io.to(players.X.socketId).emit("game_update", game);
    io.to(players.O.socketId).emit("game_update", game);
  });

  socket.on("cancel_matchmaking", () => {
    const index = queue.indexOf(socket.id);
    if (index !== -1) {
      queue.splice(index, 1);
    }
    io.to(socket.id).emit("matchmaking_canceled", { success: true });
  });


  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    // Optional: clean up queue or game if a player leaves
  });
});

app.use("/api", router);
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log("Server running on port", PORT));
