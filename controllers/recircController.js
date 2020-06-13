
var comController = require ('./serialController');
var dbController = require ('./databasecontroller');

//var onTime = new Date(2020, 04, 29, 06, 30, 00, 0);
//var offTime = new Date(2020, 04, 29, 10, 00, 00, 0);
var showerTemp = "120";
var isPumpOn = false;
var runRecirc = false;
var recircON = 04;
var recircOFF = 05;
var weekend = false;

exports.checkRecirc = function (recircTemp){

	// get the current time
	let date_ob = new Date();
	let hours = date_ob.getHours();
	// current minutes
	let minutes = date_ob.getMinutes();
	var currentTime = hours + ":" + minutes;

//	console.log("current time - " + currentTime);
	console.log("recirc temperature - " + recircTemp);
	console.log("Is Pump On - " + isPumpOn);

	dbController.recircSettingsRecirCNTRL("somethign", function (stuff) {
//		console.log("got back from the database, in recirccntrl stuff -")
//		console.log(stuff);

		function inTimeCheckTemps(){
			console.log("within time parameters");
			if (isPumpOn == false && recircTemp < stuff[0].pipeTempOn){
				// pump is off and temp is below trigger
				console.log("pump is off and temp is less than should be");
				runRecirc = true;
				isPumpOn = true;
				// turn pump on
				comController.sendMessageToArdunio("runRecirc")
			} else if(isPumpOn && recircTemp > stuff[0].pipeTempOff){
				console.log("pump is on and temp is greater than target");
				runRecirc = false;
				isPumpOn = false;
				// pump is on, but reached temp so turn off
				comController.sendMessageToArdunio("stopRecirc");
			};

		};

		if(date_ob.getDay() == 6 || date_ob.getDay() == 0){
			console.log("It's a weekend YEA");
			if (currentTime >= stuff[0].weekEndOn1 && currentTime <= stuff[0].weekEndOff1){
				// we are within the time parameters
				inTimeCheckTemps();
			} else if (currentTime >= stuff[0].weekEndOn2 && currentTime <= stuff[0].weekEndOff2){
				inTimeCheckTemps();
			}
			}
		else {
			console.log("NOT a weekend");
			if (currentTime >= stuff[0].weekDayOn1 && currentTime <= stuff[0].weekDayOff1){
				// we are within the time parameters
				inTimeCheckTemps();
			} else if (currentTime >= stuff[0].weekDayOn2 && currentTime <= stuff[0].weekDayOff2){
				inTimeCheckTemps();
			}
		};
	});
};

