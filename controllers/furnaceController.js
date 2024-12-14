// version 2.0.2

var version = "2.0.3";
var schemaVersion = "2.0.3";


var dbController = require ('./databasecontroller');
var recircController = require ('./recircController');
var comController = require ('./communicationsController');

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
var localTimeOfDay = "";
	// "weekEndMorning", "weekEndDay", "weekEndEvening", etc

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
	WeekDayEveningMinTemp: 65,
	WeekDayEveningMaxTemp: 68,
	WeekDayNightMinTemp: 62,
	WeekDayNightMaxTemp: 65,

	WeekEndMorningMinTemp: 66,
	WeekEndMorningMaxTemp: 69,
	WeekEndMiddayMinTemp: 64,
	WeekEndMiddayMaxTemp: 67,
	WeekEndEveningMinTemp: 66,
	WeekEndEveningMaxTemp: 69,
	WeekEndNightMinTemp: 62,
	WeekEndNightMaxTemp: 65,
	awayMinTemp: 58,
	awayMaxTemp: 61,

	minHouseTemp: 58,
	maxHouseTemp: 61,

    weekDayMorningOnTime: "06:00",
    weekDayMiddayOnTime: "08:30",
    weekDayEveningOnTime: "17:00",
    weekDayNightOnTime: "23:00",
    weekEndMorningOnTime: "07:00",
    weekEndMiddayOnTime: "11:00",
    weekEndEveningOnTime: "16:00",
    weekEndNightOnTime: "23:30",
    state: "Away",
    currentSensor: currentArduinoOffSensor
};


//// states
var stateFurnace = "off";
//var cuvar2rrentSaveDelayCount

// global to keep the current temperatures
var currentTemperatures = {
	furnaceTemp : 0.0,
	familyTemp : 0.0,
	bedroomTemp : 0.0,
	deskTemp : 0.0,
	outsideTemp : 0.0,
	currentState : 0.0
};

exports.getVersion = function (){
	return (version);
};

function secondsToHms(d) {
    d = Number(d);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return m + ":" + s; 
};



