

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
		tempFamilyRoom: {
			type: Datatypes.FLOAT,
			allowNull: false,
		},
		tempBedRoom: {
			type: Datatypes.FLOAT,
			allowNull: false,	
		}
	});
	return temperatures
};

