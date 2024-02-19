// version 2.0.1

var version = "2.M.1";


var dbController = require ('./databasecontroller');
var recircController = require ('./recircController');
var communicationController = require ('./communicationsController');

// inputs
// var furnaceTemp = 0;
// var furnaceTempMin = 90;
// var furnaceTempMax = 180;
// var outsideTemp = 0;
// var outsideTempMin = 60;
// var outsideTempMax = 80;
// var familyRmTemp = 0;
// var stoveTemp = 0;
var bedroomTemp = 0;
var bedroomTempMin = 69;
var houseTemp = 68;
//var minHouseTemp = 66;
//var maxHouseTemp = 69;
var currentTime = "";
var mornOnWDFlag = true;
var midDayOnWDFlag = true;
var eveningOnWDFlag = true;
var nightOnWDFlag = true;

var currentTime = "";
var dayOfTheWeek = 0;
/*var dayAndTime = {
	time: "",
	day: 0
};*/

var getSettingsCount = 0;
var getSettingsInterval = 100;

var countRunForWater = 0;
var runForWaterInterval;
var currentArduinoOffSensor = "bedroom"; // default family room
var keepOldSensor = "test";  // keep current sensor while on manual run
	// 1 - bedroom
	// 3 - desk

var furnaceSettings = {
	id: 0,
	WeekDayMorningMinTemp: 65,
	WeekDayMorningMaxTemp: 68,
	WeekDayMiddayMinTemp: 60,
	WeekDayMiddayMaxTemp: 63,
	WeekDayEveningMinTemp: 66,
	WeekDayEveningMaxTemp: 69,
	WeekDayNightMinTemp: 61,
	WeekDayNightMaxTemp: 64,

	WeekEndMorningMinTemp: 66,
	WeekEndMorningMaxTemp:69,
	WeekEndMiddayMinTemp: 64,
	WeekEndMiddayMaxTemp: 67,
	WeekEndEveningMinTemp: 66,
	WeekEndEveningMaxTemp: 69,
	WeekEndNightMinTemp: 61,
	WeekEndNightMaxTemp: 66,
	awayMinTemp: 58,
	awayMaxTemp: 61,

	minHouseTemp: 60,
	maxHouseTemp: 64,

    weekDayMorningOnTime: "06:00",
    weekDayMiddayOnTime: "08:30",
    weekDayEveningOnTime: "17:00",
    weekDayNightOnTime: "23:00",
    weekEndMorningOnTime: "07:00",
    weekEndMiddayOnTime: "11:00",
    weekEndEveningOnTime: "16:00",
    weekEndNightOnTime: "23:30",
    state: "Home",      //  ****** this needs to be implemented  ******
    currentSensor: currentArduinoOffSensor
};


//// states
var stateFurnace = "off";
//var cuvar2rrentSaveDelayCount

exports.getVersion = function (){
	return (version);
};

function secondsToHms(d) {
    d = Number(d);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return m + ":" + s; 
};

exports.runFurnForWater = function(howLong){
	keepOldSensor = currentArduinoOffSensor;
	communicationController.sendMessageToArdunio("whichSensor", "none");
	console.log("Furnace CNTRL run for hot water for  - " + howLong);
	countRunForWater = howLong * 3000;
	console.log("In start Run For Water");
	dbController.setFurnaceChange("FurnOnForWater");
	communicationController.sendMessageToArdunio("furnaceTurnOn", 69);
	stateFurnace = "on";
	runForWaterInterval = setInterval(checkForEnd, 1000);
	//let myVar = setInterval(checkForEnd, 1000);
};

function checkForEnd(){
	if (countRunForWater <= 0){
		clearInterval(runForWaterInterval);
		console.log("In End RFW Delay, KEEP OLD - " + keepOldSensor);
		communicationController.sendMessageToArdunio("whichSensor", keepOldSensor);
		currentArduinoOffSensor = keepOldSensor;
		console.log("ENDING Run For Water, count - " + countRunForWater);
		secondTimeout = setTimeout(endRunForWater, 500);
	} else {
		countRunForWater --;
		console.log("In Run For Water, count - " + countRunForWater);
	};
};

