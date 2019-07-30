import './css/styles.css';
import PLAYER from './models/player';
import * as ctrl from './controller/playerCtrl';
import { dom } from './models/base';
import * as base from './models/base';
import * as dView from './views/dealerView';
import * as pView from './views/playerView';
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
        dView.renderInit(dealer.getOnHand());   // Render dealer's 2 cards 
        pView.renderCards(players);       // Render initial 2 cards for all players
        checkBlackjack();
        if (canDraw.length > 0) { // Dealer has no blackjack and some players may have blackjack.
          // canDrawId is needed to verify activate or not.
          canDrawId = canDraw.shift();

          // Add event to the buttons for each player and start the game. 
          // Four choice buttons are Surrender, Double, Hit, and Stay 
          setButtonsAndPlay();              
        } else timer = setTimeout(() => init(), delayTime)  // Show the result for 3 seconds.
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

function checkBlackjack() {
  if (dealer.hasBlackjack()) {    // Dealer has a blackjack. Game is over. 
    players.forEach((p, i) => {
      if (p.getInPlay()) {
        if (p.hasBlackjack()) p.setInitPlayer()   // Player has a blackjack, so even.
        else p.looseHand();       // Player does not have a blackjack, so loose.
      }
    })
    canDraw = [];
    message('Game over. Dealer has Blackjsck.');
  } else {                        // Dealer does not have a blackjack. Continue the game.
    players.forEach((p,i) => {
      if (p.getInPlay() && p.hasBlackjack()) {    // Player has a blackjack, so win.
        p.blackjack();
        pView.playerMSG('player-' + i, 'You got Blackjack. Wow!');
        const index = canDraw.indexOf(i);         
        if (index >= 0) canDraw.splice(index,1);  // Remove the player from the canDraw[]
      }
    })
  }
}

// Set Events to the playing options (Surrender, Double, Hit, and Stry).
function setButtonsAndPlay() {
  const surrender = document.querySelectorAll('.surrender');
  surrender.forEach(sr => {
    const i = sr.dataset.id;
    sr.addEventListener('click', () => {
      if (canDrawId == i) {       // Activate this event when canDrawId == player's ID
        players[i].surrender(); 
        pView.playerMSG('player-' + i, 'Player surrender.');
      }
    });
  });

  const double = document.querySelectorAll('.double');
  double.forEach(d => {
    const i = d.dataset.id;
    d.addEventListener('click', () => {
      if (canDrawId == i) {       // Activate this event when canDrawId == player's ID
        if (players[i].getOnHand().length > 2) {
          message('Not allowed DOUBLE after 3rd card drawn.');
        } else {
          players[i].setBetting(players[i].getBetting() * 2); // Reset betAmt double.
          drawCard(players[i]);
          pView.renderPlayerScore(players[i], i);
          pView.renderLastCard(players[i].lastCard(), i);
          pView.playerMSG('player-' + i, 'Double bet for this hand.');
          }
      }
    });
  });
}
