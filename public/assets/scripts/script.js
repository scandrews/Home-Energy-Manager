// client side script file for the home control application

$(document).ready(function() {

var currentLocation = window.location.href;
console.log("curent URL - " + currentLocation);

//$('.pipeTempsChartcontainer').addClass("style=display:none;");
//$('.otherTempsChartcontainer').addClass("style=display:none;");

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

furnaceSettings = {}; // global to keep seeting
// ------------------------------------------------


// Handle the show current temps button
$(".messageShowCurrentTemps").on("click", function(){
	console.log("got the show current temperature message click");

	var localPumpStatus = '0ff';
	var furnaceStatus = 'Off';
	function writeTemperatures(localTempArray){
		console.log(localTempArray);
		if(localTempArray[2] == 1){
			localPumpStatus = 'on'
		} else if (localTempArray[2] == 0){
			localPumpStatus = 'off'
		}
		if(localTempArray[3] == 1){
			localFurnStatus = 'on'
       		$(".messageStartFurnace").text("Stop Furnace");
		} else if (localTempArray[3] == 0){
       		$(".messageStartFurnace").text("Start Furnace");
			localFurnStatus = 'off'
		}

		$(".curTempBlock1").html("<td>" + localTempArray[5][6] +  //outdoor sun
							"</td><td>" + localTempArray[5][7] +  //outdoor shade
							"</td><td>" + localTempArray[5][2] +  //Bedroom
							"</td><td>" + localTempArray[5][1] +  //Family room
							"</td><td>" + localTempArray[5][5] +  //Desk
							"</td><td>" + localTempArray[5][8] +  //water tank
							"</td><td>" + localTempArray[5][3] +  //Pipe
							"</td><td>" + localTempArray[5][0] +  //Wood stove temp
							"</td><td>" + localTempArray[5][4] +  //Furnace
							"</td>");
		$(".timeToSaveStatus").html("<td>" + localTempArray[6][2] + "</td>");
		$(".pumpStatus").html("<td>" + localPumpStatus + "</td>");
		$(".furnaceStatus").html("<td>" + localFurnStatus + "</td>");
		$(".arduinoMaxHouseTemp").html("<td>" + localTempArray[4] + "</td>");
		$(".mode").html("<td>" + localTempArray[7].stateHomeAway + "</td>");
		$(".runForWaterTime").html("<td>" + localTempArray[8] + "</td>");
		$(".CurrentTimeOfDay").html("<td>" + localTempArray[7].stateTimeOfDay + "</td>");
	};

	$.get('currentTemps', (temps) => {
		//console.log(temps);
		writeTemperatures(temps);
	});
});




// handling the Chart Pipe Temps click
$(".messageChartPipeTemps").on("click", function(event){
	event.preventDefault();
	const labels = [];
	const pipeTempArray = [];     // pipe temp array will hopd the temps for display
	var time = [];
	console.log("got the Chart Pipe Temps click");

	document.getElementById("div1").removeAttribute("display:none");
	document.getElementById("div1").setAttribute("style", "display:block");


	// to convert mysql timestamp
	// https://stackoverflow.com/questions/3075577/convert-mysql-datetime-stamp-into-javascripts-date-format

	// get the pipe temperature data
	$.get('pipeTemp', (temps) => {
		console.log("data back from pipe temps - ");
		console.log(temps);          // the temps array is te temperatures returned from the server

		// label array is the x axis lable for each data point
		var labelArray = [];
		for (i=0; i<temps.length; i++){
			var od = temps[i].recircHist;
			var pt = temps[i].pipetemperatures;  // put the temp in the variable

			var t = od.split(/[- : T .]/);
			console.log(t);
			if (t[3] < 5){
				x = t[3] - 5;
				t[3] = x + 24;
			} else t[3] = t[3] - 5;

			// Apply each element to the Date function
			time = t[3] + ":" + t[4];
			console.log(time);
			labels [i] = time;    // assine the time to the array at the data point
			Math.round(pt);        // round the temp
			pipeTempArray[i] = pt   // then put it into the pipe temp array
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
					speed: 15,
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
	const outDoorSunTempArray = [];
	const outDoorShadeTempArray = [];
	const bedRmTempArray = [];
	const familyTempArray = [];
	const deskTempArray = [];
	const waterTankTempArray = [];
	const pipeTempArray = [];
	const woodStoveTempArray = [];
	const furnaceTempArray = [];
	var time = [];
	console.log("got the Chart Other Temps click");

	document.getElementById("div2").removeAttribute("display:none");
	document.getElementById("div2").setAttribute("style", "display:block");

//	var $this = $(".otherTempsChartcontainer");
//	if ($this.hasClass("hidden")) {
//		console.log("in the has class hidden");
//		$this.removeClass("hidden").addClass("visible");
//	};



	// to convert mysql timestamp
	// https://stackoverflow.com/questions/3075577/convert-mysql-datetime-stamp-into-javascripts-date-format

	// get the other temperature data
	$.get('curTempHistory', (temps) => {
		console.log("data back from other temperatures - ");
		console.log(temps);
		var labelArray = [];


		for (i=0; i<temps.length; i++){
			var od = temps[i].createdAt;
			var osunt = temps[i].tempOutDoorsSun;
			var oshadet = temps[i].tempOutDoorsShade;
			var brt = temps[i].tempBedRoom;
			var frt = temps[i].tempFamilyRoom;
			var dt = temps[i].tempDesk;
			var wt = temps[i].tempWaterTank;
			var pt = temps[i].tempPipe;
			var ft = temps[i].tempFurnace;
			var wst = temps[i].tempWoodStove;
			//var furnStat = temps[i].furnaceOnOff;

			var t = od.split(/[- : T .]/);
			//console.log(t);
			if (t[3] < 5){
				x = t[3] - 5;
				t[3] = x + 24;
			} else t[3] = t[3] - 5;
			// Apply each element to the Date function
			time = t[3] + ":" + t[4];
			// + ":" + t[5];  this adds seconds
			//console.log(time);
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
			pipeTempArray[i] = pt;
			deskTempArray[i] = dt;
			waterTankTempArray[i] = wt;
			woodStoveTempArray[i] = wst;
			furnaceTempArray[i] = ft;

			if (temps[i].furnaceOnOff != "noChange"){
				var onOffText = "";
				switch (temps[i].furnaceOnOff){
					case "turnedFurnaceOn":
						onOffText = "Furnace On";
						break;
					case "turnedFurnaceOff":
						onOffText = "Furnace Off";
						break;
					case "manualOn":
						onOffText = "Manual On";
						break;
					case "manualOff":
						onOffText = "Manual Off";
						break;
					case "FurnOnForWater":
						onOffText = "OnForWater";
						break;
					case "FurnOffForWater":
						onOffText = "OffForWater";
						break;
					default:
						console.log("Error - Hit the default in the furnace change");
						break;
				};

			// build the screen lables here
				labelArray.push( {
							      "text": onOffText,
							      "background-color": "#4d80a6",
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
							      "hook": "node: plot=6; index=" + i
							      //"hook": "node:plot=2;index=4"
								})
			};
/*			if (temps[i].furnaceOnOff == "turnedFurnaceOff"){
				labelArray.push ({
							      "text": "Furnace Off",
							      "background-color": "#4d80a6",
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
							      "hook": "node: plot=6; index=" + i
								})
			}*/
		};



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
					// larger number is slower
					speed: 55,
				}
			},

			"labels": labelArray,

//			plot-label{
//				multiple: true
//			},

			series: [{
				// plot 0 values, linear data
				values: outDoorShadeTempArray,
				text: 'Outside Shade Temperature',
				backgroundColor: '#8eefde'
				},
				{
	            // plot 1 values, linear data
	            values: outDoorSunTempArray,
	            text: 'Outside Sun Temperature',
	            backgroundColor: '#70cfeb'
	          },
	          {
	            // plot 2 values, linear data
	            values: familyTempArray,
	            text: 'Family Room Temperature',
	            backgroundColor: '#8ee9de'
	          },
	          {
	            // plot 3 values, linear data
	            values: bedRmTempArray,
	            text: 'Bedroom Temperature',
	            backgroundColor: '#4d80a6'
	          },
				{
	            // plot 4 values, linear data
	            values: pipeTempArray,
	            text: 'Pipe Temperature',
	            backgroundColor: '#4d80a6'
	          },
				{
	            // plot 5 values, linear data
	            values: deskTempArray,
	            text: 'Desk Temps',
	            backgroundColor: '#4d80a6'
	          },
				{
	            // plot 6 values, linear data
	            values: furnaceTempArray,
	            text: 'Furnace Temperature',
	            backgroundColor: '#4d80a6',
//	            guideLabel: labelArray
				},
				{
	            // plot 7 values, linear data
	            values: woodStoveTempArray,
	            text: 'Wood Stove Temperature',
	            backgroundColor: '#4d80a6'
	          },
				{
	            // plot 8 values, linear data
	            values: waterTankTempArray,
	            text: 'Water Tank Temperature',
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

// NOT USED
// handling the show temperature click
/*
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
*/



// manually start the furnace
$(".messageStartFurnace").on("click", function(event){
	console.log("got the furnace click");
    $.ajax({
    	url: currentLocation + "sendMessage",
        type: "POST",
        data: {message: "changeFurnace"},
        success: function(returnState) {
        	console.log("Back from the server - " + returnState);
        	//console.log(returnState);
        	//console.log(returnState.stateFurnace);
        	if (returnState == "on"){
        		$(".messageStartFurnace").text("Stop Furnace");
        		//$(".furnaceStatus").text("on");
			} else if (returnState == "off"){
				$(".messageStartFurnace").text("Start Furnace");
        		//$(".furnaceStatus").text("off");
			}
        	console.log("SUCCESS in the change start/stop Furnace state");
        }
    });

})


/*******************************************************************/

// manually turn the pump on   or run recirc
$(".messageTurnPumpOn").on("click", function(event){
	event.preventDefault();

	//$(this).text('Turn Pump Off');
	console.log("got the pump on message click");
    $.ajax({
    	url: currentLocation + "sendMessage",
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
/*
$(".messageTurnPumpOff").on("click", function(event){
	console.log("got the pump off message click");
    $.ajax({
    	url: currentLocation + "sendMessage",
        type: "POST",
        data: {message: "turnPumpOff"},
        success: function(d) {
        	console.log("SUCCESS in the pump off");
            alert("successs "+ JSON.stringify(d));
        }
    });
});
*/


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
	var serverURL =	currentLocation + "upDateRecircSettings";
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

// ---------------------------------

// get the Furnace settings from the database
$(".getFurnaceSettings").on("click", function(event){
	event.preventDefault();
	console.log("got the get furnace settings click");
	$.get('furnaceSettings', (stuff) => {
		console.log("here's the stuff I got back");
		console.log(stuff);
		var DIW = Object.assign(furnaceSettings, stuff); 
		$("#furnaceState").attr("placeholder", stuff.state);
		$("#weekDayMorningOnTime").attr("placeholder", stuff.weekDayMorningOnTime);
		$("#weekDayMorningMinTemperture").attr("placeholder", stuff.WeekDayMorningMinTemp);
		$("#weekDayMorningMaxTemperture").attr("placeholder", stuff.WeekDayMorningMaxTemp);
		$("#weekDayMidDayOnTime").attr("placeholder", stuff.weekDayMiddayOnTime);
		$("#weekDayMidDayMinTemperture").attr("placeholder", stuff.WeekDayMiddayMinTemp);
		$("#weekDayMidDayMaxTemperture").attr("placeholder", stuff.WeekDayMiddayMaxTemp);
		$("#weekDayEveningOnTime").attr("placeholder", stuff.weekDayEveningOnTime);
		$("#weekDayEveningMinTemperture").attr("placeholder", stuff.WeekDayEveningMinTemp);
		$("#weekDayEveningMaxTemperture").attr("placeholder", stuff.WeekDayEveningMaxTemp);
		$("#weekDayNightOnTime").attr("placeholder", stuff.weekDayNightOnTime);
		$("#weekDayNightMinTemperture").attr("placeholder", stuff.WeekDayNightMinTemp);
		$("#weekDayNightMaxTemperture").attr("placeholder", stuff.WeekDayNightMaxTemp);

		$("#weekEndMorningOnTime").attr("placeholder", stuff.weekEndMorningOnTime);
		$("#weekEndMorningMinTemperture").attr("placeholder", stuff.WeekEndMorningMinTemp);
		$("#weekEndMorningMaxTemperture").attr("placeholder", stuff.WeekEndMorningMaxTemp);
		$("#weekEndMidDayOnTime").attr("placeholder", stuff.weekEndMiddayOnTime);
		$("#weekEndMidDayMinTemperture").attr("placeholder", stuff.WeekEndMiddayMinTemp);
		$("#weekEndMidDayMaxTemperture").attr("placeholder", stuff.WeekEndMiddayMaxTemp);
		$("#weekEndEveningOnTime").attr("placeholder", stuff.weekEndEveningOnTime);
		$("#weekEndEveningMinTemperture").attr("placeholder", stuff.WeekEndEveningMinTemp);
		$("#weekEndEveningMaxTemperture").attr("placeholder", stuff.WeekEndEveningMaxTemp);
		$("#weekEndNightOnTime").attr("placeholder", stuff.weekEndNightOnTime);
		$("#weekEndNightMinTemperture").attr("placeholder", stuff.WeekEndNightMinTemp);
		$("#weekEndNightMaxTemperture").attr("placeholder", stuff.WeekEndNightMaxTemp);
		
		$("#awayMinTemperture").attr("placeholder", stuff.awayMinTemp);
		$("#awayMaxTemperture").attr("placeholder", stuff.awayMaxTemp);
		
		$("#whichSensor").attr("placeholder", stuff.currentSensor);
		$("#currentMode").attr("placeholder", stuff.runMode);
    });
});

// Update the furnace settings
$(".upDateFurnaceSettings").on("click", function(event){
	event.preventDefault();
	console.log("got the update Furnace Settings click");
	var newSettings = {
		furnaceState: $("#furnaceState").val().trim(),
		weekDayMorningOnTime: $("#weekDayMorningOnTime").val().trim(),
		weekDayMorningMinTemp: $("#weekDayMorningMinTemperture").val().trim(),
		weekDayMorningMaxTemp: $("#weekDayMorningMaxTemperture").val().trim(),
		weekDayMidDayOnTime: $("#weekDayMidDayOnTime").val().trim(),
		weekDayMidDayMinTemp: $("#weekDayMidDayMinTemperture").val().trim(),
		weekDayMidDayMaxTemp: $("#weekDayMidDayMaxTemperture").val().trim(),
		weekDayEveningOnTime: $("#weekDayEveningOnTime").val().trim(),
		weekDayEveningMinTemp: $("#weekDayEveningMinTemperture").val().trim(),
		weekDayEveningMaxTemp: $("#weekDayEveningMaxTemperture").val().trim(),
		weekDayNightOnTime: $("#weekDayNightOnTime").val().trim(),
		weekDayNightMinTemp: $("#weekDayNightMinTemperture").val().trim(),
		weekDayNightMaxTemp: $("#weekDayNightMaxTemperture").val().trim(),
		weekEndMorningOnTime: $("#weekEndMorningOnTime").val().trim(),
		weekEndMorningMinTemp: $("#weekEndMorningMinTemperture").val().trim(),
		weekEndMorningMaxTemp: $("#weekEndMorningMaxTemperture").val().trim(),
		weekEndMidDayOnTime: $("#weekEndMidDayOnTime").val().trim(),
		weekEndMidDayMinTemp: $("#weekEndMidDayMinTemperture").val().trim(),
		weekEndMidDayMaxTemp: $("#weekEndMidDayMaxTemperture").val().trim(),
		weekEndEveningOnTime: $("#weekEndEveningOnTime").val().trim(),
		weekEndEveningMinTemp: $("#weekEndEveningMinTemperture").val().trim(),
		weekEndEveningMaxTemp: $("#weekEndEveningMaxTemperture").val().trim(),
		weekEndNightOnTime: $("#weekEndNightOnTime").val().trim(),
		weekEndNightMinTemp: $("#weekEndNightMinTemperture").val().trim(),
		weekEndNightMaxTemp: $("#weekEndNightMaxTemperture").val().trim(),
		awayMinTemp: $("#awayMinTemperture").val().trim(),
		awayMaxTemp: $("#awayMaxTemperture").val().trim(),
	};

	for (var key in newSettings){
		if (newSettings[key] == ''){
			console.log("nothing at - " + key)
		}else {
			console.log("At - " + key + " got - " + newSettings[key]);
			furnaceSettings[key] = newSettings[key];
		}
	}

	console.log(newSettings);
	console.log("new furnace settings -");
	console.log(furnaceSettings);

//	var serverURL = "'http://" + serverIPAddress + ":2000/upDateRecircSettings'";
	var serverURL =	currentLocation + "upDateFurnaceSettings";
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

// Save the furnace settings
$(".saveFurnaceSettings").on("click", function(event){
	event.preventDefault();
	console.log("got the save Furnace Settings click");

//	var serverURL = "'http://" + serverIPAddress + ":2000/upDateRecircSettings'";
	var serverURL =	currentLocation + "saveFurnaceSettings";
	$.ajax({
		url: serverURL,
		type: "POST",
		data: furnaceSettings,
		success: function(d) {
			console.log("the post worked");
			console.log(d);
		}
	})
});


// ----------------------------------

// Handle the GET other settings button
$(".getGeneralSettings").on("click", function(event){
	event.preventDefault();
	console.log("got the get general settings click");

	var serverURL =	currentLocation + "generalSettings";
	$.ajax({
		url: serverURL,
		type: "get",
		success: function(stuff) {
			console.log("the post worked");

//	$.get('generalSettings', (stuff) => {
			console.log(stuff);
			//serverIPAddress = stuff.serverIPAddress;
			$("#tempSaveInterval").attr("placeholder", stuff.tempSaveInterval);
			$("#dataPointsInGraph").attr("placeholder", stuff.numDataPointsToGraph);
			$("#minHouseTemp").attr("placeholder", stuff.minHouseTemp);
			$("#maxHouseTemp").attr("placeholder", stuff.maxHouseTemp);
			$("#minFurnaceTemp").attr("placeholder", stuff.minFurnaceTemp);
			$("#maxFurnaceTemp").attr("placeholder", stuff.maxFurnaceTemp);
			$("#serverIPAddress").attr("placeholder", stuff.serverIPAddress);
			$("#ArduinoIPAddress").attr("placeholder", stuff.arduinoIPAddress);
			$("#runMode").attr("placeholder", stuff.runMode);
			$("#keepDataDays").attr("placeholder", stuff.keepDataDays);
			$("#whichSensor").text(stuff.currentSensor);
		}
	});
});


// Update the General settings
$(".upDateGeneralSettings").on("click", function(event){
	event.preventDefault();
	console.log("got the update general click");
	var newGenSettings = {
		tempSaveInterval: $("#tempSaveInterval").val().trim(),
		dataPointsToGraph: $("#dataPointsInGraph").val().trim(),
		setMinHouseTemp: $("#minHouseTemp").val().trim(),
		setMaxHouseTemp: $("#maxHouseTemp").val().trim(),
		minFurnaceTemp: $("#minFurnaceTemp").val().trim(),
		maxFurnaceTemp: $("#maxFurnaceTemp").val().trim(),
		whichSensor: $("#whichSensor").val().trim(),
		serverIPAddress: $("#serverIPAddress").val().trim(),
		arduinoIPAddress: $("#ArduinoIPAddress").val().trim(),
		keepDataDays: $("#keepDataDays").val().trim(),
	};
	console.log(newGenSettings);
	$(".generalSettingsForm")[0].reset();
//	var serverURL = "'http://" + serverIPAddress + ":2000/upDateGeneralSettings'";

	$.ajax({
		url: currentLocation + "upDateGeneralSettings",
		type: "POST",
		data: newGenSettings,
		success: function(d) {
			console.log("the post worked");
		}
	})
});

// these next 4 change which sensor turns the furnace off
$(".changeFurnTurnOffBedroom").on("click", function(event){
	$("#whichSensor").text("Bedroom");
	$.ajax({
		url: currentLocation + "changeFurnaceOnOff",
		type: "POST",
		data: {message: "bedroom"},
		success: function(d) {
			console.log("got back");
		}
	})	
});

$(".changeFurnTurnOffFamilyroom").on("click", function(event){
	$("#whichSensor").text("Familyroom");
	$.ajax({
		url: currentLocation + "changeFurnaceOnOff",
		type: "POST",
		data: {message: "familyroom"},
		success: function(d) {
			console.log("got back");
		}
	})	
});

$(".changeFurnTurnOffDesk").on("click", function(event){
	$("#whichSensor").text("Desk");
	$.ajax({
		url: currentLocation + "changeFurnaceOnOff",
		type: "POST",
		data: {message: "desk"},
		success: function(d) {
			console.log("got back from set - " + d);
		}
	})	
});

$(".changeFurnTurnOffNone").on("click", function(event){
	$("#whichSensor").text("None");
	$.ajax({
		url: currentLocation + "changeFurnaceOnOff",
		type: "POST",
		data: {message: "none"},
		success: function(d) {
			console.log("got back from set - " + d);
		}
	})	
});

// Handle the show current URL click
$(".messageShowURL").on("click", function(){
	console.log("got the show URL message click");

	var currentLocation = window.location.href;
	console.log("curent URL - " + currentLocation);
	$("showURL").text(currentLocation);

});


// Handle the change home/away button
// Don;t thing this is used
/*$(".changeHomeAway").on("click", function(event){
	console.log("got the send change home/away click");
    $.ajax({
    	url: currentLocation + "sendMessage",
        type: "POST",
        data: {message: "changeHome-Away"},
        success: function(returnState) {
        	console.log("Back from the server - " + returnState.stateHomeAway);
       		$(".statusHomeAway").text(returnState.stateHomeAway);
        }
    });
});
*/

// Handle the state dropdown click
$('#stateList li a').on('click', function(){
    var newState = ($(this).text());
    console.log("got the dropdown click value - " + newState);
    $.ajax({
    	url: currentLocation + "changeFurnState",
        type: "POST",
        data: {message: newState},
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


// handling the about page click
$(".about").on("click", function(event){
//	event.preventDefault();
	console.log("got the about click");
	$.get('/about');
})


// end doc ready
});