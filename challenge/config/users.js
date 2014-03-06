
// load up the user model
var User  = require('../app/models/user'),
Challenge = require('../app/models/challenge'),
relations = require('./relations');

module.exports = {

	/**
	 * Return NUMBER users whom will be used as judge in the tribunal
	 * for a given ongoing case.
	 * @param  {Object}   exclude [_id of users to exclude: the challenger and challenged]
	 * @param  {Number}   number  [number of judges we want]
	 * @param  {Function} done    [callback]
	 * @return {Array}           [Array of users' object]
	 */
	 pickTribunalUsers : function(exclude, number, done) {
	 	var num = ((number) ? number : 1)
	 	nearNum = [Math.random(), 0];

	 	User
	 	.find( {
	 		$and: [ { _id: { $ne: exclude.one } }, { _id: { $ne: exclude.two } } ],
	 		userRand : { $near : nearNum } 
	 	} )
	 	.limit( num )
	 	.exec(function (err, randomUser) {

	 		if(err)
	 			throw err;

	 		return done(randomUser);

	 	});

	 },

	 setJudges : function(id, users, done) {
	 	var query = [];

	 	for (var i = users.length - 1; i >= 0; i--) {
	 		query.push(users[i]._id);
	 	};

	 	console.log(query);

	 	User
	 	.update(
	 		{ _id: { $in: query } },
	 		{ $addToSet: { tribunal : id} },
	 		{ multi: true }
	 		)
	 	.exec(function (err, randomUser) {

	 		if(err)
	 			throw err;

	 		return done(true);

	 	});

	 },
	 /**
	  * Delete the ongoing Case and add an item in the tribunalHistoric
	  * @param  {[type]}   data [description]
	  * @param  {Function} done [description]
	  * @return {[type]}        [description]
	  */
	  votedOnCase : function(data, done) {
	  	var query = []
	  	currentDate = new Date(),
	  	idSplice = data.id;

	  	User
	  	.findByIdAndUpdate(data.idUser,
	  		{ $push : 
	  			{ tribunalHistoric : {
	  				idCase: data.id,
	  				answer: data.answer,
	  				voteDate: currentDate
	  			}} 
	  		}
	  		)
	  	.exec(function (err, doc) {

	  		if(err)
	  			throw err;

	  		console.log(doc);

	  		var idx = doc.tribunal ? doc.tribunal.indexOf(idSplice) : -1;
            // is it valid?
            if (idx !== -1) {

                // remove it from the array.
                doc.tribunal.splice(idx, 1);

                // save the doc
                doc.save(function(err, doc) {
                	if (err) {
                		throw err;
                	} else {

                		return done(true);
                	}
                });
                // stop here, otherwise 404
                return;
            }
            throw 'wrong whilst splicing';


        });

	  },
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