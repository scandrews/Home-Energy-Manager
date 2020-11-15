
var comController = require ('./communicationsController');
var dbController = require ('./databasecontroller');

//var showerTemp = "120";
var isPumpOn = false;
var recircOn = 04;
var recircOff = 05;
var weekend = false;
var loopCount = 0;
var testCount = 0;
var getSettingsInterval = 10;   // we'll get the recirc settings on this interval
var savePipeDataInterval = 1;
var recircSettings = [{
	id: 0,
    pipeTempOn: 0,
    pipeTempOff: 0,
    weekDayOn1: '0',
    weekDayOff1: '0',
    weekDayOn2: '0',
    weekDayOff2: '0',
    weekEndOn1: '0',
    weekEndOff1: '0',
    weekEndOn2: '0',
    weekEndOff2: '0'
}];

//console.log("starting recirc controller");
//dbController.recircSettingsRecirCNTRL("somethign", function (recircSettings) {
//console.log("Starting recircontroller, settings - " + recircSettings);
//});

// set the pump state flag when maually turned on or off
exports.manualPumpChange = function (newState){
	if (newState == "turnPumpOn"){
		isPumpOn = true;
	} else if (newState == "turnPumpOff"){
		isPumpOn = false;
	}
};

exports.checkRecirc = function (recircTemp){

	// get the current time
	let date_ob = new Date();
	let hours = date_ob.getHours();
	// current minutes
	let minutes = date_ob.getMinutes();
	var currentTime = hours + ":" + minutes;

//	console.log("recirc temperature - " + recircTemp);
//	console.log("Is Pump On - " + isPumpOn);
	
	// don't hit the db for the recirc settings every time through
	// console.log (recircSettings[0].id);
	console.log (testCount);

	// if NOT the first time through or if we've been through test count times, do normal processing
	// otherwise get the recirc settings
	if (recircSettings[0].id == 1 && testCount < getSettingsInterval) {
		//console.log("have the settings");
		testCount++;

		// pump is running so check if temp good
		function checkIfTurnOff (){
			// when pump is running save temp every other time through
			if (savePipeDataInterval == 10){
				dbController.savePipeTemp("recircIsOn", recircTemp);
				savePipeDataInterval = 0;
			};
			savePipeDataInterval ++;
			if (recircTemp > recircSettings[0].pipeTempOff){
				console.log("pump is on and temp is greater than target");
				// pump is on, but reached temp so turn off
				dbController.savePipeTemp("turningRecircOff", recircTemp);
				comController.sendMessageToArdunio("stopRecirc");
				isPumpOn = false;
			};
		}

		// pump is NOT running so check temps
		function inTimeCheckTemps(){
			console.log("within time parameters - loopCount = " + loopCount);
			loopCount ++;
			if (loopCount >= 20){
				dbController.savePipeTemp("recircIsOff", recircTemp);
				loopCount = 0;
			};
			if (recircTemp < recircSettings[0].pipeTempOn){
				// temp is below trigger
				console.log("pump is off and temp is less than should be");
				isPumpOn = true;
				// turn pump on
				dbController.savePipeTemp("turnRecircOn", recircTemp);
				comController.sendMessageToArdunio("runRecirc")
			};
		};


//		console.log ("just back from getting recirc settings - " + recircSettings);	
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
//					console.log("NOT a weekend");
					if (currentTime >= recircSettings[0].weekDayOn1 && currentTime <= recircSettings[0].weekDayOff1){
						// we are within the time parameters
						inTimeCheckTemps();
					} else if (currentTime >= recircSettings[0].weekDayOn2 && currentTime <= recircSettings[0].weekDayOff2){
						inTimeCheckTemps();
					}
				};
	} else {
		// either the first time through or exceeded the loop count so update recirc settings
		dbController.recircSettingsRecirCNTRL("somethign", function (tempRecircSettings) {
			console.log(tempRecircSettings);
			recircSettings = tempRecircSettings;
			testCount = 0;
		});
	};
// end export check recirc
};

