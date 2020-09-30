import Phaser from '../phaser.js';
import playBtn from '../../assets/images/playButton.png';
import leadBtn from '../../assets/images/leadersBoardButton.png';
import sound from '../../assets/audio/sndBtn.wav';
import Background from '../../assets/images/baseBg.png';

export default class StartScreen extends Phaser.Scene {
	constructor() {
		super({ key: "StartScreen" });
  }
  
  preload() {
    this.load.image('sprBtnPlay', playBtn);
    this.load.image('bgStart', Background);
    this.load.image('ldBtn', leadBtn);
  
    this.load.audio('sndBtn', sound);
  }

  create() {
    this.sfx = {
      btn: this.sound.add('sndBtn')
    };

    this.add.image(260, 400, 'bgStart');

    this.textTitle = this.add.text(
      this.game.config.width * 0.5,
      64,
      "KILL'EM ALL",
      {
        fontFamily: 'monospace',
        fontSize: 32,
        align: "center"
      }
    );
    this.textTitle.setOrigin(0.5);    

    this.btnPlay = this.add.sprite(
      this.game.config.width * 0.5,
      this.game.config.height * 0.5,
      "sprBtnPlay",
    );
    this.btnPlay.setInteractive();

    this.btnPlay.on("pointerover", () => {
      this.sfx.btn.play();
    }, this);
    
    this.btnPlay.on("pointerdown", () => {
      this.sfx.btn.play();
      this.scene.start('MainScene');
    }, this);


    this.leaderBoard = this.add.sprite(
      this.game.config.width * 0.5,
      this.game.config.height * 0.6,
      "ldBtn",
    );
    this.leaderBoard.setInteractive();

    this.leaderBoard.on("pointerover", () => {
      this.sfx.btn.play();
    }, this);
    
    
    this.leaderBoard.on("pointerdown", () => {
      this.sfx.btn.play();
      this.scene.start('Score');
    }, this);  
    
    const style = {
      fontFamily: 'monospace',
      fontSize: 16,
      color: '#aaf',
      align: 'center',
    };
    const instruction1 = 'Use A and D to move your plane left or right.';
    const instruction2 = 'Use Space Bar to shoot.';
    const xPos = this.game.config.width * 0.5;
    const yPos = this.game.config.height - 40;
    this.instructions1 = this.add.text(xPos, yPos, instruction1, style);
    this.instructions1.setOrigin(0.5);
    this.instructions2 = this.add.text(xPos, yPos + 20, instruction2, style);
    this.instructions2.setOrigin(0.5);
  }
  
}
