//  Called ...

var dbController = require ('./databasecontroller');
var recircController = require ('./recircController');
var communicationController = require ('./communicationsController');

// inputs
var furnaceTemp = 0;
var furnaceTempMin = 90;
var furnaceTempMax = 180;
var outsideTemp = 0;
var outsideTempMin = 60;
var outsideTempMax = 80;
var familyRmTemp = 0;
var stoveTemp = 0;
var bedroomTemp = 0;
var bedroomTempMin = 69;
var houseTemp = 68;
var minHouseTemp = 66;
var maxHouseTemp = 70;
var currentTime = "";
//var currentTime = "00:00";
//var morningStartTime = "05:00";
//var morningEndTime = "10:00";
//var afternoonStartTime = "16:00";
//var afternoonEndTime = "21:30";

var currentTime = "";
var dayAndTime = {
	time: "",
	day: 0
};

var currentArduinoOffSensor = "desk"; // default family room
var keepOldSensor = "desk";  // keep current sensor while on manual run
	// 1 - bedroom
	// 3 - desk

var morningMinTempWeekDay = 66;
var morningMaxTempWeekDay = 70;
var middayMinTempWeekDay = 65;
var middayMaxTempWeekDay = 68;
var eveningMinTempWeekDay = 66;
var eveningMaxTempWeekDay = 70;
var nightMinTempWeekDay = 65;
var nightMaxTempWeekDay = 69;

var furnaceSettings = {
	id: 0,
    minHouseTemp: 0,
    maxHouseTemp: 0,
    weekDayOn1: "06:00",
    weekDayOn1_2: "06:10",
    weekDayOff1: "09:30",
    weekDayOff1_2: "09:40",
    weekDayOn2: "16:30",
    weekDayOn2_2: "16:40",
    weekDayOff2: "23:30",
    weekDayOff2_2: "23:40",
    weekEndOn1: '0',
    weekEndOff1: '0',
    weekEndOn2: '0',
    weekEndOff2: '0',
    runMode: currentArduinoOffSensor,
    currentSensor: currentArduinoOffSensor
};


// states
var stateFurnace = "off";
//var currentSaveDelayCount = 0;


function secondsToHms(d) {
    d = Number(d);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return m + ":" + s; 
};


function endRunForWater(){
	currentArduinoOffSensor = keepOldSensor;
	console.log("In End RFW Delay, KEEP OLD - " + keepOldSensor);
	communicationController.sendMessageToArdunio("whichSensor", keepOldSensor);
	stateFurnace = "off";
	communicationController.changeState("changeHome-Away", "back");
	communicationController.sendMessageToArdunio("furnaceTurnOff", 69);
	dbController.setFurnaceChange("FurnOffForWater");
};

/*
function runDelayer (delayTime){
	console.log("IN FUCKIN FURN CNTRL currentArduinoOffSensor - " + currentArduinoOffSensor);
	keepOldSensor = currentArduinoOffSensor;
	communicationController.sendMessageToArdunio("whichSensor", "none");
	communicationController.sendMessageToArdunio("furnaceChange", 69);
	dbController.setFurnaceChange("FurnOnForWater");
	stateFurnace = "on";
	// set timer
	setTimeout(endRunForWater, delayTime);
};
*/

// called from the communitcations controller 
exports.runFurnForWater = function (howLong){
	keepOldSensor = currentArduinoOffSensor;
	console.log("Furnace CNTRL run for hot water for  - " + howLong);
	communicationController.sendMessageToArdunio("whichSensor", "none");
	delayTime = howLong * 60000;
	//delayTime = howLong * 10000;
	console.log("Delay Time - " + delayTime);
	communicationController.sendMessageToArdunio("furnaceTurnOn", 69);
	dbController.setFurnaceChange("FurnOnForWater");
	stateFurnace = "on";
	// set timer
	setTimeout(endRunForWater, delayTime);
/*
	switch (howLong){
		case 30:
			console.log ("in furn cntrl run furn for hot water 30");
			runDelayer(1800000);
			break;
		case 60:
			console.log ("in furn cntrl run furn for hot water 60");
			runDelayer(3600000);
			break;
		}; */
};

exports.changeFurnState = function (newState){
	stateFurnace = newState;
};

//  called from the route controller get general settings
exports.getFurnaceSettings = function (req, res){
	furnaceSettings.minHouseTemp = minHouseTemp;
	furnaceSettings.maxHouseTemp = maxHouseTemp;
	furnaceSettings.currentSensor = currentArduinoOffSensor;
	return (furnaceSettings);
};

// called from the route controller get current furnace settings
exports.getAllFurnSettings = function (req, res){

	var allFurnaceSettings = {
		currentSensor: currentArduinoOffSensor,
		morningMinTempWeekDaySet: morningMinTempWeekDay,
		morningMaxTempWeekDaySet: morningMaxTempWeekDay,
		middayMinTempWeekDaySet: middayMinTempWeekDay,
		middayMaxTempWeekDaySet: middayMaxTempWeekDay,
		eveningMinTempWeekDaySet: eveningMinTempWeekDay,
		eveningMaxTempWeekDaySet: eveningMaxTempWeekDay,
		nightMinTempWeekDaySet: nightMinTempWeekDay,
		nightMaxTempWeekDaySet: nightMaxTempWeekDay,

	    weekDayMorningOn: furnaceSettings.weekDayOn1,
	    weekDayDayOn: furnaceSettings.weekDayOff1,
	    weekDayEveningOn: furnaceSettings.weekDayOn2,
	    weekDayNightOn: furnaceSettings.weekDayOff2,
	    weekEndOn1Set: furnaceSettings.weekEndOn1,
	    weekEndOff1Set: furnaceSettings.weekEndOff1,
	    weekEndOn2Set: furnaceSettings.weekEndOn2,
	    weekEndOff2Set: furnaceSettings.weekEndOff2,
	    runModeSet: furnaceSettings.runMode,
	    currentSensorSet: furnaceSettings.currentSensor
	};
	console.log("furn cntrl all furnace settings - ");
	console.log(allFurnaceSettings);
	res.send (allFurnaceSettings);
};