// Main Entry Point
// entry point from the db controller with new avg temperatures
exports.checkFurnace = function (furnaceTemp, familyTemp, bedroomTemp, deskTemp, outsideTemp, currentState){

	console.log("* * * * * * Entering the Furnace Controller, FURNACE IS - " + stateFurnace + " * * * * * *");

	currentTemperatures.furnaceTemp = furnaceTemp;
	currentTemperatures.familyTemp = familyTemp;
	currentTemperatures.bedroomTemp = bedroomTemp;
	currentTemperatures.deskTemp = deskTemp;
	currentTemperatures.outsideTemp = outsideTemp;
	currentTemperatures.currentState = currentState;

			// don't hit the db for the recirc settings every time through
			// if NOT the first time through or if we've been through test count times, do
			// normal processing otherwise get the recirc settings

		/*
			console.log("furnSetting id - " + furnaceSettings.id);
			console.log("get settings count - " + getSettingsCount);
			console.log("get settings interval - " + getSettingsInterval);
			// id is 0 first tile through, or refresh every interval
			if (furnaceSettings.id == 0 || getSettingsCount >= getSettingsInterval) {

				//update furnace settings new subroutine
				getNewFurnaceSettins(currentState.stateHomeAway, function (){
					console.log("******* in check furnace, callback after get new furnace settings *******");
					checkIfFurnaceAdjust(furnaceTemp, familyTemp, bedroomTemp, deskTemp, outsideTemp, currentState);
					getSettingsCount = 0;
				})
			// end get furnace setting from the db
			} else {
				console.log("******* in check furnace, no need to get new furnace settings *******");
			};
		*/
		//checkIfFurnaceAdjust(furnaceTemp, familyTemp, bedroomTemp, deskTemp, outsideTemp, currentState);
		// end main entry
		//};


		//checkIfFurnaceAdjust = function(furnaceTemp, familyTemp, bedroomTemp, deskTemp, outsideTemp, currentState){
	console.log("* * just entered the check if furnace adjust * *");
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


	// set the time of day
	if (dayOfTheWeek == 6 || dayOfTheWeek == 0){
		console.log("It's a weekend YEA");
			if (currentTime > furnaceSettings.weekEndMorningOnTime && currentTime < furnaceSettings.weekEndMiddayOnTime){
				localTimeOfDay = "weekEndMorning";
				mornOnWDFlag = false;
				nightOnWDFlag = true;
				}
			else if (currentTime > furnaceSettings.weekEndMiddayOnTime && currentTime < furnaceSettings.weekEndEveningOnTime){
				localTimeOfDay = "weekEndDay";
				midDayOnWDFlag = false;
				console.log("just set the furn state to week end day");
				}
			else if (currentTime > furnaceSettings.weekEndEveningOnTime && currentTime < furnaceSettings.weekEndNightOnTime){
				localTimeOfDay = "weekEndEvening";
				eveningOnWDFlag = false;
				console.log("just set the furn state to week end evening");
				}
			else if (currentTime > furnaceSettings.weekEndNightOnTime || currentTime < furnaceSettings.weekEndMorningOnTime){
				localTimeOfDay = "weekEndNight";
				console.log("just set the furn state to week end night");
				nightOnWDFlag = false;
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
		console.log(furnaceSettings.weekDayEveningOnTime);
		console.log("that should have been the week day evening on time");
			if (currentTime > furnaceSettings.weekDayMorningOnTime && currentTime < furnaceSettings.weekDayMiddayOnTime){
				localTimeOfDay = "weekDayMorning";
				console.log("just adjusted localTimeOfDay for morning");
				mornOnWDFlag = false;
				nightOnWDFlag = true;
				}
			else if (currentTime > furnaceSettings.weekDayMiddayOnTime && currentTime < furnaceSettings.weekDayEveningOnTime){
				console.log("just adjusted localTimeOfDay for mid day");
				localTimeOfDay = "weekDayDay";
				midDayOnWDFlag = false;
				}
			else if (currentTime > furnaceSettings.weekDayEveningOnTime && currentTime < furnaceSettings.weekDayNightOnTime){
				console.log("just adjusted localTimeOfDay for evening");
				localTimeOfDay = "weekDayEvening";
				eveningOnWDFlag = false;
				}
			else if (currentTime > furnaceSettings.weekDayNightOnTime || currentTime < furnaceSettings.weekDayMorningOnTime){
				console.log("just adjusted localTimeOfDay for night");
				localTimeOfDay = "weekDayNight";
				}
			// after midnight reset all flags
			//if (currentTime < "00:05" && mornOnWDFlag == false){
			//	mornOnWDFlag = true;
			//	midDayOnWDFlag = true;
			//	eveningOnWDFlag = true;
			//}
	}
	//end set time of day


	// just changed the time of day, should adjust temps
	console.log("Should we adjust temps - " + localTimeOfDay);
	var statesHereInFurnCNTRL = comController.getState ();
	console.log("if these don't match  -  " + statesHereInFurnCNTRL.stateTimeOfDay);
	//console.log("or maybe this one - " + statesHereInFurnCNTRL.stateTimeOfDay);
	console.log("if these don't match  -  " + localTimeOfDay);
		// localTimeOfDay - "weekEndMorning", "weekEndDay", "weekEndEvening", etc
	if (localTimeOfDay != statesHereInFurnCNTRL.stateTimeOfDay){
		console.log("Just got a new Time of day state, new state - " + localTimeOfDay);
		console.log("The old time of day sate was - " + statesHereInFurnCNTRL.stateTimeOfDay);
		comController.changeFurnaceState(localTimeOfDay);
		//var currentState = comController.getState();

		console.log(currentState.stateHomeAway)
		if (currentState.stateHomeAway == "Away"){
			furnaceSettings.minHouseTemp = furnaceSettings.awayMinTemp;
			furnaceSettings.maxHouseTemp = furnaceSettings.awayMaxTemp;
		} else {

			switch (localTimeOfDay){
				case "weekDayMorning":
					console.log(furnaceSettings.weekDayMorningOnTime);
					console.log("just adjusted temps for morning");
					furnaceSettings.minHouseTemp = furnaceSettings.WeekDayMorningMinTemp;
					furnaceSettings.maxHouseTemp = furnaceSettings.WeekDayMorningMaxTemp;
		    		break;
		    	case "weekDayDay":
					console.log(furnaceSettings.weekDayMiddayOnTime);
					console.log("just adjusted temps for mid day");
					furnaceSettings.minHouseTemp = furnaceSettings.WeekDayMiddayMinTemp;
					furnaceSettings.maxHouseTemp = furnaceSettings.WeekDayMiddayMaxTemp;
					break;
				case "weekDayEvening":
					console.log(furnaceSettings.weekDayEveningOnTime);
					console.log("just adjusted furn temps for evening");
					furnaceSettings.minHouseTemp = furnaceSettings.WeekDayEveningMinTemp;
					furnaceSettings.maxHouseTemp = furnaceSettings.WeekDayEveningMaxTemp;
					break;
				case "weekDayNight":
					console.log(furnaceSettings.weekDayNightOnTime);
					console.log("just adjusted furn temps for night");
					furnaceSettings.minHouseTemp = furnaceSettings.WeekDayNightMinTemp;
					furnaceSettings.maxHouseTemp = furnaceSettings.WeekDayNightMaxTemp;
					break;
				case "WeekEndMorning":
					console.log(furnaceSettings.weekEndMorningOnTime);
					furnaceSettings.minHouseTemp = furnaceSettings.WeekEndMorningMinTemp;
					furnaceSettings.maxHouseTemp = furnaceSettings.WeekEndMorningMaxTemp;
					console.log("just adjusted temps for morning");
					break;
				case "weekEndDay":
					console.log(furnaceSettings.weekEndMiddayOnTime);
					furnaceSettings.minHouseTemp = furnaceSettings.WeekEndMiddayMinTemp;
					furnaceSettings.maxHouseTemp = furnaceSettings.WeekEndMiddayMaxTemp;
					console.log("just adjusted temps for mid day");
					break;
				case "weekEndEvening":
					console.log("just adjusted furn temps for evening");
					furnaceSettings.minHouseTemp = furnaceSettings.WeekEndEveningMinTemp;
					furnaceSettings.maxHouseTemp = furnaceSettings.WeekEndEveningMaxTemp;
					break;
				case "weekEndNight":
					console.log(furnaceSettings.weekEndNightOnTime);
					console.log("just adjusted furn temps for night");
					furnaceSettings.minHouseTemp = furnaceSettings.WeekEndNightMinTemp;
					furnaceSettings.maxHouseTemp = furnaceSettings.WeekEndNightMaxTemp;
					break;
				default:
					console.log("*** ERROR IN THE FORCE HOUSE TEMPS UPDATE");
			// end adjust temperatures
			};
		// end if away skip temp adjustment
		}
		// after making any temperature adjustment, send new number to ardruino - com cntrl sends only if arduino doesn't match
		comController.sendMessageToArdunio("changeHouseMaxTemp", furnaceSettings.maxHouseTemp)
	// end change temps because we have a new time of day
	};


	// Arduino sends flag (status) packet right before sending a temperature packet
	currentArduinoStates = comController.getState();
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

		if (houseTemp < furnaceSettings.minHouseTemp){
			comController.sendMessageToArdunio("furnaceChange", "on");
			console.log("In Furnace Controller - Check Temps, Turning Furnace ON");
			stateFurnace = "on";
			dbController.setFurnaceChange("turnedFurnaceOn");
		}

		//inTimeCheckTemps()

	// end furnace temp is below minimum		
	}
// end chek if we should adjust furnace
};





