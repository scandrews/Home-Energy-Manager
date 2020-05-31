
var express = require("express");
var path = require ("path");
var app = express();
var PORT = process.env.PORT || 3000;
var router = express.Router();
var bodyParser = require ("body-parser");

app.use(express.json());

const cors = require('cors');
app.use(cors());

// set up express parsing
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies
//app.use(bodyParser.text());
//app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// apply the routes to our application
app.use('/', router);


const dbaccess = require ('./databasecontroller');
const comControler = require ('./serialController');
let SendMessageToArdunio = comControler.sendMessageToArdunio;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


//app.get('')

app.get('/about', (req, res) => {
//    res.sendFile('./about.html');
	res.sendFile(__dirname, "./views/about.html");
});

app.get('/curTemp', (req, res) => {
	console.log("in the get curTemp route");
	console.log(req.body)
	dbaccess.getTempData(req, res);
});

app.post('/sendMessage', (req, res) => {
	console.log("in route controller send message");
	console.log(req.body);
	comControler.sendMessageToArdunio(req);
});



module.exports = app;