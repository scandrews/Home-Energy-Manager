// all data communications serial and ethernet will be in this file
const data_access = require('./databasecontroller');
const recircContrl = require('./recircController');
const furnaceController = require('./furnaceController');

//  delete this - var tempToUse = [];
//  delete this - var test = "Test";
//  delete this - var temperature1 = 11.11;

// Status flags - from the Arduino
var whichSensor = 0;
var recircMotorState = 0;
var arduinoFurnaceState = 0;

var tempF1 = 0.0; // Wood Stove
var tempF2 = 0.0; // bread Board
var tempF3 = 0.0; // bedroom
var tempF4 = 0.0; // pipe
var tempFurnaceF = 0.0; // Furnace
var tempF6 = 0.0; // breadboard
var tempF7 = 0.0; // outdoor sun
var tempF8 = 0.0; // outdoor shade
var tempF9 = 0.0; // water tank


// setup serial port
const BaudRate = 9600;
var comPort = 'Com3';
// initialize the serial port
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

// setup ethernet server
var dgram = require("dgram");
var server = dgram.createSocket('udp4');
var PORT = 6000;
var arduinoAddress = '192.168.1.5';
var arduinoPort = '8888';
var serverAddress = '';
var tempIPs = [];

// codes for arduino function
var whichSensorToSet = '1';
var redChange = '2';
var runRecirculator = '3';
var stopRecirculator = '4';
var updateServerIPAddress = '5';
//var getServerIPAddress = '06';
var furnaceTurnOn = '6';
var furnaceTurnOff = '7';
var changeHouseMinTemp = '8';
var changeHouseMaxTemp = '9';
var furnaceText = "noChange";
var maxHouseTempArduino = 0;

// which sensors:
//var Bedroom = '1';
//var FamilyRoom = '2';
//var Desk = '3';

// get my local IP Address and console.log it
//var ip = require('ip');
//console.log ("my server IP address is - ");
//console.log(ip.address());

// get my local IP Address and console log it
var os = require('os');
var interfaces = os.networkInterfaces();
//console.log ("initial interfaces - ");
//console.log(interfaces);
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
};
console.log("The Addresses are :");
console.log(addresses[0]);
//console.log(addresses[1]);
//console.log(addresses[2]);
console.log(interfaces);
serverIPAddress = addresses[0];
console.log("Server IP Address - " + serverIPAddress);
console.log("server thinks the Arduino address - " + arduinoAddress);


//  State Machine for the whole application
var allStates = {
	stateHomeAway: "Home",
	stateRecircPump: "off",
	stateFurnace: "off",
	stateWoodStove: "off"
};


	// called by -	recirc controller manual pump change
	//			 -  furnace controller
	//			 - furnace controller for run for hot water
exports.changeState = function (whichState, toWhatState){
	console.log("in com cntrlr change which state - " + whichState);
	console.log("com controller to what state - " + toWhatState);
	switch (whichState){
		case "changeHome-Away":
			console.log("In Com CNTRL change home/away, new state - " + toWhatState);
			switch (toWhatState){
				case "Run Furnace For Hot Water 30":
					oldState = allStates.stateHomeAway;
					allStates.stateHomeAway = "RunForWtr30";
					furnaceController.runFurnForWater(30);
					break;
				case "Run Furnace For Hot Water 60":
					oldState = allStates.stateHomeAway;
					allStates.stateHomeAway = "RunForWtr60";
					furnaceController.runFurnForWater(60);
					break;
				case "Home":
					console.log("in case Home");
					allStates.stateHomeAway = "Home";
					break
				case "Home Alone":
					console.log("in case Home Alone");
					allStates.stateHomeAway = "Home Alone";
					break;
				case "Guests":
					console.log("in case Guests");
					break;
				case "Away":
					console.log("in case Away");
					break;
				case "back":
					console.log("in com cntrl change state - BACK");
					allStates.stateHomeAway = oldState;
					break;
				default:
					console.log("ERROR in state default");
				};

			//allStates.stateHomeAway = toWhatState;
			console.log ("new home-away state - " + allStates.stateHomeAway);
			break;
		case "stateRecircPump":
			allStates.stateRecircPump = toWhatState;
			return allStates
			break;
		case "stateFurnace":
			if (allStates.stateFurnace == "off"){
				allStates.stateFurnace = "on";
				return allStates
			} else if (allStates.stateFurnace == "on"){
				allStates.stateFurnace = "off";
				return allStates
			}
			break;
		case "stateWoodStove":
			allStates.stateWoodStove = "off"
		default:
			console.log("ERROR - change state function recieved other request")
	}
};

