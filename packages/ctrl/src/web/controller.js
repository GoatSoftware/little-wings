var socket = io("https://192.168.1.40:9001/");
socket.emit('registerAsController');
const REFRESH_RATE = 144;

let previousState = {
  a: 0,
  b: 0,
  g: 0
};

let state = {
  orientation: {
    global: {
      a: 0,
      b: 0,
      g: 0
    },
    calibrated: {
      a: 0,
      b: 0,
      g: 0
    },
    delta: {
      a: 0,
      b: 0,
      g: 0
    }
  },
  calibration: {
    a: 0,
    b: 0,
    g: 0
  }
};

window.addEventListener("deviceorientation", e => handleOrientation(e));

function handleOrientation(e) {
  if (e && e.alpha && e.beta && e.gamma) {
    state.orientation = {
      global: {
        a: e.alpha,
        b: e.beta,
        g: e.gamma
      },
      calibrated: {
        a: state.calibration.a - e.alpha,
        b: state.calibration.b - e.beta,
        g: state.calibration.g - e.gamma
      },
      delta: {
        ...state.orientation.delta
      }
    };
  }
}

setInterval(() => {
  state.orientation.delta = {
    a: state.orientation.global.a - previousState.a,
    b: state.orientation.global.b - previousState.b,
    g: state.orientation.global.g - previousState.g
  };
  socket.emit("orientation", state);
  previousState = {...state.orientation.global};
}, 1000 / REFRESH_RATE);

function calibrate() {
  state = {
    ...state,
    calibration: {
      ...state.orientation.global
    }
  };
}
