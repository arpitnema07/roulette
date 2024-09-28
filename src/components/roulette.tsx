"use client";

import { useState, useEffect } from "react";
import { Coins, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];
const COLORS = [
  "green",
  ...Array(36)
    .fill("")
    .map((_, i) => (i % 2 === 0 ? "black" : "red")),
  "white",
];

type Bet = {
  type: "number" | "color" | "even" | "odd";
  value: number | string;
  amount: number;
};

type HistoryItem = {
  num: number;
  winLose: "win" | "lose";
  amount: number;
};

export default function Roulette() {
  const [balance, setBalance] = useState(1000);
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [betAmount, setBetAmount] = useState(10);
  const [customNumber, setCustomNumber] = useState("");
  const [wheelRotation, setWheelRotation] = useState(0);

  const placeBet = (bet: Omit<Bet, "amount">) => {
    if (balance >= betAmount) {
      const newBet = { ...bet, amount: betAmount };
      setBets([...bets, newBet]);
      setBalance(balance - betAmount);
      toast.success(`Bet placed: $${betAmount} on ${bet.value}`);
    } else {
      toast.error("Insufficient balance");
    }
  };

  const spin = () => {
    if (bets.length === 0) {
      toast.error("Please place a bet first");
      return;
    }

    setSpinning(true);
    const randomIndex = Math.floor(Math.random() * NUMBERS.length);
    const winningNumber = NUMBERS[randomIndex];
    const rotations = 5 + Math.random() * 5; // 5 to 10 full rotations
    const targetRotation =
      rotations * 360 + (360 - randomIndex * (360 / NUMBERS.length)) + 90;

    setWheelRotation(targetRotation);

    setTimeout(() => {
      setResult(winningNumber);
      setSpinning(false);

      // Process bets
      let winnings = 0;
      bets.forEach((bet) => {
        if (
          (bet.type === "number" && bet.value === winningNumber) ||
          (bet.type === "color" &&
            bet.value === COLORS[NUMBERS.indexOf(winningNumber)]) ||
          (bet.type === "even" &&
            winningNumber % 2 === 0 &&
            winningNumber !== 0) ||
          (bet.type === "odd" && winningNumber % 2 === 1)
        ) {
          const multiplier = getMultiplier(bet.type);
          winnings += bet.amount * multiplier;
          toast.success(`You won $${bet.amount * multiplier} on ${bet.value}!`);
        }
      });

      setBalance((prevBalance) => prevBalance + winnings);
      setHistory((prevHistory) => [
        {
          num: winningNumber,
          winLose: winnings > 0 ? "win" : "lose",
          amount:
            winnings > 0
              ? winnings
              : bets.reduce((sum, bet) => sum + bet.amount, 0),
        },
        ...prevHistory.slice(0, 9),
      ]);

      if (winnings === 0) {
        toast.info("No winning bets this round");
      }
      setBets([]);
    }, 10000); // 10 seconds for the wheel to stop
  };

  const resetGame = () => {
    setBalance(1000);
    setBets([]);
    setResult(null);
    setHistory([]);
    setBetAmount(10);
    setCustomNumber("");
    setWheelRotation(0);
    toast.info("Game reset");
  };

  const getMultiplier = (betType: string) => {
    switch (betType) {
      case "number":
        return 35;
      case "color":
        return 2;
      case "even":
      case "odd":
        return 2;
      default:
        return 1;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Roulette</span>
            <span>Balance: ${balance}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <div className="relative w-64 h-64 md:w-96 md:h-96">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: spinning
                    ? "transform 10s cubic-bezier(0.25, 0.1, 0.25, 1)"
                    : "none",
                }}
              >
                {NUMBERS.map((num, index) => {
                  const angle = (index * 360) / NUMBERS.length;
                  const radius = 60; // Increased radius for more spacing
                  const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
                  return (
                    <g key={num}>
                      <line
                        x1="100"
                        y1="100"
                        x2={x}
                        y2={y}
                        stroke="#888"
                        strokeWidth="1"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="10" // Slightly smaller circles
                        fill={COLORS[NUMBERS.indexOf(num)]}
                        stroke="#fff"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#fff"
                        fontSize="8" // Slightly smaller font
                        fontWeight="bold"
                      >
                        {num}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-8 bg-yellow-400 z-10"></div> */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl md:text-4xl font-bold"
                  style={{
                    background:
                      COLORS[
                        NUMBERS.indexOf(result ? result : COLORS.length - 1)
                      ],
                    color: COLORS[NUMBERS.indexOf(result ? result + 1 : 1)],
                  }}
                >
                  {spinning ? "?" : result !== null ? result : ""}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="bet-amount">Bet Amount ($)</Label>
              <Input
                id="bet-amount"
                type="number"
                value={betAmount}
                onChange={(e) =>
                  setBetAmount(Math.max(1, parseInt(e.target.value) || 0))
                }
                min="1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="custom-number">Custom Number (0-36)</Label>
              <Input
                id="custom-number"
                type="number"
                value={customNumber}
                onChange={(e) => setCustomNumber(e.target.value)}
                min="0"
                max="36"
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            <Button onClick={() => placeBet({ type: "color", value: "red" })}>
              Red <span className="ml-1 text-xs">(2x)</span>
            </Button>
            <Button onClick={() => placeBet({ type: "color", value: "black" })}>
              Black <span className="ml-1 text-xs">(2x)</span>
            </Button>
            <Button onClick={() => placeBet({ type: "number", value: 0 })}>
              0 <span className="ml-1 text-xs">(35x)</span>
            </Button>
            <Button onClick={() => placeBet({ type: "even", value: "even" })}>
              Even <span className="ml-1 text-xs">(2x)</span>
            </Button>
            <Button onClick={() => placeBet({ type: "odd", value: "odd" })}>
              Odd <span className="ml-1 text-xs">(2x)</span>
            </Button>
            <Button
              onClick={() =>
                placeBet({ type: "number", value: parseInt(customNumber) })
              }
              disabled={
                customNumber === "" ||
                parseInt(customNumber) < 0 ||
                parseInt(customNumber) > 36
              }
            >
              Custom <span className="ml-1 text-xs">(35x)</span>
            </Button>
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-2">
            <Button
              onClick={spin}
              disabled={spinning || bets.length === 0}
              className="w-full md:w-auto"
            >
              <Coins className="mr-2 h-4 w-4" /> Spin
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              className="w-full md:w-auto"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {history.map((item, index) => (
              <div
                key={index}
                className={`p-2 rounded-md flex items-center justify-between ${
                  item.winLose === "win" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-2"
                    style={{
                      backgroundColor: COLORS[NUMBERS.indexOf(item.num)],
                    }}
                  >
                    {item.num}
                  </div>
                  <span className="font-semibold">
                    {item.winLose === "win" ? "Win" : "Lose"}
                  </span>
                </div>
                <span className="text-sm">${item.amount}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