// get the furnace setting from the db for the current home/away state, load to the 
// local global object furnace settings
getNewFurnaceSettins = function (newHome_AwayState, fn){
	console.log ("in get new funrnace setting, state - " + newHome_AwayState);

	dbController.getFurnaceSettings(newHome_AwayState, function (tempFurnaceSettings){
		console.log("* * * in furnace controller just back from getting settings");
		console.log(tempFurnaceSettings[0].state);
		console.log(tempFurnaceSettings[0].weekDayEveningOnTime);

		furnaceSettings.id = tempFurnaceSettings[0].id;
		furnaceSettings.WeekDayMorningMinTemp = tempFurnaceSettings[0].WeekDayMorningMinTemp;
		furnaceSettings.WeekDayMorningMaxTemp = tempFurnaceSettings[0].WeekDayMorningMaxTemp;
		furnaceSettings.WeekDayMiddayMinTemp = tempFurnaceSettings[0].WeekDayMiddayMinTemp;
		furnaceSettings.WeekDayMiddayMaxTemp = tempFurnaceSettings[0].WeekDayMiddayMaxTemp;
		furnaceSettings.WeekDayEveningMinTemp = tempFurnaceSettings[0].WeekDayEveningMinTemp;
		furnaceSettings.WeekDayEveningMaxTemp = tempFurnaceSettings[0].WeekDayEveningMaxTemp;
		furnaceSettings.WeekDayNightMinTemp = tempFurnaceSettings[0].WeekDayNightMinTemp;
		furnaceSettings.WeekDayNightMaxTemp = tempFurnaceSettings[0].WeekDayNightMaxTemp;

		furnaceSettings.WeekEndMorningMinTemp = tempFurnaceSettings[0].WeekEndMorningMinTemp;
		furnaceSettings.WeekEndMorningMaxTemp = tempFurnaceSettings[0].WeekEndMorningMaxTemp;
		furnaceSettings.WeekEndMiddayMinTemp = tempFurnaceSettings[0].WeekEndMiddayMinTemp;
		furnaceSettings.WeekEndMiddayMaxTemp = tempFurnaceSettings[0].WeekEndMiddayMaxTemp;
		furnaceSettings.WeekEndEveningMinTemp = tempFurnaceSettings[0].WeekEndEveningMinTemp;
		furnaceSettings.WeekEndEveningMaxTemp = tempFurnaceSettings[0].WeekEndEveningMaxTemp;
		furnaceSettings.WeekEndNightMinTemp = tempFurnaceSettings[0].WeekEndNightMinTemp;
		furnaceSettings.WeekEndNightMaxTemp = tempFurnaceSettings[0].WeekEndNightMaxTemp;
		furnaceSettings.awayMinTemp = tempFurnaceSettings[0].awayMinTemp;
		furnaceSettings.awayMaxTemp = tempFurnaceSettings[0].awayMaxTemp;

		//furnaceSettings.minHouseTemp = tempFurnaceSettings.minHouseTemp,
		//furnaceSettings.maxHouseTemp = tempFurnaceSettings.maxHouseTemp,

	    furnaceSettings.weekDayMorningOnTime = tempFurnaceSettings[0].weekDayMorningOnTime;
	    furnaceSettings.weekDayMiddayOnTime = tempFurnaceSettings[0].weekDayMiddayOnTime;
	    furnaceSettings.weekDayEveningOnTime = tempFurnaceSettings[0].weekDayEveningOnTime;
	    furnaceSettings.weekDayNightOnTime = tempFurnaceSettings[0].weekDayNightOnTime;
	    furnaceSettings.weekEndMorningOnTime = tempFurnaceSettings[0].weekEndMorningOnTime;
	    furnaceSettings.weekEndMiddayOnTime = tempFurnaceSettings[0].weekEndMiddayOnTime;
	    furnaceSettings.weekEndEveningOnTime = tempFurnaceSettings[0].weekEndEveningOnTime;
	    furnaceSettings.weekEndNightOnTime = tempFurnaceSettings[0].weekEndNightOnTime;
	    furnaceSettings.state = tempFurnaceSettings[0].state;
	    //furnaceSettings.currentSensor = tempFurnaceSettings.

		console.log("just got the new furnace settings, id - " + furnaceSettings.id);
		console.log("just got the new furnace settings, WeekDayMiddayMinTemp - " + furnaceSettings.WeekDayMiddayMinTemp);
		console.log("just got the new furnace settings, WeekDayMiddayMaxTemp - " + furnaceSettings.WeekDayMiddayMaxTemp);
		console.log("just got the new furnace settings, state - " + furnaceSettings.state);

		//return;
		//checkIfFurnaceAdjust(currentTemperatures.furnaceTemp, currentTemperatures.familyTemp, currentTemperatures.bedroomTemp, currentTemperatures.deskTemp, currentTemperatures.outsideTemp, currentTemperatures.currentState);
		console.log("geeeeezzzzzz - WWWHHHHAAATTTT TTTHHHHEEEE FFFUUUUCCCKKK");
		return (fn() );
	});
};


