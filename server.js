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

const routes = require('./controllers/routeController');
const comControler = require ('./controllers/communicationsController');
app.use("/", routes);


// Models
const models = require('./models');

app.get('/about', (req, res) => {
//    res.sendFile('./about.html');
	res.sendFile(__dirname, "./views/about.html");
});

// Sync Database
models.sequelize
  .sync()
  .then(() => {
    console.log('Connected to the Database');
  })
  .catch((err) => {
    console.log(err, 'Something went wrong with the Database Update!');
  });

// kick off serial listener
comControler.serialComStuff();

// Listener
app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});
