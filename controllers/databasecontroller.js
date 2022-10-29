//  Database controller all interaction with the database are here

const mysql = require('mysql2');
var comController = require ('./communicationsController');
const recircCNTRL = require ('./recircController');
const furnaceController = require ('./furnaceController');

// variables for the temperature sensor
var tempSum1 = 0;
var tempFamSum = 0;
var tempSum3 = 0;
var tempSum4 = 0;
var tempSum5 = 0;
var tempSum6 = 0;
var tempSum7 = 0;
var tempSum8 = 0;
var tempSum9 = 0;
var avgTemp1 = 0;
var avgFamTemp = 0;
var avgTemp3 = 0;
var avgTemp4 = 0;
var avgTemp5 = 0;
var avgTemp6 = 0;
var avgTemp7 = 0;
var avgTemp8 = 0;
var avgTemp9 = 0;
var flags = [];
//var numOfReadingsToAvg = 20;
var numOfReadingsToAvg = 10;
var tempcount = 0;
//  30 min * 60 * numOfReadingsToAvg = 1800 - save every 30 min
//  2  min * 60 * numOfReadingsToAvg / 2 = 600
//  1  min * 60 * numOfReadingsToAvg / 2 = 300
//  20 sec * numOfReadingsToAvg * 2 = 1
//  2 sec * numOfReadingsToAvg * currentSaveDelayCount = 20 sec
//  2 sec * numOfReadingsToAvg * currentSaveDelayCount / 60 = 
//  2 sec * 10 * 90 / 60 = 30 Min - current time between saves
//var currentSaveDelayCount = 90;
// the period between all temperature saves
var saveDelayIntervalMinutes = 3;
var saveDelayIntervalSeconds = saveDelayIntervalMinutes * 60;
var currentSaveDelayCount = saveDelayIntervalSeconds;
var currentDelayCountMin = 0; // only used to display the count
//var saveDelay = currentSaveDelayCount;
//var delayCount = 0;
var numDataPointsReadGen = 300;
var numDataPointsReadPipe = 100;
var temporaryTimes = [];
var test = "Test";

var furnChangeState = 'NULL';
var localFurnAction = "noChange";
var keepDataTime = 1;

var connection;

// timer
var myVar = setInterval(myTimer, 1000);

function myTimer(){
  currentSaveDelayCount--;
  currentDelayCountMin = secondsToHms(currentSaveDelayCount);
  console.log("current delay count - " + currentSaveDelayCount);
  console.log("current delay count - " + currentDelayCountMin);
};


function secondsToHms(d) {
    d = Number(d);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return m + ":" + s; 
};

function getCurrentTime(){
    // get the current time
    let date_ob = new Date();
    let hours = date_ob.getHours();
    // current minutes
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    if (hours < 10){
      hours = "0" + hours
    };
    if (minutes < 10){
      minutes = "0" + minutes;
    };
    if (seconds < 10){
      seconds = "0" + seconds
    };
    currentTime = hours + ":" + minutes + ":" + seconds;

    date = date_ob.getDate();
    year = date_ob.getFullYear();
    month = date_ob.getMonth();
    currentDate = year + "-" + month + "-" + date + " " + currentTime;

    console.log("Current Time in dbcontroller - " + currentDate);
    return(currentDate);
};

exports.upDateFurnState = function (newState){
  furnChangeState = newState;
}

exports.upDateTempSaveIterval = function(newDelay) {
  saveDelayIntervalMinutes = newDelay;
  saveDelayIntervalSeconds = saveDelayIntervalMinutes * 60;
  currentSaveDelayCount = saveDelayIntervalSeconds
  return ("Saved New Temp Save Interval");
};

exports.updateNumDataPointsToChart = function(newDataPoints) {
  numDataPointsReadGen = newDataPoints;
  return ("sucessfuly updated num data points to chart");
};

exports.getCurrentTimes = function(){
  temporaryTimes = [currentSaveDelayCount, tempcount, currentDelayCountMin];
  return(temporaryTimes);
};

