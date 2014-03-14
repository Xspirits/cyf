module.exports = function(app, _, passport, genUID, xp, notifs, moment, challenge, users, relations, games) {

	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		if (req.isAuthenticated())
			res.render('index_logged.ejs', {
				currentUser : req.user
			});
		else
			res.render('index.ejs', {
				currentUser : false
			});
	});

	// LOGOUT ==============================
	app.get('/logout', isLoggedIn, function(req, res) {

		notifs.logout(req.user);

		users.setOffline(req.user, function( result ) {
			if(result){
				req.logout();
				res.redirect('/');

			}
		});

	});

	// PROFILE SECTION =========================
	app.get('/profile', isLoggedIn, function(req, res) {

		// req.io.emit('message', { text: req.user.local.pseudo});
		res.render('profile.ejs', {
			currentUser : req.user
		});
	});

	// CHALLENGES SECTION =========================
	app.get('/request', isLoggedIn, function(req, res) {

		//get Ongoing challenges for the current user

		// @todo : merge this shit
		challenge.challengerRequests(req.user._id, function ( dataChallenger ) { 

			challenge.challengedRequests(req.user._id, function ( dataChallenged ) { 

				var obj = {
					sent: dataChallenger,
					request: dataChallenged
				};

				res.render('request.ejs', {
					currentUser : (req.isAuthenticated()) ? req.user : false,
					challenges : obj
				});
			})
		})
	});
// =============================================================================
// TRIBUNAL   ==================================================================
// =============================================================================

	// USER TRIBUNAL'S CASES SECTION =========================
	app.get('/tribunal', isLoggedIn, function(req, res) {		

		challenge.userWaitingCases(req.user , function (data) {

			// console.log(data);

			res.render('tribunal.ejs', {
				currentUser : req.user,
				cases: data
			});

		});
	});

	// CASE DETAIL SECTION =========================
	// @TODO
	app.get('/t/:id', isLoggedIn, function(req, res) {

		var id = req.params.id;

	});	

// =============================================================================
// ONGOINGS   ==================================================================
// =============================================================================

	// ONGOING DETAILS SECTION =========================
	app.get('/o/:id', function(req, res) {

		var id = req.params.id;

		challenge.ongoingDetails(id , function (data) {

			// console.log(data);

			res.render('ongoingDetails.ejs', {
				currentUser : (req.isAuthenticated()) ? req.user : false,
				user : req.user,
				ongoing: data
			});

		});
	});	

	// USER'S ONGOINGS SECTION =========================
	app.get('/ongoing', isLoggedIn, function(req, res) {

		//get Ongoing challenges for the current user
		challenge.userAcceptedChallenge(req.user._id, function ( data ) { 

			var cStart, eStart,
			upcomingChall = [],
			ongoingChall = [],
			endedChall = [],
			reqValidation = [];

			for(var i = 0; i < data.length || function(){

				res.render('ongoing.ejs', {
					currentUser    : req.user,
					toValidate 	   : reqValidation,
					upChallenges   : upcomingChall,
					onChallenges   : ongoingChall,
					endChallenges  : endedChall
				});
				return false;}();i++){

				cStart = data[i].launchDate;
				cEnd = data[i].deadLine;

				// Challenge is awaiting validation
				// To determine if its belong to the current user or not will be done client-side.
				if(data[i].waitingConfirm === true && data[i].progress < 100) {

					reqValidation.push(data[i]);
					console.log('parsed reqValidation : ' + data[i].waitingConfirm);
				}
				// Start hasn't been reached
				else if(!moment(cStart).isBefore() && !moment(cEnd).isBefore()  && data[i].progress < 100) {

					upcomingChall.push(data[i]);
					console.log('parsed upcoming : ' + data[i]._id);
				}
				// Start has been reached but not end
				else if (moment(cStart).isBefore() && !moment(cEnd).isBefore()  && data[i].progress < 100) {

					ongoingChall.push(data[i]);
					console.log('parsed ongoing : ' + data[i]._id);
				}
				// end has been reached
				else {
					endedChall.push(data[i]);
					console.log('parsed ended : ' + data[i]._id);

				}
			}
		});
});