function endRunForWater(){
	clearTimeout(secondTimeout);
	console.log("in end run for water");
	stateFurnace = "off";
	communicationController.sendMessageToArdunio("furnaceTurnOff", 69);
	communicationController.changeState("changeHome-Away", "back");
	dbController.setFurnaceChange("FurnOffForWater");
	//setTimeout(continueEndRunForWater, 3000);
};

//function continueEndRunForWater(){
//};

exports.getRunForWaterCount = function(){
	var countInMin = secondsToHms(countRunForWater)
	return (countInMin);
};

//  Called from the communications controller changeState
exports.changeHomeState = function (newHomeState){
	furnaceSettings.state = newHomeState;
	furnaceSettings.id = 0   // forces it to get new settings from the db
	console.log("in furnace controller just got the new state from the com controller");
	console.log(furnaceSettings);
	// set the appropriate flag to force temps to update
	if (currentTime > furnaceSettings.weekDayMorningOnTime && currentTime < furnaceSettings.weekDayMiddayOnTime){
		console.log("just set flag for morning");
		mornOnWDFlag = true;
	} else
	// at midday time we'll set the flag
	if (currentTime > furnaceSettings.weekDayMiddayOnTime && currentTime < furnaceSettings.weekDayEveningOnTime){
		console.log("just set flag for mid day");
		midDayOnWDFlag = true;
	} else
	// at evening time we'll set the flag
	if (currentTime > furnaceSettings.weekDayEveningOnTime && currentTime < furnaceSettings.weekDayNightOnTime){
		console.log("just set flag for evening");
		eveningOnWDFlag = true;
	} else
	// at night we'll set the flag
	if (currentTime > furnaceSettings.weekDayNightOnTime && nightOnWDFlag){
		console.log("just set flag for night");
		nightOnWDFlag = true;
	};
};

// called by the server upon startup
exports.changeFurnState = function (newState){
	stateFurnace = newState;
};

// called from the route controler get general settings
exports.getFurnaceSettings = function (req, res){
	furnaceSettings.currentSensor = currentArduinoOffSensor;
	//furnaceSettings.minHouseTemp = minHouseTemp;
	//furnaceSettings.maxHouseTemp = maxHouseTemp;
	return (furnaceSettings);
};

// called from the route controller get current furnace settings
exports.getAllFurnSettings = function (fn){
	console.log("furn cntrl get all furnace settings - ");
	console.log(furnaceSettings);
	fn (furnaceSettings);
};

// within furnace run time, check if we should start the furnace
inTimeCheckTemps = function (){
	console.log("In Time, Check if we should Turn Furnace on");
	console.log("Current house Temp - " + houseTemp);
	console.log("Minimum House Temp - " + furnaceSettings.minHouseTemp);
	
	if (houseTemp < furnaceSettings.minHouseTemp){
		communicationController.sendMessageToArdunio("furnaceChange", "on");
		console.log("In Furnace Controller - Check Temps, Turning Furnace ON");
		stateFurnace = "on";
		dbController.setFurnaceChange("turnedFurnaceOn");
	}
};