//getNewFurnaceSettins(furnaceSettings.state);

//  Called from the communications controller changeState
exports.changeHomeState = function (newHomeState, stateTimeOfDay){
	//furnaceSettings.state = newHomeState;
	console.log("in furnace controller just got the new state from the com controller");
	//console.log("or maybe the route controller");
	console.log("The New State is - " + newHomeState)

	//getNewFurnaceSettins(currentState.stateHomeAway, function (){

	//getNewFurnaceSettins(newHomeState, function (tempFurnaceSettings){
	console.log("just before calling the db, newHomeState - " + newHomeState);
	console.log("just before calling the db, stateTimeOfDay - " + stateTimeOfDay);
	dbController.getFurnaceSettings(newHomeState, function (tempFurnaceSettings){
		console.log("* * * in furnace controller just back from getting settings");
		console.log(tempFurnaceSettings[0].state);
		console.log(tempFurnaceSettings[0].weekDayEveningOnTime);

		furnaceSettings.id = tempFurnaceSettings[0].id;
		furnaceSettings.WeekDayMorningMinTemp = tempFurnaceSettings[0].WeekDayMorningMinTemp;
		furnaceSettings.WeekDayMorningMaxTemp = tempFurnaceSettings[0].WeekDayMorningMaxTemp;
		furnaceSettings.WeekDayMiddayMinTemp = tempFurnaceSettings[0].WeekDayMiddayMinTemp;
		furnaceSettings.WeekDayMiddayMaxTemp = tempFurnaceSettings[0].WeekDayMiddayMaxTemp;
		furnaceSettings.WeekDayEveningMinTemp = tempFurnaceSettings[0].WeekDayEveningMinTemp;
		furnaceSettings.WeekDayEveningMaxTemp = tempFurnaceSettings[0].WeekDayEveningMaxTemp;
		furnaceSettings.WeekDayNightMinTemp = tempFurnaceSettings[0].WeekDayNightMinTemp;
		furnaceSettings.WeekDayNightMaxTemp = tempFurnaceSettings[0].WeekDayNightMaxTemp;

		furnaceSettings.WeekEndMorningMinTemp = tempFurnaceSettings[0].WeekEndMorningMinTemp;
		furnaceSettings.WeekEndMorningMaxTemp = tempFurnaceSettings[0].WeekEndMorningMaxTemp;
		furnaceSettings.WeekEndMiddayMinTemp = tempFurnaceSettings[0].WeekEndMiddayMinTemp;
		furnaceSettings.WeekEndMiddayMaxTemp = tempFurnaceSettings[0].WeekEndMiddayMaxTemp;
		furnaceSettings.WeekEndEveningMinTemp = tempFurnaceSettings[0].WeekEndEveningMinTemp;
		furnaceSettings.WeekEndEveningMaxTemp = tempFurnaceSettings[0].WeekEndEveningMaxTemp;
		furnaceSettings.WeekEndNightMinTemp = tempFurnaceSettings[0].WeekEndNightMinTemp;
		furnaceSettings.WeekEndNightMaxTemp = tempFurnaceSettings[0].WeekEndNightMaxTemp;
		furnaceSettings.awayMinTemp = tempFurnaceSettings[0].awayMinTemp;
		furnaceSettings.awayMaxTemp = tempFurnaceSettings[0].awayMaxTemp;

		//furnaceSettings.minHouseTemp = tempFurnaceSettings.minHouseTemp,
		//furnaceSettings.maxHouseTemp = tempFurnaceSettings.maxHouseTemp,

	    furnaceSettings.weekDayMorningOnTime = tempFurnaceSettings[0].weekDayMorningOnTime;
	    furnaceSettings.weekDayMiddayOnTime = tempFurnaceSettings[0].weekDayMiddayOnTime;
	    furnaceSettings.weekDayEveningOnTime = tempFurnaceSettings[0].weekDayEveningOnTime;
	    furnaceSettings.weekDayNightOnTime = tempFurnaceSettings[0].weekDayNightOnTime;
	    furnaceSettings.weekEndMorningOnTime = tempFurnaceSettings[0].weekEndMorningOnTime;
	    furnaceSettings.weekEndMiddayOnTime = tempFurnaceSettings[0].weekEndMiddayOnTime;
	    furnaceSettings.weekEndEveningOnTime = tempFurnaceSettings[0].weekEndEveningOnTime;
	    furnaceSettings.weekEndNightOnTime = tempFurnaceSettings[0].weekEndNightOnTime;
	    furnaceSettings.state = tempFurnaceSettings[0].state;
	    //furnaceSettings.currentSensor = tempFurnaceSettings.

		console.log("just got the new furnace settings, id - " + furnaceSettings.id);
		console.log("just got the new furnace settings, WeekDayMiddayMinTemp - " + furnaceSettings.WeekDayMiddayMinTemp);
		console.log("just got the new furnace settings, WeekDayMiddayMaxTemp - " + furnaceSettings.WeekDayMiddayMaxTemp);
		console.log("just got the new furnace settings, state - " + furnaceSettings.state);

		//return;
		//checkIfFurnaceAdjust(currentTemperatures.furnaceTemp, currentTemperatures.familyTemp, currentTemperatures.bedroomTemp, currentTemperatures.deskTemp, currentTemperatures.outsideTemp, currentTemperatures.currentState);
		console.log("geeeeezzzzzz - WWWHHHHAAATTTT TTTHHHHEEEE FFFUUUUCCCKKK");
		//return (fn() );
	//});

		console.log("* * * in furnace controller just back from getting settings  * * * in change state * * * * ");
		console.log(furnaceSettings.state);
		console.log(furnaceSettings.WeekDayMiddayMinTemp);
		console.log(furnaceSettings.WeekDayMiddayMaxTemp);
		console.log(stateTimeOfDay);

		if (newHomeState == "Away"){
				furnaceSettings.minHouseTemp = furnaceSettings.minHouseTemp;
				furnaceSettings.maxHouseTemp = furnaceSettings.maxHouseTemp;
		} else {
				switch (stateTimeOfDay){
					case "weekDayMorning":
						furnaceSettings.minHouseTemp = furnaceSettings.WeekDayMorningMinTemp;
			    		furnaceSettings.maxHouseTemp = furnaceSettings.WeekDayMorningMaxTemp;
			    		break;
			    	case "weekDayDay":
			    		console.log("in the switch week day day");
						console.log(furnaceSettings);
						furnaceSettings.minHouseTemp = furnaceSettings.WeekDayMiddayMinTemp;
						furnaceSettings.maxHouseTemp = furnaceSettings.WeekDayMiddayMaxTemp;
						break;
					case "weekDayEvening":
			    		console.log("in the switch week day day");
						console.log(furnaceSettings.state);
						furnaceSettings.minHouseTemp = furnaceSettings.WeekDayEveningMinTemp;
						furnaceSettings.maxHouseTemp = furnaceSettings.WeekDayEveningMaxTemp;
						break;
					case "weekDayNight":
						furnaceSettings.minHouseTemp = furnaceSettings.WeekDayNightMinTemp;
						furnaceSettings.maxHouseTemp = furnaceSettings.WeekDayNightMaxTemp;
						break;
					case "WeekEndMorning":
						furnaceSettings.minHouseTemp = furnaceSettings.WeekEndMorningMinTemp;
						furnaceSettings.maxHouseTemp = furnaceSettings.WeekEndMorningMaxTemp;
						break;
					case "weekEndDay":
						furnaceSettings.minHouseTemp = furnaceSettings.WeekEndMiddayMinTemp;
						furnaceSettings.maxHouseTemp = furnaceSettings.WeekEndMiddayMaxTemp;
						break;
					case "weekEndEvening":
						furnaceSettings.minHouseTemp = furnaceSettings.WeekEndEveningMinTemp;
						furnaceSettings.maxHouseTemp = furnaceSettings.WeekEndEveningMaxTemp;
						break;
					case "weekEndNight":
						furnaceSettings.minHouseTemp = furnaceSettings.WeekEndNightMinTemp;
						furnaceSettings.maxHouseTemp = furnaceSettings.WeekEndNightMaxTemp;
						break;
					case "Away":
						console.log("*** ERROR IN THE FORCE HOUSE TEMPS UPDATE 1");
						break;
					default:
						console.log("*** ERROR IN THE FORCE HOUSE TEMPS UPDATE 2");

					}
		};

		console.log("just forced an update to the house temps, min house temp - " + furnaceSettings.minHouseTemp);
		console.log("just forced an update to the house temps, max house temp - " + furnaceSettings.maxHouseTemp);

		//checkIfFurnaceAdjust(currentTemperatures.furnaceTemp, currentTemperatures.familyTemp, currentTemperatures.bedroomTemp, currentTemperatures.deskTemp, currentTemperatures.outsideTemp, currentTemperatures.currentState);

		comController.sendMessageToArdunio("changeHouseMaxTemp", furnaceSettings.maxHouseTemp)

		inTimeCheckTemps()
	});
	// end get furnace setting from the db
};