// within furnace run time, check if we should start the furnace
inTimeCheckTemps = function (){
	console.log("In Time, Check if we should Turn Furnace on");
	console.log("houseTemp - " + houseTemp);
	console.log("minHouseTemp - " + minHouseTemp);
	
	if (houseTemp < minHouseTemp){
		communicationController.sendMessageToArdunio("furnaceChange", "on");
		console.log("In Furnace Controller - Check Temps, Turning Furnace ON");
		stateFurnace = "on";
		dbController.setFurnaceChange("turnedFurnaceOn");
	}
};

// Main Entry Point
// entry point from the db controller with new avg temperatures
exports.checkFurnace = function (furnaceTemp, familyTemp, bedroomTemp, deskTemp, outsideTemp){
	console.log("Entering the Furnace Controller, FURNACE IS - " + stateFurnace);
	//currentDayAndTime = recircController.getCurrentTime();


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

	dayAndTime.day = date_ob.getDay();
	dayOfTheWeek = dayAndTime.day;
	dayAndTime.time = currentTime;
	console.log("Current Time in FURN cntrl- " + currentTime + ", on - " + dayOfTheWeek);

/*
var FurnaceSettings = [{
	id: 0,
    pipeTempOn: 0,
    pipeTempOff: 0,
    weekDayOn1: "6:00",
    weekDayOff1: "9:00",
    weekDayOn2: "16:30",
    weekDayOff2: "23:30",
    weekEndOn1: '0',
    weekEndOff1: '0',
    weekEndOn2: '0',
    weekEndOff2: '0'
}];
*/
	// Make temperature adjustments if required
	console.log("NOT a weekend");
	// at 6 AM we'll up the temps
	console.log(furnaceSettings.weekDayOn1);
	if (currentTime > furnaceSettings.weekDayOn1 && currentTime < furnaceSettings.weekDayOn1_2){
		console.log("just adjusted temps for morning");
		minHouseTemp = morningMinTempWeekDay;
		maxHouseTemp = morningMaxTempWeekDay;
	};
	// at 9 AM we'll set temps back down
	console.log(furnaceSettings.weekDayOff1);
	if (currentTime > furnaceSettings.weekDayOff1 && currentTime < furnaceSettings.weekDayOff1_2){
	// && currentTime < FurnaceSettings.weekDayOn2){
		console.log("just adjusted temps for mid day");
		minHouseTemp = middayMinTempWeekDay;
		maxHouseTemp = middayMaxTempWeekDay;
	};
	// at 4:30 PM we'll up the temps
	console.log(furnaceSettings.weekDayOn2);
	if (currentTime > furnaceSettings.weekDayOn2 && currentTime < furnaceSettings.weekDayOn2_2){
		console.log("just adjusted furn temps for evening");
		minHouseTemp = eveningMinTempWeekDay;
		maxHouseTemp = eveningMaxTempWeekDay;
	};

	// at 11:30 PM we'll set the temps down for night
	console.log(furnaceSettings.weekDayOff2);
	if (currentTime > furnaceSettings.weekDayOff2 && currentTime < furnaceSettings.weekDayOff2_2){
		console.log("just adjusted furn temps for night");
		minHouseTemp = nightMinTempWeekDay;
		maxHouseTemp = nightMaxTempWeekDay;
	};


	// Arduino sends flag (status) packet right before sending a temperature packet
	currentArduinoStates = communicationController.getState();
	if (stateFurnace == "on"){
		if (currentArduinoStates.stateFurnace == "off" ){
		// local furnace state ON but state machine is OFF - Arduino just turned it off
		console.log("looks like the arduino just turned the furnace off");
		stateFurnace = "off";
		dbController.setFurnaceChange("turnedFurnaceOff");
		} else {
			// check if we're in run for hot water and should turn off
			// check state
			if (currentArduinoStates.stateHomeAway == "Run Furnace For Hot Water 30" || currentArduinoStates.stateHomeAway == "Run Furnace For Hot Water 60"){
				console.log("in furn CNTRL furn ON, state - Hot water 30 ~ 60");
				if (currentRunDelayCount == 0){
					// we ran for hot wqater to the limit so turn off
					communicationController.sendMessageToArdunio("furnaceChange");
					communicationController.sendMessageToArdunio("whichSensor", "familyroom");
				};
			};
		}
	/*if (stateFurnace == "on") {
		console.log("furnace is running - check if we should turn it off");
		if (furnaceTemp >= furnaceTempMax){
			console.log("in furnace cntrl - turning furnace off");
			// comment out te following - assume Arduino turns furnace off
			//communicationController.sendMessageToArdunio("furnaceTurnOff")
			dbController.setFurnaceChange("turnedFurnaceOff");
			stateFurnace = "off";
		}
	// furnace is off
	} 
*/

	}else if (stateFurnace == "off"){ 
		console.log("Furnace is off so check if turn on **********");

		// sets which temp to the last reported temp from the dbcontroller who averaged the readings
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

//	if (outsideTemp < 40){
//		if (familyRmTemp < )

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
			maxHouseTemp = newTemp;
			break;
		case "minHouseTemp":
			minHouseTemp = newTemp;
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

// called fromt the com controller reflecting Arduino 
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
	maxHouseTemp = currentMaxHouseTemp;
};

// day time
	// avg sum temp < 

// morning or evening

// night
