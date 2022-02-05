
var express = require("express");
var bodyParser = require ("body-parser");
// var morgan = require("morgan");
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
const furnaceController = require ('./furnaceController');
//let SendMessageToArdunio = comControler.sendMessageToArdunio;

//app.get('')

app.get('/about', (req, res) => {
//    res.sendFile('./about.html');
	res.sendFile(__dirname, "./views/about.html");
});

app.get('/currentTemps', (req, res) => {
	console.log("in the get current temperatures route");
	dataPackage = comControler.returnFlags();   // gets the flags as last updated by the Arduino
	temporyTemps = dbaccess.getCurentAvgTemps();
	temporyTimes = dbaccess.getCurrentTimes();  // add curent save time here
	dataPackage.push(temporyTemps);
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
		newState = comControler.changeState(req.body.message);
		console.log("GOT THE RETURN CHANGE HOME/AWAY - " + newState.stateHomeAway + newState.statePump);
		res.send(newState);
	} else if (req.body.message == "ManualPumpChange") {
		newState = recircController.manualPumpChange(req.body.message);
		//comControler.changeState()
		//newState = comControler.getState();
		console.log("GOT THE RETURN MANUAL PUMP CHANGE - " + newState);
		res.send(newState);
	} else if (req.body.message == "changeFurnace") {
		// manually chage the furnace
		console.log("in the change furnace route");
		newState = furnaceController.manualFurnaceChange('furnaceChange', '180', '90');
		//newState = comControler.sendMessageToArdunio('furnaceChange', '180');
		console.log("GOT THE RETURN CHANGE FURNACE - " + newState);
		console.log(newState);
		//newPState = comControler.changeState('stateFurnace', 'on');
		console.log(newState.stateFurnace)
		res.send(newState);
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
	var furnSettings = furnaceController.getFurnaceSettings();
	console.log(IPAddresses);
	console.log(dbSettings);
		var generalSettings = {
			tempSaveInterval : dbSettings[0],
			numDataPointsToGraph : dbSettings[1],
			minHouseTemp : furnSettings.minHouseTemp,
			maxHouseTemp : furnSettings.maxHouseTemp,
			minFurnaceTemp : furnSettings.minFurnaceTemp,
			maxFurnaceTemp : furnSettings.maxFurnaceTemp,
			curFurnTemp : furnSettings.curFurnTemp,
			currentSensor : furnSettings.currentSensor,
			serverIPAddress : IPAddresses[0],
			arduinoIPAddress : IPAddresses[1],
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
				case "tempSaveInterval":
					var returnStatus = dbaccess.upDateTempSaveIterval(newSettings[key])
					console.log("return from update temp save interval - " + returnStatus);
					break;
				case "dataPointsToGraph":
					var returnStatus = dbaccess.updateNumDataPointsToChart(newSettings[key]);
					console.log("return from #of points to graph - " + returnStatus);
					break;
				case "setMinHouseTemp":
					var returnStatus = comControler.sendMessageToArdunio ("changeHouseMinTemp", newSettings[key]);
					console.log("return from change min house temp");
					break;
				case "setMaxHouseTemp":
					var returnStatus = comControler.sendMessageToArdunio ("changeHouseMaxTemp", newSettings[key]);
					var returnStatus = furnaceController.setFurnaceTemps ("maxHouseTemp", newSettings[key]);
					console.log("return from change max house temp");
					break;
				case "minFurnaceTemp":
					var returnStatus = furnaceController.setFurnaceTemps ("changeMinFurnaceTemp", newSettings[key]);
					console.log("return from change min furnace temp");
					break;
				case "maxFurnaceTemp":
					var returnStatus = furnaceController.setFurnaceTemps ("changeMaxFurnaceTemp", newSettings[key]);
					console.log("return from change max furnace temp");
					break;
				case "whichSensor":
					var returnStatus = comControler.sendMessageToArdunio ("whichSensor", newSettings[key]);
					console.log("return from change whichh sensor");
					break;
				case "serverIPAddress":
					var returnStatus = comControler.sendMessageToArdunio ("updateServerIPAddress", newSettings[key])
					console.log("return from change server IP Address - " + returnStatus);
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

// route to change which sensor turns the furnace off
app.post('/changeFurnaceOnOff', function (req, res){
	var whoChangesFurnace = req.body.message;
	console.log ("Who Changes Furnace - " + whoChangesFurnace);
	var didGetBack = furnaceController.changeOnOff(whoChangesFurnace)
	return (didGetBack);
})

module.exports = app;