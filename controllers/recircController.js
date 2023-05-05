//  This module is called every time a temperature is recieved
  
var comController = require ('./communicationsController');
var dbController = require ('./databasecontroller');

//var recircOn = 04;
//var recircOff = 05;
var loopCount = 0;
var getSettingsCount = 0;
var getSettingsInterval = 100;   // we'll get the recirc settings on this interval
var savePipeDataInterval = 30;
var savePipeDataCount = 0;
//var saveRunningPipeDataInterval = 15;
//var savePumpOffPipeDataInterval = 15;
var currentTime = "";
var dayOfTheWeek = 0;
/*var dayAndTime = {
	time: "",
	day: 0
};*/

var recircSettings = {
	id: 0,
    pipeTempOn: 85,
    pipeTempOff: 0,
    weekDayOn1: '0',
    weekDayOff1: '0',
    weekDayOn2: '0',
    weekDayOff2: '0',
    weekEndOn1: '0',
    weekEndOff1: '0',
    weekEndOn2: '0',
    weekEndOff2: '0'
};
var allStates = {};
var pumpState = "off";
var recirculatorTemp = 0.0;


//console.log("starting recirc controller");
//dbController.recircSettingsRecirCNTRL("somethign", function (recircSettings) {
//console.log("Starting recircontroller, settings - " + recircSettings);
//});

/*exports.getCurrentTime = function (){
	return (dayAndTime);
};*/

// force a re-read of the recirc settings
exports.getNewRecircSettings = function(){
	getSettingsCount = getSettingsInterval;
};

// Front end requested a forced pump change
exports.manualPumpChange = function (newState){
	console.log("in recirc cntrlr manual pump change");
	//allStates = comController.getState;
	//console.log("All States recirc pump - " + allStates.stateRecircPump);
	//console.log("All States furnace - " + allStates.stateFurnace);
	if (pumpState == "on"){
		console.log("Recirc Pump is on and manula request to turn off");
		comController.sendMessageToArdunio("stopRecirc");
		dbController.savePipeTemp("ManualPumpOff", recirculatorTemp);
		comController.changeState("stateRecircPump", "off");
		pumpState = "off";
	} else if (pumpState == "off"){
		console.log("Recirc Pump is off and manual request to turn on");
		comController.sendMessageToArdunio("runRecirc");
		dbController.savePipeTemp("ManualPumpOn", recirculatorTemp);
		comController.changeState("stateRecircPump", "on");
		pumpState = "on";
	};
	//allStates = comController.getState;
	return (pumpState);
};

// this is called from the route controller to force an update
exports.changedRecircSettings = function (){
	// The Recirc settings were just changed so force a get them from the db
	dbController.recircSettingsRecirCNTRL("somethign", function (tempRecircSettings) {
		console.log(tempRecircSettings);
		recircSettings = tempRecircSettings;
		getSettingsCount = 0;
	});
};

