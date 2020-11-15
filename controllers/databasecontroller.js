//  Database controller all interaction with the database are here

const mysql = require('mysql2');

// variables for the temperature sensor
var tempSum1 = 0;
var tempSum2 = 0;
var tempSum3 = 0;
var tempSum4 = 0;
var tempcount = 0;
var avgTemp1 = 0;
var avgTemp2 = 0;
var avgTemp3 = 0;
var avgTemp4 = 0;
var numOfReadingsToAvg = 10;
//  30 min * 60 * numOfReadingsToAvg = 1800 - save every 30 min
//  2  min * 60 * numOfReadingsToAvg / 2 = 600
//  1  min * 60 * numOfReadingsToAvg / 2 = 300
//  20 sec * numOfReadingsToAvg * 2 = 1
//  2 sec * numOfReadingsToAvg * currentSaveDelayCount = 20 sec
//  2 sec * numOfReadingsToAvg * currentSaveDelayCount / 60 = 
var currentSaveDelayCount = 90;
var delayCount = 0;
var test = "Test";
//var loopsSinceLastSettings = 0;
//var checkSettingsIntervul = 100;

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
    // only hit the db every 99 times otherwise just return the variable
  //  if loopsSinceLastSettings == 0 {
  //    loopsSinceLastSettings++;

//    console.log(fn);
      connection.query("SELECT * FROM recirculatorsettings", (err, result) => {
        console.log(result);
        return ( fn ( result ));
      });
//    }else if loopsSinceLastSettings == checkSettingsIntervul {
//      loopsSinceLastSettings = 0;
//    }
  };

  // get the recirculator settings from the data base
  exports.recircSettingsFrontEnd = function (req, res) {
    console.log("dbase controoler get recirc settings from the front end");
    connection.query("SELECT * FROM recirculatorsettings", (err, result) => {
//        console.log(result);
        res.send( result );
    });
  };

  // retrieve the stored temp data for display
  exports.getTempData = function (req, res) {
    console.log("in get temp data  yyyoooo");
    connection.query("SELECT * FROM temperatures ORDER BY id DESC LIMIT 30", (err, result) => {
//          console.log(result);
          res.send( result );
      });
  };

  // retrieve the pipe temperature data
  exports.getPipeTempData = function (req, res) {
    console.log("in dbcontroler get pipe data");
    connection.query("SELECT * FROM recirculatorHistory ORDER By id DESC LIMIT 30", (err, result) => {
      console.log(result);
      res.send ( result );
    });
  };


  exports.saveTempData = function (temp1, temp2, temp3, temp4) {
    console.log("in save temp data");
//    console.log(temp2, temp3);

    // average temperature readings to numOfReadingsToAvg
    tempSum1 = tempSum1 + temp1;
    tempSum2 = tempSum2 + temp2;
    tempSum3 = tempSum3 + temp3;
    tempSum4 = tempSum4 + temp4;
    tempcount++;
    console.log("tempcount - " + tempcount);

    if (tempcount == numOfReadingsToAvg) {
      avgTemp1 = tempSum1/numOfReadingsToAvg;
      avgTemp2 = tempSum2/numOfReadingsToAvg;
      avgTemp3 = tempSum3/numOfReadingsToAvg;
      avgTemp4 = tempSum4/numOfReadingsToAvg;
      tempSum1 = 0;
      tempSum2 = 0;
      tempSum3 = 0;
      tempSum4 = 0;
      tempcount = 0;
      console.log("averages - " + avgTemp1, avgTemp2, avgTemp3, avgTemp4);
      console.log("delayCount - " + delayCount);

      if (delayCount == currentSaveDelayCount){

        console.log("Saving Temp Data");
        connection.query("INSERT INTO temperatures SET ?",
          {
            tempOutDoors: avgTemp1,
            tempFamilyRoom: avgTemp2,
            tempBedRoom: avgTemp3,
            tempPipe: avgTemp4
          }, (err, result) => {
            if (err) throw err;
            return;
        });
        delayCount = 0;
      }
      delayCount++;
    };
  };

  exports.savePipeTemp = function (action, pipeTemp){
    console.log("In save pipe temp" + action + " , " + pipeTemp);
    connection.query("INSERT INTO recirculatorHistory SET ?",
    {
      pipetemperatures: pipeTemp,
      recircOnOff: action,
    }, (err) => {
      if (err) {
        console.log("Got a DB error in savePipeTemp");
        console.log (err);
      };
      return;
    });
  };

// end connection
});
