// client side script file for the home control application

$(document).ready(function() {


// get the current recirc times and write to screen

var variableH = 6;
var veriableM = 30;
var variable = "6:30";

// wait for clicks on the buttons

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
            alert("successs "+ JSON.stringify(d));
        }
    });
});

// manually turn the pump on
$(".messageTurnPumpOn").on("click", function(event){
	console.log("got the pump on message click");
    $.ajax({
    	url: "http://localhost:2000/sendMessage",
        type: "POST",
        data: {message: "turnPumpOn"},
        success: function(d) {
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