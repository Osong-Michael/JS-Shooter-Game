import Phaser from '../phaser';
import player from '../../assets/images/sprPlayer.png';
import enemies from '../../assets/images/sprEnemy0.png';
import shield from '../../assets/images/sprShieldTile.png';
import enemyLaser from '../../assets/images/sprLaserEnemy.png';
import playerLaser from '../../assets/images/sprLaserPlayer.png';
import explosion from '../../assets/images/sprExplosion.png';
import exploSound from '../../assets/audio/sndExplode.wav';
import laserSnd1 from '../../assets/audio/sndLaserPlayer.wav';
import laserSnd2 from '../../assets/audio/sndLaserEnemy.wav';
import { Player, PlayerLaser } from '../content/player';
import { Enemy, EnemyLaser } from '../content/enemy';
import { ShieldTile, Explosion } from '../content/entity';


export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  init(data) {
    this.passingData = data;
  }

  preload() {
    this.load.image('sprPlayer', player);
    this.load.spritesheet('sprEnemy0', enemies, {
      frameWidth: 8,
      frameHeight: 8,
    });
    this.load.image('sprShieldTile', shield);
    this.load.image('sprLaserEnemy', enemyLaser);
    this.load.image('sprLaserPlayer', playerLaser);
    this.load.spritesheet('sprExplosion', explosion, {
      frameWidth: 8,
      frameHeight: 8,
    });

    this.load.audio('sndExplode', exploSound);
    this.load.audio('sndLaserPlayer', laserSnd1);
    this.load.audio('sndLaserEnemy', laserSnd2);
  }

  create() {
    if (Object.getOwnPropertyNames(this.passingData).length === 0
      && this.passingData.constructor === Object) {
      this.passingData = {
        maxLives: 3,
        lives: 3,
        score: 0,
      };
    }

    this.sfx = {
      explode: this.sound.add('sndExplode'),
      laserPlayer: this.sound.add('sndLaserPlayer'),
      laserEnemy: this.sound.add('sndLaserEnemy'),
    };


    this.anims.create({
      key: 'sprEnemy0',
      frames: this.anims.generateFrameNumbers('sprEnemy0'),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'sprExplosion',
      frames: this.anims.generateFrameNumbers('sprExplosion'),
      frameRate: 15,
      repeat: 0,
    });


    this.textScore = this.add.text(
      12,
      10,
      `Score: ${this.passingData.score}`,
      {
        fontFamily: 'monospace',
        fontSize: 16,
        align: 'left',
      },
    );

    this.player = new Player(
      this,
      this.game.config.width * 0.5,
      this.game.config.height - 54,
    );
    this.player.body.collideWorldBounds = true;

    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.playerShootDelay = 20;
    this.playerShootTick = 0;

    this.shieldPattern = [
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 1, 1],
    ];

    this.enemies = this.add.group();
    this.enemyLasers = this.add.group();
    this.playerLasers = this.add.group();
    this.explosions = this.add.group();
    this.shieldTiles = this.add.group();
    this.shieldHoles = this.add.group();

    this.lastEnemyMoveDir = 'RIGHT';
    this.enemyMoveDir = 'LEFT';
    this.enemyRect = new Phaser.Geom.Rectangle(
      0,
      0,
      Math.round((this.game.config.width / 24) * 0.75) * 24,
      Math.round((this.game.config.height / 20) * 0.25) * 20,
    );

    for (let x = 0; x < Math.round((this.game.config.width / 24) * 0.75); x += 1) {
      for (let y = 0; y < Math.round((this.game.config.height / 20) * 0.25); y += 1) {
        const enemy = new Enemy(this, x * 24, 128 + (y * 20), 'sprEnemy0');
        enemy.play('sprEnemy0');
        enemy.setScale(2);
        this.enemies.add(enemy);
      }
    }

    this.updateEnemiesMovement();
    this.updateEnemiesShooting();
    this.updatePlayerMovement();
    this.updatePlayerShooting();
    this.updateLasers();
    this.createLivesIcons();

    this.physics.add.overlap(this.playerLasers, this.enemies, (laser, enemy) => {
      if (laser) {
        laser.destroy();
      }

      if (enemy) {
        this.createExplosion(enemy.x, enemy.y);
        this.addScore(10);
        enemy.destroy();
      }
    }, null, this);

    this.physics.add.overlap(this.playerLasers, this.enemyLasers, (playerLaser, enemyLaser) => {
      if (playerLaser) {
        playerLaser.destroy();
      }

      if (enemyLaser) {
        enemyLaser.destroy();
      }
    }, null, this);

    this.physics.add.overlap(this.playerLasers, this.shieldTiles, (laser, tile) => {
      if (laser) {
        laser.destroy();
      }

      this.destroyShieldTile(tile);
    }, null, this);

    this.physics.add.overlap(this.enemyLasers, this.shieldTiles, (laser, tile) => {
      if (laser) {
        laser.destroy();
      }

      this.destroyShieldTile(tile);
    }, null, this);

    this.physics.add.overlap(this.player, this.enemies, (player) => {
      if (player) {
        player.destroy();

        this.onLifeDown();
      }
    }, null, this);

    this.physics.add.overlap(this.player, this.enemyLasers, (player, laser) => {
      if (player) {
        player.destroy();

        this.onLifeDown();
      }

      if (laser) {
        laser.destroy();
      }
    }, null, this);

    const totalShieldsWidth = (4 * 96) + (7 * 8);
    for (let i = 0; i < 4; i += 1) {
      this.addShield(
        ((this.game.config.width * 0.5) - (totalShieldsWidth * 0.5)) + ((i * 96) + (7 * 8)),
        this.game.config.height - 128,
      );
    }
  }


  addScore(amount) {
    this.passingData.score += amount;
    this.textScore.setText(`Score: ${this.passingData.score}`);
  }

  setEnemyDirection(direction) {
    this.lastEnemyMoveDir = this.enemyMoveDir;
    this.enemyMoveDir = direction;
  }

  updateEnemiesMovement() {
    this.enemyMoveTimer = this.time.addEvent({
      delay: 1024,
      callback() {
        if (this.enemyMoveDir === 'RIGHT') {
          this.enemyRect.x += 6;

          if (this.enemyRect.x + this.enemyRect.width > this.game.config.width - 20) {
            this.setEnemyDirection('DOWN');
          }
        } else if (this.enemyMoveDir === 'LEFT') {
          this.enemyRect.x -= 6;

          if (this.enemyRect.x < 20) {
            this.setEnemyDirection('DOWN');
          }
        } else if (this.enemyMoveDir === 'DOWN') {
          this.enemyMoveTimer.delay -= 100;
          this.moveEnemiesDown();
        }

        for (let i = this.enemies.getChildren().length - 1; i >= 0; i -= 1) {
          const enemy = this.enemies.getChildren()[i];

          if (this.enemyMoveDir === 'RIGHT') {
            enemy.x += 6;
          } else if (this.enemyMoveDir === 'LEFT') {
            enemy.x -= 6;
          }
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  updateEnemiesShooting() {
    this.time.addEvent({
      delay: 300,
      callback() {
        for (let i = 0; i < this.enemies.getChildren().length; i += 1) {
          const enemy = this.enemies.getChildren()[i];

          if (Phaser.Math.Between(0, 1000) > 995) {
            const laser = new EnemyLaser(this, enemy.x, enemy.y);
            this.enemyLasers.add(laser);

            this.sfx.laserEnemy.play();
          }
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  moveEnemiesDown() {
    for (let i = this.enemies.getChildren().length - 1; i >= 0; i -= 1) {
      const enemy = this.enemies.getChildren()[i];

      enemy.y += 20;

      if (this.lastEnemyMoveDir === 'LEFT') {
        this.setEnemyDirection('RIGHT');
      } else if (this.lastEnemyMoveDir === 'RIGHT') {
        this.setEnemyDirection('LEFT');
      }
    }
  }

  updatePlayerMovement() {
    this.time.addEvent({
      delay: 60,
      callback() {
        if (this.keyA.isDown) {
          this.player.x -= 8;
        }

        if (this.keyD.isDown) {
          this.player.x += 8;
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  updatePlayerShooting() {
    this.time.addEvent({
      delay: 15,
      callback() {
        if (this.keySpace.isDown && this.player.active) {
          if (this.playerShootTick < this.playerShootDelay) {
            this.playerShootTick += 1;
          } else {
            const laser = new PlayerLaser(this, this.player.x, this.player.y);
            this.playerLasers.add(laser);

            this.sfx.laserPlayer.play();

            this.playerShootTick = 0;
          }
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  updateLasers() {
    this.time.addEvent({
      delay: 30,
      callback() {
        for (let i = 0; i < this.playerLasers.getChildren().length; i += 1) {
          const laser = this.playerLasers.getChildren()[i];

          laser.y -= laser.displayHeight;

          if (laser.y < 16) {
            this.createExplosion(laser.x, laser.y);

            if (laser) {
              laser.destroy();
            }
          }
        }
      },
      callbackScope: this,
      loop: true,
    });

    this.time.addEvent({
      delay: 128,
      callback() {
        for (let i = 0; i < this.enemyLasers.getChildren().length; i += 1) {
          const laser = this.enemyLasers.getChildren()[i];

          laser.y += laser.displayHeight;
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  addShield(posX, posY) {
    for (let y = 0; y < this.shieldPattern.length; y += 1) {
      for (let x = 0; x < this.shieldPattern[y].length; x += 1) {
        if (this.shieldPattern[y][x] === 1) {
          const tile = new ShieldTile(
            this,
            posX + (x * 8),
            posY + (y * 8),
          );
          this.shieldTiles.add(tile);
        }
      }
    }
  }

  destroyShieldTile(tile) {
    if (tile) {
      this.createExplosion(tile.x, tile.y);

      for (let i = 0; i < Phaser.Math.Between(10, 20); i += 1) {
        const shieldHole = this.add.graphics({
          fillStyle: {
            color: 0x000000,
          },
        });
        shieldHole.setDepth(-1);

        const size = Phaser.Math.Between(2, 4);
        const self = this;

        if (Phaser.Math.Between(0, 100) > 25) {
          const rect = new Phaser.Geom.Rectangle(
            tile.x + (Phaser.Math.Between(-2, tile.displayWidth + 2)),
            tile.y + (Phaser.Math.Between(-2, tile.displayHeight + 2)),
            size,
            size,
          );
          shieldHole.fillRectShape(rect);
          self.shieldHoles.add(shieldHole);
        } else {
          const rect = new Phaser.Geom.Rectangle(
            tile.x + (Phaser.Math.Between(-4, tile.displayWidth + 4)),
            tile.y + (Phaser.Math.Between(-4, tile.displayHeight + 4)),
          );
          shieldHole.fillRectShape(rect);
          self.shieldHoles.add(shieldHole);
        }
      }
      tile.destroy();
    }
  }

  createExplosion(x, y) {
    this.sfx.explode.play();

    const explosion = new Explosion(this, x, y);
    this.explosions.add(explosion);
  }

  createLivesIcons() {
    for (let i = 0; i < this.passingData.lives; i += 1) {
      const icon = this.add.sprite(
        32 + (i * 32),
        this.game.config.height - 24,
        'sprPlayer',
      );
      icon.setScale(2);
      icon.setDepth(5);
    }
  }

  onLifeDown() {
    if (this.passingData.lives === 0) {
      this.textScore.setVisible(false);
      this.scene.start('GameOver', {
        gameScore: this.passingData.score,
      });
      this.passingData.score = 0;
      this.passingData.lives = 3;
    }

    this.time.addEvent({
      delay: 3000,
      callback() {
        if (this.passingData.lives > 0) {
          this.passingData.lives -= 1;

          this.scene.start('MainScene', this.passingData);
        } else {
          this.scene.start('MainScene', { });
        }
      },
      callbackScope: this,
      loop: false,
    });
  }
}
