// client side script file for the home control application

$(document).ready(function() {

var serverIPAddress = "";

var time = 2;

// timer to get periodicaly get status
//var Timer = setInterval(myTimer, 1000);

//function myTimer() {
//	$.get('currentStatus', (stati) => {
//		console.log(stati);
//		$(".statusBox").html(stati.flag4);
//		$(".temp1").html(stati.tempF1);
//		$(".temp1").html(stati.tempF2);
//		$(".temp1").html(stati.tempF3);
//		$(".temp1").html(stati.tempF4);
//	})
//};

var variableH = 6;
var veriableM = 30;
var variable = "6:30";
// ------------------------------------------------


// Handle the show current temps button
$(".messageShowCurrentTemps").on("click", function(){
	console.log("got the show current temperature message click");

	var localPumpStatus = '0ff';
	function writeTemperatures(localTempArray){
		console.log(localTempArray);
		$(".curTempBlock1").html("<td>" + localTempArray[10] +  //outdoor sun
							"</td><td>" + localTempArray[6] +  //Bedroom
							"</td><td>" + localTempArray[5] + //Family room
							"</td><td>" + localTempArray[6] +  //Bed Room
							"</td><td>" + localTempArray[9] +  //Desk
							"</td><td>" + localTempArray[7] +  //Pipe
							"</td><td>" + localTempArray[4] +  //Wood
							"</td><td>" + localTempArray[8] +  //Furnace
							"</td>");
		$(".timeToSaveStatus").html("<td>" + localTempArray[11][2] + "</td>");
		$(".pumpStatus").html("<td>" + localPumpStatus + "</td>");
	};

	$.get('currentTemps', (temps) => {
		console.log(temps);
		if(temps[2] == 1){
			localPumpStatus = 'on'
		} else if (temps[2] == 0){
			localPumpStatus = 'off'
		}
		writeTemperatures(temps);

		//		intervalId = setInterval(count(temps), 1000);
		//    	function count (temps) {
		//	   	    time--;
	       	// update the screen to the new converted time
		//			writeTemperatures(temps);
		//	       	if (time <= 0){
		//	       		clearInterval(intervalId);
		//				$.get('currentTemps', (temps) => {
		//					console.log(temps);
		//					writeTemperatures(temps);
		//			    });
		//       		}
		//    	};

	});

});




// handling the Chart Pipe Temps click
$(".messageChartPipeTemps").on("click", function(event){
	event.preventDefault();
	const labels = [];
	const pipeTempArray = [];
	var time = [];
	console.log("got the Chart Pipe Temps click");

	// to convert mysql timestamp
	// https://stackoverflow.com/questions/3075577/convert-mysql-datetime-stamp-into-javascripts-date-format

	// get the pipe temperature data
	$.get('pipeTemp', (temps) => {
		console.log("data back from pipe temps - ");
		console.log(temps);

		var labelArray = [];
		for (i=0; i<temps.length; i++){
			var od = temps[i].recircHist;
			var pt = temps[i].pipetemperatures;

			var t = od.split(/[- : T .]/);
			console.log(t);
			if (t[3] < 5){
				x = t[3] - 5;
				t[3] = x + 24;
			} else t[3] = t[3] - 5;

			// Apply each element to the Date function
			time = t[3] + ":" + t[4] + ":" + t[5];
			console.log(time);
			labels [i] = time;
			Math.round(pt); 
			pipeTempArray[i] = pt
			if (temps[i].recircOnOff == "turnRecircOn"){
				labelArray.push( {
							      "text": "Pump Turned ON",
							      "background-color": "#90A23B",
							      "font-size": "14px",
							      "font-family": "arial",
							      "font-weight": "normal",
							      "font-color": "#FFFFFF",
							      "padding": "10%",
							      "border-radius": "3px",
							      "offset-y": -30,
							      "shadow": false,
							      "callout": true,
							      "callout-height": "10px",
							      "callout-width": "15px",
							      "hook": "node:index=" + i
								})
			};
			if (temps[i].recircOnOff == "turningRecircOff"){
				labelArray.push ( {
							      "text": "Pump Turned OFF",
							      "background-color": "#90A23B",
							      "font-size": "14px",
							      "font-family": "arial",
							      "font-weight": "normal",
							      "font-color": "#FFFFFF",
							      "padding": "10%",
							      "border-radius": "3px",
							      "offset-y": -30,
							      "shadow": false,
							      "callout": true,
							      "callout-height": "10px",
							      "callout-width": "15px",
							      "hook": "node:index=" + i
								})
			}
		}

		console.log("built the chart struct - ");
		console.log(labelArray);

		// full ZingChart schema can be found here:
		// https://www.zingchart.com/docs/api/json-configuration/
		const myConfig = {
    	    type: 'line',
        	title: {
				text: 'Recirculator status',
				fontSize: 22,
				color: '#5d7d9a'
			},
			legend: {
				draggable: true,
			},
			scaleX: {
				// set scale label
				label: {
					text: 'Time'
				},
				// convert text on scale indices
				labels: labels
				//  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
			},
			scaleY: {
			// scale label with unicode character
				label: {
					text: 'Temperature (°F)'
				}
			},
			plot: {
				// animation docs here:
				// https://www.zingchart.com/docs/tutorials/design-and-styling/chart-animation/#animation__effect
				animation: {
					effect: 'ANIMATION_EXPAND_BOTTOM',
					method: 'ANIMATION_STRONG_EASE_OUT',
					sequence: 'ANIMATION_BY_NODE',
					speed: 275,
				}
			},

			"labels": labelArray,

			series: [{
				// plot 1 values, linear data
				values: pipeTempArray,
				text: 'Pipe Temperature',
				backgroundColor: '#4d80a6'
			}]
		};
     
		// render chart with width and height to
		// fill the parent container CSS dimensions
		zingchart.render({
			id: 'myChart',
			data: myConfig,
			height: '100%',
			width: '100%'
		});
    });
// end the chart pipe temps click
});


// ------------------------------------------------


// handling the Chart Other Temps click
$(".messageChartOtherTemps").on("click", function(event){
	event.preventDefault();
	const labels = [];
	const outDoorShadeTempArray = [];
	const outDoorSunTempArray = [];
	const familyTempArray = [];
	const bedRmTempArray = [];
	const pipeTempArray = [];
	const deskTempArray = [];
	const furnaceTempArray = [];
	const woodStoveTempArray = [];
	var time = [];
	console.log("got the Chart Other Temps click");

	// to convert mysql timestamp
	// https://stackoverflow.com/questions/3075577/convert-mysql-datetime-stamp-into-javascripts-date-format

	// get the pipe temperature data
	$.get('curTempHistory', (temps) => {
		console.log("data back from pipe temps - ");
		console.log(temps);

		for (i=0; i<temps.length; i++){
			var od = temps[i].createdAt;
			var oshadet = temps[i].tempOutDoorsShade;
			var osunt = temps[i].tempOutDoorsSun;
			var frt = temps[i].tempFamilyRoom;
			var brt = temps[i].tempBedRoom;
			var pt = temps[i].tempPipe;
			var dt = temps[i].tempDesk;
			var ft = temps[i].tempFurnace;
			var wst = temps[i].tempWoodStove;

			var t = od.split(/[- : T .]/);
			console.log(t);
			if (t[3] < 5){
				x = t[3] - 5;
				t[3] = x + 24;
			} else t[3] = t[3] - 5;
			// Apply each element to the Date function
			time = t[3] + ":" + t[4] + ":" + t[5];
			console.log(time);
			labels [i] = time;
			Math.round(oshadet);
			Math.round(osunt);
			Math.round(frt);
			Math.round(brt);
			Math.round(pt);
			Math.round(dt);
			Math.round(ft);
			Math.round(wst);
			outDoorShadeTempArray[i] = oshadet;
			outDoorSunTempArray[i] = osunt;
			familyTempArray[i] = frt;
			bedRmTempArray[i] = brt;
			pipeTempArray[i] = pt
			deskTempArray[i] = dt
			furnaceTempArray[i] = ft
			woodStoveTempArray[i] = wst
		}


		// full ZingChart schema can be found here:
		// https://www.zingchart.com/docs/api/json-configuration/
		const myConfig = {
    	    type: 'line',
        	title: {
				text: 'House Temperatures History',
				fontSize: 22,
				color: '#5d7d9a'
			},
			legend: {
				draggable: true,
			},
			scaleX: {
				// set scale label
				label: {
					text: 'Time'
				},
				// convert text on scale indices
				labels: labels
			},
			scaleY: {
			// scale label with unicode character
				label: {
					text: 'Temperature (°F)'
				}
			},
			plot: {
				// animation docs here:
				// https://www.zingchart.com/docs/tutorials/design-and-styling/chart-animation/#animation__effect
				animation: {
					effect: 'ANIMATION_EXPAND_BOTTOM',
					method: 'ANIMATION_STRONG_EASE_OUT',
					sequence: 'ANIMATION_BY_NODE',
					speed: 275,
				}
			},

			series: [{
				// plot 1 values, linear data
				values: outDoorShadeTempArray,
				text: 'Outside Shade Temperature',
				backgroundColor: '#8eefde'
				},
				{
	            // plot 2 values, linear data
	            values: outDoorSunTempArray,
	            text: 'Outside Sun Temperature',
	            backgroundColor: '#70cfeb'
	          },
	          {
	            // plot 3 values, linear data
	            values: familyTempArray,
	            text: 'Family Room Temperature',
	            backgroundColor: '#8ee9de'
	          },
	          {
	            // plot 4 values, linear data
	            values: bedRmTempArray,
	            text: 'Bedroom Temperature',
	            backgroundColor: '#4d80a6'
	          },
				{
	            // plot 5 values, linear data
	            values: pipeTempArray,
	            text: 'Pipe Temperature',
	            backgroundColor: '#4d80a6'
	          },
				{
	            // plot 6 values, linear data
	            values: deskTempArray,
	            text: 'Desk Temps',
	            backgroundColor: '#4d80a6'
	          },
				{
	            // plot 7 values, linear data
	            values: furnaceTempArray,
	            text: 'Furnace Temperature',
	            backgroundColor: '#4d80a6'
				},
				{
	            // plot 8 values, linear data
	            values: woodStoveTempArray,
	            text: 'Wood Stove Temperature',
	            backgroundColor: '#4d80a6'
	          }
			]
		};
     
		// render chart with width and height to
		// fill the parent container CSS dimensions
		zingchart.render({
			id: 'otherTempsChart',
			data: myConfig,
			height: '100%',
			width: '100%'
		});
    });
// end the chart other temperatures click
});



// -------------------------------------------------
// wait for button clicks

// handling the show temperature click
$(".showTemp").on("click", function(event){
	event.preventDefault();
	console.log("got the show click");
	//get current temps from database
	$.get('curTemp', (temps) => {
		console.log(temps);
		console.log("temp1 - ", temps[0].createdAt);
		console.log("temp2 - ", temps[0].tempFamilyRoom);
		console.log("temp2 - ", temps[0].tempBedRoom);
		console.log("temp2 - ", temps[0].tempOutDoors);
		console.log("temp2 - ", temps[0].tempPipe);
		$(".tempblock1").html("<td>" + temps[0].createdAt + 
						 "</td><td>" + temps[0].tempFamilyRoom + 
						 "</td><td>" + temps[0].tempBedRoom + 
						 "</td><td>" + temps[0].tempOutDoors + 
						 "</td><td>" + temps[0].tempPipe + "</td>");
	});
});


// get the recirculator settings from the database
$(".getRecircSettings").on("click", function(event){
	event.preventDefault();
	console.log("got the get recirc settings click");
	$.get('recircSettings', (stuff) => {
		console.log(stuff);
		console.log(stuff[0].weekDayOn1 + stuff[0].pipeTempOn);
		$("#onTemperature").attr("placeholder", stuff[0].pipeTempOn);
		$("#offTemperature").attr("placeholder", stuff[0].pipeTempOff);
		$("#weekdayStartTime1").attr("placeholder", stuff[0].weekDayOn1);
		$("#weekdayOffTime1").attr("placeholder", stuff[0].weekDayOff1);
		$("#weekdayStartTime2").attr("placeholder", stuff[0].weekDayOn2);
		$("#weekdayOffTime2").attr("placeholder", stuff[0].weekDayOff2);
		$("#weekendStartTime1").attr("placeholder", stuff[0].weekEndOn1);
		$("#weekendOffTime1").attr("placeholder", stuff[0].weekEndOff1);
		$("#weekendStartTime2").attr("placeholder", stuff[0].weekEndOn2);
		$("#weekendOffTime2").attr("placeholder", stuff[0].weekEndOff2);
    });
});

// Update the recirculator settings
$(".upDateRecircSettings").on("click", function(event){
	event.preventDefault();
	console.log("got the update click");
	var newSettings = {
		pipeTempOn: $("#onTemperature").val().trim(),
		pipeTempOff: $("#offTemperature").val().trim(),
		weekDayOn1: $("#weekdayStartTime1").val().trim(),
		weekDayOff1: $("#weekdayOffTime1").val().trim(),
		weekDayOn2: $("#weekdayStartTime2").val().trim(),
		weekDayOff2: $("#weekdayOffTime2").val().trim(),
		weekEndOn1: $("#weekendStartTime1").val().trim(),
		weekEndOff1: $("#weekendOffTime1").val().trim(),
		weekEndOn2: $("#weekendStartTime2").val().trim(),
		weekEndOff2: $("#weekendOffTime2").val().trim(),
	};
	console.log(newSettings);

//	var serverURL = "'http://" + serverIPAddress + ":2000/upDateRecircSettings'";
	var serverURL =	"http://localhost:2000/upDateRecircSettings";
	$.ajax({
		url: serverURL,
		type: "POST",
		data: newSettings,
		success: function(d) {
			console.log("the post worked");
			console.log(d);
		}
	})
});

// Handle the GET other settings button
$(".getGeneralSettings").on("click", function(event){
	event.preventDefault();
	console.log("got the get general settings click");
	$.get('generalSettings', (stuff) => {
		console.log(stuff);
		serverIPAddress = stuff.serverIPAddress;
		$("#tempSaveInterval").attr("placeholder", stuff.tempSaveInterval);
		$("#dataPointsInGraph").attr("placeholder", stuff.numDataPointsToGraph);
		$("#serverIPAddress").attr("placeholder", stuff.serverIPAddress);
		$("#ArduinoIPAddress").attr("placeholder", stuff.arduinoIPAddress);
		$("#someThing").attr("placeholder", stuff.something);
		$("#somethingElse").attr("placeholder", stuff.somethingelse);
		$("#somefkn").attr("placeholder", stuff.somefkn);
		$("#somethingelse2").attr("placeholder", stuff.somethingelse2);
		$("#somefkn2").attr("placeholder", stuff.somefkn2);
		$("#runMode").attr("placeholder", stuff.runMode);
    });
});


// Update the General settings
$(".upDateGeneralSettings").on("click", function(event){
	//event.preventDefault();
	console.log("got the update general click");
	var newGenSettings = {
		tempSaveInterval: $("#tempSaveInterval").val().trim(),
		dataPointsToGraph: $("#dataPointsInGraph").val().trim(),
		weekDayOn1: $("#serverIPAddress").val().trim(),
		weekDayOff1: $("#ArduinoIPAddress").val().trim(),
		weekDayOn2: $("#someThing").val().trim(),
		weekDayOff2: $("#somethingElse").val().trim(),
		weekEndOn1: $("#somefkn").val().trim(),
		serverIPAddress: $("#serverIPAddress").val().trim(),
		arduinoIPAddress: $("#ArduinoIPAddress").val().trim(),
		runMode: $("#runMode").val().trim(),
	};
	console.log(newGenSettings);
//	var serverURL = "'http://" + serverIPAddress + ":2000/upDateGeneralSettings'";
	var serverURL = "http://localhost:2000/upDateGeneralSettings"

	$.ajax({
		url: serverURL,
		type: "POST",
		data: newGenSettings,
		success: function(d) {
			console.log("the post worked");
		}
	})
});



// Handle the change red button
$(".messageRedChange").on("click", function(){
	console.log("got the send Red Change message click");
    $.ajax({
    	url: "http://localhost:2000/sendMessage",
        type: "POST",
        data: {message: "redChange"},
        success: function(d) {
        	console.log("SUCCESS in the change state - " + d);
            alert("successs "+ JSON.stringify(d));
        }
    });
});

// Handle the change home/away button
$(".changeHomeAway").on("click", function(event){
	console.log("got the send change home/away click");
    $.ajax({
    	url: "http://localhost:2000/sendMessage",
        type: "POST",
        data: {message: "changeHome-Away"},
        success: function(returnState) {
        	console.log("Back from the server - " + returnState.stateHomeAway);
        	if (returnState.stateHomeAway == "Home"){
        		$(".changeHomeAway").text("Away");
			} else if (returnState.stateHomeAway == "Away"){
				$(".changeHomeAway").text("Home");
			}
        	console.log("SUCCESS in the change home/away state");
        }
    });
});

// manually turn the pump on
$(".messageTurnPumpOn").on("click", function(event){
	//$(this).text('Turn Pump Off');
	console.log("got the pump on message click");
    $.ajax({
    	url: "http://localhost:2000/sendMessage",
        type: "POST",
        data: {message: "ManualPumpChange"},
        success: function(returnState) {
        	console.log("Back from the server - " + returnState);
        	if (returnState == "on"){
        		$(".messageTurnPumpOn").text("Stop Recirculator");
			} else if (returnState == "off"){
				$(".messageTurnPumpOn").text("Run Recirculator");
			}
        	console.log("SUCCESS in the change start/stop Recirc state");
        }
    });
});

// manually turn the pump off
// delete this - make the pump change toggle
$(".messageTurnPumpOff").on("click", function(event){
	console.log("got the pump off message click");
    $.ajax({
    	url: "http://localhost:2000/sendMessage",
        type: "POST",
        data: {message: "turnPumpOff"},
        success: function(d) {
        	console.log("SUCCESS in the pump off");
            alert("successs "+ JSON.stringify(d));
        }
    });
});


// handling the about page click
$(".about").on("click", function(event){
//	event.preventDefault();
	console.log("got the about click");
	$.get('/about');
})


// end doc ready
});