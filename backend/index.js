const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));

const questions = [
    { "id": 1, "text": "What is the meaning of 'happy'?", "choices": ["Sad", "Excited", "Angry", "Joyful"], "answer": "Joyful" },
    { "id": 2, "text": "What does 'big' mean?", "choices": ["Small", "Large", "Thin", "Short"], "answer": "Large" },
    { "id": 3, "text": "What is the meaning of 'fast'?", "choices": ["Slow", "Quick", "Heavy", "Strong"], "answer": "Quick" },
    { "id": 4, "text": "What does 'clean' mean?", "choices": ["Dirty", "Neat", "Messy", "Old"], "answer": "Neat" }
  ];

let leaderboard = [];

app.get("/questions", (req, res) => {
  res.json(questions.map(({ id, text, choices }) => ({ id, text, choices })));
});

app.post("/validate", (req, res) => {
  const { username, questionId, answer } = req.body;
  const question = questions.find((q) => q.id === questionId);

  if (!question) {
    return res.status(400).json({ error: "Invalid question" });
  }

  const correct = question.answer === answer;

  if (correct) {
    const user = leaderboard.find((user) => user.username === username);
    if (user) {
      user.score += 1;
    } else {
      leaderboard.push({ username, score: 1 });
    }

    io.emit("leaderboard", leaderboard.sort((a, b) => b.score - a.score));
  }

  res.json({ correct, correctAnswer: question.answer });
});

io.on("connection", (socket) => {
  console.log("User connected");
  socket.emit("leaderboard", leaderboard);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});
