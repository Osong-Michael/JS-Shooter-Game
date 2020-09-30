import { Entity } from './entity.js';

class EnemyLaser extends Entity {
	constructor(scene, x, y, key) {
		super(scene, x,y, "sprLaserEnemy");
	}
}

class Enemy extends Entity {
	constructor(scene, x, y, key) {
		super(scene, x, y, key);
		this.setOrigin(0);
	}
}

export { Enemy, EnemyLaser };