// =============================================================================
// CHALLENGES ==================================================================
// =============================================================================

	// CHALLENGE DETAILS SECTION =========================
	app.get('/c/:id', function(req, res) {

		var cId = req.params.id;

		challenge.getChallenge(cId , function (data) {

			// console.log(data);

			res.render('challengeDetails.ejs', {
				currentUser : (req.isAuthenticated()) ? req.user : false,
				challenge: data
			});

		});
	});	

	// CREATE CHALLENGE SECTION =========================
	app.get('/newChallenge', isLoggedIn, function(req, res) {

		res.render('newChallenge.ejs', {
			currentUser    : req.user,
			challenge: false
		});
	});

	app.post('/newChallenge', isLoggedIn, function(req, res) {

		challenge.create(req, function(done){	

			console.log(done);

			notifs.createdChallenge(req.user, done.idCool);

			xp.xpReward(req.user, 'challenge.create');

			res.render('newChallenge.ejs', {
				currentUser    : req.user,
				challenge: done 
			});
		})
	});

	app.post('/validateChallenge', isLoggedIn, function(req, res) {

		var data = {
			oId : req.body.id,
			pass : req.body.pass
		};

		if(typeof data.pass == 'boolean' || data.pass instanceof Boolean) {
			//Update the ongoing
			challenge.validateOngoing(data, function(done){	

				// Ongoing has been updated;
				// if the answer was "pass", mean it wasn't accepted, don't let people rate the challenge (yet).
				if(data.pass === true) {

					var obj = {
						id : done._idChallenge._id,
						_idChallenged : done._idChallenged._id,
						_idChallenger : done._idChallenger._id
					}

					xp.xpReward(done._idChallenger, 'ongoing.validate');
					xp.xpReward(done._idChallenged, 'ongoing.succeed');
					notifs.successChall(done);

					//Ask the challenger and challenged to rate the challenge.
					users.askRate(obj, function( done ) {
						res.send(done);
					});
				} else 
				res.send(true);
			});
		} else 
		res.send(false, 'not a boolean');		
	});

	// USER CHALLENGE TO BE RATED (ask opinion) ==================
	app.get('/rateChallenges', isLoggedIn, function(req, res) {

		users.userToRateChallenges(req.user._id, function( data ) {
			console.log(data);

			res.render('rateChallenge.ejs', {
				currentUser : req.user,
				challenge: data 
			});
		});
	});

	// PROFILE SECTION - USER Challenges =========================
	app.get('/myChallenges', isLoggedIn, function(req, res) {

		challenge.getUserChallenges(req.user._id, function( data ) {			
			res.render('myChallenges.ejs', {
				currentUser    : req.user,
				challenges : data
			});

		})
	});

	// DELETE CHALLENGE SECTION =========================
	app.get('/removeChallenge/:id', isLoggedIn, function(req, res) {

		var data = {id : req.params.id, user : req.user};

		challenge.delete(data, function (returned) {
			res.redirect('/myChallenges');
		});
	});

	// LAUNCH A CHALLENGE REQUEST =======================

	app.get('/launchChallenge',isLoggedIn, function(req, res) {

		//Get the challenge list
		challenge.getList(function( challenges ) {

			//Get the users' friend list, because we need one which is up to date
			users.getUser(req.user.idCool, function( newUser ) {

				if(newUser.friends.length > 0) {
					var friends = newUser.friends;
				} else {
					var friends = {};
				}
				res.render('launchChallenge.ejs', {
					currentUser    : req.user,
					user: req.user,
					userList: friends,
					challenges: challenges
				});
			})
		})
	});

	app.post('/launchChallenge', isLoggedIn, function(req, res){
		var data = {
			from : req.user._id,
			idChallenged : req.body.idChallenged,
			idChallenge : req.body.idChallenge,
			deadLine : req.body.deadLine,
			launchDate : req.body.launchDate
		};
		
		notifs.launchChall(data.from,data.idChallenged);
		challenge.launch(data, function( result ) {
			res.send(true);
			// @TODO
		})

	});

	//Ask a challenge validation to another user
	
	app.post('/validationRequest', isLoggedIn, function(req, res){

		var data = {
			idUser : req.user._id,
			idChallenge : req.body.idChallenge,
			proofLink1 : req.body.proofLink1,
			proofLink2 : req.body.proofLink2,
			confirmComment : req.body.confirmComment
		};
		
		challenge.requestValidation(data, function( result ) {
			res.send(result);
			//TODO
		})

	});


