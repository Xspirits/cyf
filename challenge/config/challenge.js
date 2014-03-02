
// load up the user model
var moment     = require('moment');
var User       = require('../app/models/user'),
Challenge      = require('../app/models/challenge'),
Ongoing        = require('../app/models/ongoing');

module.exports = {

	/**
	 * Create a new challenge
	 * @param  {array}   req  [form variables]
	 * @param  {Function} done [callback]
	 * @return {mixed}        [true or error]
	 */
	 create : function (req, done) {
			// body...
			var data = req.body
			user     = req.user;
			
			/*title           : String,
			description     : String,
			game            : String,
			creation        : Date,
			author          : Number,
			value           : Number,
			icon            : String,
			rateNumber      : Number,
			rateValue       : Number*/
			var title   = data['title'],
			durationH   = data['durationH'],
			durationD   = data['durationD'],
			description = data['description'],
			game        = 'League of Legend';/*data['game'];*/

			Challenge
			.findOne({ 'title' :  title })
			.exec(function(err, challenge) {

                // if there are any errors, return the error
                if (err)
                	throw err;

                // check to see if theres already a user with that email
                if (challenge) {
                	return done(null, false, req.flash('createMessage', 'That challenge already exists.'));
                } else {

                	var generateDate = new Date;

                	// Store the data for the upcoming callback
                	var returned = { title : title, description : description,durationH : durationH,durationD : durationD, game : game, creation : generateDate};

					// create the challenge
					var newChallenge            = new Challenge();
					
					newChallenge.title       = title;
					newChallenge.description = description;
					newChallenge.game        = game;
					newChallenge.creation    = generateDate;
					newChallenge.durationH   = durationH;
					newChallenge.durationD   = durationD;
					newChallenge.author      = user._id;
					newChallenge.value       = 0;
					newChallenge.icon        = 'glyphicon glyphicon-bookmark';
					newChallenge.rateNumber  = 0;
					newChallenge.rateValue   = 0;
					
					newChallenge.save(function(err) {

						if (err)
							throw err;

						return done(returned);
					});
				}
			});
},

		/**
		* Edit an existing challenge.
		* @param  {array}   data [data which have to be updated]
		* @param  {Function} done [callback]
		* @return {mixed}        [true or error]
		*/
		edit : function (data, done) {},
		
		/**
		* Favorite a challenge.
		* Most favorited challenge are highlighted
		* @param  {array}   data [Challenge and user id]
		* @param  {Function} done [description]
		* @return {mixed}        [true or error]
		*/
		favorite : function (data, done) {},
		
		/**
		* User evaluation of an existing challenge
		* Requiered: User already did this event
		* @param  {array}   data [parameters and rate]
		* @param  {Function} done [callback]
		* @return {mixed}        [true or error]
		*/
		rate : function (data, done) {},
		
		/**
		* Delete a challenge
		* @param  {Array}   data   [Id and user session]
		* @param  {Function} done [description]
		* @return {[type]}        [description]
		*/
		delete : function (data, done) {

			var currentUser = data.user.local.email;

	  	/**
	  	 * Select the challenge and remove it from our model
	  	 */
	  	 Challenge
	  	 .find({ '_id' :  data.id })
	  	 .limit(1)
	  	 .exec(function(err, doc) {

                // if there are any errors, return the error
                if (err)
                	return done(err);

                var chall = doc[0];

                console.log(chall);
                console.log(chall.author + ' <> ' + currentUser);

                if(chall.author === currentUser) 
                	return chall.remove(done);

                else 
                	return done(false, 'you are not the owner of this challenge')
                

            });

	  	},

	  	/**
	  	 * Return all the details for a given challenge
	  	 * @param  {String}   id   [id of the challenge]
	  	 * @param  {Function} done [callback]
	  	 * @return {Object}        [Object containing all the challenge data]
	  	 */
	  	 getList : function (done) {

	  	 	Challenge
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
	  	 * Return all the details for a given challenge
	  	 * @param  {String}   id   [id of the challenge]
	  	 * @param  {Function} done [callback]
	  	 * @return {Object}        [Object containing all the challenge data]
	  	 */
	  	 getChallenge : function (id, done) {

	  	 	Challenge
	  	 	.findOne({ '_id' :  id })
	  	 	.exec(function(err, data) {

                // if there are any errors, return the error
                if (err)
                	throw err;

                // else we return the data
                return done(data);
            });

	  	 },


	  	/**
	  	 * Return all the challenges created byt a given user
	  	 * @param  {String}   email  [email of the creator]
	  	 * @param  {Function} done [callback]
	  	 * @return {Object}        [List of challenges]
	  	 */
	  	 getUserChallenges : function (id, done) {

	  	 	Challenge
	  	 	.find({ 'author' :  id })
	  	 	.sort('-creation')
	  	 	.exec(function(err, data) {

                // if there are any errors, return the error
                if (err)
                	return done(err);
                // else we return the data
                return done(data);
            });

	  	 },


// =============================================================================
// ONGOING CHALLENGES ==========================================================
// =============================================================================



	  	/**
	  	 * Return the challenges accepted by a given user
	  	 * @param  {ObjectId}   id  [_id of the creator]
	  	 * @param  {Function} done [callback]
	  	 * @return {Object}        [List of challenges]
	  	 */
	  	 ongoingDetails : function (id, done) {

	  	 	Ongoing
	  	 	.findById(id)
	  	 	.populate('_idChallenge _idChallenger _idChallenged')
	  	 	.exec( function( err, data ) {

				// if there are any errors, return the error
				if (err)
					throw err;
				// else we return the data
				return done(data);
			})

	  	 },
	  	/**
	  	 * Return the challenges accepted by a given user
	  	 * @param  {ObjectId}   id  [_id of the creator]
	  	 * @param  {Function} done [callback]
	  	 * @return {Object}        [List of challenges]
	  	 */
	  	 userAcceptedChallenge : function (id, done) {

	  	 	Ongoing
	  	 	.find({ accepted: true, $or: [ { _idChallenger: id }, { _idChallenged: id } ] })
	  	 	.populate('_idChallenge _idChallenger _idChallenged')
	  	 	.exec( function( err, data ) {

				// if there are any errors, return the error
				if (err)
					throw err;
				// else we return the data
				return done(data);
			})

	  	 },
	  	/**
	  	 * Return all the challenges (request and received) for a given user
	  	 * @param  {ObjectId}   id  [_id of the creator]
	  	 * @param  {Function} done [callback]
	  	 * @return {Object}        [List of challenges]
	  	 */
	  	 challengerRequests : function (id, done) {

	  	 	Ongoing
	  	 	.find({_idChallenger : id})
	  	 	.populate('_idChallenge _idChallenger _idChallenged')
	  	 	.exec( function( err, data ) {

				// if there are any errors, return the error
				if (err)
					throw err;
				// else we return the data
				console.log(data);
				return done(data);
			})

	  	 },
	  	/**
	  	 * Return all the challenges (request and received) for a given user
	  	 * @param  {ObjectId}   id  [_id of the creator]
	  	 * @param  {Function} done [callback]
	  	 * @return {Object}        [List of challenges]
	  	 */
	  	 challengedRequests : function (id, done) {

	  	 	Ongoing
	  	 	.find({_idChallenged : id})
	  	 	.populate('_idChallenge _idChallenger _idChallenged')
	  	 	.exec( function( err, data ) {

				// if there are any errors, return the error
				if (err)
					throw err;
				// else we return the data
				console.log(data);
				return done(data);
			})

	  	 },

		/**
		 * Challenge another user !
		 * @param  {Object}   data [All the required data to throw a challenge]
		 * @param  {Function} done [description]
		 * @return {[type]}        [description]
		 */
		 launch : function (data, done) {


            // Store the data for the upcoming callback
            var returned = { 
            	idChallenge : data.idChallenge,            	
            	challenger : data.from,
            	challenged : data.idChallenged,
            	deadLine : data.deadLine
            };

            if (data.deadLine.d > 0 ) {
            	query = {hours:data.deadLine.h,days:data.deadLine.d};
            } else {
            	query = {hours:data.deadLine.h};
            }

            // console.log(data.launchDate);
            // console.log(moment(data.launchDate).utc());
            // console.log(moment(data.launchDate).isValid());
            // console.log('=====')
            var oCha           = new Ongoing();

            oCha._idChallenge  = data.idChallenge;
            oCha._idChallenger = data.from;
            oCha._idChallenged = data.idChallenged;

            oCha.launchDate    = moment(data.launchDate).utc();
            oCha.deadLine      = moment(data.launchDate).utc().add(query);

            // console.log(oCha.deadLine);
            // console.log(moment(oCha.deadLine).utc());
            // console.log(moment(oCha.deadLine).isValid());

            oCha.save(function(err, result) {
            	if (err)
            		throw err;
            	return done(result);
            });
        },

	  	/**
	  	 * accept an ongoing challenge's request, setting "accepted" to true
	  	 * @param  {Object}   data [id challenge and id of user]
	  	 * @param  {Function} done [callback]
	  	 * @return {Boolean}       [true or false]
	  	 */
	  	 accept : function(data, done ) {


	  	 	var idChallenge = data.id,
	  	 	idUser = data.idUser;

	  	/**
	  	 * Select the challenge and remove it from our model
	  	 */
	  	 Ongoing
	  	 .findOne({ _id :  idChallenge })
	  	 .exec(function(err, chall) {

                // if there are any errors, return the error
                if (err)
                	throw err;

                if(chall._idChallenged = idUser) {
                	chall.accepted = true;

                	chall.save(function(err, result) {
                		if (err)
                			throw err;
                		return done(result);
                	});
                } else 
                return done(false, 'you are not the person challenged on this challenge')
            });

	  	},

	  	/**
	  	 * Deny an ongoing challenge's request by deleting it.
	  	 * @param  {Object}   data [id challenge and id of user]
	  	 * @param  {Function} done [callback]
	  	 * @return {Boolean}       [true or false]
	  	 */
	  	 deny : function(data, done ) {


	  	 	var idChallenge = data.id,
	  	 	idUser = data.idUser;

	  	 	Ongoing
	  	 	.findOne({ _id :  idChallenge })
	  	 	.exec(function(err, chall) {

                // if there are any errors, return the error
                if (err)
                	throw err;

                console.log(chall);
                console.log(chall._idChallenged + ' <> ' + idUser);


                if(chall._idChallenged = idUser) {

                	chall
                	.remove()
                	.exec(done(true));
                } else 
                return done(false, 'you are not the person challenged on this challenge')
            });

	  	 },


	  	 requestValidation : function(data, done ) {

	  	 	Ongoing
	  	 	.findOne({ _id :  data.idChallenge, _idChallenged : data.idUser  })
	  	 	.exec(function(err, ongoing) {

                // if there are any errors, return the error
                if (err)
                	throw err;

                console.log(ongoing);

                ongoing.waitingConfirm	= true;
                ongoing.confirmAsk		= new Date;
                ongoing.confirmLink1	= data.proofLink1;
                ongoing.confirmLink2	= (data.proofLink2) ? data.proofLink2 : '';
                ongoing.confirmComment	= (data.confirmComment) ? data.confirmComment : '';

                ongoing.save(function(err, result) {
                	if (err)
                		throw err;
                	return done(result);
                });
            });

	  	 },

	  	};