checkIfFurnaceAdjust = function(furnaceTemp, familyTemp, bedroomTemp, deskTemp, outsideTemp, currentState){

	//console.log("have the settings");
	getSettingsCount++;

	// get the current time
	let date_ob = new Date();
	let hours = date_ob.getHours();
	// current minutes
	let minutes = date_ob.getMinutes();
	//let seconds = date_ob.getSeconds();
	if (hours < 10){
		currentTime = "0" + hours + ":" + minutes;
	} else if (minutes < 10){
		currentTime = hours + ":" + "0" + minutes;
	} else {
		currentTime = hours + ":" + minutes;
	};
	//dayAndTime.day = date_ob.getDay();
	dayOfTheWeek = date_ob.getDay();
	//dayAndTime.time = currentTime;
	console.log("Current Time in FURN cntrl- " + currentTime + ", on - " + dayOfTheWeek);

	if (dayOfTheWeek == 6 || dayOfTheWeek == 0){
		console.log("It's a weekend YEA");
			if (currentTime > furnaceSettings.weekEndMorningOnTime && currentTime < furnaceSettings.weekEndMiddayOnTime){
				communicationController.changeFurnaceState("weekEndMorning");
				//mornOnWDFlag = false;
				//nightOnWDFlag = true;
				}
			else if (currentTime > furnaceSettings.weekEndMiddayOnTime && currentTime < furnaceSettings.weekEndEveningOnTime){
				communicationController.changeFurnaceState("weekEndDay");
				//midDayOnWDFlag = false;
				console.log("just set the furn state to week end day");
				}
			else if (currentTime > furnaceSettings.weekEndEveningOnTime && currentTime < furnaceSettings.weekEndNightOnTime){
				communicationController.changeFurnaceState("weekEndEvening");
				//eveningOnWDFlag = false;
				console.log("just set the furn state to week end evening");
				}
			else if (currentTime > furnaceSettings.weekEndNightOnTime || currentTime < furnaceSettings.weekEndMorningOnTime){
				communicationController.changeFurnaceState("weekEndNight");
				console.log("just set the furn state to week end night");
				//nightOnWDFlag = false;
				}
			// after midnight reset all flags
			//else if (currentTime < "00:05" && mornOnWDFlag == false){
				//	mornOnWDFlag = true;
				//	midDayOnWDFlag = true;
				//	eveningOnWDFlag = true;
			//}
	}
	else {
		console.log("NOT a weekend");
			if (currentTime > furnaceSettings.weekDayMorningOnTime && currentTime < furnaceSettings.weekDayMiddayOnTime && mornOnWDFlag){
				communicationController.changeFurnaceState("weekDayMorning");
				console.log("just adjusted temps for morning");
				//mornOnWDFlag = false;
				//nightOnWDFlag = true;
				}
			else if (currentTime > furnaceSettings.weekDayMiddayOnTime && currentTime < furnaceSettings.weekDayEveningOnTime && midDayOnWDFlag){
				communicationController.changeFurnaceState("weekDayDay");
				//midDayOnWDFlag = false;
				}
			else if (currentTime > furnaceSettings.weekDayEveningOnTime && currentTime < furnaceSettings.weekDayNightOnTime && eveningOnWDFlag){
				communicationController.changeFurnaceState("weekDayEvening");
				//eveningOnWDFlag = false;
				}
			else if (currentTime > furnaceSettings.weekDayNightOnTime || currentTime < furnaceSettings.weekDayMorningOnTime && eveningOnWDFlag){
				communicationController.changeFurnaceState("weekDayNight");
				}
			// after midnight reset all flags
			//if (currentTime < "00:05" && mornOnWDFlag == false){
			//	mornOnWDFlag = true;
			//	midDayOnWDFlag = true;
			//	eveningOnWDFlag = true;
			//}
	}


	//var currentState = communicationController.getState();
	if (currentState.stateHomeAway == "Away"){
			console.log("We're Away");
			furnaceSettings.minHouseTemp = furnaceSettings.awayMinTemp;
			furnaceSettings.maxHouseTemp = furnaceSettings.awayMaxTemp;
			//communicationController.sendMessageToArdunio("changeHouseMaxTemp", furnaceSettings.maxHouseTemp)
	} else if (communicationController.getState.stateFurnace == "weekEndMorning"){
			// at 6 AM we'll up the temps
			console.log(furnaceSettings.weekEndMorningOnTime);
			furnaceSettings.minHouseTemp = furnaceSettings.WeekEndMorningMinTemp;
			furnaceSettings.maxHouseTemp = furnaceSettings.WeekEndMorningMaxTemp;
			console.log("just adjusted temps for morning");
			//	communicationController.sendMessageToArdunio("changeHouseMaxTemp", furnaceSettings.maxHouseTemp)
	} else if (communicationController.getState.stateFurnace =="weekEndDay"){
			// at 9 AM we'll set temps back down
			console.log(furnaceSettings.weekEndMiddayOnTime);
			furnaceSettings.minHouseTemp = furnaceSettings.WeekEndMiddayMinTemp;
			furnaceSettings.maxHouseTemp = furnaceSettings.WeekEndMiddayMaxTemp;
			console.log("just adjusted temps for mid day");
			//	communicationController.sendMessageToArdunio("changeHouseMaxTemp", furnaceSettings.maxHouseTemp)
	} else  if (communicationController.getState.stateFurnace =="weekEndEvening"){
			// at 4:30 PM we'll up the temps
			console.log("just adjusted furn temps for evening");
			furnaceSettings.minHouseTemp = furnaceSettings.WeekEndEveningMinTemp;
			furnaceSettings.maxHouseTemp = furnaceSettings.WeekEndEveningMaxTemp;
			//	communicationController.sendMessageToArdunio("changeHouseMaxTemp", furnaceSettings.maxHouseTemp)
	} else if (communicationController.getState.stateFurnace =="weekEndNight"){
			// at 11:30 PM we'll set the temps down for night
			console.log(furnaceSettings.weekEndNightOnTime);
			console.log("just adjusted furn temps for night");
			furnaceSettings.minHouseTemp = furnaceSettings.WeekEndNightMinTemp;
			furnaceSettings.maxHouseTemp = furnaceSettings.WeekEndNightMaxTemp;
	}

			// Make temperature adjustments if required
			// at 6 AM we'll up the temps
	else if (communicationController.getState.stateFurnace == "weekDayMorning"){
			console.log(furnaceSettings.weekDayMorningOnTime);
			console.log("just adjusted temps for morning");
			furnaceSettings.minHouseTemp = furnaceSettings.WeekDayMorningMinTemp;
			furnaceSettings.maxHouseTemp = furnaceSettings.WeekDayMorningMaxTemp;
			//communicationController.sendMessageToArdunio("changeHouseMaxTemp", furnaceSettings.maxHouseTemp)
	} else if (communicationController.getState.stateFurnace == "weekDayDay"){
			// at 9 AM we'll set temps back down
			console.log(furnaceSettings.weekDayMiddayOnTime);
			console.log("just adjusted temps for mid day");
			furnaceSettings.minHouseTemp = furnaceSettings.WeekDayMiddayMinTemp;
			furnaceSettings.maxHouseTemp = furnaceSettings.WeekDayMiddayMaxTemp;
				//communicationController.sendMessageToArdunio("changeHouseMaxTemp", furnaceSettings.maxHouseTemp)
	} else if (communicationController.getState.stateFurnace == "weekDayEvening"){
			// at 4:30 PM we'll up the temps
			console.log(furnaceSettings.weekDayEveningOnTime);
			console.log("just adjusted furn temps for evening");
			furnaceSettings.minHouseTemp = furnaceSettings.WeekDayEveningMinTemp;
			furnaceSettings.maxHouseTemp = furnaceSettings.WeekDayEveningMaxTemp;
			//communicationController.sendMessageToArdunio("changeHouseMaxTemp", furnaceSettings.maxHouseTemp)
	} else if (communicationController.getState.stateFurnace == "weekDayNight"){
			// at 11:30 PM we'll set the temps down for night
			console.log(furnaceSettings.weekDayNightOnTime);
			console.log("just adjusted furn temps for night");
			furnaceSettings.minHouseTemp = furnaceSettings.WeekDayNightMinTemp;
			furnaceSettings.maxHouseTemp = furnaceSettings.WeekDayNightMaxTemp;
	};
	// end adjust temperatures
	// after making any temperature adjustment, send new number to ardruino - com cntrl sends only if arduino doesn't match
	communicationController.sendMessageToArdunio("changeHouseMaxTemp", furnaceSettings.maxHouseTemp)

	// end check if away else
	//};

	// Arduino sends flag (status) packet right before sending a temperature packet
	currentArduinoStates = communicationController.getState();
	if (stateFurnace == "on"){
		if (currentArduinoStates.stateFurnace == "off" ){
			// local furnace state ON but state machine is OFF - Arduino just turned it off
			console.log("looks like the arduino just turned the furnace off");
			stateFurnace = "off";
			dbController.setFurnaceChange("turnedFurnaceOff");
		}

	} else if (stateFurnace == "off"){ 
		console.log("Furnace is off so check if turn on **********");

		// sets which temp to the last reported temp from the dbcontroller who
		// averaged the readings
		console.log("currentArduinoOffSensor - " + currentArduinoOffSensor);
		switch (currentArduinoOffSensor){
			case "bedroom":
				console.log("In CASE 1 ** bedroomTemp - " + bedroomTemp);
				houseTemp = bedroomTemp;
				break;
			case "familyroom":
				console.log("in CASE 2 ** familyTemp - " + familyTemp);
				houseTemp = familyTemp;
				break;
			case "desk":
				console.log("in CASE 3 ** deskTemp - " + deskTemp);
				houseTemp = deskTemp;
				break;
			case "none":
				console.log("in Furnace controller case none ");
				break;
			default:
				console.log("Somthing messed up in the Furnace Controller");
		};

		inTimeCheckTemps()

	// end furnace temp is below minimum		
	}
// end chek if we should adjust furnace
};

