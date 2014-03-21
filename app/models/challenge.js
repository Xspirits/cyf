// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var challengeSchema = mongoose.Schema({
	idCool   		: String,
	title           : String,
	description     : String,
	game            : String,
	featured        : {type : Boolean, default: false},
	durationH       : Number,
	durationD       : Number,
	game            : {type : String, ref: 'Game' },
	creation     	: {type : Date, default: Date.now}, 
	author          : {type : mongoose.Schema.Types.ObjectId, ref: 'User' },
	value           : {type : Number, default: 0 },
	icon            : {type : String, default: 'glyphicon glyphicon-certificate'},
	rateNumber      : {type : Number, default: 0 },
	rateValue       : {type : Number, default: 0 },
	completedBy		: [{ type : mongoose.Schema.Types.ObjectId, index: true, ref: 'User' }, {_id:false}],	
	rating	: {
		difficulty 	: {			
			count: {type : Number, default: 0 },
			max: {type : Number, default: 0 },
			min: {type : Number, default: 0 },
			sum: {type : Number, default: 0 },
			avg: {type : Number, default: 0 },
			distribution: {
				one: {type : Number, default: 0 },
				two: {type : Number, default: 0 },
				three: {type : Number, default: 0 },
				four: {type : Number, default: 0 },
				five: {type : Number, default: 0 }
			}
		},
		quickness  	: {			
			count: {type : Number, default: 0 },
			max: {type : Number, default: 0 },
			min: {type : Number, default: 0 },
			sum: {type : Number, default: 0 },
			avg: {type : Number, default: 0 },
			distribution: {
				one: {type : Number, default: 0 },
				two: {type : Number, default: 0 },
				three: {type : Number, default: 0 },
				four: {type : Number, default: 0 },
				five: {type : Number, default: 0 }
			}
		},
		fun  		: {			
			count: {type : Number, default: 0 },
			max: {type : Number, default: 0 },
			min: {type : Number, default: 0 },
			sum: {type : Number, default: 0 },
			avg: {type : Number, default: 0 },
			distribution: {
				one: {type : Number, default: 0 },
				two: {type : Number, default: 0 },
				three: {type : Number, default: 0 },
				four: {type : Number, default: 0 },
				five: {type : Number, default: 0 }
			}
		},
	},
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Challenge', challengeSchema);
