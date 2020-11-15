// client side script file for the home control application

$(document).ready(function() {


// get the current recirc times and write to screen

var variableH = 6;
var veriableM = 30;
var variable = "6:30";
// ------------------------------------------------

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

		for (i=0; i<temps.length; i++){
			var od = temps[i].recircHist;
			var pt = temps[i].pipetemperatures;

			var t = od.split(/[- : T .]/);
			// Apply each element to the Date function
			time = t[3] + ":" + t[4] + ":" + t[5];
			labels [i] = time;
			Math.round(pt); 
			pipeTempArray[i] = pt
		}


		// full ZingChart schema can be found here:
		// https://www.zingchart.com/docs/api/json-configuration/
		const myConfig = {
    	    type: 'line',
        	title: {
				text: 'Current Pipe Temperature',
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
			series: [{
				// plot 1 values, linear data
				values: pipeTempArray,
				// values: [23, 20, 27, 29, 25, 17, 15],
				text: 'Pipe Temperature',
				backgroundColor: '#4d80a6'
			}
			//,
//	          {
	            // plot 2 values, linear data
//	            values: [35, 42, 33, 49, 35, 47, 35],
//	            text: 'Week 2',
//	            backgroundColor: '#70cfeb'
//	          },
//	          {
	            // plot 2 values, linear data
//	            values: [15, 22, 13, 33, 44, 27, 31],
//	            text: 'Week 3',
//	            backgroundColor: '#8ee9de'
//	          }
			]
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

// handling the Chart other Temps click
$(".messageChartOtherTemps").on("click", function(event){
	event.preventDefault();
	const labels = [];
	const outDoorTempArray = [];
	const familyTempArray = [];
	const bedRmTempArray = [];
	const pipeTempArray = [];
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
			var ot = temps[i].tempOutDoors;
			var ft = temps[i].tempFamilyRoom;
			var bt = temps[i].tempBedRoom;
			var pt = temps[i].tempPipe;

			var t = od.split(/[- : T .]/);
			// Apply each element to the Date function
			time = t[3] + ":" + t[4] + ":" + t[5];
			labels [i] = time;
			Math.round(ot);
			Math.round(ft);
			Math.round(bt);
			Math.round(pt);
			outDoorTempArray[i] = ot;
			familyTempArray[i] = ft;
			bedRmTempArray[i] = bt;
			pipeTempArray[i] = pt
		}


		// full ZingChart schema can be found here:
		// https://www.zingchart.com/docs/api/json-configuration/
		const myConfig = {
    	    type: 'line',
        	title: {
				text: 'Current House Temperatures',
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
			series: [{
				// plot 1 values, linear data
				values: outDoorTempArray,
				// values: [23, 20, 27, 29, 25, 17, 15],
				text: 'Outdoor Temperature',
				backgroundColor: '#4d80a6'
			},
	          {
	            // plot 2 values, linear data
	            values: familyTempArray,
	            // values: [35, 42, 33, 49, 35, 47, 35],
	            text: 'Family Room Temperature',
	            backgroundColor: '#70cfeb'
	          },
	          {
	            // plot 3 values, linear data
	            values: bedRmTempArray,
	            //values: [15, 22, 13, 33, 44, 27, 31],
	            text: 'Bedroom Temperature',
	            backgroundColor: '#8ee9de'
	          },
	          {
	            // plot 4 values, linear data
	            values: pipeTempArray,
	            // values: [15, 22, 13, 33, 44, 27, 31],
	            text: 'Pipe Temps',
	            backgroundColor: '#8eefde'
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
		console.log("temp1 - ", temps [0].createdAt);
		console.log("temp2 - ", temps [0].tempFamilyRoom);
		$(".tempblock1").html("<td>" + temps[0].createdAt + "</td><td>" + temps[0].tempFamilyRoom + "</td><td>" + temps[0].tempBedRoom + "</td>");
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

// Handle the change red button
$(".messageRedChange").on("click", function(){
	console.log("got the send Red Change message click");
    $.ajax({
    	url: "http://localhost:2000/sendMessage",
        type: "POST",
        data: {message: "redChange"},
        success: function(d) {
        	console.log("SUCCESS in the change red");
            alert("successs "+ JSON.stringify(d));
        }
    });
});

// Handle the change green button
$(".messageGreenChange").on("click", function(event){
	console.log("got the send Green message click");
    $.ajax({
    	url: "http://localhost:2000/sendMessage",
        type: "POST",
        data: {message: "greenChange"},
        success: function(d) {
        	console.log("SUCCESS in the change green");
            alert("successs "+ JSON.stringify(d));
        }
    });
});

// manually turn the pump on
$(".messageTurnPumpOn").on("click", function(event){
	$(this).text('Turn Pump Off');
	console.log("got the pump on message click");
    $.ajax({
    	url: "http://localhost:2000/sendMessage",
        type: "POST",
        data: {message: "turnPumpOn"},
        success: function(d) {
        	console.log("SUCCESS in the pump on");
            alert("successs "+ JSON.stringify(d));
        }
    });
});

// manually turn the pump off
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