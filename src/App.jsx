
import React, { useState } from 'react';

// ============================================================================
// GAME CONSTANTS & DATA
// ============================================================================

const CARD_TYPES = {
  GRAVITY: 'gravity',
  FORCE: 'force',
  WIGGLE: 'wiggle',
  CHAOS: 'chaos',
};

const FORCE_COLORS = ['red', 'blue', 'yellow', 'green'];
const CHAOS_TYPES = ['squish', 'gauge-break', 'big-bang'];

// Create the 54-card deck
const createDeck = () => {
  const deck = [];
  let id = 0;

  // 18 Gravity cards (6 each of Ball-1, Ball-2, Ball-3)
  for (let variant = 1; variant <= 3; variant++) {
    for (let i = 0; i < 6; i++) {
      deck.push({
        id: `card_${id++}`,
        type: CARD_TYPES.GRAVITY,
        name: `Ball-${variant}`,
        variant,
        connections: [CARD_TYPES.GRAVITY, CARD_TYPES.WIGGLE, CARD_TYPES.CHAOS],
      });
    }
  }

  // 12 Force cards (3 each color)
  FORCE_COLORS.forEach((color) => {
    for (let i = 0; i < 3; i++) {
      deck.push({
        id: `card_${id++}`,
        type: CARD_TYPES.FORCE,
        name: `${color.charAt(0).toUpperCase() + color.slice(1)} Force`,
        color,
        connections: [CARD_TYPES.FORCE, CARD_TYPES.WIGGLE, CARD_TYPES.CHAOS],
      });
    }
  });

  // 18 Wiggle cards (6 each of Wave-1, Wave-2, Wave-3)
  for (let variant = 1; variant <= 3; variant++) {
    for (let i = 0; i < 6; i++) {
      deck.push({
        id: `card_${id++}`,
        type: CARD_TYPES.WIGGLE,
        name: `Wave-${variant}`,
        variant,
        connections: [
          CARD_TYPES.GRAVITY,
          CARD_TYPES.FORCE,
          CARD_TYPES.WIGGLE,
          CARD_TYPES.CHAOS,
        ],
      });
    }
  }

  // 6 Chaos cards (2 each type)
  CHAOS_TYPES.forEach((chaosType) => {
    for (let i = 0; i < 2; i++) {
      const names = {
        squish: 'Squish!',
        'gauge-break': 'Gauge-Break!',
        'big-bang': 'Big Bang!',
      };

      deck.push({
        id: `card_${id++}`,
        type: CARD_TYPES.CHAOS,
        name: names[chaosType],
        chaosType,
        connections: [
          CARD_TYPES.GRAVITY,
          CARD_TYPES.FORCE,
          CARD_TYPES.WIGGLE,
          CARD_TYPES.CHAOS,
        ],
      });
    }
  });

  return deck;
};

const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============================================================================
// GAME LOGIC
// ============================================================================

const canConnectTo = (card, chainEndCard, consecutiveForces) => {
  if (!chainEndCard) return true; // Empty chain

  // Wiggle can connect to anything
  if (chainEndCard.type === CARD_TYPES.WIGGLE) return true;

  // Gravity end
  if (chainEndCard.type === CARD_TYPES.GRAVITY) {
    return (
      card.type === CARD_TYPES.GRAVITY ||
      card.type === CARD_TYPES.WIGGLE ||
      card.type === CARD_TYPES.CHAOS
    );
  }

  // Force end
  if (chainEndCard.type === CARD_TYPES.FORCE) {
    if (card.type === CARD_TYPES.GRAVITY) return false;
    if (card.type === CARD_TYPES.FORCE && consecutiveForces >= 2) return false;
    return true;
  }

  // Chaos (shouldn't happen as chaos is played and resolved immediately)
  return true;
};

const countConsecutiveForces = (chain, fromEnd = 'right') => {
  if (chain.length === 0) return 0;

  let count = 0;
  const cards = fromEnd === 'right' ? [...chain].reverse() : chain;

  for (const card of cards) {
    if (card.type === CARD_TYPES.FORCE) count++;
    else break;
  }

  return count;
};

