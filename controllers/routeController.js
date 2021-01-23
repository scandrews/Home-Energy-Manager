
var express = require("express");
var bodyParser = require ("body-parser");
var morgan = require("morgan");
var app = express();

// set up express parsing
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// apply the routes to our application
//app.use('/', router);

app.set('views',__dirname + '/public');
// Serve static content from 'public'
app.use(express.static('public'));

//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');

const dbaccess = require ('./databasecontroller');
const comControler = require ('./communicationsController');
const recircController = require ('./recircController');
//let SendMessageToArdunio = comControler.sendMessageToArdunio;

//app.get('')

app.get('/about', (req, res) => {
//    res.sendFile('./about.html');
	res.sendFile(__dirname, "./views/about.html");
});

app.get('/currentTemps', (req, res) => {
	console.log("in the get current temperatures route");
	dataPackage = comControler.returnFlags();
	temporyTimes = dbaccess.getCurrentTimes();
	dataPackage.push(temporyTimes);
	console.log("still in get current temps route data - " + dataPackage);
	res.send(dataPackage);	
});

app.get('/curTemp', (req, res) => {
	console.log("in the get curTemp route");
//	console.log(req.body)
	dbaccess.getTempData(req, res);
});

app.get('/curTempHistory', (req, res) => {
	console.log("in the get curTemp route");
//	console.log(req.body)
	dbaccess.getTempData(req, res);
});

app.get('/recircSettings', (req, res) => {
	console.log("in route controller get recirculator settings duuu");
//	res.send("What da FAAA");
	dbaccess.recircSettingsFrontEnd(req, res), function(){
	};
});

app.get('/pipeTemp', (req, res) => {
	console.log("in route controler, get pipe temp data");
	dbaccess.getPipeTempData(req, res);
});

app.post('/sendMessage', (req, res) => {
	console.log("in route controller send message - " + req.body.message);
	if (req.body.message == "changeHome-Away"){
		newState = comControler.changeState(req.body.message)
			console.log("GOT THE RETURN - " + newState.stateHomeAway + newState.statePump);
			res.send(newState)
		;
	} else if (req.body.message == "ManualTurnPumpOn") {
		recircController.manualPumpChange(req.body.message);
		//	console.log(req.body);
		comControler.sendMessageToArdunio(req.body.message);
	};
});

app.get('/currentStatus', (req, res) => {
	console.log("in route controler, get current status");
	return comControler.returnFlags();
});

app.post('/upDateRecircSettings', function (req, res) {
	console.log("in route Controller update recirc settings");
	console.log(req.body);
	var stuffBack = dbaccess.upDateRecircSettings(req.body);
	return(stuffBack);
});

app.get('/generalSettings', (req, res) => {
	console.log("in route controler get general settings");
	var IPAddresses = comControler.getIPAddresses();
	var dbSettings = dbaccess.getdbSettings();
	console.log(IPAddresses);
	console.log(dbSettings);
		var generalSettings = {
			tempSaveInterval : dbSettings[0],
			numDataPointsToGraph : dbSettings[1],
			serverIPAddress : IPAddresses[0],
			arduinoIPAddress : IPAddresses[1],
			something : 'something',
			somethingelse : "somethingelse",
			somefkn : "somefkn",
			somethingelse2 : "somethingelse",
			somefkn2 : "somefkn",
			runMode : "normal"
		}
		res.send (generalSettings)
});

app.post('/upDateGeneralSettings', function (req, res) {
	console.log("in route Controller update general settings");
	console.log(req.body);

//  need to handle

//	dbaccess.upDateRecircSettings(req.body);
});


module.exports = app;