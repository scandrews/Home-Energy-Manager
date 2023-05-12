//  Database controller all interaction with the database are here

const mysql = require('mysql2');
var comController = require ('./communicationsController');
const recircCNTRL = require ('./recircController');
const furnaceController = require ('./furnaceController');

var db = require("../models");
const { Op } = require("sequelize");

// for troubleshooting run for water
    var setFurnChngCounter = 0;


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
//var numOfReadingsToAvg = 3;
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
var keepDataTime = 1;  //days

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
  saveDelayIntervalSeconds = saveDelayIntervalMinutes * 30;
  currentSaveDelayCount = saveDelayIntervalSeconds
  return ("Saved New Temp Save Interval");
};

exports.updateNumDataPointsToChart = function(newDataPoints) {
  numDataPointsReadGen = newDataPoints;
  return ("sucessfuly updated num data points to chart");
};

// called from the route controller to get this stuff for the front end
exports.getCurrentTimes = function(){
  temporaryTimes = [currentSaveDelayCount, tempcount, currentDelayCountMin];
  return(temporaryTimes);
};

exports.changeKeepDataTime = function(newTime){
  console.log("Changing the save days to - " + newTime);
  keepDataTime = newTime;
  return(keepDataTime)
};

/*var connection;

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
*/

  //populate the database
  exports.initSettings = function(){
      console.log("* * * in db cntrlr init ALL settings * * *");

      db.recirculatorSettings.destroy({ truncate: true });
      db.furnaceSettings.destroy({ truncate: true });

      db.recirculatorSettings.create(
//    connection.query("INSERT INTO recirculatorSettings SET ?",
        {
            pipeTempOn: 100,
            pipeTempOff: 110,
            weekDayOn1: "7:30",
            weekDayOff1: "7:35",
            weekDayOn2: "18:00",
            weekDayOff2: "18:30",
            weekEndOn1: "8:30",
            weekEndOff1: "8:35",
            weekEndOn2: "20:00",
            weekEndOff2: "20:30"
        })
        .then ((result) => {
          console.log("Did the fucker work - " + result)
        })
        .catch ((err) => {
            if (err) {
              console.log("Got a DB error in init recirc settings FIRST");
              console.log (err);
        }
        })

      console.log("got through the first init, now on the first furnace init");
      db.furnaceSettings.create(
  //        connection.query("insert into furnaceSettings set ?",{
          {
            state: "Home",
            weekDayMorningOnTime: "06:00",
            WeekDayMorningMinTemp: 65,
            WeekDayMorningMaxTemp: 68,
            weekDayMiddayOnTime: "09:30",
            WeekDayMiddayMinTemp: 60,
            WeekDayMiddayMaxTemp: 63,
            weekDayEveningOnTime: "16:30",
            WeekDayEveningMinTemp: 65,
            WeekDayEveningMaxTemp: 68,
            weekDayNightOnTime: "23:30",
            WeekDayNightMinTemp: 62,
            WeekDayNightMaxTemp: 65,
      
            weekEndMorningOnTime: "07:00",
            WeekEndMorningMinTemp: 66,
            WeekEndMorningMaxTemp: 69,
            weekEndMiddayOnTime: "12:00",
            WeekEndMiddayMinTemp: 64,
            WeekEndMiddayMaxTemp: 67,
            weekEndEveningOnTime: "16:00",
            WeekEndEveningMinTemp: 66,
            WeekEndEveningMaxTemp: 69,
            weekEndNightOnTime: "23:30",
            WeekEndNightMinTemp: 62,
            WeekEndNightMaxTemp: 65,
      
            awayMinTemp: 58,
            awayMaxTemp: 61
          })
        .then ((result) => {
            console.log("got the second then" + result);
          })
        .catch ((err) => {
            console.log("Got a DB error in init furnace settings SECOND");
            console.log (err);
        });

        //connection.query("insert into furnaceSettings set ?",{
        db.furnaceSettings.create(
        {
          state: "Guest",
          weekDayMorningOnTime: "06:00",
          WeekDayMorningMinTemp: 65,
          WeekDayMorningMaxTemp: 68,
          weekDayMiddayOnTime: "10:30",
          WeekDayMiddayMinTemp: 62,
          WeekDayMiddayMaxTemp: 65,
          weekDayEveningOnTime: "16:00",
          WeekDayEveningMinTemp: 65,
          WeekDayEveningMaxTemp: 68,
          weekDayNightOnTime: "23:30",
          WeekDayNightMinTemp: 62,
          WeekDayNightMaxTemp: 65,

          weekEndMorningOnTime: "07:00",
          WeekEndMorningMinTemp: 66,
          WeekEndMorningMaxTemp: 69,
          weekEndMiddayOnTime: "12:00",
          WeekEndMiddayMinTemp: 65,
          WeekEndMiddayMaxTemp: 68,
          weekEndEveningOnTime: "16:00",
          WeekEndEveningMinTemp: 66,
          WeekEndEveningMaxTemp: 69,
          weekEndNightOnTime: "23:30",
          WeekEndNightMinTemp: 64,
          WeekEndNightMaxTemp: 67,

          awayMinTemp: 58,
          awayMaxTemp: 61
          })
          .then ((result) => {
              console.log("got the **  WTF **  third then" + result);
            })
          .catch ((err) => {
              console.log("Got a DB error in init furnace settings THIRD");
              console.log (err);
          });

        db.furnaceSettings.create(
        {
          state: "Working From Home",
          weekDayMorningOnTime: "06:00",
          WeekDayMorningMinTemp: 65,
          WeekDayMorningMaxTemp: 68,
          weekDayMiddayOnTime: "10:30",
          WeekDayMiddayMinTemp: 64,
          WeekDayMiddayMaxTemp: 66,
          weekDayEveningOnTime: "16:00",
          WeekDayEveningMinTemp: 65,
          WeekDayEveningMaxTemp: 68,
          weekDayNightOnTime: "23:30",
          WeekDayNightMinTemp: 62,
          WeekDayNightMaxTemp: 65,

          weekEndMorningOnTime: "07:00",
          WeekEndMorningMinTemp: 66,
          WeekEndMorningMaxTemp: 69,
          weekEndMiddayOnTime: "12:00",
          WeekEndMiddayMinTemp: 65,
          WeekEndMiddayMaxTemp: 68,
          weekEndEveningOnTime: "16:00",
          WeekEndEveningMinTemp: 66,
          WeekEndEveningMaxTemp: 69,
          weekEndNightOnTime: "23:30",
          WeekEndNightMinTemp: 64,
          WeekEndNightMaxTemp: 67,

          awayMinTemp: 58,
          awayMaxTemp: 61
          })
          .then ((result) => {
              console.log("got the **  WTF **  third then" + result);
            })
          .catch ((err) => {
              console.log("Got a DB error in init furnace settings THIRD");
              console.log (err);
          });


  // end init settings
  };

  // get the recirculator settings for the recirc controller
  exports.recircSettingsRecirCNTRL = function (what, fn) {
    console.log("dbase controoler get recirc settings from recirs controller");
    db.recirculatorSettings.findAll({
      where: { id: 1 }
    })
      .then ((result) => {
          console.log("db controller, get recirc settings for the recirc controller - ");
          console.log(result[0].dataValues);
          console.log(result[0].dataValues.pipeTempOn);
          fn (result[0].dataValues);
        })
      .catch ((err) => {
          console.log("Got a DB error in recirc setting for the recirc cntrlr");
          console.log (err);
      });

//    connection.query("SELECT * FROM recirculatorSettings", (err, result) => {
//      return ( fn ( result ));
//    });
  };

  // get the recirculator settings for the front end
  exports.recircSettingsFrontEnd = function (req, res) {
    console.log("dbase controoler get recirc settings from the front end");
    db.recirculatorSettings.findAll({})
      .then ((result) => {
          console.log("db controller, get setting for the front end - " + result);
          res.send (result);
        })
      .catch ((err) => {
          console.log("Got a DB error in get recird setting for the front end");
          console.log (err);

//    connection.query("SELECT * FROM recirculatorSettings", (err, result) => {
//        res.send( result );
    });
  };

  // retrieve the stored temp data for display
  exports.getTempData = function (req, res) {
    console.log("in get temp data  yyyoooo");
    //var temp = "SELECT * FROM temperatures ORDER By id DESC LIMIT ";
    //var oursql = temp.concat(numDataPointsReadGen);
    //console.log(oursql);
    db.temperatures.findAll({
      order:[['id', 'DESC']]
    })
      .then ((result) => {
          console.log("got the third then" + result);
          res.send (result);
        })
      .catch ((err) => {
          console.log("Got a DB error in init furnace settings THIRD");
          console.log (err);

//    connection.query("SELECT * FROM recirculatorSettings", (err, result) => {
//        res.send( result );
    });

/*      
    connection.query( oursql, (err, result) => {
        //console.log(result);
        if (err) {
          console.log("Got a DB error in getTempData (other)");
          console.log (err);
          };
      res.send( result );
    });
*/
  };

  // retrieve the pipe temperature data
  exports.getPipeTempData = function (req, res) {
    console.log("in dbcontroler get pipe data");
    //var temp = "SELECT * FROM recirculatorHistory ORDER By id DESC LIMIT ";
    //var oursql = temp.concat(numDataPointsReadPipe);
    //console.log(oursql);
    db.recirculatorHistory.findAll({
      order:[['id', 'DESC']],
      limit: [[numDataPointsReadPipe]]
    })
      .then ((result) => {
        console.log("got the third then" + result);
        res.send (result);
      })
      .catch ((err) => {
        console.log("Got a DB error in init furnace settings THIRD");
        console.log (err);
      })

/*    connection.query( oursql, (err, result) => {
        console.log(result);
        if (err) {
          console.log("Got a DB error in getPipeTempData");
          console.log (err);
          };
        res.send ( result );
    });*/
  };


  exports.getdbSettings = function (){
    //console.log("in db controller get db settings");
    var dbSettings = [saveDelayIntervalMinutes, numDataPointsReadGen, keepDataTime];
    //console.log(dbSettings);
    return dbSettings;
  };




  exports.setFurnaceChange = function (furnChangeText){
    console.log("Db Controller - setFurnaceChange, counter - " + setFurnChngCounter);
    setFurnChngCounter ++;
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


  exports.saveTempData = function (temp1, temp2, temp3, temp4, temp5, temp6, temp7, temp8, temp9, furnAction, currentStates) {
    console.log("in save temperature data");
    console.log(temp1, temp2, temp3, temp4, temp5, temp6, temp7, temp8, temp9, furnAction);
    //currentSaveDelayCount--;
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
    console.log("db cntrl temp count - " + tempcount);
    console.log("db cntrl num readings to average - " + numOfReadingsToAvg);

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
      furnaceController.checkFurnace(avgTemp5, avgFamTemp, avgTemp3, avgTemp6, avgTemp7, currentStates);
    };

      //      console.log("Current Save Delay Count - " + currentSaveDelayCount);
      if (currentSaveDelayCount <= 0){

          console.log("* * * * * Saving Temp Data * * * * * * ");
          //var oldestRecordTime = '';

          // remove the oldest record if older than keep time
          let timeDifference = 86400000 * keepDataTime;
          console.log("Keep Data Time - " + keepDataTime);
          db.temperatures.destroy({
                where: {
                    createdAt: { [Op. lt]: (new Date() -  timeDifference) }
                }
          })

          .then ((result) => {

            console.log("in the .then after the destroy");
            db.temperatures.create(
              {
                tempWoodStove:     avgTemp1,
                tempFamilyRoom:    avgFamTemp,
                tempBedRoom:       avgTemp3,
                tempPipe:          avgTemp4,
                tempFurnace:       avgTemp5,
                tempDesk:          avgTemp6,
                tempOutDoorsSun:   avgTemp7,
                tempOutDoorsShade: avgTemp8,
                tempWaterTank:     avgTemp9,
                furnaceOnOff:      localFurnAction
              })
            .then (( result ) => {
              console.log("I think we inserted new temperatures into the db");
              localFurnAction = "noChange";
              return (result);
            })
            .catch ((err) =>{
              console.log("ERROR IN THE SAVE TEMPS " + err)
            })
          })
          .catch (( err ) => {
            console.log ("So ERROR on the delete old record " + err)
          })

                // NOTE:  assignment of temps to locations
                // end write temperatures to the database
        currentSaveDelayCount = saveDelayIntervalSeconds;
        console.log ("just set the current save delay count to the interval - " + currentSaveDelayCount)

        // end the if save delay count
      };

  // end save temp data
  };

  exports.savePipeTemp = function (action, pipeTemp){
    console.log("In save pipe temp" + action + " , " + pipeTemp);

/*    var temp = "DELETE FROM recirculatorHistory WHERE recircHist < now() - interval ";
    var oursql = temp.concat(delayDays);
    var finalSQL = oursql.concat(" day");
    console.log(finalSQL);

    let timeDifference = currentTimeHere - (86400000 * keepDataTime);
*/    // delete the oldest record if < keepDataTime
    let delayDays = keepDataTime + .5;
    db.recirculatorHistory.destroy({
        where: {
          createdAt: { lt: new Date(Date.now() - delayDays) }
        }
      })
      .then ((result) => {
          db.recirculatorHistory.create(
            {
              pipetemperatures: pipeTemp,
              recircOnOff: action,
            })
          .then ((result) => {
            console.log("Looks like we sucessfully deleted the oldest recond in recic Hist")
            return;
          })
          .catch ((err) => {
            console.log("got an err in delete oldest record in recirc history")
          })
      .catch ((err) => {
        console.log("Got a DB error in savePipeTemp");
        console.log (err);
      })

    })
  }

