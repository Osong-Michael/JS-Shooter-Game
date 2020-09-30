import Phaser from '../phaser';
import * as Helper from '../helpers/buttonHelpers';
import * as ScoreLogic from '../helpers/scoreLogic';
import Background from '../../assets/images/baseBg.png';
import buttonUp from '../../assets/images/buttonUp.png';

export default class GameOver extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  preload() {
    this.load.image('GOendBG', Background);
    this.load.image('btnUP', buttonUp);
  }


  init(data) {
    this.gameScore = data.gameScore;
  }


  create() {
    this.add.image(260, 400, 'GOendBG');

    this.addText(200, 'GAME OVER', 45);

    this.addText(300, `Your score: ${this.gameScore}`, 25);

    ScoreLogic.createNameInput();

    this.btnSubmit = this.add.sprite(
      this.game.config.width * 0.5,
      370,
      'btnUP',
    );
    // eslint-disable-next-line max-len
    Helper.addButtonFunctionality(this, this.btnSubmit, () => ScoreLogic.handleScore(this, this.gameScore));
    Helper.addButtonText(this, 370, 'Submit score');
  }

  addText(y, text, size) {
    this.add.text(
      this.game.config.width * 0.5,
      y,
      text,
      {
        fontFamily: 'monospace',
        fontSize: size,
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      },
    ).setOrigin(0.5);
  }
}