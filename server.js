// Home Energy Controler

var version = "2.0.1";

//var runMode = '';
//runMode = process.argv[2];
//console.log("Server procenv - " + runMode);

const dbCntrl = require ('./controllers/databasecontroller');
dbCntrl.setProcessEnv(process.argv[2]);


//var env       = process.env.NODE_ENV || 'development';
//var config    = require( './config/config.json')[runMode];
//console.log(runMode);

exports.getProcessEnv = function(){
  console.log("Run Mode - " + runMode);
  return (runMode);
};


const express = require("express");
var bodyParser = require("body-parser");
const mysql   = require('mysql2');
//var morgan = require("morgan");

const app = express();

// might want this init stuff after the db is created
const routes = require ('./controllers/routeController');
const comControler = require ('./controllers/communicationsController');
const furnController = require ('./controllers/furnaceController');
app.use("/", routes);

const PORT = process.env.PORT || 2000;

// Set up Express for data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.set('views',__dirname + '/public');
// Serve static content from 'public'
app.use(express.static('public'));

app.get('/about', (req, res) => {
//    res.sendFile('./about.html');
  res.sendFile(__dirname, "./views/about.html");
});

// Models
//const models = require('./models');

/*
if (process.argv[2]){
  runMode = process.argv[2];
  console.log("Server procenv - " + runMode);
} else {
  runMode = 'run';
};
*/

exports.getVersion = function (){
  return (version);
};


newDataPoints = dbCntrl.updateNumDataPointsToChart (350);
console.log("after the test update datapoints to save - " + newDataPoints );

// https://stackoverflow.com/questions/66595428/callback-connect-query
// https://blog.bitsrc.io/understanding-promises-in-javascript-c5248de9ff8f
/*
*/


// set up our default values
//dbCntrl.initSettings();

// Set the arduino states on startup
comControler.sendMessageToArdunio("turnPumpOff", 70);
comControler.sendMessageToArdunio("furnaceTurnOff", 66);
comControler.sendMessageToArdunio("changeHouseMaxTemp", 65);
furnController.changeFurnState("off");

console.log("* * * * * OK this is really fucked * * * * * *")


// Listener for seperate host server
app.listen(PORT, '0.0.0.0', function() {
  console.log('Listening to port:  ' + PORT);
});

