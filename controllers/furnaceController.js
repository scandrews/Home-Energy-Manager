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

var whichTemp = "Desk"; // default family room
	// 1 - bedroom
	// 3 - desk

// states
var stateFurnace = "off";

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

// entry point from the communications controller with new temperatures
exports.checkFurnace = function (furnaceTemp, familyTemp, bedroomTemp, deskTemp, outsideTemp){
	console.log("Entering the Furnace Controller, FURNACE IS - " + stateFurnace);
	//currentDayAndTime = recircController.getCurrentTime();
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
		console.log("Current Time - " + currentTime);

		//dayAndTime.day = date_ob.getDay();
		//dayOfTheWeek = dayAndTime.day;
		//dayAndTime.time = currentTime;

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

		//if(currentTime > morningStartTime && currentTime < morningEndTime){
				inTimeCheckTemps()
		//}  else if (currentTime > afternoonStartTime && currentTime < afternoonEndTime){
		//		inTimeCheckTemps()
		//}


	// end furnace temp is below minimum		
	}

//	if (outsideTemp < 40){
//		if (familyRmTemp < )

}


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

exports.setFurnaceTemps = function (whichLTemp, newTemp){
	if (whichLTemp == "minFurnaceTemp"){
		furnaceTempMin = newTemp;
	} else if (whichLTemp == "maxFurnaceTemp"){
		furnaceTempMax = newTemp;
	} else if (whichLTemp == "maxHouseTemp"){
		maxHouseTemp = newTemp;
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
