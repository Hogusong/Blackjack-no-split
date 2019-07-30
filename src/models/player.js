export default class PLAYER {
  constructor(name, amount, inPlay=false) {
    this.name = name;
    this.amount = amount;
    this.onHand = [];               // store player's cards on hand.
    this.countAces = 0;             // store how many Aces on hand.
    this.betting = 5;
    this.inPlay = inPlay;             // track player joined the game or not.
    this.prevResult = 'New player'; // to say the last hand's result.
  }

  getName() {  return this.name;  }
  getAmount() {  return this.amount;  }
  getBetting() {  return this.betting;  }
  getOnHand() {  return this.onHand;  }
  getCountAces() {  return this.countAces;  }
  getInPlay() {  return  this.inPlay;  }
  getPrevResult() {  return this.prevResult;  }
  getScore() {
    let score = 0;
    this.onHand.forEach(card => score += card.getValue());
    let count = this.countAces;
    while (score > 21 && count-- > 0) score -= 10;
    return score;
  }
  lastCard() {  return this.onHand[this.onHand.length-1];  }

  setInPlay(status) { this.inPlay = status;  }
  setBetting(amt) {  this.betting = amt;  }
  setPrevResult(status) { this.prevResult = status; }
  emptyOnHand() { 
    this.onHand = []; 
    this.countAces = 0;
  }
  addOnHand(card) {
    if (card.getKey() === 'A') this.countAces++;
    this.onHand.push(card);
  }
  surrender() {
    this.amount -= this.betting / 2;
    this.prevResult = 'Surrendered';
    this.setInitPlayer();
  }
  looseHand() {
    this.amount -= this.betting;
    this.prevResult = 'Lost hand'
    this.setInitPlayer();
  }
  blackjack() {
    this.amount += this.betting * 1.5;
    this.prevResult = 'Had Blackjack';
    this.setInitPlayer();
  }
  winHand() {
    this.amount += this.betting;
    this.prevResult = "Won hand"
    this.setInitPlayer();
  }
  evenHand() {
    this.prevResult = "Even hand"
    this.setInitPlayer();
  }
  setInitPlayer() {
    this.onHand = [];
    this.countAces = 0;
    this.inPlay = false;
  }
  hasBlackjack() {
    if (this.onHand.length > 2) return false;
    let index = this.onHand.findIndex(card => card.getKey() === 'A');
    if (index < 0) return false;
    index = index < 1 ? 1 : 0;
    return this.onHand[index].getValue() === 10;
  }
}
