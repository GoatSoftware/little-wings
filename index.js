var spawn = require('child_process').spawn

const apps = {
  'CTRL': 'ctrl',
  'GAME': 'game',
  'SRV': 'server'
};


if (apps[process.env.APP]) {
  startApp(apps[process.env.APP]);
}

function startApp(app) {
  var child = spawn('npm', ['run', `start:${app}`], { shell: true });

  child.stdout.on('data', function (data) {
    process.stdout.write(data);
  });
  
  child.stderr.on('data', function (data) {
    process.stdout.write(data);
  });
  
  child.on('exit', function () {
    process.stdout.write(`${app} finished.`);
  });
}