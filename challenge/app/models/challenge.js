// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var challengeSchema = mongoose.Schema({
	title           : String,
	description     : String,
	game            : String,
	durationH       : Number,
	durationD       : Number,
	game            : String,
	creation     	: {type: Date, default: Date.now}, 
	author          : {type : mongoose.Schema.Types.ObjectId, ref: 'User' },
	value           : Number,
	icon            : String,
	rateNumber      : Number,
	rateValue       : Number,
	completedBy		: [mongoose.Schema.Types.ObjectId]
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Challenge', challengeSchema);
