// Temperature sensor project
const express = require("express");
var bodyParser = require("body-parser");
const mysql   = require('mysql2');
//var morgan = require("morgan");

const app = express();

// might want this init stuff after the db is created
const routes = require ('./controllers/routeController');
const comControler = require ('./controllers/communicationsController');
const furnController = require ('./controllers/furnaceController');
const dbCntrl = require ('./controllers/databasecontroller');
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

var env       = process.env.NODE_ENV || 'development';
var config    = require( './config/config.json')[env];

var runMode = '';
if (process.argv[2]){
  runMode = process.argv[2];
} else {
  runMode = 'run';
};

console.log("Run Mode - " + runMode);

newDataPoints = dbCntrl.updateNumDataPointsToChart (350);
console.log("after the test update datapoints to save - " + newDataPoints );

// https://stackoverflow.com/questions/66595428/callback-connect-query
// https://blog.bitsrc.io/understanding-promises-in-javascript-c5248de9ff8f
/*
*/
/*
const manualcreateconnection = new Promise((resolve, reject) => {

        // create db if it doesn't already exist
        //const { host, user, password, database } = config.database;
        const host = config.host;
        const port = config.port;
        const user = config.user;
        const database = config.database;
        const password = config.password;
        //const connection = mysql.createConnection({ host, user, password });
        console.log("host, port, user, password, database - " + host + ", " + port +", " + user + ", " + password + ", " + database);
        const connection = mysql.createConnection({ host, port, user, password });
        console.log("---------- here after the create connection --------------------");
    resolve(connection);
});
*/
/*
 
*/


/*

        const routes = require ('./controllers/routeController');
        const comControler = require ('./controllers/communicationsController');
        const furnController = require ('./controllers/furnaceController');
        const dbCntrl = require ('./controllers/databasecontroller');
        app.use("/", routes);

        // set up our default values
        dbCntrl.initSettings();
        // kick off serial listener   ** TURN THIS ON WHEN LOADING NEW CODE **
        //comControler.serialComStuff();
        console.log("DOES THIS FUCKER RUN EVERY TIME???");

        comControler.sendMessageToArdunio("whichSensor", "bedroom");
      })
      .catch((err) => {
        console.log('Something went wrong with the sequelize Database sync!');
        console.log(err);
      });
    resolve("* * * sending back from the sync")
});
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

