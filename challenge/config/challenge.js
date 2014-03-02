
// load up the user model
var moment = require('moment');
var User   = require('../app/models/user'),
Challenge  = require('../app/models/challenge'),
Ongoing    = require('../app/models/ongoing');

module.exports = {

    /**
     * Generate an unique ID for readability.
     * Max 1.6 Millions
     * @return {String} [String UID]
     */
     generateUID : function(collection, returned) {

     	var nUID = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);

     	if(collection === 'ongoings') {
     		
     		Ongoing
     		.where('idCool', nUID)
     		.count(function (err, count) {
     			if (err) return handleError(err);
     			if(count === 0) {
     				console.log(nUID);
     				returned(nUID);
     			}
     			else
     				this.generateUID('ongoings');
     		})
     	}
     	if(collection === 'challenges') {
     		
     		Challenge
     		.where('idCool', nUID)
     		.count(function (err, count) {
     			if (err) return handleError(err);
     			if(count === 0) {
     				console.log(nUID);
     				returned(nUID);
     			}
     			else
     				this.generateUID('challenges');
     		})
     	}
     	if(collection === 'users') {
     		
     		User
     		.where('idCool', nUID)
     		.count(function (err, count) {
     			if (err) return handleError(err);
     			if(count === 0) {
     				console.log(nUID);
     				returned(nUID);
     			}
     			else
     				this.generateUID('users');
     		})
     	}
     },
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
			var _this = this,
			title   = data['title'],
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

					// create the challenge
					
					_this.generateUID('challenges', function(uID) {

						var generateDate = new Date;

                	// Store the data for the upcoming callback
                	var returned = { title : title, description : description,durationH : durationH,durationD : durationD, game : game, creation : generateDate};

                	var newChallenge            = new Challenge();
                	newChallenge.idCool = uID;
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
	  	 	.findOne({idCool : id})
	  	 	.populate('author')
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
	  	 	.find({ author :  id })
	  	 	.populate('author')
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
	  	 * Return a challenge's details
	  	 * @param  {ObjectId}   id  [idCool of the challenge]
	  	 * @param  {Function} done [callback]
	  	 * @return {Object}        [List of challenges]
	  	 */
	  	 ongoingDetails : function (id, done) {

	  	 	Ongoing
	  	 	.findOne({idCool : id})
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

            this.generateUID('ongoings', function(uID) {

            	oCha._idChallenge  = data.idChallenge;
            	oCha._idChallenger = data.from;
            	oCha._idChallenged = data.idChallenged; 
            	oCha.idCool        = uID;

            	oCha.launchDate    = moment(data.launchDate).utc();
            	oCha.deadLine      = moment(data.launchDate).utc().add(query);

	            // console.log(oCha.deadLine);
	            // console.log(moment(oCha.deadLine).utc());
	            // console.log(moment(oCha.deadLine).isValid());
	            // console.log(oCha);

	            oCha.save(function(err, result) {
	            	if (err)
	            		throw err;
	            	return done(result);
	            });

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

                console.log(chall._idChallenged + ' <> ' + idUser);
                console.log((chall._idChallenged.toString() === idUser.toString()));


                if(chall._idChallenged.toString() === idUser.toString()) {

                	chall
                	.remove();
                	done(true);

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
	  	 /**
	  	  * [validateOngoing description]
	  	  * @param  {Object}   data [oId : req.params.id, deny : req.body.deny]
	  	  * @param  {Function} done [description]
	  	  * @return {[type]}        [description]
	  	  */
	  	  validateOngoing : function(data, done ) {

	  	  	Ongoing
	  	  	.findOne({idCool : data.oId})
	  	  	.exec(function(err, ongoing) {

                // if there are any errors, return the error
                if (err)
                	throw err;

                console.log(data);

                ongoing.waitingConfirm = false;
                ongoing.validated      = data.deny;
                ongoing.progress       = 100;

                ongoing.save(function(err, result) {
                	if (err)
                		throw err;
                	return done(result);
                });
            });

	  	  },



	  	};