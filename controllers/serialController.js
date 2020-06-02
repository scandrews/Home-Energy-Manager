// all data communications serial and ethernet will be in this file
const data_access = require('./databasecontroller');
const recircContrl = require('./recircController');

// variables for the temperature sensor
var tempSum1 = 0;
var tempSum2 = 0;
var tempcount = 0;
var avgTemp1 = 0;
var avgTemp2 = 0;
var tempToUse = [];
var test = "Test";
var temperature1 = 11.11;



// setup serial port
const BaudRate = 9600;
var comPort = 'Com5';
// initialize the serial port
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

// setup ethernet server
var PORT = 6000;
var HOST = '192.168.1.13';
var clientAddress = '192.168.1.7'
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

var CtoF = function (inC){
	return ((inC * 9/5) + 32);
};

//  Start the ethernet server
server.on("message", function (StuffIn, remote) {
    console.log("got an ethernet message ");
//    console.log(remote);
    arduinoPort = remote.port;
    console.log(StuffIn);

	var tempC1 = StuffIn.toString("utf-8", 0, 5);
    var tempF1 = CtoF (tempC1);
    console.log(tempC1 + " " + tempF1);
    recircContrl.checkRecirc(tempF1);


    tempC2 = StuffIn.toString("utf8", 5, 10);
	tempF2 = CtoF(tempC2);
    console.log(tempC2 + " " + tempF2);

    tempC3 = StuffIn.toString("utf8", 10, 15);
	tempF3 = CtoF(tempC3);
    console.log(tempC3 + " " + tempF3);

    data_access.saveTempData(tempF2, tempF3);
});

 server.on("listening", function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.bind(PORT);

exports.sendMessageToArdunio = function (req, res){
	console.log("in comm controller sent message, req.body.message -");
	console.log(req.body.message);
	switch (req.body.message){ 
		case "greenChange":
			console.log("in CASE green");
			server.send(greenChange, 0, 2, arduinoPort, clientAddress)
			break;
		case "redChange":
			server.send(redChange, 0, 2, arduinoPort, clientAddress)
			console.log("in CASE red");
			break;
		case runRecirc:
			server.send()
		default:
			server.send('WTF', 0, 3, arduinoPort, clientAddress)
	}
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
//	var newstr = inputString.split(" ");
	console.log (inputString);
//	console.log (newstr);
	
// end serial i/o section
});
}

// end export
//};

