export const addButtonText = (scene, y, text) => {
  scene.add.text(
    scene.game.config.width * 0.5,
    y,
    text,
    { color: '#000', fontSize: 20, fontFamily: 'monospace' },
  ).setOrigin(0.5);
};

export const addButtonFunctionality = (scene, button, callback) => {
  button.setInteractive();

  button.on('pointerover', () => {
  }, scene);

  button.on('pointerdown', () => {
  }, scene);

  button.on('pointerup', () => {
    callback();
  }, scene);
};