var request = require('request');
var conf = require('./config');
// var TeamCityStatusChecker = require('./TeamCityStatusChecker');
var blinkstick = require('blinkstick');
// var config = require('./config.json');

// var pollInterval = 10 * 1000;
// var lightDelay = 5 * 1000;
//
var led = blinkstick.findFirst();

led.setColor('blue');

var currentStatus = 'normal';
var lastStatus = 'normal';
//
// var configurations = new ConfigurationCollection(config, new TeamCityStatusChecker(), led);
// checkStatusAndSetLight();
//
// setInterval(function(){
//     checkStatusAndSetLight();
// }, pollInterval);
//
// function checkStatusAndSetLight(){
//     configurations.checkStatus();
//     setInterval(function(){
//         configurations.displayStatus();
//     }, lightDelay);
// }
var options = {
  url: 'http://teamcity.nml.com/httpAuth/app/rest/cctray/projects.xml',
  username: 'pet7915',
  password: 'CVP12345'
};

function checkStatus() {
	request.get(
		options.url,
		{
			auth: {
				user: options.username,
				pass: options.password,
				sendImmediately: true,
			},
			json: true
		},
		function(err, resp, body) {
			// console.log(err);
			const building = body.Project.filter(p => {
				return p.activity === 'Building';
			});

			const failed = body.Project.filter(p => {
				return p.lastBuildStatus === 'Failure';
			});

			if (building.length > 0) {
				setLights('Building');
			} else if (failed.length > 0) {
				setLights('Failure');
			} else {
				setLights('Success');
			}
		}
	);
}

function setLights(status) {
	switch (status) {
		case 'Building':
			led.blink('purple');
			break;
		case 'Success':
			led.setColor('green');
			break;
		case 'Failure':
			led.pulse('red', function() {
				led.pulse('red', function() {
					led.pulse('red', function() {
						led.setColor('red');
					});
				});
			});
			break;
		default:
			led.setColor('blue');
	}
}

setInterval(function() {
	checkStatus();
}, 10000);
