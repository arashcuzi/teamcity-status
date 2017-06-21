var request = require('request');
var conf = require('./config');
var request = require('request');
var blinkstick = require('blinkstick');

var benderQuotes = require('./benderQuotes');

// postToSlack();

// var led = blinkstick.findFirst();
// led.turnOff();
// led.setMode(3);

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

      const e2e = body.Project.filter(p => p.name === 'NGIS :: Testing :: E2E/Regression Testing');

      // console.log(e2e);

      setStatus({ Project: e2e });
    }
  );
}

function setStatus(body) {
  const building = getBuilds(body);
  const failed = getFailed(body);
  const build = building.length > 0 ? true : false;
  const fail = failed.length > 0 ? true : false;

  const status = getCurrentStatus(build, fail);
  setCurrentStatus(status, building, failed);

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

function postToSlack(newStatus, building, failed) {
  console.log(building, failed);
  var predicate,
    subject,
    line2;

  var rando = Math.floor(Math.random() * benderQuotes.length);

  if (building.length !== 0) {
    predicate = '*running*';
    subject = 'E2E\'s are';
    line2 = benderQuotes[rando];
  } else if (failed.length !== 0) {
    predicate = '*failed to build*';
    subject = 'E2E\'s';
    line2 = benderQuotes[rando];
  } else {
    subject = 'E2E\'s are';
    predicate = '*A-OK*!';
    line2 = benderQuotes[rando];
  }

  request({
    url: config.slack_webhook, // Slack webhook from config.json
    method: 'POST',
    body: JSON.stringify({'text': `${subject} ${predicate}\n${line2}`})
    // body: 'Hello Hello! String body!' //Set the body as a string
  }, function(error, response, body){
    if(error) {
        console.log(error);
    } else {
        console.log(response.statusCode, body);
    }
  });
};

function setCurrentStatus(newStatus, building, failed) {
  console.log(`current-status: ${currentStatus}, new-status: ${newStatus}`);
  console.log(newStatus !== lastStatus);
  if (newStatus !== currentStatus) postToSlack(newStatus, building, failed);
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
  return false;
  // led.setColor(color);
  //
  // ledTimeout = setTimeout(function() {
  //   led.setColor(0, 0, 0);
  //   ledTimeout = setTimeout(function() {
  //     blink(color);
  //   }, 1000);
  // }, 1000);
}

function stop() {
  // clearTimeout(ledTimeout);
  // led.setColor(0, 0, 0);
}

function setLights(status) {
  let now = new Date();
  console.log(`${now.toUTCString()} status:`, status);
  stop();
  switch (status) {
    case 'Building':
      // blink('purple');
      break;
    case 'Success':
      // led.setColor('green');
      break;
    case 'Failure':
    case 'Still broke':
      // blink('red');
      break;
    default:
      // led.setColor('blue');
  }
}

checkStatus();

setInterval(function() {
  checkStatus();
}, 10000);
