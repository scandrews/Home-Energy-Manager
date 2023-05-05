module.exports = (sequelize, Datatypes) => {

	//import { DataTypes } from '@sequelize/core';

	const temperatures = sequelize.define("temperatures",{
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
			type: Datatypes.TEXT,
			allowNull: false,	
		}
	});
	return temperatures;

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
