
var comController = require ('./serialController');

var onTime = new Date(2020, 04, 29, 06, 30, 00, 0);
var offTime = new Date(2020, 04, 29, 10, 00, 00, 0);
var showerTemp = "120";
var isOn = false;
var recircON = 04;
var recircOFF = 05;

exports.checkRecirc = function (recircTemp){

	// get the current time
	let date_ob = new Date();
	let hours = date_ob.getHours();
	// current minutes
	let minutes = date_ob.getMinutes();
	var currentTime = hours + ":" + minutes;

	console.log("current time - " + hours + ":" + minutes);
	console.log(currentTime);
	console.log(onTime);

	if (currentTime >= onTime && currentTime <= offTime){
		console.log("within time parameters");
		if (isOn == "off" && recircTemp < showerTemp){
			runRecirc = true;
			conController.sendMessageToArdunio(runRecirc)
		} else if(isOn == "on" && recircTemp > showerTemp){
			runRecirc = false;
			conController.sendMessageToArdunio(runRecirc);
		};
	};

	if (currentTime >= offTime){
		console.log("");
	} else if (isOn == "on"){
		comController.sendMessageToArdunio(recircOFF)
	};
};

