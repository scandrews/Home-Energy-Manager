module.exports = (sequelize, Datatypes) => {

	//import { DataTypes } from '@sequelize/core';

	const recirculatorHistory = sequelize.define("recirculatorHistory",{
		pipetemperatures: {
			type: Datatypes.FLOAT
		},
		recircOnOff: {
			type: Datatypes.INTEGER
		},
		recircHist: {
			type: Datatypes.DATE
		}
	});
	return recirculatorHistory;
};


/*
		},
		createdAt: {
			type: Datatypes.DATE,
			allowNull: false,
			defaultValue: Datatypes.NOW
		},
		updatedAt: {
			type: Datatypes.DATE,
			allowNull: false,
			defaultValue: Datatypes.NOW


insert into recirculatorSettings(pipeTempOn, pipeTempOff, weekDayOn1, weekDayOff1, weekdayOn2, weekDayOff2, weekEndOn1, weekEndOff1, weekEndOn2, weekEndOff2)
						values(     100,      110,		    "6:30",    "8:30",	    "16:30",    "22:30",		"8:30",		"11:00",	"14:30",	"23:30");

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



create table furnaceSettings(
	id integer(10)auto_increment not null,
	state VARCHAR (16),
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

	state,
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
	"Home",
	"06:00",
	65,
	68,
	"09:30",
	62,
	65,
	"16:30",
	65,
	68,
	"23:30",
	62,
	65,

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
	62,
	65,

	58,
	62
);

*/