// =============================================================================
// USERS PAGES (List and profiles===============================================
// =============================================================================

app.get('/users', function(req, res) {
	users.getUserList(function(returned) {
		res.render('userList.ejs', {
			currentUser : (req.isAuthenticated()) ? req.user : false,
			users: returned
		});
	});
});

	/*
	@todo : complete
	*/
	app.get('/u/:id', function(req, res) {

		users.getUser(req.params.id, function(returned) {

			console.log(returned);
			res.render('userDetails.ejs', {
				currentUser : (req.isAuthenticated()) ? req.user : false,
				user: returned
			});
		})
	});

// =============================================================================
// AJAX CALLS ==================================================================
// =============================================================================

		// Game autocomplete research
		app.get('/search_game', function(req, res) {

			var lookFor = req.query['term'];

			games.regexFind(lookFor, function(returned){
				res.send(returned.data, {'Content-Type': 'application/json'}, returned.go);
			});
		});


		app.post('/markNotifRead', isLoggedIn, function(req, res){

			var obj = {
				idUser : req.user._id,
				delete : req.body.delete,
				idNotif : req.body.id
			};

			notifs.markRead(obj, function( result ) {
				res.send(true);
			})

		});

		app.post('/sendTribunal', isLoggedIn, function(req, res){

			var obj = {
				idUser : req.user._id,
				id : req.body.id
			};

			challenge.sendTribunal(obj, function( result ) {

				res.send(true);
				//TODO
			})

		});

		app.post('/rateChallenges', isLoggedIn, function(req, res) {

			var obj = {
				id 			: req.body.id, // idCool of the Ongoing
				idUser 		: req.user._id,
				difficulty 	: req.body.difficulty,
				quickness 	: req.body.quickness,
				fun 		: req.body.fun,
			};

			challenge.rateChallenge(obj, function( data ) {

				console.log(data);

				xp.xpReward(req.user, 'challenge.rate');
				notifs.ratedChall(data);
				res.send(true);
			});
		});

		//A judge give his vote regarding to an open Tribunal's case
		app.post('/voteCase', isLoggedIn, function(req, res){

			var obj = {
				id : req.body.id, // idCool of the Ongoing
				idUser : req.user._id,
				answer : req.body.answer, //Boolean false to deny, true to validate
			};

			challenge.voteCase(obj, function( result ) {


				xp.xpReward(req.user, 'tribunal.vote');

				//Loop and check if all vote have been processed. then close the case.
				challenge.remainingCaseVotes(obj.id, function( counter ) {

					// Close the case
					if(counter === 0) {
						challenge.completeCase(obj.id, function( cases ) {

							var obj = {
								id : cases._idChallenge,
								_idChallenged : cases._idChallenged,
								_idChallenger : cases._idChallenger
							}

							notifs.caseClosed( cases );
							//Ask the challenger and challenged to rate the challenge.
							users.askRate(obj, function( done ) {

								res.send(true);

							});
						});
					} else 
					res.send(true);
				});
			})

		});

		app.post('/askFriend', isLoggedIn, function(req, res){
			var idFriend = req.body.id,
			idCoolFriend = req.body.idCool,
			nameFriend = req.body.pseudo;

			var obj = {
				from : {
					id: req.user._id,
					idCool: req.user.idCool,
					userName : req.user.local.pseudo
				},
				to : {
					id : idFriend,
					idCool: idCoolFriend,
					userName: nameFriend
				}
			};

			users.askFriend(obj, function( result ) {

				res.send(true);
				//TODO
			})

		});

		app.post('/confirmFriend', isLoggedIn, function(req, res){

			var idFriend = req.body.id,
			nameFriend = req.body.pseudo;

			var obj = {
				from : {
					id : idFriend,
					userName: nameFriend
				},
				to : {
					id: req.user._id,
					userName : req.user.local.pseudo
				}
			};

			// console.log(obj);
			relations.acceptRelation(obj.from, obj.to, function( result ) {


				xp.xpReward(result[0], 'user.newFriend');
				xp.xpReward(result[1], 'user.newFriend');

				notifs.nowFriends(result);
				res.send(true);
				//TODO
			})

		});


		app.post('/cancelFriend', isLoggedIn, function(req, res){

			var idFriend = req.body.id,
			nameFriend = req.body.pseudo;

			var obj = {
				from : {
					id: req.user._id,
					userName : req.user.local.pseudo
				},
				to : {
					id : idFriend,
					userName: nameFriend
				}
			};

			// console.log(obj);
			relations.cancelRelation(obj.from, obj.to, function( result ) {

				res.send(true);
			})

		});


		app.post('/denyFriend', isLoggedIn, function(req, res) {

			var idFriend = req.body.id,
			nameFriend = req.body.pseudo;

			var obj = {
				from : {
					id : idFriend,
					userName: nameFriend
				},
				to : {
					id: req.user._id,
					userName : req.user.local.pseudo
				}
			};

			// console.log(obj);
			relations.denyRelation(obj.from, obj.to, function( result ) {

				res.send(true);
				//TODO
			})
		});

		app.post('/acceptChallenge', isLoggedIn, function(req, res) {

			var obj = {
				id : req.body.id,
				idUser : req.user._id
			};

			challenge.accept(obj, function( result ) {

				xp.xpReward(result._idChallenged, 'ongoing.accept');
				xp.xpReward(result._idChallenger, 'ongoing.accept');

				notifs.acceptChall(result._idChallenger,result._idChallenged);
				res.send(true);
				//TODO
			})
		});
		app.post('/denyChallenge', isLoggedIn, function(req, res) {

			var obj = {
				id : req.body.id,
				idUser : req.user._id
			};

			challenge.deny(obj, function( result ) {

				if(result) 
					res.send(true);
				else
					console.log(result);
				//TODO
			})
		});
