
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
var maxHouseTemp = 69;
var currentTime = "";
var mornOnWDFlag = true;
var midDayOnWDFlag = true;
var eveningOnWDFlag = true;
var nightOnWDFlag = true;

var currentTime = "";
var dayAndTime = {
	time: "",
	day: 0
};

var countRunForWater = 0;
var runForWaterInterval;
var currentArduinoOffSensor = "familyroom"; // default family room
var keepOldSensor = "familyroom";  // keep current sensor while on manual run
	// 1 - bedroom
	// 3 - desk

var morningMinTempWeekDay = 66;
var morningMaxTempWeekDay = 69;
var middayMinTempWeekDay = 65;
var middayMaxTempWeekDay = 68;
var eveningMinTempWeekDay = 66;
var eveningMaxTempWeekDay = 69;
var nightMinTempWeekDay = 65;
var nightMaxTempWeekDay = 67;

var morningMinTempWeekEnd = 66;
var morningMaxTempWeekEnd = 69;
var middayMinTempWeekEnd = 66;
var middayMaxTempWeekEnd = 69;
var eveningMinTempWeekEnd = 66;
var eveningMaxTempWeekEnd = 69;
var nightMinTempWeekEnd = 65;
var nightMaxTempWeekEnd = 67;
var awayMinTemp = 58;
var awayMaxTemp = 62;

var furnaceSettings = {
	id: 0,
    minHouseTemp: 0,
    maxHouseTemp: 0,
    morningOnweekDay: "06:00",
    midDayOnWeekday: "09:30",
    eveningOnWeekday: "16:30",
    nightOnWeekday: "23:30",
    morningOnWeekEnd: "07:00",
    midDayOnWeekEnd: "12:00",
    eveningOnWeekEnd: "16:00",
    nightOnWeekEnd: "23:30",
    runMode: currentArduinoOffSensor,      //  ****** this needs to be implemented  ******
    currentSensor: currentArduinoOffSensor
};


//// states
var stateFurnace = "off";
//var cuvar2rrentSaveDelayCount


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
	countRunForWater = howLong * 60;
	setTimeout(startRunForWater, 3000);
};

function startRunForWater(){
	dbController.setFurnaceChange("FurnOnForWater");
	communicationController.sendMessageToArdunio("furnaceTurnOn", 69);
	stateFurnace = "on";
	runForWaterInterval = setInterval(checkForEnd, 1000);
	//let myVar = setInterval(checkForEnd, 1000);
};

function checkForEnd(){
	if (countRunForWater <= 0){
		console.log("In Run For Water, count - " + countRunForWater);
		endRunForWater();
	} else {
		countRunForWater --;
		console.log("In Run For Water, count - " + countRunForWater);
	};
};

function endRunForWater(){
	//clearInterval(myVar);
	clearInterval(runForWaterInterval);
	communicationController.sendMessageToArdunio("whichSensor", keepOldSensor);
	//currentArduinoOffSensor = keepOldSensor;  let's wait for it to come back from Arduino
	console.log("In End RFW Delay, KEEP OLD - " + keepOldSensor);
	stateFurnace = "off";
	communicationController.changeState("changeHome-Away", "back");
	setTimeout(continueEndRunForWater, 3000);
};

function continueEndRunForWater(){
	communicationController.sendMessageToArdunio("furnaceTurnOff", 69);
	dbController.setFurnaceChange("FurnOffForWater");
};

