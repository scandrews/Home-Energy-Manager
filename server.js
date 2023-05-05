// Temperature sensor project
const express = require("express");
var bodyParser = require("body-parser");
//var morgan = require("morgan");

const app = express();

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
const models = require('./models');

var runMode = 'run';
  runMode = process.argv[2];
  console.log("Run Mode - " + runMode);

const routes = require('./controllers/routeController');
const comControler = require ('./controllers/communicationsController');
const furnController = require ('./controllers/furnaceController');
const dbCntrl = require ('./controllers/databasecontroller');
app.use("/", routes);

// Sync Database
models.sequelize
  .sync()
  .then(() => {
    // Listener
    //app.listen(PORT, function() {
    app.listen(PORT, () => {
      console.log("App listening on PORT: " + PORT);
    });
    console.log('Connected to the Database');

    // set up our default values
    dbCntrl.initSettings();
    // kick off serial listener   ** TURN THIS ON WHEN LOADING NEW CODE **
    //comControler.serialComStuff();
    console.log("DOES THIS FUCKER RUN EVERY TIME???");

  })
  .catch((err) => {
    console.log('Something went wrong with the Database Update!');
    console.log(err);
  });


setTimeout(initStuff, 8000);

function initStuff (){

    // Set the arduino states on startup
    //comControler.sendMessageToArdunio("turnPumpOff", 70);
    //comControler.sendMessageToArdunio("furnaceTurnOff", 69);
    comControler.sendMessageToArdunio("whichSensor", "bedroom");
    //comControler.sendMessageToArdunio("changeHouseMaxTemp", 66);
    //furnController.changeFurnState("off");

  console.log("* * * * * OK this is really fucked * * * * * *")
}


// Listener for seperate host server
// app.listen(PORT, '0.0.0.0', function() {
//    console.log('Listening to port:  ' + PORT);
//});

