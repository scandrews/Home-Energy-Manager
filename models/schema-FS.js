module.exports = (sequelize, Datatypes) => {

	//import { DataTypes } from '@sequelize/core';

	const furnaceSettings = sequelize.define("furnaceSettings", {
		state: {
			type: Datatypes.TEXT,
			defaultValue: "Home"
		},
		weekDayMorningOnTime: {
			type: Datatypes.STRING,
			defaultValue: "6:00"
		},
		WeekDayMorningMinTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 65
		},
		WeekDayMorningMaxTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 68
		},
		weekDayMiddayOnTime: {
			type: Datatypes.STRING,
			defaultValue: "9:30"
		},
		WeekDayMiddayMinTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 60
		},
		WeekDayMiddayMaxTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 63
		},
		weekDayEveningOnTime: {
			type: Datatypes.STRING,
			defaultValue: "16:30"
		},
		WeekDayEveningMinTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 65
		},
		WeekDayEveningMaxTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 68
		},
		weekDayNightOnTime: {
			type: Datatypes.STRING,
			defaultValue: "23:30"
		},
		WeekDayNightMinTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 60
		},
		WeekDayNightMaxTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 63
		},

		weekEndMorningOnTime: {
			type: Datatypes.STRING,
			defaultValue: "7:00"
		},
		WeekEndMorningMinTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 65
		},
		WeekEndMorningMaxTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 68
		},
		weekEndMiddayOnTime: {
			type: Datatypes.STRING,
			defaultValue: "11:30"
		},
		WeekEndMiddayMinTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 62
		},
		WeekEndMiddayMaxTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 65
		},
		weekEndEveningOnTime: {
			type: Datatypes.STRING,
			defaultValue: "16:00"
		},
		WeekEndEveningMinTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 65
		},
		WeekEndEveningMaxTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 68
		},
		weekEndNightOnTime: {
			type: Datatypes.STRING,
			defaultValue: "23:30"
		},
		WeekEndNightMinTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 60
		},
		WeekEndNightMaxTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 63
		},

		awayMinTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 58
		},
		awayMaxTemp: {
			type: Datatypes.FLOAT,
			defaultValue: 61
		}
	});
	return furnaceSettings
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
*/