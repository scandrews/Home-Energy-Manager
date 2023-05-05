module.exports = (sequelize, Datatypes) => {

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
		}
	});
	return recirculatorSettings;
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
