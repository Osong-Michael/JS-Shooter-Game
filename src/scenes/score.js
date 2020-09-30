import Phaser from '../phaser';
import { getGameScores } from '../helpers/scoreLogic';
import Background from '../../assets/images/baseBg.png';
import buttonUp from '../../assets/images/buttonUp.png';
import backBtn from '../../assets/images/return.png'

export default class Score extends Phaser.Scene {
  constructor() {
    super('Score');
  }

  preload() {
    this.load.image('endBG', Background);
    this.load.image('SbtnUP', buttonUp);
    this.load.image('returnBtn', backBtn);
  }

  create() {

    this.add.image(260, 440, 'endBG');

    this.add.text(
      this.game.config.width * 0.5,
      70,
      'Leaders Board', {
        fontSize: 28,
        fontFamily: 'monospace',
      },
    ).setOrigin(0.5);


    this.returnButton = this.add.sprite(
      this.game.config.width * 0.5,
      this.game.config.height * 0.9,
      "returnBtn",
    );
    
    this.returnButton.setInteractive();
    
    this.returnButton.on("pointerdown", () => {
      this.scene.start('StartScreen');
    }, this);

    this.setUpScores();
  }

  async setUpScores() {
    const resultObject = await getGameScores();

    if (Array.isArray(resultObject.result)) {
      this.scores = resultObject.result.sort((a, b) => ((a.score > b.score) ? -1 : 1));

      for (let i = 0; i < 10; i += 1) {
        const y = 150 + (30 * i);

        this.addText(150, y, this.scores[i].user);
        this.addText(400, y, this.scores[i].score);
      }
    } else {
      this.addText(150, 160, resultObject);
    }
  }

  addText(x, y, text) {
    this.add.text(
      x,
      y,
      text,
      {
        fontFamily: 'monospace',
        fontSize: 15,
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      },
    ).setOrigin(0.5);
  }
}