// Main Entry Point
// entry point from the db controller with new avg temperatures
exports.checkFurnace = function (furnaceTemp, familyTemp, bedroomTemp, deskTemp, outsideTemp, currentState){

	console.log("* * * * * * Entering the Furnace Controller, FURNACE IS - " + stateFurnace + " * * * * * *");


		// don't hit the db for the recirc settings every time through
		// if NOT the first time through or if we've been through test count times, do
		// normal processing otherwise get the recirc settings
		console.log("furnSetting id - " + furnaceSettings.id);
		console.log("get settings count - " + getSettingsCount);
		console.log("get settings interval - " + getSettingsInterval);


		// id is 0 first tile through, or refresh every interval
		if (furnaceSettings.id == 0 || getSettingsCount >= getSettingsInterval) {

			dbController.getFurnaceSettings(furnaceSettings.state, function (tempFurnaceSettings){
				console.log("* * * in furnace controller just back from getting settings");
				console.log(tempFurnaceSettings.state);
/*
				furnaceSettings.id = tempFurnaceSettings.id;
			    furnaceSettings.minHouseTemp = tempFurnaceSettings.minHouseTemp;
			    furnaceSettings.maxHouseTemp = tempFurnaceSettings.maxHouseTemp;
				furnaceSettings.WeekDayMorningMinTemp = tempFurnaceSettings.WeekDayMorningMinTemp;
				furnaceSettings.WeekDayMorningMaxTemp = tempFurnaceSettings.WeekDayMorningMaxTemp;
				furnaceSettings.WeekDayMiddayMinTemp = tempFurnaceSettings.WeekDayMiddayMinTemp;
				furnaceSettings.WeekDayMiddayMaxTemp = tempFurnaceSettings.WeekDayMiddayMaxTemp;
				furnaceSettings.WeekDayEveningMinTemp = tempFurnaceSettings.WeekDayEveningMinTemp;
				furnaceSettings.WeekDayEveningMaxTemp = tempFurnaceSettings.WeekDayEveningMaxTemp;
				furnaceSettings.WeekDayNightMinTemp = tempFurnaceSettings.WeekDayNightMinTemp;
				furnaceSettings.WeekDayNightMaxTemp = tempFurnaceSettings.WeekDayNightMaxTemp;

				furnaceSettings.WeekEndMorningMinTemp = tempFurnaceSettings.WeekEndMorningMinTemp;
				furnaceSettings.WeekEndMorningMaxTemp = tempFurnaceSettings.WeekEndMorningMaxTemp;
				furnaceSettings.WeekEndMiddayMinTemp = tempFurnaceSettings.WeekEndMiddayMinTemp;
				furnaceSettings.WeekEndMiddayMaxTemp = tempFurnaceSettings.WeekEndMiddayMaxTemp;
				furnaceSettings.WeekEndEveningMinTemp = tempFurnaceSettings.WeekEndEveningMinTemp;
				furnaceSettings.WeekEndEveningMaxTemp = tempFurnaceSettings.WeekEndEveningMaxTemp;
				furnaceSettings.WeekEndNightMinTemp = tempFurnaceSettings.WeekEndNightMinTemp;
				furnaceSettings.WeekEndNightMaxTemp = tempFurnaceSettings.WeekEndNightMaxTemp;
				furnaceSettings.awayMinTemp = tempFurnaceSettings.awayMinTemp;
				furnaceSettings.awayMaxTemp = tempFurnaceSettings.awayMaxTemp;

				//furnaceSettings.minHouseTemp = tempFurnaceSettings.minHouseTemp,
				//furnaceSettings.maxHouseTemp = tempFurnaceSettings.maxHouseTemp,

			    furnaceSettings.weekDayMorningOnTime = tempFurnaceSettings.weekDayMorningOnTime;
			    furnaceSettings.weekDayMiddayOnTime = tempFurnaceSettings.weekDayMiddayOnTime;
			    furnaceSettings.weekDayEveningOnTime = tempFurnaceSettings.weekDayEveningOnTime;
			    furnaceSettings.weekDayNightOnTime = tempFurnaceSettings.weekDayNightOnTime;
			    furnaceSettings.weekEndMorningOnTime = tempFurnaceSettings.weekEndMorningOnTime;
			    furnaceSettings.weekEndMiddayOnTime = tempFurnaceSettings.weekEndMiddayOnTime;
			    furnaceSettings.weekEndEveningOnTime = tempFurnaceSettings.weekEndEveningOnTime;
			    furnaceSettings.weekEndNightOnTime = tempFurnaceSettings.weekEndNightOnTime;
			    furnaceSettings.state = tempFurnaceSettings.state;
			    //furnaceSettings.currentSensor = tempFurnaceSettings.
*/
				console.log("just got the new furnace settings, id - " + furnaceSettings.id);
				console.log("just got the new furnace settings, WeekDayMiddayMinTemp - " + furnaceSettings.WeekDayMiddayMinTemp);
				console.log("just got the new furnace settings, WeekDayMiddayMaxTemp - " + furnaceSettings.WeekDayMiddayMaxTemp);
				console.log("just got the new furnace settings, state - " + furnaceSettings.state);
				checkIfFurnaceAdjust(furnaceTemp, familyTemp, bedroomTemp, deskTemp, outsideTemp, currentState);
			});
			getSettingsCount = 0;
		// end get furnace setting from the db
		} else {
			checkIfFurnaceAdjust(furnaceTemp, familyTemp, bedroomTemp, deskTemp, outsideTemp, currentState);
		};
// end main entry
};

