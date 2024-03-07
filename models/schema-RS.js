//version 2.0.2


create table recirculatorSettings(
	id integer auto_increment not null,
	pipeTempOn FLOAT,
	pipeTempOff FLOAT,
	weekDayOn1 varchar (8),
	weekDayOff1 varchar (8),
	weekDayOn2 varchar (8),
	weekDayOff2 varchar (8),
	weekEndOn1 varchar (8),
	weekEndOff1 varchar (8),
	weekEndOn2 varchar (8),
	weekEndOff2 varchar (8),
    createdAt DATE,
	updatedAt Date,
    primary key (id)
);




INSERT INTO recirculatorSettings (
		pipeTempOn,
		pipeTempOff,
		weekDayOn1,
		weekDayOff1,
		weekdayOn2,
		weekDayOff2,
		weekEndOn1,
		weekEndOff1,
		weekEndOn2,
		weekEndOff2
	)
    values (
    	100,
    	110,
    	'6:30',
    	'8:30',
    	'16:30',
    	'22:30',
    	'8:30',
    	'11:00',
    	'14:30',
    	'23:30'
    );



/*
module.exports = (sequelize, Datatypes) => {

	const recirculatorSettings = sequelize.define("recirculatorSettings", {
		pipeTempOn: sequelize.FLOAT,
		pipeTempOff: sequelize.FLOAT,
		weekDayOn1: sequelize.STRING,
		weekDayOff1: sequelize.STRING,
		weekDayOn2: sequelize.STRING,
		weekDayOff2: sequelize.STRING,
		weekEndOn1: sequelize.STRING,
		weekEndOff1: sequelize.STRING,
		weekEndOn2: sequelize.STRING,
		weekEndOff2: sequelize.STRING,
		createdAt: sequelize.DATE,
		updatedAt: sequelize.DATE
	});
	return recirculatorSettings;
*/


/*
	//import { DataTypes } from '@sequelize/core';
	const recirculatorSettings = sequelize.define("recirculatorSettings", {
		pipeTempOn: {
			type: Datatypes.FLOAT
		},
		pipeTempOff: {
			type: Datatypes.FLOAT
		},
		weekDayOn1: {
			type: Datatypes.STRING
		},
		weekDayOff1: {
			type: Datatypes.STRING
		},
		weekDayOn2: {
			type: Datatypes.STRING
		},
		weekDayOff2: {
			type: Datatypes.STRING
		},
		weekEndOn1: {
			type: Datatypes.STRING
		},
		weekEndOff1: {
			type: Datatypes.STRING
		},
		weekEndOn2: {
			type: Datatypes.STRING
		},
		weekEndOff2: {
			type: Datatypes.STRING
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
		}
	});

	return recirculatorSettings;
};

*/
