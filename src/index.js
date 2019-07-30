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

  inAddOrRemove = false;          // to control buttons -> Start game, Add, Remove
  gameStarted = false;            // to control the status for in Game or not.
  settingPlayer(players);         // Show available players in the table
  dom.dScore.innerText = ' -- last score : ' + dealer.getScore();

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