// src/App.jsx
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GOALS = {
  "Cute Dog": ["Big Eyes", "Floppy Ears", "Compact Size", "Loyalty"],
  "Guard Dog": ["Muscular Build", "Speedy Reflexes", "Thick Fur", "Loyalty"],
  "Service Dog": ["High Intelligence", "Loyalty", "Short Snout", "Calm Temperament"],
  "Hunting Dog": ["Long Legs", "Sense of Smell", "Speedy Reflexes", "Thick Fur"],
};

const TRAITS = [
  { name: "Floppy Ears", cost: 10, successRoll: [4, 5, 6] },
  { name: "Muscular Build", cost: 20, successRoll: [5, 6] },
  { name: "Long Legs", cost: 15, successRoll: [3, 4, 5, 6] },
  { name: "High Intelligence", cost: 25, successRoll: [4, 5, 6] },
  { name: "Thick Fur", cost: 10, successRoll: [2, 3, 4, 5, 6] },
  { name: "Speedy Reflexes", cost: 20, successRoll: [5, 6] },
  { name: "Short Snout", cost: 10, successRoll: [3, 4, 5, 6] },
  { name: "Loyalty", cost: 15, successRoll: [2, 3, 4, 5, 6] },
  { name: "Big Eyes", cost: 10, successRoll: [4, 5, 6] },
  { name: "Compact Size", cost: 10, successRoll: [3, 4, 5, 6] },
  { name: "Sense of Smell", cost: 20, successRoll: [4, 5, 6] },
  { name: "Calm Temperament", cost: 15, successRoll: [3, 4, 5, 6] },
];

const rollDie = () => Math.ceil(Math.random() * 6);
const generateDogs = (num, inheritedTraits) => Array.from({ length: num }).map(() => ({ traits: { ...inheritedTraits } }));