// not used
exports.setTempTargets = function (){
	recircController.getCurrentTime()
	currentTime 
	};

 
exports.manualFurnaceChange = function (whatToDo, newMaxTemp, newMinTemp){
	console.log("in furnace controller manual furnace change, whatToDo - " + whatToDo);
	communicationController.sendMessageToArdunio(whatToDo, newMaxTemp);
	if (stateFurnace == "on"){
		stateFurnace = "off";
		dbController.setFurnaceChange("manualOff");
	} else if (stateFurnace == "off"){
		stateFurnace = "on"
		dbController.setFurnaceChange("manualOn");
	};
	console.log("Furnace CNTRL back from comCNTRL new state - " + stateFurnace);
	//console.log(stateFurnace);
	return(stateFurnace);
};

// called from route controller update general settings
exports.setFurnaceTemps = function (whichLTemp, newTemp){
	switch (whichLTemp){
		case "minFurnaceTemp" :
			furnaceTempMin = newTemp;
			break;
		case "maxFurnaceTemp":
			furnaceTempMax = newTemp;
			break;
		case "maxHouseTemp":
			furnaceSettings.maxHouseTemp = newTemp;
			break;
		case "minHouseTemp":
			furnaceSettings.minHouseTemp = newTemp;
			break;
		default:
			console.log ("ERROR in furn cntrl set temps");
	}
};

