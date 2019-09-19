const { Server, Client } = require('node-osc');

// TODO: prompt user for ports
const serverPort = 9000;
const clientPort = 9001;

const oscServer = new Server(serverPort, '127.0.0.1');
const oscClient = new Client('0.0.0.0', clientPort);

oscServer.on('message', function(msg) {
  let [path, data] = msg;

  oscClient.send(path, data, err => {
    if (err) console.error(err);
  });

  // if there is attack we send it, if not we send 0 to reset it on OSC device
  if (path.includes('attack')) {
    if (data === 1) {
      setTimeout(() => {
        oscClient.send(path, 0, err => {
          if (err) console.error(err);
        });
      }, 100);
    }
  }
});
