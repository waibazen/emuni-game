#!/usr/bin/env node

/**
 * EmUni Game Stress Test
 * Tests various game scenarios to ensure stability
 */

const CARD_TYPES = {
  GRAVITY: 'gravity',
  FORCE: 'force',
  WIGGLE: 'wiggle',
  CHAOS: 'chaos',
};

const FORCE_COLORS = ['red', 'blue', 'yellow', 'green'];
const CHAOS_TYPES = ['squish', 'gauge-break', 'big-bang'];

// Create the 54-card deck
function createDeck() {
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
}

function canConnectTo(card, chainEndCard, consecutiveForces) {
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

  return true;
}

function countConsecutiveForces(chain, fromEnd = 'right') {
  if (chain.length === 0) return 0;

  let count = 0;
  const cards = fromEnd === 'right' ? [...chain].reverse() : chain;

  for (const card of cards) {
    if (card.type === CARD_TYPES.FORCE) count++;
    else break;
  }

  return count;
}

function isAdjacentToWiggle(chain, position, playedCard) {
  if (chain.length < 2) return false;

  // Don't trigger UNIFY when playing Wiggle itself or Chaos
  if (playedCard.type === CARD_TYPES.WIGGLE || playedCard.type === CARD_TYPES.CHAOS) {
    return false;
  }

  if (position === 'left') {
    return chain[1].type === CARD_TYPES.WIGGLE;
  } else {
    return chain[chain.length - 2].type === CARD_TYPES.WIGGLE;
  }
}

// Test Suite
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.log(`❌ FAIL: ${testName}`);
    testsFailed++;
  }
}

console.log('\n🧪 EMUNI STRESS TEST - STARTING\n');
console.log('='.repeat(60));

// TEST 1: Deck Composition
console.log('\n📦 DECK COMPOSITION TESTS');
console.log('-'.repeat(60));
const deck = createDeck();
assert(deck.length === 54, 'Deck has exactly 54 cards');
assert(deck.filter(c => c.type === 'gravity').length === 18, '18 Gravity cards');
assert(deck.filter(c => c.type === 'force').length === 12, '12 Force cards');
assert(deck.filter(c => c.type === 'wiggle').length === 18, '18 Wiggle cards');
assert(deck.filter(c => c.type === 'chaos').length === 6, '6 Chaos cards');

// TEST 2: Connection Rules
console.log('\n🔗 CONNECTION RULES TESTS');
console.log('-'.repeat(60));

const ball1 = { type: 'gravity', name: 'Ball-1' };
const ball2 = { type: 'gravity', name: 'Ball-2' };
const wave1 = { type: 'wiggle', name: 'Wave-1' };
const redForce = { type: 'force', name: 'Red Force', color: 'red' };
const blueForce = { type: 'force', name: 'Blue Force', color: 'blue' };
const yellowForce = { type: 'force', name: 'Yellow Force', color: 'yellow' };
const squish = { type: 'chaos', name: 'Squish!', chaosType: 'squish' };

// Empty chain accepts anything
assert(canConnectTo(ball1, null, 0), 'Empty chain accepts Gravity');
assert(canConnectTo(redForce, null, 0), 'Empty chain accepts Force');
assert(canConnectTo(wave1, null, 0), 'Empty chain accepts Wiggle');
assert(canConnectTo(squish, null, 0), 'Empty chain accepts Chaos');

// Gravity end connections
assert(canConnectTo(ball2, ball1, 0), 'Gravity accepts Gravity');
assert(canConnectTo(wave1, ball1, 0), 'Gravity accepts Wiggle');
assert(canConnectTo(squish, ball1, 0), 'Gravity accepts Chaos');
assert(!canConnectTo(redForce, ball1, 0), 'Gravity REJECTS Force');

// Force end connections
assert(canConnectTo(blueForce, redForce, 1), 'Force accepts 2nd Force (consecutive=1)');
assert(!canConnectTo(yellowForce, blueForce, 2), 'Force REJECTS 3rd Force (consecutive=2)');
assert(!canConnectTo(ball1, redForce, 1), 'Force REJECTS Gravity');
assert(canConnectTo(wave1, redForce, 1), 'Force accepts Wiggle');
assert(canConnectTo(squish, redForce, 2), 'Force accepts Chaos (even after 2 Forces)');

// Wiggle end connections (universal)
assert(canConnectTo(ball1, wave1, 0), 'Wiggle accepts Gravity');
assert(canConnectTo(redForce, wave1, 0), 'Wiggle accepts Force');
assert(canConnectTo(wave1, wave1, 0), 'Wiggle accepts Wiggle');
assert(canConnectTo(squish, wave1, 0), 'Wiggle accepts Chaos');

// TEST 3: Consecutive Forces Counting
console.log('\n⚡ CONSECUTIVE FORCES TESTS');
console.log('-'.repeat(60));

const chain1 = [ball1, redForce, blueForce, wave1, yellowForce];
assert(countConsecutiveForces(chain1, 'right') === 1, 'Right: Count 1 Force correctly');
assert(countConsecutiveForces(chain1, 'left') === 0, 'Left: Count 0 Forces (Gravity at start)');

const chain2 = [ball1, wave1, redForce, blueForce];
assert(countConsecutiveForces(chain2, 'right') === 2, 'Right: Count 2 consecutive Forces');
assert(countConsecutiveForces(chain2, 'left') === 0, 'Left: Count 0 (Gravity at start)');

const chain3 = [redForce, blueForce, ball1];
assert(countConsecutiveForces(chain3, 'right') === 0, 'Right: Count 0 (Gravity at end)');
assert(countConsecutiveForces(chain3, 'left') === 2, 'Left: Count 2 Forces at start');

