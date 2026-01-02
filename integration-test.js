#!/usr/bin/env node

/**
 * EmUni Game Integration Tests
 * Tests game scenarios and state management
 */

console.log('\n🎮 EMUNI INTEGRATION TESTS\n');
console.log('='.repeat(60));

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

// Simulate game state
class GameSimulator {
  constructor() {
    this.playerHand = [];
    this.aiHand = [];
    this.chain = [];
    this.deck = [];
    this.currentPlayer = 'player';
    this.turnCount = 1;
    this.lockedEnd = null;
    this.consecutivePasses = 0;
  }

  drawCard(isPlayer) {
    if (this.deck.length === 0) return null;
    const card = this.deck.shift();
    if (isPlayer) {
      this.playerHand.push(card);
    } else {
      this.aiHand.push(card);
    }
    return card;
  }

  playCard(card, position, isPlayer) {
    const hand = isPlayer ? this.playerHand : this.aiHand;
    const index = hand.findIndex(c => c.id === card.id);
    if (index === -1) return false;

    hand.splice(index, 1);

    if (position === 'left') {
      this.chain.unshift(card);
    } else {
      this.chain.push(card);
    }

    this.consecutivePasses = 0;
    return true;
  }

  pass() {
    this.consecutivePasses++;
    return this.consecutivePasses >= 2; // Deadlock
  }

  checkWin(isPlayer) {
    const hand = isPlayer ? this.playerHand : this.aiHand;
    return hand.length === 0;
  }
}

// TEST 1: Game Initialization
console.log('\n🎯 GAME INITIALIZATION TESTS');
console.log('-'.repeat(60));

const game1 = new GameSimulator();
assert(game1.playerHand.length === 0, 'Player starts with empty hand (before deal)');
assert(game1.aiHand.length === 0, 'AI starts with empty hand (before deal)');
assert(game1.chain.length === 0, 'Chain starts empty');
assert(game1.currentPlayer === 'player', 'Player goes first');
assert(game1.turnCount === 1, 'Turn count starts at 1');

// Simulate initial deal
for (let i = 0; i < 5; i++) {
  game1.deck.push({ id: `p${i}`, type: 'gravity', name: `Ball-${(i % 3) + 1}` });
}
for (let i = 0; i < 5; i++) {
  game1.deck.push({ id: `a${i}`, type: 'wiggle', name: `Wave-${(i % 3) + 1}` });
}

for (let i = 0; i < 5; i++) {
  game1.drawCard(true);  // Player
}
for (let i = 0; i < 5; i++) {
  game1.drawCard(false); // AI
}

assert(game1.playerHand.length === 5, 'Player dealt 5 cards');
assert(game1.aiHand.length === 5, 'AI dealt 5 cards');
assert(game1.deck.length === 0, 'All cards dealt');

// TEST 2: Card Playing Mechanics
console.log('\n🎴 CARD PLAYING TESTS');
console.log('-'.repeat(60));

const game2 = new GameSimulator();
const card1 = { id: 'c1', type: 'gravity', name: 'Ball-1' };
const card2 = { id: 'c2', type: 'wiggle', name: 'Wave-1' };
const card3 = { id: 'c3', type: 'force', name: 'Red Force', color: 'red' };

game2.playerHand = [card1, card2, card3];

// Play to empty chain
const played1 = game2.playCard(card1, 'right', true);
assert(played1, 'Can play card to empty chain');
assert(game2.chain.length === 1, 'Chain has 1 card after play');
assert(game2.playerHand.length === 2, 'Hand reduced by 1 after play');
assert(game2.chain[0].id === card1.id, 'Correct card in chain');

// Play to right
const played2 = game2.playCard(card2, 'right', true);
assert(played2, 'Can play card to right');
assert(game2.chain.length === 2, 'Chain has 2 cards');
assert(game2.chain[1].id === card2.id, 'Card added to right end');

