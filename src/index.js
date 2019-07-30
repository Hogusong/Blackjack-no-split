import './css/styles.css';
import PLAYER from './models/player';
import * as ctrl from './controller/playerCtrl';
import { dom } from './models/base';
import * as base from './models/base';
import { settingPlayer } from './views/initialView';

let players = ctrl.createPlayers();     // Get players' infomation from the LocalStorage.
const dealer = new PLAYER('Dealer', 100000000, true);   // Create the dealer.
let cards = base.shuffleCards();
let inAddOrRemove = false, gameStarted = false;
let canDraw = [], canDrawId = null, timer, delayTime = 3000;
 
init();

function init() {
  // Update player's data in LocalStorage after each game done.
  if (gameStarted) ctrl.storeInStorage(players); 

  inAddOrRemove = false;          // to control buttons -> Start game, Add, Remove
  gameStarted = false;            // to control the status for in Game or not.
  settingPlayer(players);         // Show available players in the table
  dom.dScore.innerText = ' -- last score : ' + dealer.getScore();

  dom.btnStart.onclick = () => {
    if (base.canAcceptClick(gameStarted, inAddOrRemove)) {
      createCanDraw();            // Check the players who joined the game.
      if (canDraw.length < 1) {
        message('Wait until players join the game!');
      } else {
        gameStarted = true;       // Set the status in-game mode.
        initialDraw()             // Draw 2 cards for dealer and all in-play players
        console.log(players);
      }
    }
  }

  dom.btnAdd.onclick = () => {
    if (base.canAcceptClick(gameStarted, inAddOrRemove)) {
      inAddOrRemove = true;
      ctrl.addPlayer(players, init);
    }
  }

  dom.btnRemove.onclick = () => {
    if (base.canAcceptClick(gameStarted, inAddOrRemove)) {
      if (players.length > 0) {
      inAddOrRemove = true;
      ctrl.removePlayer(players, init);
      } else message('There is no player in this table.')
    }
  }

  // Add an Event to the in-play button. Let players join the game.
  const inplay = document.querySelectorAll('.inplay');
  inplay.forEach((P, i) => {
    P.addEventListener('click', () => {
      const betAmt = +document.getElementById('bet-amt-'+i).value;
      if (betAmt < 5) {
        message('Betting amount is too low.')
      } else {
        players[i].setBetting(betAmt);    // Reset the betting amount for each game
        players[i].setInPlay(true);    // Reset player.inplay : false -> true
        init();
      }
    })
  });
  // Add an event to the stay-out button. Let players stay out of the game.
  const stayout = document.querySelectorAll('.stayout');
  stayout.forEach((S, i) => {
    S.addEventListener('click', () => {
      if (players[i].getInPlay()) {
        players[i].setInPlay(false);    // Reset player.inplay : true -> false
        init();
      }
    })
  })
}

// Collect valid players in the 'canDraw' to control drawing card.
function createCanDraw() {
  canDraw = [];
  players.forEach((p,i) => {
    if (p.getInPlay()) canDraw.push(i);
    else p.setPrevResult("didn't play");
  });
}

function initialDraw() {
  // Shuffe cards again when too little cards left as avaiable.
  if (cards.length < 24) cards = base.shuffleCards();
  dealer.emptyOnHand();         // Make empty the dealer's onHand[].
  dom.dScore.innerText = '';

  drawCard(dealer)
  players.forEach(player => drawCard(player));
  drawCard(dealer)
  players.forEach(player => drawCard(player));
}

function drawCard(player) {
  if (!player.getInPlay()) return;
  const card = cards.pop();
  player.addOnHand(card);      // Add the drawn card to the player's hand.
}
