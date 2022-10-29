

module.exports = function(sequelize, Datatypes){
	var recirculatorSettings = sequelize.define("recirculatorSettings", {
		pipeTempOn: {
			type: Datatypes.FLOAT,
			allowNull: false
		},
		pipeTempOff: {
			type: Datatypes.FLOAT,
			allowNull: false
		},
		weekDayOn1: {
			type: Datatypes.TIME
		},
		weekDayOff1: {
			type: Datatypes.TIME
		},
		weekDayOn2: {
			type: Datatypes.TIME
		},
		weekDayOff2: {
			type: Datatypes.TIME
		},
		weekEndOn1: {
			type: Datatypes.TIME
		},
		weekEndOff1: {
			type: Datatypes.TIME
		},
		weekEndOn2: {
			type: Datatypes.TIME
		},
		weekEndOff2: {
			type: Datatypes.TIME
		}
	});
	return recirculatorSettings;

	var temperatures = sequelize.define("temperatures",{
		tempOutDoorsSun: {
			type: Datatypes.FLOAT,
			allowNull: false,
		},
		tempOutDoorsShade: {
			type: Datatypes.FLOAT,
			allowNull: false,
		},
		tempFamilyRoom: {
			type: Datatypes.FLOAT,
			allowNull: false,
		},
		tempBedRoom: {
			type: Datatypes.FLOAT,
			allowNull: false,	
		},
		tempDesk: {
			type: Datatypes.FLOAT,
			allowNull: false,	
		},
		tempPipe: {
			type: Datatypes.FLOAT,
			allowNull: false,	
		},
		tempWaterTank: {
			type: Datatypes.FLOAT,
			allowNull: false,	
		},
		tempWoodStove: {
			type: Datatypes.FLOAT,
			allowNull: false,	
		},
		tempFurnace: {
			type: Datatypes.FLOAT,
			allowNull: false,	
		},
		furnaceOnOff: {
			type: Datatypes.varchar(16),
			allowNull: false,	
		},
		createdAt: {
			type: Datatypes.TIMESTAMP,
			allowNull: false,	
		}
	});
	return temperatures;

	var recirculatorHistory = sequelize.define("recirculatorHistory",{
		pipetemperatures: {
			type: Datatypes.FLOAT
		},
		recircOnOff: {
			type: Datatypes.int (2)
		},
		recircHist: {
			type: Datatypes.TIMESTAMP
		}
	});
	return recirculatorHistory;
	
};

/*
use home_control_db;

drop table recirculatorHistory;

drop table temperatures;

drop table recirculatorSettings;

create table temperatures(
	id integer(10)auto_increment not null,
	tempOutDoorsSun FLOAT,
    tempOutDoorsShade FLOAT,
	tempBedRoom FLOAT,
	tempFamilyRoom FLOAT,
    tempDesk FLOAT,
	tempWaterTank FLOAT,
	tempPipe FLOAT,
	tempFurnace FLOAT,
    tempWoodStove FLOAT,
    furnaceOnOff varchar(16),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    primary key (id)
    );


create table recirculatorSettings(
	id integer(10)auto_increment not null,
	pipeTempOn FLOAT,
	pipeTempOff FLOAT,
	weekDayOn1 time,
	weekDayOff1 time,
	weekDayOn2 time,
	weekDayOff2 time,
	weekEndOn1 time,
	weekEndOff1 time,
	weekEndOn2 time,
	weekEndOff2 time,
    primary key (id)
);

create table recirculatorHistory(
	id integer(10)auto_increment not null,
	pipetemperatures FLOAT,
	recircOnOff VARCHAR (16),
	recircHist TIMESTAMP,
    primary key (id)
);

insert into recirculatorSettings(pipeTempOn, pipeTempOff, weekDayOn1, weekDayOff1, weekdayOn2, weekDayOff2, weekEndOn1, weekEndOff1, weekEndOn2, weekEndOff2)
						values(     100,      110,		    "6:30",    "8:30",	    "16:30",    "22:30",		"8:30",		"11:00",	"14:30",	"23:30");


create table furnaceSettings(
	id integer(10)auto_increment not null,
	weekDayMorningOn time,
	WeekDayMorningMinTemp FLOAT,
	WeekDayMorningMaxTemp FLOAT,
	weekDayMiddayOn time,
	WeekDayMiddayMinTemp FLOAT,
	WeekDayMiddayMaxTemp FLOAT,
	weekdayEveningOn time,
	WeekDayEveningMinTemp FLOAT,
	WeekDayEveningMaxTemp FLOAT,
	weekDayNightOn time,
	WeekDayNightMinTemp FLOAT,
	WeekDayNightMaxTemp FLOAT,

	weekEndMorningOn time,
	WeekEndMorningMinTemp FLOAT,
	WeekEndMorningMaxTemp FLOAT,
	weekEndMiddayOn time,
	WeekEndMiddayMinTemp FLOAT,
	WeekEndMiddayMaxTemp FLOAT,
	weekEndEveningOn time,
	WeekEndEveningMinTemp FLOAT,
	WeekEndEveningMaxTemp FLOAT,
	weekEndNightOn time,
	WeekEndNightMinTemp FLOAT,
	WeekEndNightMaxTemp FLOAT,

	awayMinTemp FLOAT,
	awayMaxTemp FLOAT,
	primary key (id)
);

drop table furnaceSettings;

insert into furnaceSettings(

	weekDayMorningOnTime,
	WeekDayMorningMinTemp,
	WeekDayMorningMaxTemp,
	weekDayMiddayOnTime,
	WeekDayMiddayMinTemp,
	WeekDayMiddayMaxTemp,
	weekdayEveningOnTime,
	WeekDayEveningMinTemp,
	WeekDayEveningMaxTemp,
	weekDayNightOnTime,
	WeekDayNightMinTemp,
	WeekDayNightMaxTemp,

	weekEndMorningOnTime,
	WeekEndMorningMinTemp,
	WeekEndMorningMaxTemp,
	weekEndMiddayOnTime,
	WeekEndMiddayMinTemp,
	WeekEndMiddayMaxTemp,
	weekEndEveningOnTime,
	WeekEndEveningMinTemp,
	WeekEndEveningMaxTemp,
	weekEndNightOnTime,
	WeekEndNightMinTemp,
	WeekEndNightMaxTemp,

	awayMinTemp,
	awayMaxTemp,
	)

	values(
	"06:00",
	65,
	68,
	"09:30",
	64,
	67,
	"16:30",
	65,
	68,
	"23:30",
	64,
	66,

	"07:00",
	66,
	69,
	"11:30",
	65,
	68,
	"16:00",
	66,
	69,
	"23:30",
	64,
	66,

	58,
	62
);

*/