exports.changeKeepDataTime = function(newTime){
  keepDataTime = newTime;
};

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
    connection.query("SELECT * FROM recirculatorSettings", (err, result) => {
      return ( fn ( result ));
    });
  };

  // get the recirculator settings from the data base
  exports.recircSettingsFrontEnd = function (req, res) {
    console.log("dbase controoler get recirc settings from the front end");
    connection.query("SELECT * FROM recirculatorSettings", (err, result) => {
        res.send( result );
    });
  };

  // retrieve the stored temp data for display
  exports.getTempData = function (req, res) {
    console.log("in get temp data  yyyoooo");
    var temp = "SELECT * FROM temperatures ORDER By id DESC LIMIT ";
    var oursql = temp.concat(numDataPointsReadGen);
    //console.log(oursql);
    connection.query( oursql, (err, result) => {
        //console.log(result);
        if (err) {
          console.log("Got a DB error in getTempData (other)");
          console.log (err);
          };
      res.send( result );
    });
  };

  // retrieve the pipe temperature data
  exports.getPipeTempData = function (req, res) {
    console.log("in dbcontroler get pipe data");
    var temp = "SELECT * FROM recirculatorHistory ORDER By id DESC LIMIT ";
    var oursql = temp.concat(numDataPointsReadPipe);
    console.log(oursql);
    connection.query( oursql, (err, result) => {
        console.log(result);
        if (err) {
          console.log("Got a DB error in getPipeTempData");
          console.log (err);
          };
        res.send ( result );
    });
  };


  exports.getdbSettings = function (){
    console.log("in db controller get db settings");
    var dbSettings = [saveDelayIntervalMinutes, numDataPointsReadGen];
    console.log(dbSettings);
    return dbSettings;
  };

  exports.setFurnaceChange = function (furnChangeText){
    localFurnAction = furnChangeText;
  };

  exports.getCurentAvgTemps = function (){
    var dataPac = [avgTemp1, avgFamTemp, avgTemp3, avgTemp4, avgTemp5, avgTemp6, avgTemp7, avgTemp8, avgTemp9];
        // 4 -  tempF1 Wood Stove
        // 5 -  tempF2 bread Board family room
        // 6 -  tempF3 bedroom
        // 7 -  tempF4 pipe
        // 8 -  tempFurnaceF Furnace
        // 9 -  tempF6 breadboard
        // 10 - tempF7 outdoor sun
    return (dataPac);
  };


  exports.saveTempData = function (temp1, temp2, temp3, temp4, temp5, temp6, temp7, temp8, temp9, furnAction) {
    console.log("in save temperature data");
    console.log(temp1, temp2, temp3, temp4, temp5, temp6, temp7, temp8, temp9, furnAction);
    currentSaveDelayCount--;
    console.log(currentSaveDelayCount + " - current save delay Count");

    // average temperature readings to numOfReadingsToAvg
    tempSum1 = tempSum1 + temp1;
    tempFamSum = tempFamSum + temp2;
    tempSum3 = tempSum3 + temp3;
    tempSum4 = tempSum4 + temp4;
    tempSum5 = tempSum5 + temp5;
    tempSum6 = tempSum6 + temp6;
    tempSum7 = tempSum7 + temp7;
    tempSum8 = tempSum8 + temp8;
    tempSum9 = tempSum9 + temp9;
    tempcount++;

    if (tempcount == numOfReadingsToAvg) {
      avgTemp1 = parseFloat((tempSum1/tempcount).toFixed(1));
      avgFamTemp = parseFloat((tempFamSum/tempcount).toFixed(1));
      avgTemp3 = parseFloat((tempSum3/tempcount).toFixed(1));
      avgTemp4 = parseFloat((tempSum4/tempcount).toFixed(1));
      avgTemp5 = parseFloat((tempSum5/tempcount).toFixed(1));
      avgTemp6 = parseFloat((tempSum6/tempcount).toFixed(1));
      avgTemp7 = parseFloat((tempSum7/tempcount).toFixed(1));
      avgTemp8 = parseFloat((tempSum8/tempcount).toFixed(1));
      avgTemp9 = parseFloat((tempSum9/tempcount).toFixed(1));
      tempSum1 = 0;
      tempFamSum = 0;
      tempSum3 = 0;
      tempSum4 = 0;
      tempSum5 = 0;
      tempSum6 = 0;
      tempSum7 = 0;
      tempSum8 = 0;
      tempSum9 = 0;
      tempcount = 0;
      console.log("averages - " + avgTemp1, avgFamTemp, avgTemp3, avgTemp4, avgTemp5, avgTemp6, avgTemp7, avgTemp8, avgTemp9);

      furnaceController.checkFurnace(avgTemp5, avgFamTemp, avgTemp3, avgTemp6, avgTemp7);
    };

    //      console.log("Current Save Delay Count - " + currentSaveDelayCount);
    if (currentSaveDelayCount <= 0){

        console.log("Saving Temp Data");
        var oldestRecordTime = '';

        // remove the oldest record if older than keep time
        tempSQL = "SELECT createdAt FROM temperatures order by id LIMIT 1";
        connection.query( tempSQL, (err, result) => {
            //console.log("Result - ");
            //console.log(result);
            if (err) {
              console.log("Got a DB error in get oldest created at");
              console.log (err);
              };
//              console.log(result[0]);
            oldestRecordTime = result[0];
            console.log ("oldest record created at - " + oldestRecordTime);
            currentTimeHere = getCurrentTime();
/*              console.log ("current time - " + currentTimeHere);
            console.log ("current keep data time - " + keepDataTime);
            let timeDifference = currentTimeHere - keepDataTime;
            console.log("Time Difference - " + timeDifference);
*/              
            var temp = "DELETE FROM temperatures WHERE createdAt < now() - interval ";
            var oursql = temp.concat(keepDataTime);
            var finalSQL = oursql.concat(" day");
            console.log(finalSQL);
            // delete the oldest record if < keepDataTime
            connection.query( finalSQL, (err, result) => {
              console.log(result);
              if (err) {
                console.log("Got a DB error in delete old record");
                console.log (err);
              };

              // NOTE:  assignment of temps to locations
              connection.query("INSERT INTO temperatures SET ?",
                {
                  tempOutDoorsSun:   avgTemp7,
                  tempOutDoorsShade: avgTemp8,
                  tempWaterTank:     avgTemp9,
                  tempFamilyRoom:    avgFamTemp,
                  tempBedRoom:       avgTemp3,
                  tempDesk:          avgTemp6,
                  tempPipe:          avgTemp4,
                  tempWoodStove:     avgTemp1,
                  tempFurnace:       avgTemp5,
                  furnaceOnOff:      localFurnAction
                }, (err, result) => {
                  if (err) {
                      console.log("Got a DB error in savePipeTemp");
                      console.log (err);
                  };
                  return;
                }
              );
              // end write temperatures to the database
            localFurnAction = "noChange";
            });
        });
      currentSaveDelayCount = saveDelayIntervalSeconds;
    // end the if save delay count
    };
  // end save temp data
  };

  exports.savePipeTemp = function (action, pipeTemp){
    console.log("In save pipe temp" + action + " , " + pipeTemp);

    var temp = "DELETE FROM recirculatorHistory WHERE createdAt < now() - interval ";
    var oursql = temp.concat(keepDataTime);
    var finalSQL = oursql.concat(" day");
    console.log(finalSQL);
    // delete the oldest record if < keepDataTime
    connection.query( finalSQL, (err, result) => {
        console.log(result);
        if (err) {
            console.log("Got a DB error in delete old record");
            console.log (err);
        };
    });

/*
    connection.query("DELETE FROM recirculatorHistory ORDER BY id limit 1", (err) => {
      if (err) {
        console.log("Got a DB error in savePipeTemp");
        console.log (err);
      };
      return;
    });
*/

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

  exports.changeState = function (action){
    if (action == "changeHome-Away"){
      connection.query ("UPDATE recirculatorSettings SET pipeTempOn = 35  WHERE id=2")
    }
    else if (action == "changeHome-Away"){
      
    }
  };

//    ******  Under construction   ********

  exports.upDateRecircSettings = function (newSettings) {
    console.log("in dbcntrlr");
    console.log(newSettings);

    //  step through the newSettings object looking for a value to save
    for (var key in newSettings){
      if (newSettings[key] == ''){
        console.log("nothing at - " + key)
      } else {
        console.log("At - " + key + " got - " + newSettings[key]);
        var y = newSettings[key];
        var x = key;
        if (typeof newSettings[key] === 'string'){
          y = "'" + y + "'"
        };
        var firstString = "UPDATE recirculatorSettings SET ";
        var secondString = " = ";
        var thirdString = " WHERE id=1";
        NewString = firstString.concat(x, secondString, y, thirdString);
        console.log (NewString);

        connection.query( NewString, (err, result) => {
          console.log(result);
          if (err) {
            console.log("Got a DB error in update reg setting");
            console.log (err);
          } else {
            recircCNTRL.getNewRecircSettings();
          }
        })
      }
    }
  };

  exports.upDateGeneralSettings = function (newSettings){
    console.log("in db controler update general settings");
    console.log(newSettings);
    console.log(" ** BTW This Was Not Implemented **");

  };


  exports.getFurnaceSettings = function (){
    console.log("in dbcontroller get furnace settings");

    connection.query("SELECT * FROM furnaceSettings", (err, result) => {
      if(err){
        console.log(" ** ERROR RETRIEVING FURNACE SETTINGS **");
        console.log(err)
      };
      return (result);
    });
  };

  exports.updateFurnaceSettings = function(changeField, newValue){
    console.log("in dbcontroller update furnace settings");
    console.log(changeField, newValue);
    console.log(" ** BTW This Was Not Implemented **");

    var firstString = "UPDATE furnaceSettings SET ";
    var secondString = " = '";
    var thirdString = "' WHERE id=1";
    NewString = firstString.concat(changeField, secondString, newValue, thirdString);
    console.log (NewString);

    connection.query( NewString, (err, result) => {
      console.log(result);
      if (err) {
        console.log("Got a DB error in update reg setting");
        console.log (err);
      }
    })
  };


// end connection
});
