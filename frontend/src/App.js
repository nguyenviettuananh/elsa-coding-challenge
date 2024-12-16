// React App: Quiz Game Frontend with Tailwind CSS
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

const App = () => {
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      fetch("http://localhost:4000/questions")
        .then((res) => res.json())
        .then((data) => setQuestions(data));

      socket.on("leaderboard", (data) => {
        setLeaderboard(data);
      });
    }

    return () => {
      socket.off("leaderboard");
    };
  }, [loggedIn]);

  const handleLogin = () => {
    if (username) {
      setLoggedIn(true);
    }
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    fetch("http://localhost:4000/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, questionId: questions[currentQuestion].id, answer }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResult(data.correct ? "correct" : "wrong");

        setTimeout(() => {
          setResult(null);
          setSelectedAnswer(null);
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
          } else {
            setFinished(true);
          }
        }, 1000);
      });
  };

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Welcome to the Quiz Game</h1>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          onClick={handleLogin}
          className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
        >
          Login
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Thank you for finishing the quiz!</h1>
        <p className="text-lg">Your responses have been recorded</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl bg-white p-6 rounded shadow">
        <div className="mb-6">
          {questions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {questions[currentQuestion].text}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {questions[currentQuestion].choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(choice)}
                    disabled={selectedAnswer !== null}
                    className={`px-4 py-2 font-semibold rounded text-white w-full ${
                      selectedAnswer === choice
                        ? result === "correct"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold mb-2">Leaderboard</h2>
          <ul className="list-disc pl-6">
            {leaderboard.map((user, index) => (
              <li key={index} className="text-base">
                {user.username}: {user.score}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;