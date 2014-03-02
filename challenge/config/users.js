
// load up the user model
var User  = require('../app/models/user'),
Challenge = require('../app/models/challenge'),
relations = require('./relations');

module.exports = {

	/**
	 * Return the list of existing users
	 * @param  {String} arg    [(optional) parameters]
	 * @param  {[type]} return [description]
	 * @return {[type]}        [description]
	 */
	 getUserList : function (done) {

	 	User
	 	.find({})
	 	.sort('-_id')
	 	.exec(function(err, data) {
	 		if(err)
	 			throw err;

			// console.log(data);

			return done(data);
		});

	 },

	/**
	 * Return the result of a given query for the user model
	 * @param  {String} arg    [(optional) parameters]
	 * @param  {[type]} return [description]
	 * @return {[type]}        [description]
	 */
	 getUser : function (id, done) {

	 	// console.log(arg);

	 	User
	 	.findOne({idCool : id})
	 	.exec(function(err, data) {
	 		if(err)
	 			throw err;

	 		return done(data);
	 	});
	 },

	 /**
	  * Request a friendship with another user
	  * @param  {Object}   data [From, id, to, id]
	  * @param  {Function} done [callback]
	  * @return {Boolean}        [true/false]
	  */
	  askFriend : function (data, done) {

	 	// check if the desired user exist, then launch the request

	 	var from = data.from,
	 	uTo      = data.to;

	 	console.log(data.from + ' (-- )'+data.to);

	 	//Check if the targeted user exist
	 	User
	 	.findById(uTo.id)
	 	.exec( function (err, data) {
	 		if(err)
	 			throw err;

	 		var currentDate = new Date;
	 		//existing user
	 		if(data) {
	 			relations.create(from, uTo, true, function (result) {

	 				if(result) 
	 					relations.create(uTo, from, false, done);
	 			});
	 		} else 
	 		return done(false, ' desired user not found');
	 	})

	 },	 
	 /**
	  * Confirm a friend relationship with another user
	  * @param  {Object}   data [From, id, to, id]
	  * @param  {Function} done [callback]
	  * @return {Boolean}        [true/false]
	  */
	  confirmFriend : function (data, done) {

	 	// check if the desired user exist, then launch the request

	 	var from = data.from,
	 	uTo      = data.to;

	 	console.log(data.from + ' (-- )'+data.to);

	 	relations.accept(from, uTo, function (result) {
	 		
	 		if(result) 
	 			relations.accept(uTo, from, done);
	 	});

	 },
	 /**
	  * Confirm a friend relationship with another user
	  * @param  {Object}   data [From, id, to, id]
	  * @param  {Function} done [callback]
	  * @return {Boolean}        [true/false]
	  */
	  denyFriend : function (data, done) {

	 	// check if the desired user exist, then launch the request

	 	var from = data.from,
	 	uTo      = data.to;

	 	console.log(data.from + ' (-- )'+data.to);

	 	relations.deny(from, uTo, function (result) {
	 		
	 		if(result) 
	 			relations.deny(uTo, from, done);
	 	});

	 },
	}