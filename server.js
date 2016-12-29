var request = require('request');
var blinkstick = require('blinkstick');

var led = blinkstick.findFirst();

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
			// body.Project.forEach(p => {
			// 	console.log(p.activity, p.lastBuildStatus);
			// });

			const building = body.Project.filter(p => {
				return p.activity === 'Building';
			});

			const failed = body.Project.filter(p => {
				return p.lastBuildStatus === 'Failure';
			});

			if (building.length !== 0) {
				setLights('Building');
			} else if (failed.length !== 0) {
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
			led.setColor('purple');
			break;
		case 'Success':
			led.setColor('green');
			break;
		case 'Failure':
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
