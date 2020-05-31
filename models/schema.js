

module.exports = function(sequelize, Datatypes){
	var recirculator = sequelize.define("recirculator", {
		pipeTemp: {
			type: Datatypes.FLOAT,
			allowNull: false,
			validate: { len: [1] }
		},
		recircOnHist: {
			type: Datatypes.DATE,
			default: false			
		},
		recircOffHist: {
			type: Datatypes.DATE,
			default: false			
		},
		activeOn1:{
			type: Datatypes.STRING
		},
		activeOff1:{
			type: Datatypes.STRING
		},
		activeOn2:{
			type: Datatypes.STRING
		},
		activeOff2:{
			type: Datatypes.STRING
		}
	});
	return recirculator;

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

