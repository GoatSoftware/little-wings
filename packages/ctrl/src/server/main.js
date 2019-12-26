let listener;

function handleConection(client) {
  console.info('Client conected');
  client.on('registerAsController', () => onRegisterController(client));
  client.on('registerAsListener', () => onRegisterListener(client));
}

function onRegisterController(client) {
  console.info('Registered as controller');
  client.on('orientation', onOrientationChange);
}

function onRegisterListener(client) {
  console.info('Registered as listener');
  listener = client;
}

function onOrientationChange(orientation) {
  if (listener) {
    listener.emit('orientation', orientation);
  } else {
    console.warn('No listener connected');
  }
}

module.exports = handleConection;