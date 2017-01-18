var request = require('request');
var conf = require('./config');
var request = require('request');
var blinkstick = require('blinkstick');

var led = blinkstick.findFirst();
led.turnOff();
led.setMode(3);

let ledTimeout;

var currentStatus = 'normal';
var lastStatus = 'normal';

function checkStatus() {
  request.get(
    conf.url,
    {
      auth: {
        user: conf.user,
        pass: conf.pass,
        sendImmediately: true
      },
      json: true
    },
    function(err, resp, body) {
      if (err) return err;

      setStatus({ Project: [body.Project[0]] });
    }
  );
}

function setStatus(body) {
  const building = getBuilds(body);
  const failed = getFailed(body);
  const build = building.length > 0 ? true : false;
  const fail = failed.length > 0 ? true : false;

  const status = getCurrentStatus(build, fail);
  setCurrentStatus(status);

  if (build) {
    setLights('Building');
  } else if (fail && currentStatus === lastStatus) {
    setLights('Still broke');
  } else if (fail) {
    setLights('Failure');
  } else {
    setLights('Success');
  }
}

function getCurrentStatus(b, f) {
  if (b) return 'Building';
  if (f) return 'Failure';

  if (!b && !f) return 'Success';
}

function postToSlack() {
  request({
    url: 'https://hooks.slack.com/services/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', //URL to hit
    method: 'POST',
    payload: {"text": "This is a line of text in a channel.\nAnd this is another line of text."}
    // body: 'Hello Hello! String body!' //Set the body as a string
  }, function(error, response, body){
    if(error) {
        console.log(error);
    } else {
        console.log(response.statusCode, body);
    }
  });
};

function setCurrentStatus(newStatus) {
  if (newStatus !== lastStatus) postToSlack(newStatus);
  lastStatus = currentStatus;
  currentStatus = newStatus;
}

function getBuilds(body) {
  return body.Project.filter(p => p.activity === 'Building');
}

function getFailed(body) {
  return body.Project.filter(p => p.lastBuildStatus === 'Failure');
}

function blink(color) {
  led.setColor(color);

  ledTimeout = setTimeout(function() {
    led.setColor(0, 0, 0);
    ledTimeout = setTimeout(function() {
      blink(color);
    }, 1000);
  }, 1000);
}

function stop() {
  clearTimeout(ledTimeout);
  led.setColor(0, 0, 0);
}

function setLights(status) {
  let now = new Date();
  console.log(`${now.toUTCString()} status:`, status);
  stop();
  switch (status) {
    case 'Building':
      blink('purple');
      break;
    case 'Success':
      led.setColor('green');
      break;
    case 'Failure':
    case 'Still broke':
      blink('red');
      break;
    default:
      led.setColor('blue');
  }
}

checkStatus();

setInterval(function() {
  checkStatus();
}, 10000);
