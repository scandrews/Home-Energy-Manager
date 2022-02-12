

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

drop table recirculatorhistory;

drop table temperatures;

drop table recirculatorsettings;

create table temperatures(
	id integer(10)auto_increment not null,
	tempOutDoorsSun FLOAT,
    tempOutDoorsShade FLOAT,
	tempFamilyRoom FLOAT,
	tempBedRoom FLOAT,
    tempDesk FLOAT,
	tempPipe FLOAT,
    tempWoodStove FLOAT,
	tempFurnace FLOAT,
    furnaceOnOff varchar(16),
    createdAt TIMESTAMP NOT NULL,
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
*/