// within furnace run time, check if we should start the furnace
inTimeCheckTemps = function (){
	console.log("In Time, Check if we should Turn Furnace on");
	console.log("Current house Temp - " + houseTemp);
	console.log("Minimum House Temp - " + furnaceSettings.minHouseTemp);
	
	if (houseTemp < furnaceSettings.minHouseTemp){
		comController.sendMessageToArdunio("furnaceChange", "on");
		console.log("In Furnace Controller - Check Temps, Turning Furnace ON");
		stateFurnace = "on";
		dbController.setFurnaceChange("turnedFurnaceOn");
	}
};



exports.runFurnForWater = function(howLong){
	keepOldSensor = currentArduinoOffSensor;
	comController.sendMessageToArdunio("whichSensor", "none");
	console.log("Furnace CNTRL run for hot water for  - " + howLong);
	countRunForWater = howLong * 60;
	console.log("In start Run For Water");
	dbController.setFurnaceChange("FurnOnForWater");
	comController.sendMessageToArdunio("furnaceTurnOn", 69);
	stateFurnace = "on";
	runForWaterInterval = setInterval(checkForEnd, 1000);
	//let myVar = setInterval(checkForEnd, 1000);
};

function checkForEnd(){
	if (countRunForWater <= 0){
		clearInterval(runForWaterInterval);
		console.log("In End RFW Delay, KEEP OLD - " + keepOldSensor);
		currentArduinoOffSensor = keepOldSensor;
		comController.sendMessageToArdunio("whichSensor", keepOldSensor);
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
	comController.sendMessageToArdunio("furnaceTurnOff", 69);
	comController.changeState("changeHome-Away", "back");
	dbController.setFurnaceChange("FurnOffForWater");
	//setTimeout(continueEndRunForWater, 3000);
};

//function continueEndRunForWater(){
//};

exports.getRunForWaterCount = function(){
	var countInMin = secondsToHms(countRunForWater)
	return (countInMin);
};



// called by the server upon startup
exports.changeFurnState = function (newState){
	stateFurnace = newState;
};

// called from the route controler get general settings
exports.getFurnaceSettings = function (req, res){
	console.log("in furnace dontroller get furnace settings current object:");
	console.log(furnaceSettings);
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

// not used
exports.setTempTargets = function (){
	recircController.getCurrentTime()
	currentTime 
	};

 // called by the route controller with a manual change from the front end
exports.manualFurnaceChange = function (whatToDo, newMaxTemp, newMinTemp){
	console.log("in furnace controller manual furnace change, whatToDo - " + whatToDo);
	comController.sendMessageToArdunio(whatToDo, newMaxTemp);
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
			console.log("in set furnace temps, new temp - " + newTemp);
			break;
		default:
			console.log ("ERROR in furn cntrl set temps");
	}
};

// called from the route controller
exports.changeOnOff = function (toWhoChangesFurn){
			console.log ("in Furn controller setting to - " + toWhoChangesFurn);
			//currentArduinoOffSensor = toWhoChangesFurn;
			comController.sendMessageToArdunio ("whichSensor", toWhoChangesFurn);
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
	};
	// end update furnace settings
}


