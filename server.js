var request = require('request');
var conf = require('./config');
var blinkstick = require('blinkstick');

var led = blinkstick.findFirst();
led.turnOff();

var currentStatus = 'normal';
var lastStatus = 'normal';

function checkStatus() {
	request.get(
		conf.url,
		{
			auth: {
				user: conf.user,
				pass: conf.pass,
				sendImmediately: true,
			},
			json: true
		},
		function(err, resp, body) {
			if (err) return err;

			setStatus(body);
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

function setCurrentStatus(newStatus) {
	lastStatus = currentStatus;
	currentStatus = newStatus;
}

function getBuilds(body) {
	return body.Project.filter(p => p.activity === 'Building');
}

function getFailed(body) {
	return body.Project.filter(p => p.lastBuildStatus === 'Failure');
}

function setLights(status) {
	console.log(Date.now(), status);
	led.turnOff();
	switch (status) {
		case 'Building':
			led.blink('purple', { repeats: 5, interval: 500 }, function() {
				led.setColor('purple');
			});
			break;
		case 'Success':
			led.setColor('green');
			break;
		case 'Failure':
			led.blink('red', { repeats: 5, interval: 500 }, function() {
				led.setColor('red');
			});
			break;
		case 'Still broke':
			led.setColor('red');
			break;
		default:
			led.setColor('blue');
	}
}

checkStatus();

setInterval(function() {
	checkStatus();
}, 10000);
