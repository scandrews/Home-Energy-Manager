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
var houseTemp = 0;
var minHouseTemp = 66;
var maxHouseTemp = 70;
var currentTime = "";
//var currentTime = "00:00";
var morningStartTime = "05:00";
var morningEndTime = "10:00";
var afternoonStartTime = "16:00";
var afternoonEndTime = "21:30";

var currentTime = "";
var dayAndTime = {
	time: "",
	day: 0
};

var whichTemp = "Desk"; // default family room
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

var FurnaceSettings = {
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
    weekEndOff2: '0'
};


// states
var stateFurnace = "off";

/*
exports.getFurnaceSettings = function (){
	var furnSettingsObject = {
		minHouseTemp: minHouseTemp,
		maxHouseTemp: maxHouseTemp,
		minFurnaceTemp: furnaceTempMin,
		maxFurnaceTemp: furnaceTempMax,
		curFurnTemp: furnaceTemp,
		currentSensor: whichTemp
	};
	return furnSettingsObject
};
*/

exports.getFurnaceSettings = function (req, res){
	FurnaceSettings.minHouseTemp = minHouseTemp;
	FurnaceSettings.maxHouseTemp = maxHouseTemp;
	return (FurnaceSettings);
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
	if(date_ob.getDay() == 6 || date_ob.getDay() == 0){
		console.log("It's a weekend YEA");

		// at 6 AM we'll up the temps
		if (currentTime > "6:00" && currentTime < "6:10"){
			minHouseTemp = morningMinTemp;
			maxHouseTemp = morningMaxTemp;
		};
		// at 9 AM we'll set temps back down
		if (currentTime > "9:00" && currentTime < "9:10"){
			minHouseTemp = middayMinTemp;
			maxHouseTemp = middayMaxTemp;
		};
		// at 4:30 PM we'll up the temps
		if (currentTime > "16:30" && currentTime < "16:40"){
			minHouseTemp = eveningMinTemp;
			maxHouseTemp = eveningMaxTemp;
		};

		// at 11:30 PM we'll set the temps down for night
		if (currentTime > "23:30" && currentTime < "23:40"){
			minHouseTemp = nightMinTemp;
			maxHouseTemp = nightMaxTemp;
		};

	}
	else {
*/
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

		console.log("NOT a weekend");
		// at 6 AM we'll up the temps
		console.log(FurnaceSettings.weekDayOn1);
		if (currentTime > FurnaceSettings.weekDayOn1 && currentTime < FurnaceSettings.weekDayOn1_2){
			console.log("just adjusted temps for morning");
			minHouseTemp = morningMinTempWeekDay;
			maxHouseTemp = morningMaxTempWeekDay;
		};
		// at 9 AM we'll set temps back down
		console.log(FurnaceSettings.weekDayOff1);
		if (currentTime > FurnaceSettings.weekDayOff1 && currentTime < FurnaceSettings.weekDayOff1_2){
		// && currentTime < FurnaceSettings.weekDayOn2){
			console.log("just adjusted temps for mid day");
			minHouseTemp = middayMinTempWeekDay;
			maxHouseTemp = middayMaxTempWeekDay;
		};
		// at 4:30 PM we'll up the temps
		console.log(FurnaceSettings.weekDayOn2);
		if (currentTime > FurnaceSettings.weekDayOn2 && currentTime < FurnaceSettings.weekDayOn2_2){
			console.log("just adjusted furn temps for evening");
			minHouseTemp = eveningMinTempWeekDay;
			maxHouseTemp = eveningMaxTempWeekDay;
		};

		// at 11:30 PM we'll set the temps down for night
		console.log(FurnaceSettings.weekDayOff2);
		if (currentTime > FurnaceSettings.weekDayOff2 && currentTime < FurnaceSettings.weekDayOff2_2){
			console.log("just adjusted furn temps for night");
			minHouseTemp = nightMinTempWeekDay;
			maxHouseTemp = nightMaxTempWeekDay;
		};

//	};


	
	currentArduinoStates = communicationController.getState();
	if (stateFurnace == "on" && currentArduinoStates.stateFurnace == "off" ){
		// local furnace state ON but state machine is OFF - Arduino just turned it off
		console.log("looks like the arduino just turned the furnace off");
		stateFurnace = "off";
		dbController.setFurnaceChange("turnedFurnaceOff");
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

*/	else if (stateFurnace == "off"){ 
		console.log("Furnace is off so check if turn on **********");


		// sets which temp to the last reported temp from the dbcontroller who averaged the readings
		console.log("whichTemp - " + whichTemp);
		switch (whichTemp){
			case "Bedroom":
				console.log("In CASE 1 ** bedroomTemp - " + bedroomTemp);
				houseTemp = bedroomTemp;
				break;
			case "Familyroom":
				console.log("in CASE 2 ** familyTemp - " + familyTemp);
				houseTemp = familyTemp;
				break;
			case "Desk":
				console.log("in CASE 3 ** deskTemp - " + deskTemp);
				houseTemp = deskTemp;
				break;
			default:
				console.log("Somthing messed up in the Furnace Controller");
		};

		console.log("morningStartTime - " + morningStartTime);
		console.log("morning end time - " + morningEndTime);
		console.log("afternoonStartTime - " + afternoonStartTime);
		console.log("afternoonEndTime - " + afternoonEndTime);

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
			//whichTemp = toWhoChangesFurn;
			communicationController.sendMessageToArdunio ("whichSensor", toWhoChangesFurn);
//			console.log("return from change whichh sensor - " + returnStatus);
	return (toWhoChangesFurn);
};

// called fromt the com controller reflecting Arduino 
exports.setFurnOnOffSensor = function (toWhichSensor){
	console.log("in furn cntrl toWhichSensor - " + toWhichSensor);
	switch (toWhichSensor){
		case '0':
			whichTemp = "None";
			break;
		case '1':
			whichTemp = "Bedroom";
			break;
		case '2':
			whichTemp = "Familyroom";
			break;
		case '3':
			whichTemp = "Desk";
			break;
		default:
			console.log ("ERROR in set furn on off - in furnace controller");
	};
};

// day time
	// avg sum temp < 

// morning or evening

// night