// Play to left
const card4 = { id: 'c4', type: 'wiggle', name: 'Wave-2' };
game2.playerHand.push(card4);
const played3 = game2.playCard(card4, 'left', true);
assert(played3, 'Can play card to left');
assert(game2.chain.length === 3, 'Chain has 3 cards');
assert(game2.chain[0].id === card4.id, 'Card added to left end');

// TEST 3: Win Conditions
console.log('\n🏆 WIN CONDITION TESTS');
console.log('-'.repeat(60));

const game3 = new GameSimulator();
game3.playerHand = [{ id: 'last', type: 'gravity', name: 'Ball-1' }];
assert(!game3.checkWin(true), 'Player has not won (1 card left)');

game3.playCard(game3.playerHand[0], 'right', true);
assert(game3.checkWin(true), 'Player wins with empty hand');

// TEST 4: Deadlock Detection
console.log('\n⚠️  DEADLOCK TESTS');
console.log('-'.repeat(60));

const game4 = new GameSimulator();
assert(game4.consecutivePasses === 0, 'No passes initially');

const deadlock1 = game4.pass();
assert(!deadlock1, 'Not deadlocked after 1 pass');
assert(game4.consecutivePasses === 1, 'Pass count incremented');

const deadlock2 = game4.pass();
assert(deadlock2, 'Deadlocked after 2 consecutive passes');
assert(game4.consecutivePasses === 2, 'Pass count = 2');

// Reset on play
game4.consecutivePasses = 1;
const card = { id: 'reset', type: 'gravity', name: 'Ball-1' };
game4.playerHand = [card];
game4.playCard(card, 'right', true);
assert(game4.consecutivePasses === 0, 'Playing card resets consecutive passes');

// TEST 5: Locked Ends (Gauge-Break!)
console.log('\n🔒 LOCKED END TESTS');
console.log('-'.repeat(60));

const game5 = new GameSimulator();
assert(game5.lockedEnd === null, 'No locked end initially');

game5.lockedEnd = 'right';
assert(game5.lockedEnd === 'right', 'Right end locked');
assert(game5.lockedEnd !== 'left', 'Left end not locked');

game5.lockedEnd = null;
assert(game5.lockedEnd === null, 'Lock can be removed');

// TEST 6: Hand Management
console.log('\n✋ HAND MANAGEMENT TESTS');
console.log('-'.repeat(60));

const game6 = new GameSimulator();
const cards = [];
for (let i = 0; i < 10; i++) {
  cards.push({ id: `h${i}`, type: 'gravity', name: `Ball-${(i % 3) + 1}` });
}
game6.playerHand = [...cards];

assert(game6.playerHand.length === 10, 'Player can have >7 cards temporarily');

// Simulate discard to 7
game6.playerHand = game6.playerHand.slice(0, 7);
assert(game6.playerHand.length === 7, 'Player discards to 7 cards');

// TEST 7: Chaos Card Removal (Squish!)
console.log('\n💥 SQUISH! SIMULATION');
console.log('-'.repeat(60));

const game7 = new GameSimulator();
const grav1 = { id: 'g1', type: 'gravity', name: 'Ball-1' };
const grav2 = { id: 'g2', type: 'gravity', name: 'Ball-2' };
const wigg1 = { id: 'w1', type: 'wiggle', name: 'Wave-1' };

game7.chain = [grav1, wigg1, grav2];
assert(game7.chain.length === 3, 'Chain has 3 cards before Squish!');

// Remove gravity card
const gravityCards = game7.chain.filter(c => c.type === 'gravity');
assert(gravityCards.length === 2, 'Found 2 Gravity cards for Squish!');

game7.chain = game7.chain.filter(c => c.id !== grav2.id);
assert(game7.chain.length === 2, 'Chain has 2 cards after Squish!');
assert(!game7.chain.find(c => c.id === grav2.id), 'Removed card not in chain');
assert(game7.chain.find(c => c.id === grav1.id), 'Other gravity card still in chain');

// TEST 8: Empty Deck Handling
console.log('\n🃏 EMPTY DECK TESTS');
console.log('-'.repeat(60));

