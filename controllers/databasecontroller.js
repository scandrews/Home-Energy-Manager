//  Database controller all interaction with the database are here

const mysql = require('mysql2');

// variables for the temperature sensor
var tempSum2 = 0;
var tempSum3 = 0;
var tempcount = 0;
var avgTemp2 = 0;
var avgTemp3 = 0;
var numOfReadingsToAvg = 25;
//var tempToUse = [];
var test = "Test";
//var temperature1 = 11.11;

var connection;

if (process.env.JAWSDB_URL) {
  connection = mysql.createConnection(process.env.JAWSDB_URL);
  } else {
    connection = mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'RutBud17',
      database: 'home_control_db'
    });
  };

connection.connect((err) => {
  if (err) throw err;

  // get the recirculator settings from the data base
  exports.recircSettingsRecirCNTRL = function (what, fn) {
    console.log("dbase controoler get recirc settings from recirs controller");
//    console.log("Ha Fuken Lo - " + what);
//    console.log(fn);
    connection.query("SELECT * FROM recirculatorsettings", (err, result) => {
//        console.log("After the db got the recirc settings");
//        console.log(result);
        return ( fn ( result ));
    });
  };

  // get the recirculator settings from the data base
  exports.recircSettingsFrontEnd = function (req, res) {
    console.log("dbase controoler get recirc settings from the front end");
//    console.log("Ha Fuken Lo");
    connection.query("SELECT * FROM recirculatorsettings", (err, result) => {
//        console.log(result);
        res.send( result );
    });
  };

  // retrieve the stored temp data for display
  exports.getTempData = function (req, res) {
    console.log("in get temp data  yyyoooo");
    connection.query("SELECT * FROM temperatures ORDER BY id DESC LIMIT 5", (err, result) => {
//          console.log(result);
          res.send( result );
      });
  };

  exports.saveTempData = function (temp2, temp3) {
    console.log("in save temp data");
//    console.log(temp2, temp3);

    tempSum2 = tempSum2 + temp2;
    tempSum3 = tempSum3 + temp3;
    tempcount++;

    if (tempcount == numOfReadingsToAvg) {
      avgTemp2 = tempSum2/numOfReadingsToAvg;
      avgTemp3 = tempSum3/numOfReadingsToAvg;
      tempSum2 = 0;
      tempSum3 = 0;
      tempcount = 0;
      console.log("averages - " + avgTemp2, avgTemp3);

      connection.query("INSERT INTO temperatures SET ?",
        {
          tempFamilyRoom: avgTemp2,
          tempBedRoom: avgTemp3
        }, (err, result) => {
          if (err) throw err;
          return;
      });
    };
  };

// end connection
});
