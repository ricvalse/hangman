import React, { useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// ---------------- Translations ----------------
const translations = {
  en: {
    title: "Hangman Game",
    guessPrompt: "Guess a letter:",
    restart: "Restart Game",
    clearScore: "Clear Score",
    language: "Language",
    winMessage: "Congratulations, you've won!",
    loseMessage: "Game over! The word was",
    score: "Score",
    wins: "Wins",
    losses: "Losses",
    timeLeft: "Time Left",
    elapsedTime: "Elapsed Time",
    timeMode: "Time Mode",
  },
  it: {
    title: "Gioco dell'Impiccato",
    guessPrompt: "Indovina una lettera:",
    restart: "Ricomincia il gioco",
    clearScore: "Pulisci Punteggio",
    language: "Lingua",
    winMessage: "Congratulazioni, hai vinto!",
    loseMessage: "Hai perso! La parola era",
    score: "Punteggio",
    wins: "Vittorie",
    losses: "Sconfitte",
    timeLeft: "Tempo Rimanente",
    elapsedTime: "Tempo Trascorso",
    timeMode: "Modalità Tempo",
  },
  es: {
    title: "Juego del Ahorcado",
    guessPrompt: "Adivina una letra:",
    restart: "Reiniciar Juego",
    clearScore: "Borrar Puntuación",
    language: "Idioma",
    winMessage: "¡Felicidades, has ganado!",
    loseMessage: "¡Juego terminado! La palabra era",
    score: "Puntuación",
    wins: "Victorias",
    losses: "Derrotas",
    timeLeft: "Tiempo Restante",
    elapsedTime: "Tiempo Transcurrido",
    timeMode: "Modo de Tiempo",
  },
};

// ---------------- Constants ----------------
const MAX_ERRORS = 6;
const INITIAL_TIME = 60; // seconds for speed and countdown modes
const COUNTDOWN_PENALTY = 10; // seconds penalty per wrong guess in Countdown mode

// ---------------- 3D Hangman Visualization ----------------

// Gallows component: a detailed gallows using boxes and cylinders
function Gallows() {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, -2, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.3, 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Vertical Pole */}
      <mesh position={[-2.5, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 8, 32]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Top Beam */}
      <mesh position={[-2.5, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.3, 0.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Rope */}
      <mesh position={[-0.5, 3.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </group>
  );
}

// Hangman Figure: renders head, body, arms, and legs progressively based on errors
function HangmanFigure({ errors }) {
  return (
    <group position={[-0.5, 3, 0]}>
      {errors > 0 && (
        // Head: sphere with a warm tone
        <mesh position={[0, -0.5, 0]} castShadow>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#f0c987" />
        </mesh>
      )}
      {errors > 1 && (
        // Body: cylinder
        <mesh position={[0, -1.8, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 2, 32]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      )}
      {errors > 2 && (
        // Left Arm: rotated cylinder
        <mesh
          position={[-0.3, -1.2, 0]}
          castShadow
          rotation={[0, 0, Math.PI / 4]}
        >
          <cylinderGeometry args={[0.1, 0.1, 1.2, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      )}
      {errors > 3 && (
        // Right Arm: rotated cylinder
        <mesh
          position={[0.3, -1.2, 0]}
          castShadow
          rotation={[0, 0, -Math.PI / 4]}
        >
          <cylinderGeometry args={[0.1, 0.1, 1.2, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      )}
      {errors > 4 && (
        // Left Leg: slightly rotated cylinder
        <mesh
          position={[-0.2, -3, 0]}
          castShadow
          rotation={[0, 0, Math.PI / 12]}
        >
          <cylinderGeometry args={[0.1, 0.1, 1.5, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      )}
      {errors > 5 && (
        // Right Leg: slightly rotated cylinder
        <mesh
          position={[0.2, -3, 0]}
          castShadow
          rotation={[0, 0, -Math.PI / 12]}
        >
          <cylinderGeometry args={[0.1, 0.1, 1.5, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      )}
    </group>
  );
}

function ImprovedHangman3D({ errors }) {
  return (
    <group>
      <Gallows />
      <HangmanFigure errors={errors} />
    </group>
  );
}

// Canvas wrapper for the 3D hangman
function ImprovedHangman3DCanvas({ errors }) {
  return (
    <div className="canvas-container">
      <Canvas
        shadows
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [10, 0, 15], fov: 30 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <ImprovedHangman3D errors={errors} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

// ---------------- On-Screen Keyboard ----------------
function KeyboardComponent({ onLetterClick, disabledLetters }) {
  const qwertyRows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];
  return (
    <div className="keyboard">
      {qwertyRows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((letter) => (
            <button
              key={letter}
              onClick={() => onLetterClick(letter)}
              disabled={disabledLetters.includes(letter)}
              className="key-button"
            >
              {letter.toUpperCase()}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------- Main App Component ----------------
function App() {
  // Language selection state
  const [language, setLanguage] = useState("en");
  const t = translations[language];

  // Time mode state: "normal" (elapsed time), "speed" (countdown), "countdown" (countdown with penalty)
  const [timeMode, setTimeMode] = useState("normal");
  const [timeLeft, setTimeLeft] = useState(
    timeMode === "normal" ? 0 : INITIAL_TIME
  );

  // Game state
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [errors, setErrors] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing"); // "playing", "won", "lost"
  const [score, setScore] = useState({ wins: 0, losses: 0 });

  // Load score from localStorage
  useEffect(() => {
    const storedScore = localStorage.getItem("hangmanScore");
    if (storedScore) {
      setScore(JSON.parse(storedScore));
    }
  }, []);

  // Restart game on language or time mode change
  useEffect(() => {
    startNewGame();
  }, [language, timeMode]);

  // Timer effect: increments or decrements timeLeft based on mode
  useEffect(() => {
    if (gameStatus !== "playing") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (timeMode === "normal") return prev + 1;
        else {
          if (prev <= 1) {
            clearInterval(interval);
            setGameStatus("lost");
            updateScore({ wins: score.wins, losses: score.losses + 1 });
            return 0;
          }
          return prev - 1;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeMode, gameStatus, score]);

  // Fetch a new word based on language
  const startNewGame = () => {
    setGuessedLetters([]);
    setErrors(0);
    setGameStatus("playing");
    setTimeLeft(timeMode === "normal" ? 0 : INITIAL_TIME);
    let apiUrl = "https://random-word-api.herokuapp.com/word";
    if (language === "it") apiUrl += "?lang=it";
    else if (language === "es") apiUrl += "?lang=es";
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => setWord(data[0].toLowerCase()))
      .catch((error) => {
        console.error("Error fetching word:", error);
        setWord("error");
      });
  };

  // Update score and persist to localStorage
  const updateScore = (newScore) => {
    setScore(newScore);
    localStorage.setItem("hangmanScore", JSON.stringify(newScore));
  };

  // Clear score handler
  const handleClearScore = () => {
    const newScore = { wins: 0, losses: 0 };
    setScore(newScore);
    localStorage.setItem("hangmanScore", JSON.stringify(newScore));
  };

  // Process a guessed letter
  const processGuess = (letter) => {
    if (gameStatus !== "playing" || guessedLetters.includes(letter)) return;
    const newGuesses = [...guessedLetters, letter];
    setGuessedLetters(newGuesses);
    if (!word.includes(letter)) {
      const newErrors = errors + 1;
      setErrors(newErrors);
      if (timeMode === "countdown") {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - COUNTDOWN_PENALTY);
          if (newTime === 0) {
            setGameStatus("lost");
            updateScore({ wins: score.wins, losses: score.losses + 1 });
          }
          return newTime;
        });
      }
      if (newErrors >= MAX_ERRORS) {
        setGameStatus("lost");
        updateScore({ wins: score.wins, losses: score.losses + 1 });
      }
    } else {
      const uniqueLetters = Array.from(new Set(word.split("")));
      const allGuessed = uniqueLetters.every((ltr) => newGuesses.includes(ltr));
      if (allGuessed) {
        setGameStatus("won");
        updateScore({ wins: score.wins + 1, losses: score.losses });
      }
    }
  };

  // Handle letter input from on-screen keyboard or physical keyboard
  const handleLetterClick = useCallback(
    (letter) => processGuess(letter),
    [guessedLetters, gameStatus, word, errors, timeMode, score]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      const letter = e.key.toLowerCase();
      if (/^[a-z]$/.test(letter)) handleLetterClick(letter);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleLetterClick]);

  const renderWord = () =>
    word.split("").map((letter, index) => (
      <span key={index} className="letter">
        {guessedLetters.includes(letter) || gameStatus !== "playing"
          ? letter.toUpperCase()
          : "_"}
      </span>
    ));

  return (
    <div className="bodycontent">
      <header>
        <h1>{t.title}</h1>
        <div className="selectors">
          <div className="language-selector">
            <label htmlFor="language-select">{t.language}:</label>
            <select
              id="language-select"
              className="select-dropdown"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="it">Italiano</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div className="time-selector">
            <label htmlFor="time-select">{t.timeMode}:</label>
            <select
              id="time-select"
              className="select-dropdown"
              value={timeMode}
              onChange={(e) => setTimeMode(e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="speed">Speed Hangman</option>
              <option value="countdown">Countdown Mode</option>
            </select>
          </div>
          <div className="flexclass">
            <p>
              {t.wins}: {score.wins}
            </p>
            <p>
              {t.losses}: {score.losses}
            </p>
          </div>
        </div>
        <div className="flexclass2">
          <div className="timer">
            {timeMode === "normal"
              ? `${t.elapsedTime}: ${timeLeft} sec`
              : `${t.timeLeft}: ${timeLeft} sec`}
          </div>
          <div className="controls">
            <button onClick={startNewGame} className="restart-button">
              {t.restart}
            </button>
            <button onClick={handleClearScore} className="restart-button">
              {t.clearScore}
            </button>
          </div>
        </div>
      </header>
      <div className="game-grid">
        <div className="left-section">
          <ImprovedHangman3DCanvas errors={errors} />
        </div>
        <div className="right-section">
          <div>
            <div className="word-section">
              <div className="word-display">{renderWord()}</div>
              {gameStatus === "won" && (
                <p className="message win">{t.winMessage}</p>
              )}
              {gameStatus === "lost" && (
                <p className="message lose">
                  {t.loseMessage} {word.toUpperCase()}
                </p>
              )}
            </div>
            <div className="keyboard-section">
              <KeyboardComponent
                onLetterClick={handleLetterClick}
                disabledLetters={guessedLetters}
              />
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .flexclass {
          display: flex;
          gap: 20px;
        }

        .flexclass2 {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .bodycontent {
          box-sizing: border-box;
          padding-top: 20px;
          background-color: #d1f2ff;
          height: 100vh;
          width: 100vw;
        }

        .canvas-container {
          width: 400px;
          height: 400px;
          overflow: hidden;
          position: relative;
        }

        .hangman-section {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          border: 1px solid black;
        }

        .right-section {
          width: 50%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding-left: 0px;
          align-items: flex-start;
        }

        .left-section {
          width: 50%;
          display: flex;
          justify-content: flex-end;
          padding-right: 0px;
        }

        header {
          text-align: center;
          margin-bottom: 10px;
        }

        h1 {
          margin: 0;
          font-size: 2rem;
        }

        .selectors {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;
          margin-top: 10px;
        }

        .language-selector,
        .time-selector {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .select-dropdown {
          padding: 5px 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #fff;
          font-size: 1rem;
          appearance: none;
        }

        .timer {
          margin-top: 10px;
          font-size: 1.2rem;
          font-weight: bold;
        }

        .game-grid {
          display: flex;
          gap: 20px;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin: 10px auto;
        }

        .word-section {
          display: flex;
          flex-direction: column;
          text-align: center;
          width: 100%;
          padding-bottom: 50px;
          box-sizing: border-box;
        }

        .word-display {
          font-size: 2rem;
          letter-spacing: 10px;
          margin-bottom: 10px;
        }

        .letter {
          display: inline-block;
          width: 30px;
          border-bottom: 2px solid #333;
        }

        .keyboard-section {
          width: 95%;
          max-width: 400px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .keyboard {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .keyboard-row {
          display: flex;
          gap: 5px;
          justify-content: center;
        }

        .key-button {
          padding: 10px;
          font-size: 1rem;
          width: 35px;
          height: 35px;
          border: none;
          background-color: #4a90e2;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .key-button:disabled {
          background-color: #999;
          cursor: not-allowed;
        }

        .controls {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .restart-button {
          padding: 10px 20px;
          font-size: 1rem;
          border: none;
          border-radius: 4px;
          background-color: #e94e77;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .restart-button:hover {
          background-color: #d73c65;
        }

        .score-board {
          background: #fff;
          padding: 10px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          width: 50%;
          margin: 0 auto;
          text-align: center;
        }

        .message {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .win {
          color: green;
        }

        .lose {
          color: red;
        }

        @media (max-width: 850px) {
          .game-grid {
            flex-direction: column;
            gap: 10px;
          }

          .left-section,
          .right-section {
            width: 100%;
            justify-content: center;
            padding: 0;
          }

          .left-section {
            order: 1;
          }

          .right-section {
            order: 2;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
