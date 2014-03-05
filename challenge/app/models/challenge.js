// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var challengeSchema = mongoose.Schema({
	idCool   		: String,
	title           : String,
	description     : String,
	game            : String,
	durationH       : Number,
	durationD       : Number,
	game            : {type : String, ref: 'Game' },
	creation     	: {type: Date, default: Date.now}, 
	author          : {type : mongoose.Schema.Types.ObjectId, ref: 'User' },
	value           : Number,
	icon            : {type: String, default: 'glyphicon glyphicon-certificate'},
	rateNumber      : Number,
	rateValue       : Number,
	completedBy		: [mongoose.Schema.Types.ObjectId]
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Challenge', challengeSchema);
