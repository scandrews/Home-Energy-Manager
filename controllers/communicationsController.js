// all data communications serial and ethernet will be in this file
const data_access = require('./databasecontroller');
const recircContrl = require('./recircController');

// variables for the temperature sensor
//var tempSum1 = 0;
//var tempSum2 = 0;
//var tempcount = 0;
//var avgTemp1 = 0;
//var avgTemp2 = 0;
var tempToUse = [];
var test = "Test";
var temperature1 = 11.11;

// Status flags - from the Arduino
var flag1 = 0;
var flag2 = 0;
var flag3 = 0;
var flag4 = 0;

var tempF1 = 0.0; // Wood Stove
var tempF2 = 0.0; // bread Board
var tempF3 = 0.0; // bedroom
var tempF4 = 0.0; // pipe
var tempF5 = 0.0; // Furnace
var tempF6 = 0.0; // breadboard
var tempF7 = 0.0; // outdoor sun


// setup serial port
const BaudRate = 9600;
var comPort = 'Com5';
// initialize the serial port
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

// setup ethernet server
var PORT = 6000;
var clientAddress = "192.168.1.4";
var dgram = require("dgram");
var server = dgram.createSocket('udp4');

var greenChange = '01';
var redChange = '02';
var runRecirculator = '03';
var stopRecirculator = '04';


// get my local IP Address and console log it
var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
};
console.log(addresses);
HOST = addresses;


//  State Machine for the whole application

var allStates = {
	stateHomeAway: "Home",
	statePump: "off",
	stateFurnace: "off",
	stateWoodStove: "off"
};

exports.changeState = function (whichState, toWhatState){
	console.log("in com cntrlr change state - " + whichState);
	console.log("com controller allstates - " + allStates);
	switch (whichState){
		case "changeHome-Away":
			if (allStates.stateHomeAway == "Home"){
				allStates.stateHomeAway = "Away";
				console.log ("new allstates - " + allStates.stateHomeAway);
				return allStates
			} else if (allStates.stateHomeAway == "Away"){
				allStates.stateHomeAway = "Home";
				console.log ("new allstates - " + allStates.stateHomeAway);
				return allStates
			}
			break;
		case "statePump":
			allStates.statePump = toWhatState;
			break;
		case "stateFurnace":
			allStates.stateFurnace = "off"
			break;
		case "stateWoodStove":
			allStates.stateWoodStove = "off"
		default:
			console.log("ERROR - change state function recieved other request")
	}
};

exports.getState = function (){
	return allStates
};
//  End state machine

exports.getIPAddresses = function (){
	HOST.push(clientAddress);
	console.log("in com cntrlr get IPs " + HOST);
	return HOST;
};

exports.getComSettings = function (){
	var comSettings = []
};

// function to convert C to F
var CtoF = function (inC){
	return (parseFloat(((inC * 9/5) + 32).toFixed(1)));
};

//  Start the ethernet server
server.on("message", function (StuffIn, remote) {
	console.log("got an ethernet message ");
    console.log(remote);
    arduinoPort = remote.port;
	console.log(StuffIn);

	// t designates it as a temperature packet
    if (StuffIn.toString("utf-8", 0, 1) == "t"){

    	// wood stove
	tempC1 = StuffIn.toString("utf-8", 1, 6);
    tempF1 = CtoF (tempC1);
    console.log("Temperature 1 C & F - " + tempC1 + " " + tempF1);

    //  bread board
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
	tempF5 = CtoF(tempC5);
    console.log("Temperature 5 C & F - " + tempC5 + " " + tempF5);

    //  bread board
    tempC6 = StuffIn.toString("utf-8", 26, 31);
	tempF6 = CtoF(tempC6);
    console.log("Temperature 6 C & F - " + tempC6 + " " + tempF6);

    tempC7 = StuffIn.toString("utf-8", 31, 36);
	tempF7 = CtoF(tempC7);
    console.log("Temperature 7 C & F - " + tempC7 + " " + tempF7);

    recircContrl.checkRecirc(tempF4);

    data_access.saveTempData(tempF1, tempF2, tempF3, tempF4, tempF5, tempF6, tempF7);

    // f designates it as a flag packet
	} else if (StuffIn.toString("utf-8", 0, 1) == "f"){
		flag1 = StuffIn.toString("utf-8", 1, 2);
		flag2 = StuffIn.toString("utf-8", 3, 4);
		flag3 = StuffIn.toString("utf-8", 5, 6);
		flag4 = StuffIn.toString("utf-8", 7, 8);

		console.log("flag1 - " + flag1);
		console.log("flag2 - " + flag2);
		console.log("flag3 - " + flag3);
		console.log("flag4 - " + flag4);
	};

});

server.on("listening", function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.bind(PORT);

exports.sendMessageToArdunio = function (whatToDo){
	console.log("in comm controller send message, req.body - " + whatToDo);
//	console.log(whatToDo);
	switch (whatToDo){ 
		case "changeHome-Away":
			console.log("in send message CASE green");
			server.send(greenChange, 0, 2, arduinoPort, clientAddress)
			break;
		case "redChange":
			console.log("in CASE red");
			server.send(redChange, 0, 2, arduinoPort, clientAddress)
			break;
		case "runRecirc":
			console.log("in send message run recirculator - from recirc controller");
			server.send(runRecirculator, 0, 2, arduinoPort, clientAddress);
			break;
		case "stopRecirc":
			console.log("in CASE send message stop recirculator - from recirc controller");
			server.send(stopRecirculator, 0, 2, arduinoPort, clientAddress);
			break;
		case "turnPumpOn":
			console.log("in CASE send message turn pump on - from front end");
			server.send(runRecirculator, 0, 2, arduinoPort, clientAddress);
			break;
		case "turnPumpOff":
			console.log("in CASE send message stop recirculator - from front end");
			server.send(stopRecirculator, 0, 2, arduinoPort, clientAddress);
			break;
		default:
			server.send('WTF', 0, 3, arduinoPort, clientAddress)
			console.log("in case WTF");
	}
};

exports.returnFlags = function (){
	//					  Pump on              
	var dataPac = [flag1, flag2, flag3, flag4, tempF1, tempF2, tempF3, tempF4, tempF5, tempF6, tempF7];
// Status flags - from the Arduino
	// 0 -  flag1
	// 1 -  flag2
	// 2 -  flag3
	// 3 -  flag4

	// 4 -  tempF1 Wood Stove
	// 5 -  tempF2 bread Board family room
	// 6 -  tempF3 bedroom
	// 7 -  tempF4 pipe
	// 8 -  tempF5 Furnace
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
		var newstr = inputString.split(" ");
		console.log (inputString);
		console.log (newstr);
		
	// end serial i/o section
	});
}

// end export
//};

