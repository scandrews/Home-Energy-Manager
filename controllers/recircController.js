
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
var homeAwayStateHere = {};
var pumpState = "";

//console.log("starting recirc controller");
//dbController.recircSettingsRecirCNTRL("somethign", function (recircSettings) {
//console.log("Starting recircontroller, settings - " + recircSettings);
//});

// set the pump state flag when maually turned on or off
exports.manualPumpChange = function (newState){
	pumpState = comController.getState;
	console.log("recirc controller pumpState - " + pumpState);
	if (pumpState.statePump == "off"){
		//set object
		//set so doesn't update recirc settings
		comController.sendMessageToArdunio("runRecirc")

	}
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
	let seconds = date_ob.getSeconds();
	if (hours < 10){
		var currentTime = "0" + hours + ":" + minutes + ":00";
	} else if (minutes < 10){
		var currentTime = hours + ":" + "0" + minutes + ":00";
	} else {
		var currentTime = hours + ":" + minutes + ":00";
	};

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

		function saveData (curState, Temp){
			
		}

		// pump is running so check if temp good
		function checkIfTurnOff (){
			// when pump is running save temp every other time through
			if (savePipeDataInterval == 15){
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

		// with time parameters and pump is NOT running so check temps
		function inTimeCheckTemps(){
			console.log("within time parameters - loopCount = " + loopCount +" of " + 200);
			loopCount ++;
			if (loopCount >= 200){
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
		console.log(currentTime);
		homeAwayStateHere = comController.getState();
		console.log("homeaway state - " + homeAwayStateHere.stateHomeAway);
		if (isPumpOn){
			checkIfTurnOff()
		// Check if in home or away mode
		} else if (homeAwayStateHere.stateHomeAway == "Home"){
		// pump in NOT running so check if weekend	
				if(date_ob.getDay() == 6 || date_ob.getDay() == 0){
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
					//console.log(currentTime + "  " + recircSettings[0].weekDayOn1 + "  " + recircSettings[0].weekDayOff1);
					//console.log(currentTime + "  " + recircSettings[0].weekDayOn2 + "  " + recircSettings[0].weekDayOff2);
					if (currentTime >= recircSettings[0].weekDayOn1 && currentTime <= recircSettings[0].weekDayOff1){
						// we are within the time parameters
						inTimeCheckTemps();
					} else if (currentTime >= recircSettings[0].weekDayOn2 && currentTime <= recircSettings[0].weekDayOff2){
						inTimeCheckTemps();
					}
				};
		// end check if home/away			
		}
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

