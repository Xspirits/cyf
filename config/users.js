
// load up the user model
var User  = require('../app/models/user'),
Challenge = require('../app/models/challenge'),
notifs    = require('../app/functions/notifications'),
relations = require('./relations'),
social    = require('./social'),
_         = require('underscore');

module.exports = {

	updateSettings : function( data , done ) {
		var query;
		if(data.target === 'facebook' || data.target === 'twitter'){

			if(data.target === 'facebook')
				query = { $set : {'share.facebook' : data.value} };
			else
				query = { $set : {'share.twitter' : data.value} };

			console.log(query);

			User.findByIdAndUpdate(data._id, query, function( err ) {
				if (err)
					throw err;

				done(true);
			});

		} else 
		done(false);
	},
	linkLol : function(data, done ){

		var region = data.region
		, name = data.summonerName;

		social.findSummonerLol(region, name, function( summoner ) {

			if( summoner.id ) {
				User
				.findById(data._id)
				.exec( function( err, user ) {

					if (err)
						throw err;

					var lol = user.leagueoflegend;

					lol.idProfile       = parseInt(summoner.id, 10);
					lol.name            = summoner.name;
					lol.profileIconId   = parseInt(summoner.profileIconId, 10);
					lol.revisionDate    = new Date(summoner.revisionDate*1000);
					lol.summonerLevel   = parseInt(summoner.summonerLevel, 10);

					user.save(function(err) {
						if (err) 
							throw err;

						console.log(user);
						return done(true);
						
					});
				});
			} else 
			return done(false, 'summoner not found');
		});
	},
	/**
	 * Unlink a league of legend account
	 * @param  {[type]}   user [description]
	 * @param  {Function} done [description]
	 * @return {[type]}        [description]
	 */
	 unlinkLol : function( id, done ) {

	 	User.findById(id).exec(function (err , user ) {
	 		if (err)
	 			throw err;

	 		var lol = user.leagueoflegend;

	 		lol.idProfile       = undefined;
	 		lol.name            = undefined;
	 		lol.profileIconId   = undefined;
	 		lol.revisionDate    = undefined;
	 		lol.summonerLevel   = undefined;

	 		user.save(function(err) {
	 			if (err) 
	 				throw err;

	 			console.log(user);
	 			return done(true);

	 		});
	 	})
	 },

	 setOffline : function( user , done ) {
	 	User.findByIdAndUpdate(user._id, {isOnline: false}, function( err ) {
	 		if (err)
	 			throw err;

	 		done(true);
	 	});
	 },
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
	 	.populate('friends.idUser')
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

	 	relations.deny(from, uTo, function (result) {
	 		
	 		if(result) 
	 			relations.deny(uTo, from, done);
	 	});

	 },

	 /**
	  * Delete the rate request and add an item in challengeRateHistoric
	  * @param  {[type]}   data [description]
	  * @param  {Function} done [description]
	  * @return {[type]}        [description]
	  */
	  ratedChallenge : function(data, done) { 
	  	var query = []
	  	currentDate = new Date(),
	  	idSplice = data.id; //Challenge ID

	  	User
	  	.findByIdAndUpdate(data.idUser,
	  		{ $push : 
	  			{ challengeRateHistoric : {
	  				_idChallenge: data.id,
	  				rateDate: currentDate,
	  				rating: data.rating,
	  			}} 
	  		}
	  		)
	  	.exec(function (err, doc) {

	  		if(err)
	  			throw err;


	  		var idx = doc.challengeRate ? doc.challengeRate.indexOf(idSplice) : -1;
            // is it valid?
            if (idx !== -1) {

                // remove it from the array.
                doc.challengeRate.splice(idx, 1);

                // save the doc
                doc.save(function(err, doc) {
                	if (err) {
                		throw err;
                	} else {

                		return done(doc);
                	}
                });
                // stop here, otherwise 404
                return;
            }
            return done(false, 'wrong whilst splicing. users l.280');


        });

	  },
	 /**
	  * Ask users to review the challenge they've just done.
	  * @param  {Object}   idChallenge [id : _idChallenge (Object),idChallenged (Object),idChallenger (Object)]
	  * @param  {Function} done        [description]
	  * @return {[type]}               [description]
	  */
	  askRate : function (data , done) {

	  	var query = [data._idChallenger,data._idChallenged];

	  	User
	  	.update(
	  		{ _id: { $in: query } },
	  		{ $addToSet: { challengeRate : data.id} },
	  		{ multi: true }
	  		)
	  	.exec(function (err, user) {

	  		if(err)
	  			throw err;
	  		
	  		console.log(user);
	  		return done(true);

	  	});
	  },

	  userToRateChallenges : function (idUser , done) {
	  	User		 	
	  	.findById(idUser)
	  	.populate('challengeRate')
	  	.exec(function(err, data) {

				// if there are any errors, return the error
				if (err)
					return done(err);

				return done(data);
			});
	  },

	  //
	  // LEADER BOARD
	  //
	  globalLeaderboard : function(type, done){
	  	User		 	
	  	.find()
	  	.sort('xp')
	  	.exec(function(err, challengers) {

	  		if (err)
	  			return done(err);

	  		return done(challengers);
	  	});
	  },
	  globalLeaderboard : function(done){
	  	User		 	
	  	.find({})
	  	.sort('globalScore')
	  	.exec(function(err, challengers) {

	  		if (err)
	  			return done(err);

	  		return done(challengers);
	  	});
	  },
	  monthlyLeaderboard : function(done){
	  	User		 	
	  	.find({})
	  	.sort('monthlyScore')
	  	.exec(function(err, challengers) {

	  		if (err)
	  			return done(err);

	  		return done(challengers);
	  	});
	  },
	  weeklyLeaderboard : function(done){
	  	User		 	
	  	.find({})
	  	.sort('weeklyScore')
	  	.exec(function(err, challengers) {

	  		if (err)
	  			return done(err);

	  		return done(challengers);
	  	});
	  },
	  getLeaderboards : function (type , done) {
	  	var buffer = {};
	  	switch(type)
	  	{
	  		case 'score':
	  		globalLeaderboard(function( global ) {
	  			monthlyLeaderboard(function( monthly ) {
	  				weeklyLeaderboard(function( weekly ) {
	  					
	  					buffer.global = global;
	  					buffer.monthly = monthly;
	  					buffer.weekly = weekly;

	  					return done(buffer);

	  				});
	  			});
	  		});
	  		default:
	  		User		 	
	  		.find({})
	  		.sort('-xp')
	  		.exec(function(err, challengers) {

	  			if (err)
	  				return done(err);

	  			return done(challengers);
	  		});
	  	}

	  },



	}