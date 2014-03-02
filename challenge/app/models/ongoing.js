// load the things we need
var mongoose = require('mongoose');

// define the schema for the ongoing challenges
var ongoingSchema = mongoose.Schema({

	_idChallenge 	: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge'  },
	_idChallenger   : { type : mongoose.Schema.Types.ObjectId, ref: 'User' },
	_idChallenged   : { type : mongoose.Schema.Types.ObjectId, ref: 'User' },
	launchDate     	: Date,
	deadLine 		: Date,
	progress        : {type: Number, default: 0},
	accepted        : {type: Boolean, default: false},
	waitingConfirm  : {type: Boolean, default: false},
	confirmAsk  	: Date,
	confirmLink1    : String,
	confirmLink2    : String,
	confirmComment  : String,
	validated		: {type: Boolean, default: false}

});
 
// create the model for users and expose it to our app
module.exports = mongoose.model('Ongoing', ongoingSchema);