// called from the route controller
exports.changeOnOff = function (toWhoChangesFurn){
			console.log ("in Furn controller setting to - " + toWhoChangesFurn);
			//currentArduinoOffSensor = toWhoChangesFurn;
			communicationController.sendMessageToArdunio ("whichSensor", toWhoChangesFurn);
//			console.log("return from change whichh sensor - " + returnStatus);
	return (toWhoChangesFurn);
};

// called from the com controller reflecting Arduino 
exports.setFurnFlagPacket = function (toWhichSensor, currentMaxHouseTemp){
	console.log("in furn cntrl stting the WhichSensor to Arduino - " + toWhichSensor);
	switch (toWhichSensor){
		case '0':
			currentArduinoOffSensor = "none";
			break;
		case '1':
			currentArduinoOffSensor = "bedroom";
			break;
		case '2':
			currentArduinoOffSensor = "familyroom";
			break;
		case '3':
			currentArduinoOffSensor = "desk";
			break;
		default:
			console.log ("ERROR in set furn on off - in furnace controller");
	};
	console.log("in Furn CNTRL, just set the furn state to the arduino state - " + currentArduinoOffSensor);
	furnaceSettings.maxHouseTemp = currentMaxHouseTemp;
};

// called from router controller to update furnace settings
exports.upDateFurnaceSettings = function (newSettings){
	console.log("in furnace controller update setting - ");
	console.log(newSettings);
	for (var key in newSettings){
		if (newSettings[key] == ''){
			console.log("nothing at - " + key)
		} else {
			console.log("At - " + key + " got - " + newSettings[key]);
			//var returnStatus = dbController.updateFurnaceSettings(key, newSettings[key]);
			switch (key){
				case "weekDayMorningOnTime":
					furnaceSettings.weekDayMorningOnTime = newSettings[key];
					break;
				case "weekDayMorningMinTemp":
					furnaceSettings.WeekDayMorningMinTemp = newSettings[key];
					break;
				case "weekDayMorningMaxTemp":
					furnaceSettings.WeekDayMorningMaxTemp = newSettings[key];
					break;
				case "weekDayMidDayOnTime":
					furnaceSettings.weekDayMiddayOnTime = newSettings[key];
					break;
				case "weekDayMidDayMinTemp":
					furnaceSettings.WeekDayMiddayMinTemp = newSettings[key];
					break;
				case "weekDayMidDayMaxTemp":
					furnaceSettings.WeekDayMiddayMaxTemp = newSettings[key];
					break;
				case "weekDayEveningOnTime":
					furnaceSettings.eveningOnWeekday = newSettings[key];
					break;
				case "weekDayEveningMinTemp":
					furnaceSettings.WeekDayEveningMinTemp = newSettings[key];
					break;
				case "weekDayEveningMaxTemp":
					furnaceSettings.WeekDayEveningMaxTemp = newSettings[key];
					break;
				case "weekDayNightOnTime":
					furnaceSettings.nightOnWeekday = newSettings[key];
					break;
				case "weekDayNightMinTemp":
					furnaceSettings.WeekDayNightMinTemp = newSettings[key];
					break;
				case "weekDayNightMaxTemp":
					furnaceSettings.WeekDayNightMaxTemp = newSettings[key];
					break;
				case "weekEndMorningOnTime":
					furnaceSettings.morningOnWeekEnd = newSettings[key];
					break;
				case "weekEndMorningMinTemp":
					furnaceSettings.WeekEndMorningMinTemp = newSettings[key];
					break;
				case "weekEndMorningMaxTemp":
					furnaceSettings.WeekEndMorningMaxTemp = newSettings[key];
					break;
				case "weekEndMidDayOnTime":
					furnaceSettings.midDayOnWeekEnd = newSettings[key];
					break;
				case "weekEndMidDayMinTemp":
					furnaceSettings.WeekEndMiddayMinTemp = newSettings[key];
					break;
				case "weekEndMidDayMaxTemp":
					furnaceSettings.WeekEndMiddayMaxTemp = newSettings[key];
					break;
				case "weekEndEveningOnTime":
					furnaceSettings.eveningOnWeekEnd = newSettings[key];
					break;
				case "weekEndEveningMinTemp":
					furnaceSettings.WeekEndEveningMinTemp = newSettings[key];
					break;
				case "weekEndEveningMaxTemp":
					furnaceSettings.WeekEndEveningMaxTemp = newSettings[key];
					break;
				case "weekEndNightOnTime":
					furnaceSettings.nightOnWeekEnd = newSettings[key];
					break;
				case "weekEndNightMinTemp":
					furnaceSettings.WeekEndNightMinTemp = newSettings[key];
					break;
				case "weekEndNightMaxTemp":
					furnaceSettings.WeekEndNightMaxTemp = newSettings[key];
					break;

				case "awayMinTemp":
					furnaceSettings.awayMinTemp = newSettings[key];
					break;
				case "awayMaxTemp":
					furnaceSettings.awayMaxTemp = newSettings[key];
					break;

				default:
					console.log("ERROR");
					break;
			}
		}
	// end update furnace settings
	};

}


