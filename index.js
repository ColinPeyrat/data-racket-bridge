const { Server, Client } = require("node-osc");

// TODO: prompt user for ports
const serverPort = 9000;
const clientPort = 9001;

// TODO: prompt user for use
// allow to make animation on fft less chunky
const fallDownSpeed = 0.2;

const oscServer = new Server(serverPort, "127.0.0.1");
const oscClient = new Client("0.0.0.0", clientPort);

let fallFft = 0;
let amplitudeFft = -60;

const deltaTime = 0.0166666666666667;

oscServer.on("message", function(msg) {
  let [path, data] = msg;

  oscClient.send(path, data, err => {
    if (err) console.error(err);
  });

  if (path.includes("fft")) {
    // Pull up by input.
    if (amplitudeFft < data) {
      amplitudeFft = data;
      fallFft = 0;
    }
  }

  // if there is attack we send it, if not we send 0 to reset it on OSC device
  if (path.includes("attack")) {
    if (data === 1) {
      setTimeout(() => {
        oscClient.send(path, 0, err => {
          if (err) console.error(err);
        });
      }, 100);
    }
  }
});

setInterval(() => {
  // Hold-and-fall-down animation.
  fallFft += Math.pow(10, 1 + fallDownSpeed * 2) * deltaTime;
  amplitudeFft -= fallFft * deltaTime;
  amplitudeFft = Math.max(amplitudeFft, 0.0);

  oscClient.send("/audio/smoothfft", amplitudeFft, err => {
    if (err) console.error(err);
  });
}, 15);