/*
  exports.changeState = function (action){
    console.log("***** I CAN'T IMAGINE THAT THIS IS USED *****")
    if (action == "changeHome-Away"){
      connection.query ("UPDATE recirculatorSettings SET pipeTempOn = 35  WHERE id=2")
    }
    else if (action == "changeHome-Away"){
    }
  };
*/
//    ******  Under construction   ********

  exports.upDateRecircSettings = function (newSettings) {
    console.log("* * * in db CONTROLLER UPDATE RECIRC SETTINGS * * *");
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

  // called by the furnace controller
  exports.getFurnaceSettings = function (HomeState, fn){
    console.log("in dbcontroller get furnace settings");
    console.log("Current state - " + HomeState);

    db.furnaceSettings.findAll(
        {
          where: {state : HomeState }
        }
        )
      .then (( result ) => {
        console.log("Just retrieved the furnace setting form the db");
        console.log(result);
        console.log("in DB cntrl id of the retrived table is - " + result[0].id);
        console.log("in DB cntrl middayMaxTemWeekDay - " + result[0].WeekDayMiddayMaxTemp);
        console.log("in DB cntrl middayMinTemWeekDay - " + result[0].WeekDayMiddayMinTemp);
        fn (result[0].dataValues);
        //return (result);
      })
      .catch ((err) =>{
        console.log("ERROR IN THE SAVE TEMPS " + err)
      })
  };

// save new settings from the front end to the database, overwriting existing settings
// or saving under a new name if given
  exports.saveFurnaceSettings = function(newValue){
    console.log("in dbcontroller save furnace settings");
    console.log(newValue);

    var placeToSave = newValue.state;

    console.log (placeToSave);

    db.furnaceSettings.destroy({
      where: {state: placeToSave}
    })
    .then ((result) => {
      db.furnaceSettings.create({
          newValue
      })
      .then ((result) => { console.log(result)
      })
      .catch ((err) => {
        console.log("got an error in the create new row in furnace settings");
        console.log(err)
      })      
    })
    .catch ((err) => {
      console.log("got an error in the create new row in furnace settings");
      console.log(err)
    })
  };



// end connection

