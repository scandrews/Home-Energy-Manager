const express = require('express');
const router = express.Router();
const path = require("path");
const bodyParser = require ('body-parser');

const app = express();

const serial = require ('serialController');

app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');


//router.get('/', (req, res) => {
//	res.send('index.html')
//});

//router.get('/', (req, res) => {
//	res.sendFile(path.join(__dirname, '/index.html'));
//});

app.get('')

app.get('/about', (req, res) => {
//    res.sendFile('./about.html');
	res.sendFile(__dirname, "./views/about.html");
});

router.get('/curTemp',(req, res) => {
	console.log("in the get curTemp route");
	res.send(data);
});

// apply the routes to our application
app.use('/', router);


module.exports = router;