exports.getState = function (){
	console.log("In con controller get state - ");
	console.log(allStates);
	return allStates
};
//  End state machine

// supplies IP addresses to the fron end
exports.getIPAddresses = function (){
//	tempIPs = '';
	//console.log(serverIPAddress);
	tempIPs[0] = serverIPAddress;
	//console.log(tempIPs);
	tempIPs[1] = (arduinoAddress);
	//console.log("in com cntrlr get IPs " + tempIPs);
	return tempIPs;
};

exports.getComSettings = function (){
	var comSettings = []
};

// function to convert C to F
var CtoF = function (inC){
	return (parseFloat(((inC * 9/5) + 32).toFixed(1)));
};

//  Ethernet RECIEVER
//  Start the ethernet server
server.on("message", function (StuffIn, remote) {
	console.log("got an ethernet message ");
    console.log(remote);
    console.log(remote.address);

    arduinoAddress = remote.address;
    arduinoPort = remote.port;
	console.log(StuffIn);

	// t designates it as a temperature packet
    if (StuffIn.toString("utf-8", 0, 1) == "t"){

    	//It Was A Temperature Packet
	    // wood stove
		tempC1 = StuffIn.toString("utf-8", 1, 6);
	    tempF1 = CtoF (tempC1);
	    if(tempF1 > 90){
	    	allStates.stateWoodStove = "on";
	    };
	    console.log("Temperature wood stove C & F - " + tempC1 + " " + tempF1);

	    //  Family Room
	    tempC2 = StuffIn.toString("utf-8", 6, 11);
		tempF2 = CtoF(tempC2);
	    console.log("Temperature 2 C & F - " + tempC2 + " " + tempF2);

	    //  bedroom
	    tempC3 = StuffIn.toString("utf-8", 11, 16);
		tempF3 = CtoF(tempC3);
	    console.log("Temperature 3 C & F - " + tempC3 + " " + tempF3);

	    //  pipe
	    tempC4 = StuffIn.toString("utf-8", 16, 21);
		tempF4 = CtoF(tempC4);
	    console.log("Temperature 4 C & F - " + tempC4 + " " + tempF4);

	    //  furnace
	    tempC5 = StuffIn.toString("utf-8", 21, 26);
		tempFurnaceF = CtoF(tempC5);
	    console.log("Temperature furnace C & F - " + tempC5 + " " + tempFurnaceF);

	    //  bread board - Desk
	    tempC6 = StuffIn.toString("utf-8", 26, 31);
		tempF6 = CtoF(tempC6);
	    console.log("Temperature 6 C & F - " + tempC6 + " " + tempF6);

	    //  outside sun
	    tempC7 = StuffIn.toString("utf-8", 31, 36);
		tempF7 = CtoF(tempC7);
	    console.log("Temperature 7 C & F - " + tempC7 + " " + tempF7);

	    //  outside shade
	    tempC8 = StuffIn.toString("utf-8", 36, 41);
		tempF8 = CtoF(tempC8);
	    console.log("Outside Shade - 8 C & F - " + tempC8 + " " + tempF8);

	    //  water tank
	    tempC9 = StuffIn.toString("utf-8", 41, 45);
		tempF9 = CtoF(tempC9);
	    console.log("Water Tank - 9 C & F - " + tempC9 + " " + tempF9);

        recircContrl.checkRecirc(tempF4);
	    data_access.saveTempData(tempF1, tempF2, tempF3, tempF4, tempFurnaceF, tempF6, tempF7, tempF8, tempF9, furnaceText);

    // f designates it as a flag packet
    // we will always get a flag packet before a temerature packet
	} else if (StuffIn.toString("utf-8", 0, 1) == "f"){
		whichSensorToSet = StuffIn.toString("utf-8", 1, 2);
		redState = StuffIn.toString("utf-8", 3, 4);
		recircMotorState = StuffIn.toString("utf-8", 5, 6);
		arduinoFurnaceState = StuffIn.toString("utf-8", 7, 8);
		maxHouseTempArduino = StuffIn.toString("utf-8", 12, 16);

		console.log("whichSensor - " + whichSensorToSet);
		console.log("redState - " + redState);
		console.log("recircMotorState, motor - " + recircMotorState);  // motor state
		console.log("arduino State, furnace - " + arduinoFurnaceState);  // furnace state
		console.log("Arduino Max House Temp - " + maxHouseTempArduino);
		// update allstates with the Arduino recirc state
		if(recircMotorState == 1){
			allStates.stateRecircPump = "on";
		} else if (recircMotorState == 0){
			allStates.stateRecircPump = "off";
		};
		//  check if furnace just changed state
		if (arduinoFurnaceState != allStates.stateFurnace){
			if (arduinoFurnaceState == 1){   //  furnace was just turned on
				furnaceText = "FurnaceOn";
				allStates.stateFurnace = "on";
			} else if (arduinoFurnaceState == 0){     // furnace was just turned off
				furnaceText = "FurnaceOff";
				allStates.stateFurnace = "off";
			};
		};
		furnaceController.setFurnFlagPacket(whichSensorToSet, maxHouseTempArduino);
	};

});