// TEST 4: UNIFY Adjacency Detection
console.log('\n⚡ UNIFY ADJACENCY TESTS');
console.log('-'.repeat(60));

const unifyChain1 = [ball1, wave1, ball2];
assert(isAdjacentToWiggle(unifyChain1, 'right', ball2), 'UNIFY: Gravity next to Wiggle (right)');

const unifyChain2 = [ball1, wave1, redForce];
assert(isAdjacentToWiggle(unifyChain2, 'right', redForce), 'UNIFY: Force next to Wiggle (right)');

const unifyChain3 = [ball1, wave1];
assert(!isAdjacentToWiggle(unifyChain3, 'right', wave1), 'NO UNIFY: Playing Wiggle itself');

const unifyChain4 = [ball1, wave1, squish];
assert(!isAdjacentToWiggle(unifyChain4, 'right', squish), 'NO UNIFY: Playing Chaos card');

const unifyChain5 = [ball1, ball2];
assert(!isAdjacentToWiggle(unifyChain5, 'right', ball2), 'NO UNIFY: Not adjacent to Wiggle');

const unifyChain6 = [ball1, wave1, ball2];
assert(isAdjacentToWiggle(unifyChain6, 'left', ball1), 'UNIFY: Playing to LEFT next to Wiggle');

// TEST 5: Chaos Card Distribution
console.log('\n💥 CHAOS CARD TESTS');
console.log('-'.repeat(60));

const chaosCards = deck.filter(c => c.type === 'chaos');
const squishCards = chaosCards.filter(c => c.chaosType === 'squish');
const gaugeBreakCards = chaosCards.filter(c => c.chaosType === 'gauge-break');
const bigBangCards = chaosCards.filter(c => c.chaosType === 'big-bang');

assert(squishCards.length === 2, 'Exactly 2 Squish! cards');
assert(gaugeBreakCards.length === 2, 'Exactly 2 Gauge-Break! cards');
assert(bigBangCards.length === 2, 'Exactly 2 Big Bang! cards');

// TEST 6: Stress Test - Complex Chain
console.log('\n🔥 STRESS TEST - COMPLEX CHAINS');
console.log('-'.repeat(60));

// Build a complex valid chain
const complexChain = [
  ball1,      // Gravity
  wave1,      // Wiggle (universal)
  redForce,   // Force (can connect to Wiggle)
  blueForce,  // Force (2nd consecutive)
  wave1,      // Wiggle (breaks Force chain)
  ball2,      // Gravity (can connect to Wiggle)
  ball1,      // Gravity (can connect to Gravity)
  wave1,      // Wiggle (can connect to anything)
  yellowForce // Force (can connect to Wiggle)
];

// Verify each connection is valid
let complexChainValid = true;
for (let i = 1; i < complexChain.length; i++) {
  const prevCard = complexChain[i - 1];
  const currentCard = complexChain[i];
  const forces = countConsecutiveForces(complexChain.slice(0, i), 'right');

  if (!canConnectTo(currentCard, prevCard, forces)) {
    complexChainValid = false;
    console.log(`Invalid connection at position ${i}: ${prevCard.name} -> ${currentCard.name}`);
  }
}
assert(complexChainValid, 'Complex 9-card chain is valid');

// TEST 7: Edge Cases
console.log('\n⚠️  EDGE CASE TESTS');
console.log('-'.repeat(60));

// Single card chain
const singleChain = [ball1];
assert(countConsecutiveForces(singleChain, 'right') === 0, 'Single Gravity card: 0 Forces');
assert(countConsecutiveForces([redForce], 'right') === 1, 'Single Force card: 1 Force');

// All Forces chain
const allForcesChain = [redForce, blueForce];
assert(countConsecutiveForces(allForcesChain, 'right') === 2, 'All Forces chain counted correctly');

// Can we add 3rd Force? (should be NO)
const thirdForceAttempt = canConnectTo(yellowForce, blueForce, 2);
assert(!thirdForceAttempt, 'Cannot add 3rd consecutive Force');

// All Wiggles chain
const allWigglesChain = [wave1, wave1, wave1];
assert(canConnectTo(wave1, wave1, 0), 'Wiggles chain is valid');

// UNIFY edge case - chain too short
const shortChain = [ball1];
assert(!isAdjacentToWiggle(shortChain, 'right', ball1), 'UNIFY: Chain too short (<2 cards)');

// TEST 8: Card Type Distribution
console.log('\n📊 DISTRIBUTION VERIFICATION');
console.log('-'.repeat(60));

const gravityVariants = [1, 2, 3];
gravityVariants.forEach(variant => {
  const count = deck.filter(c => c.type === 'gravity' && c.variant === variant).length;
  assert(count === 6, `Ball-${variant}: exactly 6 cards`);
});

const wiggleVariants = [1, 2, 3];
wiggleVariants.forEach(variant => {
  const count = deck.filter(c => c.type === 'wiggle' && c.variant === variant).length;
  assert(count === 6, `Wave-${variant}: exactly 6 cards`);
});

FORCE_COLORS.forEach(color => {
  const count = deck.filter(c => c.type === 'force' && c.color === color).length;
  assert(count === 3, `${color} Force: exactly 3 cards`);
});

// Final Report
console.log('\n' + '='.repeat(60));
console.log('📋 STRESS TEST RESULTS');
console.log('='.repeat(60));
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📊 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log('='.repeat(60));

if (testsFailed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Game logic is solid.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  SOME TESTS FAILED! Please review the failures above.\n');
  process.exit(1);
}