// Entry point from Communications controller with new temperature
exports.checkRecirc = function (recircTemp, currentStates){
	recirculatorTemp = recircTemp;

	// get the current time
	let date_ob = new Date();
	let hours = date_ob.getHours();
	// current minutes
	let minutes = date_ob.getMinutes();
	//	let seconds = date_ob.getSeconds();
	if (hours < 10){
		currentTime = "0" + hours + ":" + minutes + ":00";
	} else if (minutes < 10){
		currentTime = hours + ":" + "0" + minutes + ":00";
	} else {
		currentTime = hours + ":" + minutes + ":00";
	};
	dayOfTheWeek = date_ob.getDay();
	//dayOfTheWeek = dayAndTime.day;
	//dayAndTime.time = currentTime;

	console.log("in RECIRC current time - " + currentTime)

	/*
	try this one instead
	  if (hours < 10){
	    hours = "0" + hours;
	  }
	  if (minutes < 10){
	    var currentTime = hours + ":" + "0" + minutes;
	  } else {
	    var currentTime = hours + ":" + minutes;
	  };
	  dayAndTime.day = date_ob.getDay();
	  dayAndTime.time = currentTime;
	*/
	console.log("in Recirc controller, Just before home/away - ");
	//var tempStateFixing = comController.getState;
	console.log(currentStates.stateHomeAway);

	if (currentStates.stateHomeAway != "Away"){
		console.log("Just after home/away - state recirc pump - " + currentStates.stateRecircPump);
		// don't hit the db for the recirc settings every time through
		// if NOT the first time through or if we've been through test count times, do
		// normal processing otherwise get the recirc settings
		console.log("recircSetting id - " + recircSettings.id);
		console.log("get settings count - " + getSettingsCount);
		console.log("get settings interval - " + getSettingsInterval);

		if (recircSettings.id == 1 && getSettingsCount < getSettingsInterval) {
			//console.log("have the settings");
			getSettingsCount++;

			// pump is running so check if temp good
			function checkIfTurnOff (){
				console.log("in recirc controller check if turn off");
				savePipeDataCount ++;
				// when pump is running save temp every savepipedatainterval time through
				if (savePipeDataCount == savePipeDataInterval){
					dbController.savePipeTemp("recircIsOn", recircTemp);
					savePipeDataCount = 0;
				};

				// delete this - console.log(pumpState);
				console.log(allStates.stateRecircPump);
				// if the state has changed - allstates comes from Arduino, pumpstate in local
				if (pumpState != allStates.stateRecircPump){
						if (recircTemp > recircSettings.pipeTempOff){
							// console.log("pump is on and temp is greater than target");
							// pump is on, but reached temp so turn off
							console.log("Detected a turn Recirc pump off");
							dbController.savePipeTemp("turningRecircOff", recircTemp);
							// coment out the stop - depend on the Arduino to do
							//comController.sendMessageToArdunio("stopRecirc");
							//comController.changeState("statePump", "off");
		
							pumpState = "off";
						} else if (allStates.stateRecircPump == "off"){
							console.log("ERROR recirc cntrl and Arduino are out of sync - will set it OFF");
							pumpState = "off";
						};
				};
			};

			// within time parameters and pump is NOT running so check temps
			function inTimeCheckTemps(){
				console.log("within time parameters - loopCount = " + loopCount +" of " + savePipeDataInterval);
				loopCount ++;
				if (recircTemp < recircSettings.pipeTempOn){
					// temp is below trigger
					console.log("Recirc Pump is off and temp is less than should be");
					loopCount = 0;
					pumpState = "on";
					// turn pump on
					comController.sendMessageToArdunio("runRecirc");
					dbController.savePipeTemp("turnRecircOn", recircTemp);
					//comController.changeState("statePump", "on");
				} else if (loopCount >= savePipeDataInterval){
					dbController.savePipeTemp("recircIsOff", recircTemp);
					loopCount = 0;
				};
			};

			// within the state parameters - check time

			//*****************************************
			//*****	Main processing starts here	*******
			console.log("The Current Time (RECIRC MAIN LOOP) - " + currentTime + ", on = " + dayOfTheWeek);
			allStates = comController.getState();

			console.log("All States - ");
			console.log(allStates);
			console.log("homeaway state - " + allStates.stateHomeAway);
			console.log("Recirc Pump State - " + allStates.stateRecircPump);
			if (pumpState == "on"){
				checkIfTurnOff()
				// Check if in home or away mode
				} else if (allStates.stateHomeAway != "away"){

					// pump in NOT running so check if weekend	
					if(date_ob.getDay() == 6 || date_ob.getDay() == 0){
						console.log("It's a weekend YEA");
						if (currentTime >= recircSettings.weekEndOn1 && currentTime <= recircSettings.weekEndOff1){
							// we are within the time parameters
							inTimeCheckTemps();
						} else if (currentTime >= recircSettings.weekEndOn2 && currentTime <= recircSettings.weekEndOff2){
							inTimeCheckTemps();
							}
						}
					else {
						console.log("NOT a weekend");
						if (allStates.stateHomeAway != "HomeAlone"){
							// if home alone don't run in the morning, so check morning times
							if (currentTime >= recircSettings.weekDayOn1 && currentTime <= recircSettings.weekDayOff1){
								// we are within the time parameters
								inTimeCheckTemps();
								};
						};
						// we must be home or home alone so check afternoon times
						if (currentTime >= recircSettings.weekDayOn2 && currentTime <= recircSettings.weekDayOff2){
							inTimeCheckTemps();
						};
					};
				};
			// end check if home/away			
		} else {
			console.log(" either the first time through or exceeded the loop count so update recirc settings");
			dbController.recircSettingsRecirCNTRL("somethign", function (tempRecircSettings) {
				console.log("**  in recirc controller, just back from getting recirc settings from db");
				console.log(tempRecircSettings.pipeTempOn);
				console.log(tempRecircSettings.id);

				recircSettings.id = 1;
				recircSettings.pipeTempOn = tempRecircSettings.pipeTempOn;
				recircSettings.pipeTempOff = tempRecircSettings.pipeTempOff;
				recircSettings.weekDayOn1 = tempRecircSettings.weekDayOn1;
				recircSettings.weekDayOff1 = tempRecircSettings.weekDayOff1;
				recircSettings.weekDayOn2 = tempRecircSettings.weekDayOn2
				recircSettings.weekDayOff2 = tempRecircSettings.weekDayOff2
				recircSettings.weekEndOn1 = tempRecircSettings.weekEndOn1;
				recircSettings.weekEndOff1 = tempRecircSettings.weekEndOff1;
				recircSettings.weekEndOn2 = tempRecircSettings.weekEndOn2;
				recircSettings.weekEndOff2 = tempRecircSettings.weekEndOff2;

				getSettingsCount = 0;
			});
		};

	// end check if away	
	};

// end export check recirc
};