// =============================================================================
// AUTHENTICATE (FIRST fnotif) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form
		app.get('/login', function(req, res) {
			res.render('login.ejs', { message: req.flash('loginMessage') });
		});

		// process the login form
		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/login', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

		// SIGNUP =================================
		// show the signup form
		app.get('/signup', function(req, res) {
			res.render('signup.ejs', { message: req.flash('loginMessage') });
		});

		// process the signup form
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

		// handle the callback after facebook has authenticated the user
		app.get('/auth/facebook/callback',
			passport.authenticate('facebook', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

		// handle the callback after twitter has authenticated the user
		app.get('/auth/twitter/callback',
			passport.authenticate('twitter', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

		// the callback after google has authenticated the user
		app.get('/auth/google/callback',
			passport.authenticate('google', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

	// locally --------------------------------
	app.get('/connect/local', function(req, res) {
		res.render('connect-local.ejs', { message: req.flash('loginMessage') });
	});
	app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

		// handle the callback after facebook has authorized the user
		app.get('/connect/facebook/callback',
			passport.authorize('facebook', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

		// handle the callback after twitter has authorized the user
		app.get('/connect/twitter/callback',
			passport.authorize('twitter', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

		// the callback after google has authorized the user
		app.get('/connect/google/callback',
			passport.authorize('google', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

	// local -----------------------------------
	app.get('/unlink/local', function(req, res) {
		var user            = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.local.pseudo   = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// facebook -------------------------------
	app.get('/unlink/facebook', function(req, res) {
		var user            = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// twitter --------------------------------
	app.get('/unlink/twitter', function(req, res) {
		var user           = req.user;
		user.twitter.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// google ---------------------------------
	app.get('/unlink/google', function(req, res) {
		var user          = req.user;
		user.google.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}