const isAdjacentToWiggle = (chain, position) => {
  if (position === 'left') {
    return chain.length > 0 && chain[0].type === CARD_TYPES.WIGGLE;
  }
  return chain.length > 0 && chain[chain.length - 1].type === CARD_TYPES.WIGGLE;
};

// Simple AI that makes random legal moves
const getAIMove = (hand, chain) => {
  const legalMoves = [];

  hand.forEach((card) => {
    const leftForces = countConsecutiveForces(chain, 'left');
    const rightForces = countConsecutiveForces(chain, 'right');

    if (canConnectTo(card, chain[0], leftForces)) {
      legalMoves.push({ card, position: 'left' });
    }
    if (canConnectTo(card, chain[chain.length - 1], rightForces)) {
      legalMoves.push({ card, position: 'right' });
    }
  });

  if (legalMoves.length === 0) return null;

  // Medium AI: Prefer Wiggles and right side
  const wiggleMoves = legalMoves.filter((m) => m.card.type === CARD_TYPES.WIGGLE);
  const rightMoves = legalMoves.filter((m) => m.position === 'right');

  if (wiggleMoves.length > 0 && Math.random() > 0.3) {
    return wiggleMoves[Math.floor(Math.random() * wiggleMoves.length)];
  }
  if (rightMoves.length > 0 && Math.random() > 0.5) {
    return rightMoves[Math.floor(Math.random() * rightMoves.length)];
  }

  return legalMoves[Math.floor(Math.random() * legalMoves.length)];
};

// ============================================================================
// CARD COMPONENT
// ============================================================================

