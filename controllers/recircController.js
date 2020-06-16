
var comController = require ('./communicationsController');
var dbController = require ('./databasecontroller');

var showerTemp = "120";
var isPumpOn = false;
var recircON = 04;
var recircOFF = 05;
var weekend = false;
var loopCount = 0;

exports.checkRecirc = function (recircTemp){

	// get the current time
	let date_ob = new Date();
	let hours = date_ob.getHours();
	// current minutes
	let minutes = date_ob.getMinutes();
	var currentTime = hours + ":" + minutes;

	console.log("recirc temperature - " + recircTemp);
	console.log("Is Pump On - " + isPumpOn);

	dbController.recircSettingsRecirCNTRL("somethign", function (recircSettings) {

		// pump is running so check if temp good
		function checkIfTurnOff (){
			dbController.savePipeTemp(recircOn, recircTemp);
			if (recircTemp > recircSettings[0].pipeTempOff){
				console.log("pump is on and temp is greater than target");
				isPumpOn = false;
				// pump is on, but reached temp so turn off
				dbController.savePipeTemp(recircOff, recircTemp);
				comController.sendMessageToArdunio("stopRecirc");
			};
		}

		// pump is NOT running so check temps
		function inTimeCheckTemps(){
			console.log("within time parameters");
			loopCount ++;
			if (loopCount >= 25){
				dbController.savePipeTemp(recircTemp);
				loopCount = 0;
			};
			if (recircTemp < recircSettings[0].pipeTempOn){
				// temp is below trigger
				console.log("pump is off and temp is less than should be");
				isPumpOn = true;
				// turn pump on
				dbController.savePipeTemp(recircOn, recircTemp);
				comController.sendMessageToArdunio("runRecirc")
			};
		};

	
		if (isPumpOn){
			checkIfTurnOff()
		// pump in NOT running so check if weekend	
		} else if(date_ob.getDay() == 6 || date_ob.getDay() == 0){
				console.log("It's a weekend YEA");
				if (currentTime >= recircSettings[0].weekEndOn1 && currentTime <= recircSettings[0].weekEndOff1){
					// we are within the time parameters
					inTimeCheckTemps();
				} else if (currentTime >= recircSettings[0].weekEndOn2 && currentTime <= recircSettings[0].weekEndOff2){
					inTimeCheckTemps();
					}
				}
				else {
					console.log("NOT a weekend");
					if (currentTime >= recircSettings[0].weekDayOn1 && currentTime <= recircSettings[0].weekDayOff1){
						// we are within the time parameters
						inTimeCheckTemps();
					} else if (currentTime >= recircSettings[0].weekDayOn2 && currentTime <= recircSettings[0].weekDayOff2){
						inTimeCheckTemps();
					}
				};
	});
};

