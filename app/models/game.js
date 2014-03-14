// load the things we need
// http://www.onrpg.com/games/?sort=rating&dir=desc
var mongoose = require('mongoose');

// define the schema for our user model
var gameSchema = mongoose.Schema({
	title			: String,
	type			: String,
	players			: {type: Number, default: 0},
	updated_at		: {type: Date, default: Date.now}, 
	created_at		: {type: Date, default: Date.now}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Game', gameSchema);