const Card = ({ card, onClick, disabled, small, highlight }) => {
  const getCardColor = () => {
    switch (card.type) {
      case CARD_TYPES.GRAVITY:
        return 'from-indigo-900 to-purple-900';
      case CARD_TYPES.FORCE: {
        const colors = {
          red: 'from-red-600 to-rose-700',
          blue: 'from-blue-600 to-cyan-600',
          yellow: 'from-yellow-500 to-orange-500',
          green: 'from-emerald-600 to-teal-600',
        };
        return colors[card.color] || 'from-gray-600 to-gray-700';
      }
      case CARD_TYPES.WIGGLE:
        return 'from-cyan-500 to-teal-500';
      case CARD_TYPES.CHAOS:
        return 'from-orange-600 to-red-600';
      default:
        return 'from-gray-700 to-gray-800';
    }
  };

  const getIcon = () => {
    switch (card.type) {
      case CARD_TYPES.GRAVITY:
        return '●';
      case CARD_TYPES.FORCE:
        return '⚡';
      case CARD_TYPES.WIGGLE:
        return '〰';
      case CARD_TYPES.CHAOS:
        return '💥';
      default:
        return '?';
    }
  };

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        relative rounded-lg bg-gradient-to-br ${getCardColor()}
        border-2 border-white/20
        ${small ? 'w-16 h-24' : 'w-24 h-36'}
        ${!disabled ? 'cursor-pointer hover:scale-105 hover:border-white/40' : 'opacity-40 cursor-not-allowed'}
        ${highlight ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
        transition-all duration-200
        flex flex-col items-center justify-center
        shadow-lg hover:shadow-xl
      `}
    >
      <div className="text-2xl mb-1">{getIcon()}</div>
      <div className={`text-white font-bold text-center ${small ? 'text-xs' : 'text-sm'} px-1`}>
        {card.name}
      </div>
      {card.variant ? <div className="text-white/60 text-xs mt-1">#{card.variant}</div> : null}
    </div>
  );
};

// ============================================================================
// MAIN GAME COMPONENT
// ============================================================================

export default function EmUniGame() {
  const [gameState, setGameState] = useState('menu'); // menu | tutorial | playing | ended
  const [tutorialStep, setTutorialStep] = useState(0);
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [aiHand, setAIHand] = useState([]);
  const [chain, setChain] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('player'); // player | ai
  const [selectedCard, setSelectedCard] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const [message, setMessage] = useState('');
  const [showUnifyModal, setShowUnifyModal] = useState(false);
  const [winner, setWinner] = useState(null);
  const [stats, setStats] = useState({ unifyAccepted: 0, unifyDeclined: 0 });

  // Initialize game
  const startGame = () => {
    const newDeck = shuffleDeck(createDeck());
    const playerCards = newDeck.slice(0, 5);
    const aiCards = newDeck.slice(5, 10);
    const remaining = newDeck.slice(10);

    setDeck(remaining);
    setPlayerHand(playerCards);
    setAIHand(aiCards);
    setChain([]);
    setCurrentPlayer('player');
    setTurnCount(1);
    setMessage('Your turn! Select a card to play (no draw on first turn).');
    setGameState('playing');
    setSelectedCard(null);
    setWinner(null);
    setStats({ unifyAccepted: 0, unifyDeclined: 0 });
  };

  // Initialize tutorial with scripted cards
  const startTutorial = () => {
    const allCards = createDeck();

    const tutorialPlayerHand = [
      allCards.find((c) => c.type === 'gravity' && c.variant === 1), // Ball-1
      allCards.find((c) => c.type === 'wiggle' && c.variant === 2), // Wave-2
      allCards.find((c) => c.type === 'force' && c.color === 'red'), // Red Force
      allCards.find((c) => c.type === 'gravity' && c.variant === 2), // Ball-2
    ].filter(Boolean);

    const tutorialDeck = allCards.filter((c) => !tutorialPlayerHand.includes(c));

    setPlayerHand(tutorialPlayerHand);
    setAIHand([]);
    setDeck(tutorialDeck);
    setChain([]);
    setCurrentPlayer('player');
    setTurnCount(0);
    setTutorialStep(0);
    setGameState('tutorial');
    setSelectedCard(null);
    setMessage('');
    setShowUnifyModal(false);
    setWinner(null);
    setStats({ unifyAccepted: 0, unifyDeclined: 0 });
  };

  // Draw card
  const drawCard = (isPlayer) => {
    if (deck.length === 0) {
      setMessage('Deck empty! No cards to draw.');
      return null;
    }

    const drawnCard = deck[0];
    const newDeck = deck.slice(1);
    setDeck(newDeck);

    if (isPlayer) {
      setPlayerHand((prev) => [...prev, drawnCard]);
    } else {
      setAIHand((prev) => [...prev, drawnCard]);
    }

    return drawnCard;
  };

  // Tutorial steps
  const tutorialSteps = [
    {
      title: 'Welcome to EmUni!',
      instruction: 'This is a card game about connecting incompatible forces. Click NEXT to begin.',
      highlight: null,
      allowedAction: null,
    },
    {
      title: 'The Goal',
      instruction: 'Your goal is to EMPTY YOUR HAND by playing cards to The Chain. First player with 0 cards wins!',
      highlight: 'hand',
      allowedAction: null,
    },
    {
      title: 'The Chain',
      instruction:
        'This is The Chain - the central play area. Cards connect end-to-end, left or right. It starts empty.',
      highlight: 'chain',
      allowedAction: null,
    },
    {
      title: 'Play Your First Card',
      instruction: 'Click on Ball-1 in your hand to select it.',
      highlight: 'hand',
      allowedAction: 'select-ball-1',
    },
    {
      title: 'Place the Card',
      instruction: 'Good! Now click RIGHT to place Ball-1 on the empty chain.',
      highlight: 'chain',
      allowedAction: 'play-right',
    },
    {
      title: 'Gravity Connects to Gravity',
      instruction:
        'Ball-1 is a Gravity card (●). Gravity can connect to: Gravity, Wiggle, or Chaos. Click Ball-2 to select it.',
      highlight: 'hand',
      allowedAction: 'select-ball-2',
    },
    {
      title: 'Connect Gravity to Gravity',
      instruction: 'Perfect! Ball-2 is also Gravity, so it CAN connect. Click RIGHT to place it.',
      highlight: 'chain',
      allowedAction: 'play-right',
    },
    {
      title: 'The Wiggle Bridge',
      instruction: 'Now select Wave-2 (a Wiggle card 〰). Wiggles are special - they connect to ANYTHING!',
      highlight: 'hand',
      allowedAction: 'select-wave-2',
    },
    {
      title: 'Universal Connection',
      instruction: 'Wiggles are universal bridges! Play Wave-2 to the RIGHT.',
      highlight: 'chain',
      allowedAction: 'play-right',
    },
    {
      title: '⚡ UNIFY BONUS! ⚡',
      instruction:
        "You just played next to a Wiggle card! When you play ADJACENT to a Wiggle, you can draw 2 bonus cards. This is optional. Click 'YES, UNIFY!' to accept.",
      highlight: null,
      allowedAction: 'unify-accept',
    },
    {
      title: 'Forces Are Different',
      instruction:
        "Now you have a Red Force (⚡). Forces CANNOT connect to Gravity! They can only connect to: Forces (max 2 in a row), Wiggles, or Chaos.",
      highlight: 'hand',
      allowedAction: null,
    },
    {
      title: 'Bridge with Wiggles',
      instruction:
        "Since Forces can't connect to Gravity, we need Wiggles to bridge them. Your Wave-2 is already bridging! Select Red Force.",
      highlight: 'hand',
      allowedAction: 'select-red-force',
    },
    {
      title: 'Connect Force to Wiggle',
      instruction: 'Good! Red Force CAN connect to Wave-2 (Wiggles accept everything). Click RIGHT to play it.',
      highlight: 'chain',
      allowedAction: 'play-right',
    },
    {
      title: "You're Ready!",
      instruction:
        "Excellent! You've learned:\n• Gravity connects to Gravity/Wiggle/Chaos\n• Forces connect to Force/Wiggle/Chaos (NOT Gravity)\n• Wiggles connect to ANYTHING\n• UNIFY bonus when playing next to Wiggles\n\nReady to play against AI?",
      highlight: null,
      allowedAction: null,
    },
  ];

  const handleTutorialAction = (action) => {
    const step = tutorialSteps[tutorialStep];

    if (step.allowedAction && action !== step.allowedAction) {
      setMessage('❌ Not quite! ' + step.instruction);
      return;
    }

    switch (action) {
      case 'select-ball-1': {
        const ball1 = playerHand.find((c) => c.type === 'gravity' && c.variant === 1);
        setSelectedCard(ball1 || null);
        setTutorialStep((s) => s + 1);
        break;
      }
      case 'select-ball-2': {
        const ball2 = playerHand.find((c) => c.type === 'gravity' && c.variant === 2);
        setSelectedCard(ball2 || null);
        setTutorialStep((s) => s + 1);
        break;
      }
      case 'select-wave-2': {
        const wave2 = playerHand.find((c) => c.type === 'wiggle' && c.variant === 2);
        setSelectedCard(wave2 || null);
        setTutorialStep((s) => s + 1);
        break;
      }
      case 'select-red-force': {
        const redForce = playerHand.find((c) => c.type === 'force' && c.color === 'red');
        setSelectedCard(redForce || null);
        setTutorialStep((s) => s + 1);
        break;
      }
      case 'play-right': {
        if (!selectedCard) {
          setMessage('Select a card first!');
          return;
        }

        // Play the selected card to the right in the tutorial
        setPlayerHand((prev) => prev.filter((c) => c.id !== selectedCard.id));
        const newChain = [...chain, selectedCard];
        setChain(newChain);

        // Check for UNIFY bonus
        const adjacentToWiggle = newChain.length >= 2 && newChain[newChain.length - 2].type === CARD_TYPES.WIGGLE;

        if (adjacentToWiggle && selectedCard.type !== CARD_TYPES.CHAOS) {
          setShowUnifyModal(true);
        } else {
          setSelectedCard(null);
          setTutorialStep((s) => s + 1);
        }
        break;
      }
      case 'unify-accept': {
        // draw 2 in tutorial
        if (deck.length >= 2) {
          const card1 = deck[0];
          const card2 = deck[1];
          setPlayerHand((prev) => [...prev, card1, card2]);
          setDeck((prev) => prev.slice(2));
        }
        setShowUnifyModal(false);
        setSelectedCard(null);
        setTutorialStep((s) => s + 1);
        break;
      }
      case 'next': {
        setTutorialStep((s) => s + 1);
        break;
      }
      case 'finish': {
        setGameState('menu');
        setShowUnifyModal(false);
        setSelectedCard(null);
        setMessage('');
        break;
      }
      default:
        break;
    }
  };

  const handleTutorialCardClick = (card) => {
    const step = tutorialSteps[tutorialStep];

    if (step.allowedAction?.startsWith('select-')) {
      if (step.allowedAction === 'select-ball-1' && card.type === 'gravity' && card.variant === 1) {
        handleTutorialAction('select-ball-1');
      } else if (step.allowedAction === 'select-ball-2' && card.type === 'gravity' && card.variant === 2) {
        handleTutorialAction('select-ball-2');
      } else if (step.allowedAction === 'select-wave-2' && card.type === 'wiggle' && card.variant === 2) {
        handleTutorialAction('select-wave-2');
      } else if (step.allowedAction === 'select-red-force' && card.type === 'force' && card.color === 'red') {
        handleTutorialAction('select-red-force');
      } else {
        setMessage('❌ Not quite! ' + step.instruction);
      }
    }
  };

  // Play card (normal game)
  const playCard = (card, position) => {
    const isPlayer = currentPlayer === 'player';
    const hand = isPlayer ? playerHand : aiHand;
    const setHand = isPlayer ? setPlayerHand : setAIHand;

    // Remove from hand
    const newHand = hand.filter((c) => c.id !== card.id);
    setHand(newHand);

    // Add to chain
    const newChain = position === 'left' ? [card, ...chain] : [...chain, card];
    setChain(newChain);

    // UNIFY bonus
    const adjacentToWiggle = isAdjacentToWiggle(newChain, position);

    if (adjacentToWiggle && isPlayer && card.type !== CARD_TYPES.CHAOS) {
      setShowUnifyModal(true);
      // pause turn until accept/decline
      return;
    } else if (adjacentToWiggle && !isPlayer && card.type !== CARD_TYPES.CHAOS) {
      // AI accepts UNIFY if hand < 5
      if (aiHand.length < 5) {
        drawCard(false);
        drawCard(false);
      }
    }

    // Hand limit (7)
    if (newHand.length > 7) {
      setMessage(`${isPlayer ? 'You have' : 'AI has'} ${newHand.length} cards. Must discard to 7!`);
      if (!isPlayer) {
        const toDiscard = newHand.length - 7;
        setHand(newHand.slice(toDiscard));
      }
    }

    // Win condition
    if (newHand.length === 0) {
      setWinner(isPlayer ? 'player' : 'ai');
      setGameState('ended');
      return;
    }

    endTurn();
  };

  const handleUnifyAccept = () => {
    drawCard(true);
    drawCard(true);
    setStats((prev) => ({ ...prev, unifyAccepted: prev.unifyAccepted + 1 }));
    setShowUnifyModal(false);

    // Hand limit check (best-effort message; state updates async)
    setMessage('UNIFY accepted! (Drew 2 cards)');
    endTurn();
  };

  const handleUnifyDecline = () => {
    setStats((prev) => ({ ...prev, unifyDeclined: prev.unifyDeclined + 1 }));
    setShowUnifyModal(false);
    setMessage('UNIFY declined.');
    endTurn();
  };

  const endTurn = () => {
    setSelectedCard(null);
    const nextPlayer = currentPlayer === 'player' ? 'ai' : 'player';
    setCurrentPlayer(nextPlayer);
    setTurnCount((t) => t + 1);

    if (nextPlayer === 'ai') {
      setMessage("AI's turn...");
      setTimeout(() => executeAITurn(), 800);
    } else {
      setMessage('Your turn! Select a card to play.');
    }
  };

  const executeAITurn = () => {
    // AI draws (skip on very first AI move)
    if (deck.length > 0 && turnCount > 1) {
      drawCard(false);
    }

    setTimeout(() => {
      const aiMove = getAIMove(aiHand, chain);

      if (!aiMove) {
        setMessage('AI passes (no legal moves).');
        setTimeout(() => endTurn(), 700);
        return;
      }

      playCard(aiMove.card, aiMove.position);
    }, 400);
  };

  const handleCardClick = (card) => {
    if (currentPlayer !== 'player') return;

    const isFirstTurn = turnCount === 1;

    // Draw card (skip on first turn per game rules)
    if (!isFirstTurn && deck.length > 0) {
      drawCard(true);
    }

    setSelectedCard(card);
    setMessage('Click LEFT or RIGHT to play this card.');
  };

  const handleChainEndClick = (position) => {
    if (!selectedCard || currentPlayer !== 'player') return;
    
    // FIX: Handle empty chain - any card can be played
    if (chain.length === 0) {
      playCard(selectedCard, position);
      return;
    }
    
    const endCard = position === 'left' ? chain[0] : chain[chain.length - 1];
    const consecutiveForces = countConsecutiveForces(chain, position);
    
    if (canConnectTo(selectedCard, endCard, consecutiveForces)) {
      playCard(selectedCard, position);
    } else {
      setMessage('Illegal play! Check connection rules.');
    }
  };
  

  const handlePass = () => {
    if (currentPlayer !== 'player') return;
    setMessage('You passed.');
    endTurn();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              EMUNI
            </h1>
            <p className="text-sm text-gray-400 font-mono">v4.0 • Emergent Unification</p>
          </div>
          {gameState === 'playing' && (
            <div className="text-right">
              <div className="text-2xl font-bold">Turn {turnCount}</div>
              <div className="text-sm text-gray-400">Deck: {deck.length} cards</div>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      {gameState === 'menu' && (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">Bridge the Incompatible</h2>
            <p className="text-xl text-gray-300 mb-2">Connect Gravity and Forces using Wiggles</p>
            <p className="text-sm text-gray-400">A physics-themed card game • 15-20 minutes</p>
          </div>

          <button
            onClick={startGame}
            className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-2xl font-bold hover:scale-105 transition-transform shadow-2xl"
          >
            PLAY vs AI
          </button>

          <button
            onClick={startTutorial}
            className="mt-4 px-12 py-4 bg-white/10 border-2 border-cyan-400 rounded-lg text-xl font-bold hover:bg-white/20 transition-all"
          >
            📚 TUTORIAL
          </button>

          <div className="mt-12 text-left bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-xl font-bold mb-4">Quick Rules:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                • <strong>Goal:</strong> Empty your hand first
              </li>
              <li>
                • <strong>Each turn:</strong> Draw 1 → Play 1 → End turn
              </li>
              <li>
                • <strong>Gravity</strong> connects to: Gravity, Wiggle, Chaos
              </li>
              <li>
                • <strong>Forces</strong> connect to: Force (max 2 in row), Wiggle, Chaos
              </li>
              <li>
                • <strong>Wiggles</strong> connect to: ANYTHING (universal bridge!)
              </li>
              <li>
                • <strong>UNIFY Bonus:</strong> Play adjacent to Wiggle? Draw 2 cards (optional)
              </li>
              <li>
                • <strong>Hand limit:</strong> 7 cards max
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tutorial */}
      {gameState === 'tutorial' && (
        <div className="max-w-7xl mx-auto">
          {/* Progress */}
          <div className="mb-6 bg-white/5 border border-cyan-400/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-400">
                Tutorial Progress: Step {tutorialStep + 1} of {tutorialSteps.length}
              </div>
              <button onClick={() => setGameState('menu')} className="text-sm text-gray-400 hover:text-white">
                Skip Tutorial →
              </button>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Instruction */}
          <div className="mb-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-3 text-cyan-400">{tutorialSteps[tutorialStep].title}</h2>
            <p className="text-lg text-white whitespace-pre-line mb-6">{tutorialSteps[tutorialStep].instruction}</p>

            {!tutorialSteps[tutorialStep].allowedAction && tutorialStep < tutorialSteps.length - 1 && (
              <button
                onClick={() => handleTutorialAction('next')}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold"
              >
                NEXT →
              </button>
            )}

            {tutorialStep === tutorialSteps.length - 1 && (
              <div className="flex gap-4">
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  START PLAYING!
                </button>
                <button
                  onClick={() => handleTutorialAction('finish')}
                  className="px-8 py-3 bg-white/10 border border-white/30 rounded-lg font-bold hover:bg-white/20"
                >
                  Back to Menu
                </button>
              </div>
            )}
          </div>

          {/* Chain */}
          <div className="mb-8">
            <div className="text-sm text-gray-400 mb-2">
              The Chain ({chain.length} cards)
              {tutorialSteps[tutorialStep].highlight === 'chain' && (
                <span className="ml-2 text-cyan-400 animate-pulse">← Look here!</span>
              )}
            </div>
            <div
              className={`
              bg-black/30 rounded-lg p-6 min-h-48 border-2 
              ${tutorialSteps[tutorialStep].highlight === 'chain' ? 'border-cyan-400 ring-4 ring-cyan-400/50' : 'border-white/10'}
            `}
            >
              <div className="flex gap-4 overflow-x-auto pb-4 items-center">
                <div className="flex-shrink-0 w-24 h-36 border-4 border-dashed rounded-lg flex items-center justify-center text-sm font-bold border-gray-600 bg-gray-800/20">
                  ← LEFT
                </div>

                {chain.length === 0 ? (
                  <div className="flex-1 text-center text-gray-500 py-12">Empty chain - play your first card!</div>
                ) : (
                  chain.map((card, idx) => <Card key={`${card.id}-${idx}`} card={card} disabled />)
                )}

                <button
                  onClick={() =>
                    tutorialSteps[tutorialStep].allowedAction === 'play-right' && handleTutorialAction('play-right')
                  }
                  disabled={tutorialSteps[tutorialStep].allowedAction !== 'play-right'}
                  className={`
                      flex-shrink-0 w-24 h-36 border-4 border-dashed rounded-lg
                      flex items-center justify-center text-sm font-bold
                      ${tutorialSteps[tutorialStep].allowedAction === 'play-right'
                        ? 'border-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 cursor-pointer animate-pulse' 
                        : 'border-gray-600 bg-gray-800/20'}
                    `}
                >
                  RIGHT →
                </button>
              </div>
            </div>
          </div>

          {/* Hand */}
          <div>
            <div className="text-sm text-gray-400 mb-2">
              Your Hand ({playerHand.length} cards)
              {tutorialSteps[tutorialStep].highlight === 'hand' && (
                <span className="ml-2 text-cyan-400 animate-pulse">← Look here!</span>
              )}
            </div>
            <div
              className={`
              flex gap-4 flex-wrap p-4 rounded-lg
              ${tutorialSteps[tutorialStep].highlight === 'hand' ? 'bg-cyan-400/10 border-2 border-cyan-400' : ''}
            `}
            >
              {playerHand.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handleTutorialCardClick(card)}
                  highlight={selectedCard?.id === card.id}
                />
              ))}
            </div>
          </div>

          {message && <div className="mt-4 text-center text-yellow-400 font-bold">{message}</div>}
        </div>
      )}

      {/* Playing */}
      {gameState === 'playing' && (
        <div className="max-w-7xl mx-auto">
          {/* Status */}
          <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-6 text-center">
            <div className="text-lg font-mono">{message}</div>
            <div className="text-sm text-gray-400 mt-2">
              Current player: <span className="font-bold text-cyan-400">{currentPlayer === 'player' ? 'YOU' : 'AI'}</span>
            </div>
          </div>

          {/* AI Hand */}
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">AI Hand: {aiHand.length} cards</div>
            <div className="flex gap-2">
              {aiHand.map((_, idx) => (
                <div
                  key={idx}
                  className="w-16 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg border-2 border-white/20"
                />
              ))}
            </div>
          </div>

          {/* Chain */}
          <div className="mb-8">
            <div className="text-sm text-gray-400 mb-2">The Chain ({chain.length} cards)</div>
            <div className="bg-black/30 rounded-lg p-6 min-h-48 border-2 border-white/10">
              <div className="flex gap-4 overflow-x-auto pb-4 items-center">
                <button
                  onClick={() => handleChainEndClick('left')}
                  disabled={!selectedCard || currentPlayer !== 'player'}
                  className={`flex-shrink-0 w-24 h-36 border-4 border-dashed rounded-lg flex items-center justify-center text-sm font-bold ${
                    selectedCard && currentPlayer === 'player'
                      ? 'border-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 cursor-pointer'
                      : 'border-gray-600 bg-gray-800/20'
                  }`}
                >
                  LEFT
                </button>

                {chain.length === 0 ? (
                  <div className="flex-1 text-center text-gray-500 py-12">Empty chain - play your first card!</div>
                ) : (
                  chain.map((card, idx) => <Card key={card.id + '-' + idx} card={card} disabled />)
                )}

                <button
                  onClick={() => handleChainEndClick('right')}
                  disabled={!selectedCard || currentPlayer !== 'player'}
                  className={`flex-shrink-0 w-24 h-36 border-4 border-dashed rounded-lg flex items-center justify-center text-sm font-bold ${
                    selectedCard && currentPlayer === 'player'
                      ? 'border-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 cursor-pointer'
                      : 'border-gray-600 bg-gray-800/20'
                  }`}
                >
                  RIGHT
                </button>
              </div>
            </div>
          </div>

          {/* Player Hand */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-400">Your Hand ({playerHand.length}/7 cards)</div>
              {currentPlayer === 'player' && (
                <button
                  onClick={handlePass}
                  className="px-4 py-2 bg-red-600/20 border border-red-500 rounded text-sm hover:bg-red-600/30"
                >
                  Pass (No Legal Moves)
                </button>
              )}
            </div>
            <div className="flex gap-4 flex-wrap">
              {playerHand.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handleCardClick(card)}
                  disabled={currentPlayer !== 'player'}
                  highlight={selectedCard?.id === card.id}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 text-xs text-gray-500 text-center font-mono">
            UNIFY: {stats.unifyAccepted} accepted • {stats.unifyDeclined} declined
          </div>
        </div>
      )}

      {/* End */}
      {gameState === 'ended' && (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">{winner === 'player' ? '🏆' : '🤖'}</div>
          <h2 className="text-4xl font-bold mb-4">{winner === 'player' ? 'YOU WIN!' : 'AI WINS!'}</h2>
          <div className="text-xl text-gray-300 mb-8">Game ended on turn {turnCount}</div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-8">
            <h3 className="text-lg font-bold mb-4">Final Stats:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Your cards: {playerHand.length}</div>
              <div>AI cards: {aiHand.length}</div>
              <div>Chain length: {chain.length}</div>
              <div>Total turns: {turnCount}</div>
              <div>UNIFY accepted: {stats.unifyAccepted}</div>
              <div>UNIFY declined: {stats.unifyDeclined}</div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-2xl font-bold hover:scale-105 transition-transform"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* UNIFY Modal */}
      {showUnifyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-900 border-4 border-cyan-400 rounded-xl p-8 max-w-md animate-pulse">
            <div className="text-4xl text-center mb-4">⚡ UNIFY! ⚡</div>
            <p className="text-xl text-center mb-6">You played adjacent to a Wiggle card!</p>
            <p className="text-center mb-8 text-gray-300">Draw 2 extra cards?</p>
            <div className="flex gap-4">
              <button
                onClick={gameState === 'tutorial' ? () => handleTutorialAction('unify-accept') : handleUnifyAccept}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
              >
                YES, UNIFY!
              </button>
              <button
                onClick={gameState === 'tutorial' ? () => {} : handleUnifyDecline}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold"
                disabled={gameState === 'tutorial'}
                title={gameState === 'tutorial' ? 'Tutorial requires accepting UNIFY here.' : undefined}
              >
                No, Skip
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">
              {gameState === 'tutorial'
                ? '💡 Tutorial: Click YES to continue learning!'
                : '💡 Tip: Decline in late game to empty your hand faster!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
