
// load up the user model
var moment  = require('moment');
var User    = require('../app/models/user')
, Challenge = require('../app/models/challenge')
, Ongoing   = require('../app/models/ongoing')
, users     = require('./users')
, genUID    = require('shortid');
genUID.seed(664);

module.exports = {

	/**
	 * Create a new challenge
	 * @param  {array}   req  [form variables]
	 * @param  {Function} done [callback]
	 * @return {mixed}        [true or error]
	 */
	 create : function (req, done) {

	 	var data    = req.body
	 	user        = req.user;

	 	var _this   = this,
	 	title       = data['title'],
	 	durationH   = data['durationH'],
	 	durationD   = data['durationD'],
	 	description = data['description'],
	 	game        = data['game'];

	 	var uID = genUID.generate().substr(-6);

		// create the challenge

		var newChallenge         = new Challenge();
		newChallenge.idCool      = uID;
		newChallenge.title       = title;
		newChallenge.description = description;
		newChallenge.game        = game;
		newChallenge.durationH   = durationH;
		newChallenge.durationD   = durationD;
		newChallenge.author      = user._id;

		console.log(newChallenge);

		newChallenge.save( function(err) {
			if (err)
				throw err;

			return done(newChallenge);

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
		  * [rateChallenge description]
		  * @param  {Object}   data [id String idCool, user ObjectId, difficulty Number, quickness Number, fun Number ]
		  * @param  {Function} done [callback]
		  * @return {Boolean}       
		  */
		  rateChallenge : function (data, done) {

		  	Challenge
		  	.findOne({idCool : data.id})
		  	.exec(function(err, challenge) {

				// if there are any errors, return the error
				if (err)
					throw err;

				// Add this user on the users historical
				challenge.completedBy = data.idUser;

				var diff  = challenge.rating.difficulty,
				diffiRate = data.difficulty,
				quick     = challenge.rating.quickness,
				quickRate = data.quickness,
				fun       = challenge.rating.fun,
				funRate   = data.fun;

				var diffiFive = Math.round(diffiRate / 10),
				quickFive = Math.round(quickRate / 10),
				funFive = Math.round(funRate / 10);

				// Do Some Maths youhou.
				diffiFive  = (diffiFive < 1 ) ? 1 : diffiFive;
				quickFive = (quickFive < 1 ) ? 1 : quickFive;
				funFive   = (funFive < 1  ) ?1 : funFive;

				console.log(diffiFive +' o ' +quickFive+' o ' +funFive );

				// #DIFFICULTY
				
				var newDiffiCount = ((diff.count) ? diff.count : 0) + 1,
				newDiffiSum = ((diff.sum) ? diff.sum : 0) + diffiRate;

				if(diffiRate > ((diff.max) ? diff.max : 0))
					diff.max = diffiRate;
				
				if(diffiRate < ((diff.min) ? diff.min : 0))
					diff.min = diffiRate;
				
				diff.sum = newDiffiSum;
				diff.avg = newDiffiSum / newDiffiCount;
				diff.count = newDiffiCount;

				switch(diffiFive)
				{
					case 1:
					diff.distribution.one   = ((diff.distribution.one) ? diff.distribution.one : 0)  + 1;
					break;
					case 2:
					diff.distribution.two   = ((diff.distribution.two) ? diff.distribution.two : 0)  + 1;
					break;
					case 3:
					diff.distribution.three = ((diff.distribution.three) ? diff.distribution.three : 0) + 1;
					break;
					case 4:
					diff.distribution.four  = ((diff.distribution.four) ? diff.distribution.four : 0) + 1;
					break;
					case 5:
					diff.distribution.five  = ((diff.distribution.five) ? diff.distribution.five : 0)  + 1;
					break;
					default:
					console.log('error with switch for ' + diffiFive);
				}
				// #QUICKNESS
				
				var newQuickCount = ((quick.count) ? quick.count : 0) + 1,
				newQuickSum = ((quick.sum) ? quick.sum : 0) + quickRate;

				if(quickRate > ((quick.max) ? quick.max : 0))
					quick.max = quickRate;
				
				if(quickRate < ((quick.min) ? quick.min : 0))
					quick.min = quickRate;
				
				quick.sum = newQuickSum;
				quick.avg = newQuickSum / newQuickCount;
				quick.count = newQuickCount;

				switch(quickFive)
				{
					case 1:
					quick.distribution.one   = ((quick.distribution.one) ? quick.distribution.one : 0)  + 1;
					break;
					case 2:
					quick.distribution.two   = ((quick.distribution.two) ? quick.distribution.two : 0)  + 1;
					break;
					case 3:
					quick.distribution.three = ((quick.distribution.three) ? quick.distribution.three : 0) + 1;
					break;
					case 4:
					quick.distribution.four  = ((quick.distribution.four) ? quick.distribution.four : 0) + 1;
					break;
					case 5:
					quick.distribution.five  = ((quick.distribution.five) ? quick.distribution.five : 0)  + 1;
					break;
					default:
					console.log('error with switch for ' + quickFive);
				}				
				// #FUN
				
				var newFunCount = ((fun.count) ? fun.count : 0) + 1,
				newFunSum = ((fun.sum) ? fun.sum : 0) + funRate;

				if(funRate > ((fun.max) ? fun.max : 0))
					fun.max = funRate;
				
				if(funRate < ((fun.min) ? fun.min : 0))
					fun.min = funRate;
				
				fun.sum = newFunSum;
				fun.avg = newFunSum / newFunCount;
				fun.count = newFunCount;

				switch(funFive)
				{
					case 1:
					fun.distribution.one   = ((fun.distribution.one) ? fun.distribution.one : 0)  + 1;
					break;
					case 2:
					fun.distribution.two   = ((fun.distribution.two) ? fun.distribution.two : 0)  + 1;
					break;
					case 3:
					fun.distribution.three = ((fun.distribution.three) ? fun.distribution.three : 0) + 1;
					break;
					case 4:
					fun.distribution.four  = ((fun.distribution.four) ? fun.distribution.four : 0) + 1;
					break;
					case 5:
					fun.distribution.five  = ((fun.distribution.five) ? fun.distribution.five : 0)  + 1;
					break;
					default:
					console.log('error with switch for ' + funRate);
				}


				challenge.save(function(err, result) {
					if (err)
						throw err;

					var obj = {
						id 		: result._id,
						idUser 	: data.idUser,
						rating 	: {
							difficulty 	: data.difficulty,
							quickness 	: data.quickness,
							fun 		: data.fun
						}
					}
					var theChallenge = result,
					theNote = Math.round((data.difficulty + data.quickness + data.fun ) / 3);


					users.ratedChallenge(obj, function( result ) {

						var toNotify = {
							challenge: theChallenge,
							note : theNote,
							user : result
						}
						console.log(toNotify);
						return done(toNotify);
					})
				});
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

		 	if (data.deadLine.d > 0 ) {
		 		query = {hours:data.deadLine.h,days:data.deadLine.d};
		 	} else {
		 		query = {hours:data.deadLine.h};
		 	}

		 	var oCha           = new Ongoing();

		 	oCha._idChallenge  = data.idChallenge;
		 	oCha._idChallenger = data.from;
		 	oCha._idChallenged = data.idChallenged; 
		 	oCha.idCool        = genUID.generate().substr(-6);

		 	oCha.launchDate    = moment(data.launchDate).utc();
		 	oCha.deadLine      = moment(data.launchDate).utc().add(query);

		 	oCha.save(function(err) {
		 		if (err)
		 			throw err;

		 		return done(oCha);
		 	});

		 },

		/**
		 * accept an ongoing challenge's request, setting "accepted" to true
		 * @param  {Object}   data [id challenge and id of user]
		 * @param  {Function} done [callback]
		 * @return {Boolean}       [true or false]
		 */
		 accept : function( data, done ) {


		 	var idChallenge = data.id,
		 	idUser = data.idUser;

			/**
			 * Select the challenge and remove it from our model
			 */
			 Ongoing
			 .findOne({ _id :  idChallenge })
			 .populate('_idChallenge _idChallenged _idChallenger')
			 .exec( function(err, chall) {

			 	var passing = chall;
				// if there are any errors, return the error
				if (err)
					throw err;

				var testiD = chall._idChallenged._id.toString()
				, uString = idUser.toString();

				console.log(testiD + ' ' +uString);

				if(testiD == uString) {

					chall.accepted = true;

					chall.save(function(err) {
						if (err)
							throw err;

						return done(passing);
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
		 	.populate('_idChallenge _idChallenged _idChallenger')
		 	.exec(function(err, ongoing) {

				// if there are any errors, return the error
				if (err)
					throw err;

				ongoing.waitingConfirm	= true;
				ongoing.confirmAsk		= new Date;
				ongoing.confirmLink1	= data.proofLink1;
				ongoing.confirmLink2	= (data.proofLink2) ? data.proofLink2 : '';
				ongoing.confirmComment	= (data.confirmComment) ? data.confirmComment : '';

				ongoing.save(function(err) {
					if (err)
						throw err;

					return done(ongoing);
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
		  	.populate('_idChallenged _idChallenger _idChallenge')
		  	.exec(function(err, ongoing) {

				// if there are any errors, return the error
				if (err)
					throw err;

				ongoing.waitingConfirm = false;
				ongoing.validated      = data.pass;
				ongoing.progress       = 100;

				ongoing.save(function(err) {

					if (err)
						throw err;

					return done(ongoing);
				});
			});

		  },

// =============================================================================
// TRIBUNAL CASES     ==========================================================
// =============================================================================

	/**
	 * [userWaitingCases description]
	 * @param  {[type]}   user [description]
	 * @param  {Function} done [description]
	 * @return {[type]}        [description]
	 */
	 userWaitingCases : function(user,done) {

	 	var loadCases = user.tribunal;

	 	// console.log(loadCases);

	 	Ongoing
	 	.find({ _id: { $in: loadCases }})
	 	.populate('_idChallenge _idChallenger _idChallenged')
	 	.exec( function(err, cases) {

	 		// console.log(cases);
	 		done(cases);
	 	});

	 },

	/**
	 * Send an Ongoing event (actually closed) to the tribunal
	 * @param  {Object}   data [oId]
	 * @param  {Function} done [description]
	 * @return {[type]}        [description]
	 **/
	 sendTribunal : function(data,done) {

	 	Ongoing
	 	.findById(data.id)
	 	.exec(function(err, ongoing) {

			// if there are any errors, return the error
			if (err)
				throw err;

			//Does this ongoing already has an opened case? 
			//if yes, we do nothing.
			if(ongoing.tribunal === false) {

			//Is the person who ask the same as the challenged ?
			if( data.idUser.toString() === ongoing._idChallenged.toString()) {


				var exclude = {
					one : ongoing._idChallenger,
					two : ongoing._idChallenged
				};

				// console.log('Going to exclude and pick');
				// console.log(exclude);

				users.pickTribunalUsers(exclude, 3, function(pickedUser) {

					console.log(pickedUser);

					users.setJudges(ongoing._id, pickedUser, function( completed ) {

						if(completed) {
							var judges = [];

							for (var i = pickedUser.length - 1; i >= 0; i--) {
								aJudge = {
									idUser   : pickedUser[i]._id,
									hasVoted : false,
									answer   : false
								};
								judges.push(aJudge);
							};

							ongoing.tribunal = true;
							ongoing.tribunalVote = judges;

							// console.log(ongoing);
							ongoing.save(function(err, result) {
								if (err)
									throw err;


								return done(true);
							});		
						} else
						throw 'something went wrong here';
					});
				});
			} else 
			done(false, "Case already taken in account");
		} else 
		done(false, "not the challenged");
	});
},

	/**
	 * Register a vote on a tribunal case given by an user
	 * @param  {Object}   data [id (String; idCool of an Ongoing), idUser(ObjectId), answer(Boolean)]
	 * @param  {Function} done [callback]
	 * @return {Boolean}       
	 */
	 voteCase : function (data, done) {

	 	Ongoing
	 	.findOneAndUpdate(
	 		{idCool : data.id, 'tribunalVote.idUser' : data.idUser},
	 		{'$set':  {
	 			'tribunalVote.$.answer': data.answer ,
	 			'tribunalVote.$.hasVoted': true,
	 			'tribunalVote.$.voteDate': new Date
	 		}}
	 		)
	 	.exec( function( err, cases ) {

	 		if (err)
	 			throw err;

	 		var userData = {
	 			id : cases._id,
	 			idUser :data.idUser,
	 			answer : data.answer
	 		};

	 		console.log('Challenge.js l.673 - '+userData);
	 		users.votedOnCase(userData, function( ret ){

	 			//return the case
	 			return done(cases);

	 		});
	 	});
	 },

	 completeCase : function (idCase, done) {

	 	Ongoing
	 	.findOne({idCool : idCase})
	 	.populate('_idChallenged _idChallenger _idChallenge')
	 	.exec( function( err, cases ) {

	 		if (err)
	 			throw err;

	 		var deny = 0,
	 		validate = 0,
	 		judges = cases.tribunalVote;

	 		for (var i = judges.length - 1; i >= 0; i--) {

	 			//This shouldn't be needed but well, better be certain.
	 			if(judges[i].hasVoted === true) {

	 				if(judges[i].answer === true)  
	 					validate++;
	 				else 
	 					deny++;
	 			}
	 		}
	 		// The total of judge is never pair, so this can't be even.
	 		console.log('case: ' + cases.idCool+' === ['+validate+']+1 ['+deny+']-1 Result: '+ (validate > deny)? 'validated' : 'denied');

	 		cases.tribunalAnswered = (validate > deny) ? true : false;
	 		cases.caseClosed       = true;
	 		cases.caseClosedDate   = new Date;

	 		cases.save(function(err) {
	 			if (err)
	 				throw err;

	 			return done(cases);
	 		});
	 	});
	 },

	 remainingCaseVotes : function (idCase, done) {

	 	Ongoing
	 	.findOne({idCool : idCase})
	 	.exec( function( err, req ) {

	 		if (err)
	 			throw err;

	 		var counter = 0,
	 		judges = req.tribunalVote;

	 		for (var i = judges.length - 1; i >= 0; i--) {
	 			if(judges[i].hasVoted === false)
	 				counter++;
	 		}

	 		done(counter);
	 	});
	 },


	};