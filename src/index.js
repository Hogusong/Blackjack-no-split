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
  console.log(players);
  settingPlayer(players);         // Show available players in the table
  dom.dScore.innerText = ' -- last score : ' + dealer.getScore();

  dom.btnAdd.onclick = () => {
    inAddOrRemove = true;
    ctrl.addPlayer(players, init);
  }
}