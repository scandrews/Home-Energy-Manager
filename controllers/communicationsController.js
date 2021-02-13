// all data communications serial and ethernet will be in this file
const data_access = require('./databasecontroller');
const recircContrl = require('./recircController');

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
var dgram = require("dgram");
var server = dgram.createSocket('udp4');
var PORT = 6000;
var arduinoAddress = '';
var serverAddress = '';
var tempIPs = [];

var greenChange = '01';
var redChange = '02';
var runRecirculator = '03';
var stopRecirculator = '04';
var updateServerIPAddress = '05';
var getServerIPAddress = '06';

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
//console.log("The Addresses are :");
//console.log(addresses);
serverIPAddress = addresses[1];
console.log("Server IP Address - " + serverIPAddress);
//console.log(serverIPAddress);

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

// supplies IP addresses to the fron end
exports.getIPAddresses = function (){
//	tempIPs = '';
	console.log(serverIPAddress);
	tempIPs[0] = serverIPAddress;
	console.log(tempIPs);
	tempIPs[1] = (arduinoAddress);
	console.log("in com cntrlr get IPs " + tempIPs);
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
		console.log("flag3 - " + flag3);  // motor state
		console.log("flag4 - " + flag4);
		if(flag3 == 1){
			allStates.statePump = "on";
		} else if (flag3 == 0){
			allStates.statePump = "off";
		};
	};

});

server.on("listening", function () {
    serverAddress = server.address();
    console.log('UDP Server listening on ' + serverAddress.address + ":" + serverAddress.port);
});

server.bind(PORT);

// ethernet SENDER
exports.sendMessageToArdunio = function (whatToDo, data){
	console.log("in comm controller send message, req.body - " + whatToDo);
//	console.log(whatToDo);
	switch (whatToDo){ 
		case "changeHome-Away":
			console.log("in send message CASE green");
			server.send(greenChange, 0, 2, arduinoPort, arduinoAddress)
			break;
		case "redChange":
			console.log("in CASE red");
			server.send(redChange, 0, 2, arduinoPort, arduinoAddress)
			break;
		case "runRecirc":
			console.log("in send message run recirculator - from recirc controller");
			server.send(runRecirculator, 0, 2, arduinoPort, arduinoAddress);
			break;
		case "stopRecirc":
			console.log("in CASE send message stop recirculator - from recirc controller");
			server.send(stopRecirculator, 0, 2, arduinoPort, arduinoAddress);
			break;
		case "ManualTurnPumpOn":
			console.log("in CASE send message turn pump on - from front end");
			server.send(runRecirculator, 0, 2, arduinoPort, arduinoAddress);
			break;
		case "turnPumpOff":
			console.log("in CASE send message stop recirculator - from front end");
			server.send(stopRecirculator, 0, 2, arduinoPort, arduinoAddress);
			break;
		case "updateServerIPAddress":
			console.log("in CASE update Server IP Address");
			console.log(data);
			var dataToSend = updateServerIPAddress + " " + data;
			charsToSend = dataToSend.length + 3;
			console.log(dataToSend + " - " + charsToSend);
			server.send(dataToSend, 0, charsToSend, arduinoPort, arduinoAddress);
			break;
		case "getServerIPAddress":
			console.log("in CASE get server IP address");
			server.send(getServerIPAddress, 0, 2, arduinoPort, arduinoAddress);

		default:
			server.send('WTF', 0, 3, arduinoPort, arduinoAddress)
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
		//var newstr = inputString.split(" ");
		console.log ("serialprint - " + inputString);
		//console.log (newstr);
		
	// end serial i/o section
	});
}

// end export
//};

