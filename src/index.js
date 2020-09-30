import Phaser from './phaser.js';
import StartScreen from './scenes/startScreen.js';
import MainScene from './scenes/mainScene.js';
import GameOver from './scenes/gameOver';
import Score from './scenes/score';

const config = {
	type: Phaser.WEBGL,
	width: 600,
	height: 550,
	backgroundColor: "black",
	physics: {
		default: "arcade",
		arcade: {
			gravity: { x: 0, y: 0 }
		}
	},
	scene: [
		StartScreen,
		MainScene,
		GameOver,
		Score
	],
	pixelArt: true,
	roundPixels: true
};

const game = new Phaser.Game(config);