exports.getRunForWaterCount = function(){
	var countInMin = secondsToHms(countRunForWater)
	return (countInMin);
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

	    weekDayMorningOn: furnaceSettings.morningOnweekDay,
		morningMinTempWeekDaySet: morningMinTempWeekDay,
		morningMaxTempWeekDaySet: morningMaxTempWeekDay,
	    weekDayDayOn: furnaceSettings.midDayOnWeekday,
		middayMinTempWeekDaySet: middayMinTempWeekDay,
		middayMaxTempWeekDaySet: middayMaxTempWeekDay,
	    weekDayEveningOn: furnaceSettings.eveningOnWeekday,
		eveningMinTempWeekDaySet: eveningMinTempWeekDay,
		eveningMaxTempWeekDaySet: eveningMaxTempWeekDay,
	    weekDayNightOn: furnaceSettings.nightOnWeekday,
		nightMinTempWeekDaySet: nightMinTempWeekDay,
		nightMaxTempWeekDaySet: nightMaxTempWeekDay,

	    weekEndMorningOn: furnaceSettings.morningOnWeekEnd,
		morningMinTempWeekEndSet: morningMinTempWeekEnd,
		morningMaxTempWeekEndSet: morningMaxTempWeekEnd,
	    weekEndDayOn: furnaceSettings.midDayOnWeekEnd,
		middayMinTempWeekEndSet: middayMinTempWeekEnd,
		middayMaxTempWeekEndSet: middayMaxTempWeekEnd,
	    weekEndEveningOn: furnaceSettings.eveningOnWeekEnd,
		eveningMinTempWeekEndSet: eveningMinTempWeekEnd,
		eveningMaxTempWeekEndSet: eveningMaxTempWeekEnd,
	    weekEndNightOn: furnaceSettings.nightOnWeekEnd,
		nightMinTempWeekEndSet: nightMinTempWeekEnd,
		nightMaxTempWeekEndSet: nightMaxTempWeekEnd,

		awayMinTempSet: awayMinTemp,
		awayMaxTempSet: awayMaxTemp,

	    runModeSet: furnaceSettings.runMode,
	    currentSensorSet: currentArduinoOffSensor
	};
	console.log("furn cntrl get all furnace settings - ");
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


	// Make temperature adjustments if required
	if (dayOfTheWeek == 6 || dayOfTheWeek == 0){
		console.log("It's a weekend YEA");

		// at 6 AM we'll up the temps
		console.log(furnaceSettings.morningOnWeekEnd);
		if (currentTime > furnaceSettings.morningOnWeekEnd && currentTime < furnaceSettings.midDayOnWeekEnd && mornOnWDFlag){
			communicationController.changeFurnaceState("weekEndMorning");
			console.log("just adjusted temps for morning");
			mornOnWDFlag = false;
			nightOnWDFlag = true;
			minHouseTemp = morningMinTempWeekEnd;
			maxHouseTemp = morningMaxTempWeekEnd;
			communicationController.sendMessageToArdunio("changeHouseMaxTemp", maxHouseTemp)
		} else
		// at 9 AM we'll set temps back down
		console.log(furnaceSettings.midDayOnWeekEnd);
		if (currentTime > furnaceSettings.midDayOnWeekEnd && currentTime < furnaceSettings.eveningOnWeekEnd && midDayOnWDFlag){
			communicationController.changeFurnaceState("weekEndDay");
			console.log("just adjusted temps for mid day");
			midDayOnWDFlag = false;
			minHouseTemp = middayMinTempWeekEnd;
			maxHouseTemp = middayMaxTempWeekEnd;
			communicationController.sendMessageToArdunio("changeHouseMaxTemp", maxHouseTemp)
		} else
		// at 4:30 PM we'll up the temps
		console.log(furnaceSettings.eveningOnWeekEnd);
		if (currentTime > furnaceSettings.eveningOnWeekEnd && currentTime < furnaceSettings.nightOnWeekEnd && eveningOnWDFlag){
			communicationController.changeFurnaceState("weekEndEvening");
			console.log("just adjusted furn temps for evening");
			eveningOnWDFlag = false;
			minHouseTemp = eveningMinTempWeekEnd;
			maxHouseTemp = eveningMaxTempWeekEnd;
			communicationController.sendMessageToArdunio("changeHouseMaxTemp", maxHouseTemp)
		} else

		// at 11:30 PM we'll set the temps down for night
		console.log(furnaceSettings.nightOnWeekEnd);
		if (currentTime > furnaceSettings.nightOnWeekEnd && nightOnWDFlag){
			communicationController.changeFurnaceState("weekEndNight");
			console.log("just adjusted furn temps for night");
			nightOnWDFlag = false;
			minHouseTemp = nightMinTempWeekEnd;
			maxHouseTemp = nightMaxTempWeekEnd;
		};

		// after midnight reset all flags
		if (currentTime < "00:05" && mornOnWDFlag == false){
			mornOnWDFlag = true;
			midDayOnWDFlag = true;
			eveningOnWDFlag = true;
		}

	}
	else {
		console.log("NOT a weekend");
		// Make temperature adjustments if required
		// at 6 AM we'll up the temps
		console.log(furnaceSettings.morningOnweekDay);
		if (currentTime > furnaceSettings.morningOnweekDay && currentTime < furnaceSettings.midDayOnWeekday && mornOnWDFlag){
			communicationController.changeFurnaceState("weekDayMorning");
			console.log("just adjusted temps for morning");
			mornOnWDFlag = false;
			nightOnWDFlag = true;
			minHouseTemp = morningMinTempWeekDay;
			maxHouseTemp = morningMaxTempWeekDay;
			communicationController.sendMessageToArdunio("changeHouseMaxTemp", maxHouseTemp)
		} else
		// at 9 AM we'll set temps back down
		console.log(furnaceSettings.midDayOnWeekday);
		if (currentTime > furnaceSettings.midDayOnWeekday && currentTime < furnaceSettings.eveningOnWeekday && midDayOnWDFlag){
			communicationController.changeFurnaceState("weekDayDay");
			console.log("just adjusted temps for mid day");
			midDayOnWDFlag = false;
			minHouseTemp = middayMinTempWeekDay;
			maxHouseTemp = middayMaxTempWeekDay;
			communicationController.sendMessageToArdunio("changeHouseMaxTemp", maxHouseTemp)
		} else
		// at 4:30 PM we'll up the temps
		console.log(furnaceSettings.eveningOnWeekday);
		if (currentTime > furnaceSettings.eveningOnWeekday && currentTime < furnaceSettings.nightOnWeekday && eveningOnWDFlag){
			communicationController.changeFurnaceState("weekDayEvening");
			console.log("just adjusted furn temps for evening");
			eveningOnWDFlag = false;
			minHouseTemp = eveningMinTempWeekDay;
			maxHouseTemp = eveningMaxTempWeekDay;
			communicationController.sendMessageToArdunio("changeHouseMaxTemp", maxHouseTemp)
		} else

		// at 11:30 PM we'll set the temps down for night
		console.log(furnaceSettings.nightOnWeekday);
		if (currentTime > furnaceSettings.nightOnWeekday && nightOnWDFlag){
			communicationController.changeFurnaceState("weekDayNight");
			console.log("just adjusted furn temps for night");
			nightOnWDFlag = false;
			minHouseTemp = nightMinTempWeekDay;
			maxHouseTemp = nightMaxTempWeekDay;
			communicationController.sendMessageToArdunio("changeHouseMaxTemp", maxHouseTemp)
		};

		// after midnight reset all flags
		if (currentTime < "00:05" && mornOnWDFlag == false){
			mornOnWDFlag = true;
			midDayOnWDFlag = true;
			eveningOnWDFlag = true;
		}
	};


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
	maxHouseTemp = currentMaxHouseTemp;
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
			var returnStatus = dbController.updateFurnaceSettings(key, newSettings[key]);
			switch (key){
				case "weekDayMorningOnTime":
					morningOnweekDay = newSettings[key];
					break;
				case "weekDayMorningMinTemp":
					morningMinTempWeekDay = newSettings[key];
					break;
				case "weekDayMorningMaxTemp":
					morningMaxTempWeekDay = newSettings[key];
					break;
				case "weekDayMidDayOnTime":
					midDayOnWeekday = newSettings[key];
					break;
				case "weekDayMidDayMinTemp":
					middayMinTempWeekDay = newSettings[key];
					break;
				case "weekDayMidDayMaxTemp":
					middayMaxTempWeekDay = newSettings[key];
					break;
				case "weekDayEveningOnTime":
					eveningOnWeekday = newSettings[key];
					break;
				case "weekDayEveningMinTemp":
					eveningMinTempWeekDay = newSettings[key];
					break;
				case "weekDayEveningMaxTemp":
					eveningMaxTempWeekDay = newSettings[key];
					break;
				case "weekDayNightOnTime":
					nightOnWeekday = newSettings[key];
					break;
				case "weekDayNightMinTemp":
					nightMinTempWeekDay = newSettings[key];
					break;
				case "weekDayNightMaxTemp":
					nightMaxTempWeekDay = newSettings[key];
					break;
				case "weekEndMorningOnTime":
					morningOnWeekEnd = newSettings[key];
					break;
				case "weekEndMorningMinTemp":
					morningMinTempWeekEnd = newSettings[key];
					break;
				case "weekEndMorningMaxTemp":
					morningMaxTempWeekEnd = newSettings[key];
					break;
				case "weekEndMidDayOnTime":
					midDayOnWeekEnd = newSettings[key];
					break;
				case "weekEndMidDayMinTemp":
					middayMinTempWeekEnd = newSettings[key];
					break;
				case "weekEndMidDayMaxTemp":
					middayMaxTempWeekEnd = newSettings[key];
					break;
				case "weekEndEveningOnTime":
					eveningOnWeekEnd = newSettings[key];
					break;
				case "weekEndEveningMinTemp":
					eveningMinTempWeekEnd = newSettings[key];
					break;
				case "weekEndEveningMaxTemp":
					eveningMaxTempWeekEnd = newSettings[key];
					break;
				case "weekEndNightOnTime":
					nightOnWeekEnd = newSettings[key];
					break;
				case "weekEndNightMinTemp":
					nightMinTempWeekEnd = newSettings[key];
					break;
				case "weekEndNightMaxTemp":
					nightMaxTempWeekEnd = newSettings[key];
					break;

				case "awayMinTemp":
					awayMinTemp = newSettings[key];
					break;
				case "awayMaxTemp":
					awayMaxTemp = newSettings[key];
					break;

				default:
					console.log("ERROR");
					break;
			}
			console.log("return from update Furnsettings - " + returnStatus);
		}
	};

}