const ArtificialSelectionGame = () => {
  const [goal, setGoal] = useState("");
  const [generation, setGeneration] = useState(1);
  const [budget, setBudget] = useState(100);
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [history, setHistory] = useState([]);
  const [traitSuccessCounts, setTraitSuccessCounts] = useState({});
  const [inheritedTraits, setInheritedTraits] = useState({});
  const [goalAchieved, setGoalAchieved] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  const [dogs, setDogs] = useState(generateDogs(10, {}));

  useEffect(() => {
    const goalNames = Object.keys(GOALS);
    setGoal(goalNames[Math.floor(Math.random() * goalNames.length)]);
  }, []);

  const toggleTrait = (trait) => {
    setSelectedTraits((prev) => {
      const alreadySelected = prev.some((t) => t.name === trait.name);
      if (alreadySelected) return prev.filter((t) => t.name !== trait.name);
      const totalCost = prev.reduce((sum, t) => sum + t.cost, 0) + trait.cost;
      if (totalCost > budget) return prev;
      return [...prev, trait];
    });
  };

  const simulateGeneration = () => {
    const popSize = 10;
    const newDogs = generateDogs(popSize, {});
    const freq = {};
    const updatedCounts = { ...traitSuccessCounts };
    const nextInherited = {};

    newDogs.forEach((dog) => {
      selectedTraits.forEach((trait) => {
        const roll = rollDie();
        const success = trait.successRoll.includes(roll);
        if (success) {
          dog.traits[trait.name] = true;
          updatedCounts[trait.name] = (updatedCounts[trait.name] || 0) + 1;
        }
      });
      Object.keys(inheritedTraits).forEach((trait) => {
        if (Math.random() < 0.5) {
          dog.traits[trait] = true;
        }
      });
    });

    TRAITS.forEach((trait) => {
      freq[trait.name] = newDogs.filter((d) => d.traits[trait.name]).length;
      if (freq[trait.name] > 0) {
        nextInherited[trait.name] = true;
      }
    });

    const goalTraits = GOALS[goal] || [];
    const hasPerfectDog = newDogs.some((dog) =>
      goalTraits.every((trait) => dog.traits[trait])
    );

    if (hasPerfectDog) {
      setGoalAchieved(true);
      setShowRestart(true);
    }

    const totalCost = selectedTraits.reduce((sum, t) => sum + t.cost, 0);
    const newBudget = budget - totalCost;
    if (newBudget <= 0 && !hasPerfectDog) {
      setGameOver(true);
      setShowRestart(true);
    }

    setDogs(newDogs);
    setHistory([...history, freq]);
    setBudget(newBudget);
    setGeneration(generation + 1);
    setSelectedTraits([]);
    setTraitSuccessCounts(updatedCounts);
    setInheritedTraits(nextInherited);
  };

  const restartGame = () => {
    const goalNames = Object.keys(GOALS);
    setGoal(goalNames[Math.floor(Math.random() * goalNames.length)]);
    setGeneration(1);
    setBudget(100);
    setSelectedTraits([]);
    setHistory([]);
    setTraitSuccessCounts({});
    setInheritedTraits({});
    setGoalAchieved(false);
    setGameOver(false);
    setShowRestart(false);
    setDogs(generateDogs(10, {}));
  };

  const goalTraits = GOALS[goal] || [];

  const calculateProgress = () => {
    if (goalAchieved) return 100;
    const latest = history[history.length - 1] || {};
    const goalTotal = goalTraits.length * 10;
    const goalScore = goalTraits.reduce((sum, trait) => sum + (latest[trait] || 0), 0);
    return Math.min(100, Math.round((goalScore / goalTotal) * 100));
  };

  const getGoalImage = () => {
    const goalKey = goal.toLowerCase().split(" ")[0];
    return `/images/${goalKey}.jpg`;
  };

  const data = {
    labels: history.map((_, i) => `Gen ${i + 1}`),
    datasets: TRAITS.filter((t) => history.some((h) => h[t.name] !== undefined)).map((trait, i) => ({
      label: trait.name,
      data: history.map((h) => h[trait.name] || 0),
      borderColor: `hsl(${i * 30}, 70%, 50%)`,
      backgroundColor: `hsla(${i * 30}, 70%, 50%, 0.4)`
    }))
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Trait Frequencies Over Generations"
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Number of Dogs Showing Trait (out of 10)"
        },
        beginAtZero: true,
        max: 10
      }
    }
  };

  return (
    <div className="app">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Artificial Selection Game</h1>
        <p style={{ fontSize: "0.9rem", fontStyle: "italic" }}>Created by George, Nicholas, Affan and Ethan</p>
      </div>

      <h2>Goal: <strong>{goal}</strong></h2>
      <p>Generation: {generation} | Budget: ${budget}</p>

      <div className="goal-progress">
        <p>Goal Progress</p>
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar"
            style={{
              width: `${calculateProgress()}%`,
              backgroundColor: `hsl(${calculateProgress()}, 80%, 50%)`,
              transition: 'width 0.8s ease'
            }}
          />
        </div>
      </div>

      {goalAchieved && (
        <div className="success-message">
          <h3>🎉 You have successfully bred a perfect {goal}!</h3>
          <img src={getGoalImage()} alt={goal} style={{ maxWidth: "300px", marginTop: "10px", borderRadius: "12px" }} />
        </div>
      )}

      {gameOver && <div className="game-over">💸 Game Over: You ran out of budget before breeding a perfect dog.</div>}
      {showRestart && <button onClick={restartGame}>Restart Game</button>}

      <div className="trait-grid">
        {TRAITS.map((trait) => {
          const isSelected = selectedTraits.some((t) => t.name === trait.name);
          return (
            <div
              key={trait.name}
              className={`trait-card ${isSelected ? "selected" : ""}`}
              onClick={() => toggleTrait(trait)}
            >
              <h3>{trait.name}</h3>
              <p>Cost: ${trait.cost}</p>
              {traitSuccessCounts[trait.name] && (
                <div className="trait-checks">
                  {Array.from({ length: traitSuccessCounts[trait.name] }).map((_, i) => (
                    <span key={i} className="checkmark">✔</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={simulateGeneration} disabled={selectedTraits.length === 0 || goalAchieved || gameOver}>
        Run Generation {generation}
      </button>

      <div className="dog-display">
        <h3>Current Dogs:</h3>
        <div className="dog-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {dogs.map((dog, index) => (
            <div key={index} className="dog-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px', backgroundColor: '#fefefe' }}>
              <p><strong>Dog #{index + 1}</strong></p>
              <ul style={{ paddingLeft: '16px' }}>
                {Object.keys(dog.traits).map((trait, i) => (
                  <li key={i}>{trait}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="chart-container">
          <Line data={data} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default ArtificialSelectionGame;
