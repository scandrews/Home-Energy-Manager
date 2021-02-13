
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
	temporyTimes = dbaccess.getCurrentTimes();  // add curent save time here
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
	console.log("in the get curTemp History route");
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
		res.send(newState);
	} else if (req.body.message == "ManualPumpChange") {
		newPState = recircController.manualPumpChange(req.body.message);
		//comControler.changeState()
		//newState = comControler.getState();
		console.log("GOT THE RETURN - " + newPState);
		res.send(newPState);
	};
});

app.get('/currentStatus', (req, res) => {
	console.log("in route controler, get current status");
	return comControler.returnFlags();
});

app.post('/upDateRecircSettings', function (req, res) {
	console.log("in route Controller update recirc settings");
	console.log(req.body);
	dbaccess.upDateRecircSettings(req.body, function (){
		console.log("got back from updating te db with new recirc settings");
		recircController.changedRecircSettings();
	});
});

var getCurrentGeneralSettings = function (){
	var IPAddresses = comControler.getIPAddresses();
	//var serverIPAddress = comControler.sendMessageToArdunio("getServerIPAddress", "x")
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
	return (generalSettings)
};

app.get('/generalSettings', (req, res) => {
	console.log("in route controler get general settings");
	generalSettings = getCurrentGeneralSettings();
	res.send (generalSettings)
});

app.post('/upDateGeneralSettings', function (req, res) {
	console.log("in route Controller update general settings");
	newSettings = req.body;
	console.log(newSettings);
	for (var key in newSettings){
		if (newSettings[key] == ''){
			console.log("nothing at - " + key)
		}else {
			console.log("At - " + key + " got - " + newSettings[key]);
			switch (key){
				case "serverIPAddress":
					var returnStatus = comControler.sendMessageToArdunio ("updateServerIPAddress", newSettings[key])
					console.log("return from change server IP Address - " + returnStatus);
				break;
				case "tempSaveInterval":
					var returnStatus = dbaccess.upDateTempSaveIterval(newSettings[key])
					console.log("return from update temp save interval - " + returnStatus);
				break;
				case "dataPointsToGraph":
					var returnStatus = dbaccess.updateNumDataPointsToChart(newSettings[key]);
					console.log("return from #of points to graph - " + returnStatus);
				break;
				default:
					console.log("ERROR");
				break;
			}
		}
	};
	var currentSettings = getCurrentGeneralSettings();
	res.send (currentSettings);
});


module.exports = app;