server.on("listening", function () {
    //serverAddress = server.address();
    serverAddress = addresses[0];
    console.log('UDP Server listening on ' + serverAddress.address + " : " + serverAddress.port);
});

server.bind(PORT);

/*
// codes for arduino function
var whichSensor = '1';
var redChange = '2';
var runRecirculator = '3';
var stopRecirculator = '4';
var updateServerIPAddress = '5';
//var getServerIPAddress = '06';
var furnaceTurnOn = '6';
var furnaceTurnOff = '7';
var changeHouseMinTemp = '8';
var changeHouseMaxTemp = '9';
var furnaceText = "noChange";
*/

// ethernet SENDER
exports.sendMessageToArdunio = function (whatToDo, data){
	console.log("in comm controller send message, req.body - " + whatToDo);
	console.log(data);
//	var flag = '2';
//	console.log(whatToDo);
	switch (whatToDo){
		case "whichSensor":
			console.log("in send message CASE which sensor - " + data);
			switch (data){
				case "none":
					flag = '0';
					break;
				case "bedroom":
					flag = '1';
					break;
				case "familyroom":
					flag = '2';
					break;
				case "desk":
					flag = '3';
					break;
				default:
					console.log ("ERROR in the which sensor case");
					flag = '4';
			};
			if (flag != '4'){
				var dataToSend = 1 + " " + flag + " " + 9;
				charsToSend = dataToSend.length;
				console.log(dataToSend + " - " + charsToSend);
				server.send(dataToSend, 0, charsToSend, arduinoPort, arduinoAddress);
				// var whichSensor = '1';
				}
			break;
		case "redChange":
			console.log("in CASE red");
			server.send(redChange, 0, 1, arduinoPort, arduinoAddress)
			// var redChange = '02';
			break;
		case "runRecirc":      // used for manual start AND for auto starts
			console.log("in case send message - run recirculator - from recirc controller");
			server.send(runRecirculator, 0, 1, arduinoPort, arduinoAddress);
			// var runRecirculator = '03';
			break;
		case "stopRecirc":    // used for manual stop
			console.log("in CASE send message stop recirculator - from recirc controller");
			server.send(stopRecirculator, 0, 1, arduinoPort, arduinoAddress);
			// var stopRecirculator = '04';
			break;
		//case "whichSensor":   // I don't think this is used
		//	console.log("in CASE send message turn pump on - from front end");
		//	server.send(whichSensor, 0, 1, arduinoPort, arduinoAddress);
		//	break;
		case "turnPumpOff":     //  this is used at server start
			console.log("in CASE send message stop recirculator - from front end");
			server.send(stopRecirculator, 0, 1, arduinoPort, arduinoAddress);
			break;
		case "updateServerIPAddress":
			console.log("in CASE update Server IP Address");
			console.log(data);
			var dataToSend = updateServerIPAddress + " " + data;
			charsToSend = dataToSend.length;
			console.log(dataToSend + " - " + charsToSend);
			server.send(dataToSend, 0, charsToSend, arduinoPort, arduinoAddress);
			//var updateServerIPAddress = '05';
			break;
		case "getServerIPAddress":
			console.log("in CASE get server IP address");
			server.send(getServerIPAddress, 0, 1, arduinoPort, arduinoAddress);
			break;
		case "furnaceChange":
			console.log ("in case turn furnace change");
			console.log(data);
			if(allStates.stateFurnace == 'off'){
				//allStates.stateFurnace = "on"; don't set state - wait for an Arduino update
				console.log("in com cntrl case change furn, was off");
				// var furnaceTurnOn = '06';
				var dataToSend = furnaceTurnOn + " " + data;  // furnaceTurnOn - '07'
				server.send(dataToSend, 0, 5, arduinoPort, arduinoAddress);
			} else if(allStates.stateFurnace == 'on'){
				//allStates.stateFurnace = "off"; don't set state - wait for an Arduino update
				console.log("in com cntrl case change furn, was ON");
				var dataToSend = furnaceTurnOff + " " + data;  // furnaceTurnOff - '7'
				server.send(dataToSend, 0, 4, arduinoPort, arduinoAddress);
			}
			//return allStates
			break;
			//var furnaceTurnOff = '7';
		case "furnaceTurnOn":
			// NOTE: the Arduino ingors the data (temerature) that is sent in this packet
			console.log ("in case turn furnace ***  ON   ***");
			var dataToSend = furnaceTurnOn + " " + data;  // furnaceTurnOn - '07'
			charsToSend = dataToSend.length;
			console.log(dataToSend + " - " + charsToSend);
			server.send(dataToSend, 0, charsToSend, arduinoPort, arduinoAddress);
			allStates.stateFurnace = "on";
			//var furnaceTurnOff = '06';
			break;
		case "furnaceTurnOff":
			// NOTE: the Arduino ingors the data (temerature) that is sent in this packet
			console.log ("in case turn furnace ***   off   ***");
			var dataToSend = furnaceTurnOff + " " + data;  // furnaceTurnOff - '7'
			charsToSend = dataToSend.length;
			console.log(dataToSend + " - " + charsToSend);
			server.send(dataToSend, 0, charsToSend, arduinoPort, arduinoAddress);
			allStates.stateFurnace = "off";
			//var furnaceTurnOff = '08';
			break;
		case "changeHouseMinTemp":
			console.log("in case change min house temp - ");
			console.log(data);
			var dataToSend = changeHouseMinTemp + " " + data;
			charsToSend = dataToSend.length;
			console.log(dataToSend + " - " + charsToSend);
			server.send(dataToSend, 0, charsToSend, arduinoPort, arduinoAddress);
			//server.send(changeHouseMinTemp, 0, 2, arduinoPort, arduinoAddress);
			break;
			// changeHouseMaxTemp - 9
		case "changeHouseMaxTemp":
			console.log("in case change max house temp - ");
			console.log(data);
			var dataToSend = changeHouseMaxTemp + " " + data + " ";
			charsToSend = dataToSend.length;
			console.log(dataToSend + " - " + charsToSend);
			server.send(dataToSend, 0, charsToSend, arduinoPort, arduinoAddress);
			//server.send(changeHouseMinTemp, 0, 2, arduinoPort, arduinoAddress);
			break;
		default:
			//server.send('WTF', 0, 3, arduinoPort, arduinoAddress)
			console.log("in case WTF");
	}
};

exports.returnFlags = function (){
	//					  Pump on              
	var dataPac = [whichSensorToSet, whichSensor, recircMotorState, arduinoFurnaceState, maxHouseTempArduino];
// Status flags - from the Arduino
	// 0 -  flag1
	// 1 -  whichSensor
	// 2 -  recircMotorState   motor state
	// 3 -  flag4   furnace state

	// 4 -  tempF1 Wood Stove
	// 5 -  tempF2 bread Board family room
	// 6 -  tempF3 bedroom
	// 7 -  tempF4 pipe
	// 8 -  tempFurnaceF Furnace
	// 9 -  tempF6 breadboard
	// 10 - tempF7 outdoor sun

	return (dataPac);
};

// this section reads the serial port and console logs it
exports.serialComStuff = function (){

	// open the serial port
	var port = new SerialPort(comPort, {
		baudRate: BaudRate,
	});
	const parser = new Readline('\n');

	port.pipe(parser);
	parser.on('data', function(inputString){
		//var newstr = inputString.split(" ");
		console.log ("serialprint - " + inputString);
		//console.log (newstr);
		
	// end serial i/o section
	});
}

// end export
//};

