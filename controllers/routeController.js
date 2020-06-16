
var express = require("express");
var bodyParser = require ("body-parser");
var morgan = require("morgan");
//var path = require ("path");
//var PORT = process.env.PORT || 3000;
//var router = express.Router();

//app.use(express.json());
var app = express();

//const cors = require('cors');
//app.use(cors());

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
//let SendMessageToArdunio = comControler.sendMessageToArdunio;

//app.get('')

app.get('/about', (req, res) => {
//    res.sendFile('./about.html');
	res.sendFile(__dirname, "./views/about.html");
});

app.get('/curTemp', (req, res) => {
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

app.post('/sendMessage', (req, res) => {
	console.log("in route controller send message");
	console.log(req.body);
	comControler.sendMessageToArdunio(req.body.message);
});



module.exports = app;