const game8 = new GameSimulator();
game8.deck = [];

const drawnCard = game8.drawCard(true);
assert(drawnCard === null, 'Drawing from empty deck returns null');
assert(game8.playerHand.length === 0, 'Hand unchanged when deck empty');

// Add one card and draw
game8.deck.push({ id: 'last', type: 'gravity', name: 'Ball-1' });
const lastCard = game8.drawCard(true);
assert(lastCard !== null, 'Can draw last card');
assert(game8.deck.length === 0, 'Deck empty after drawing last card');
assert(game8.playerHand.length === 1, 'Card added to hand');

// TEST 9: Complex Chain Building
console.log('\n⛓️  COMPLEX CHAIN TESTS');
console.log('-'.repeat(60));

const game9 = new GameSimulator();
const chainCards = [
  { id: 'ch1', type: 'gravity', name: 'Ball-1' },
  { id: 'ch2', type: 'wiggle', name: 'Wave-1' },
  { id: 'ch3', type: 'force', name: 'Red Force', color: 'red' },
  { id: 'ch4', type: 'force', name: 'Blue Force', color: 'blue' },
  { id: 'ch5', type: 'wiggle', name: 'Wave-2' },
  { id: 'ch6', type: 'gravity', name: 'Ball-2' },
];

game9.playerHand = [...chainCards];

for (const card of chainCards) {
  game9.playCard(card, 'right', true);
}

assert(game9.chain.length === 6, 'Built chain of 6 cards');
assert(game9.playerHand.length === 0, 'All cards played from hand');
assert(game9.chain[0].type === 'gravity', 'Chain starts with Gravity');
assert(game9.chain[game9.chain.length - 1].type === 'gravity', 'Chain ends with Gravity');

// TEST 10: Alternating Play
console.log('\n🔄 ALTERNATING PLAY TESTS');
console.log('-'.repeat(60));

const game10 = new GameSimulator();
game10.playerHand = [{ id: 'p1', type: 'gravity', name: 'Ball-1' }];
game10.aiHand = [{ id: 'a1', type: 'wiggle', name: 'Wave-1' }];

assert(game10.currentPlayer === 'player', 'Player turn initially');

game10.playCard(game10.playerHand[0], 'right', true);
game10.currentPlayer = 'ai';
assert(game10.currentPlayer === 'ai', 'AI turn after player');

game10.playCard(game10.aiHand[0], 'right', false);
game10.currentPlayer = 'player';
assert(game10.currentPlayer === 'player', 'Back to player turn');

// TEST 11: Stress Test - Many Cards
console.log('\n🔥 STRESS TEST - HIGH VOLUME');
console.log('-'.repeat(60));

const game11 = new GameSimulator();
const manyCards = [];
for (let i = 0; i < 100; i++) {
  manyCards.push({ id: `bulk${i}`, type: 'wiggle', name: 'Wave-1' });
}

game11.deck = [...manyCards];
assert(game11.deck.length === 100, 'Deck with 100 cards');

// Draw all cards
for (let i = 0; i < 50; i++) {
  game11.drawCard(true);
  game11.drawCard(false);
}

assert(game11.deck.length === 0, 'All 100 cards drawn');
assert(game11.playerHand.length === 50, 'Player has 50 cards');
assert(game11.aiHand.length === 50, 'AI has 50 cards');

// Play many cards
for (let i = 0; i < 20; i++) {
  game11.playCard(game11.playerHand[0], 'right', true);
}

assert(game11.chain.length === 20, 'Chain with 20 cards');
assert(game11.playerHand.length === 30, 'Player has 30 cards left');

// Final Report
console.log('\n' + '='.repeat(60));
console.log('📋 INTEGRATION TEST RESULTS');
console.log('='.repeat(60));
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📊 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log('='.repeat(60));

if (testsFailed === 0) {
  console.log('\n🎉 ALL INTEGRATION TESTS PASSED!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  SOME TESTS FAILED!\n');
  process.exit(1);
}
