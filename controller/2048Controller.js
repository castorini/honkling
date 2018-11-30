$("#gameBoardPlaceholder").load("../2048/index.html", function() {
  new GameManager(4, AudioInputManager, HTMLActuator, LocalStorageManager);
});
