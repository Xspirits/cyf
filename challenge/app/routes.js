module.exports = function(app, passport, moment, challenge, users, relations) {

// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		if (req.isAuthenticated())
			res.render('index_logged.ejs', {
				currentUser : req.user,
				user : req.user
			});
		else
			res.render('index.ejs');
	});

	// PROFILE SECTION =========================
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			currentUser : (req.isAuthenticated()) ? req.user : false,
			user : req.user
		});
	});

	// CHALLENGES SECTION =========================
	app.get('/request', isLoggedIn, function(req, res) {

		//get Ongoing challenges for the current user

		challenge.challengerRequests(req.user._id, function ( dataChallenger ) { 

			challenge.challengedRequests(req.user._id, function ( dataChallenged ) { 

				var obj = {
					sent: dataChallenger,
					request: dataChallenged
				};

				res.render('request.ejs', {
					currentUser : (req.isAuthenticated()) ? req.user : false,
					user : req.user,
					challenges : obj
				});
			})
		})
	});

	// CHALLENGE DETAILS SECTION =========================
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
	app.get('/ongoing', isLoggedIn, function(req, res) {

		//get Ongoing challenges for the current user


		challenge.userAcceptedChallenge(req.user._id, function ( data ) { 


			var cStart, eStart,
			upcomingChall = [],
			ongoingChall = [],
			endedChall = [];

			for(var i = 0; i < data.length || function(){

				console.log('Going to RES');

				res.render('ongoing.ejs', {
					currentUser : (req.isAuthenticated()) ? req.user : false,
					user : req.user,
					upChallenges : upcomingChall,
					onChallenges : ongoingChall,
					endChallenges : endedChall
				});

				return false;}();i++){

				cStart = data[i].launchDate;
				cEnd = data[i].deadLine;

				// Start hasn't been reached
				if(!moment(cStart).isBefore() && !moment(cEnd).isBefore()) {
					upcomingChall.push(data[i]);
					console.log('parsed upcoming : ' + data[i]._id);

				}
				// Start has been reached but not end
				else if (data[i].waitingConfirm || moment(cStart).isBefore() && !moment(cEnd).isBefore()) {
					ongoingChall.push(data[i]);
					console.log('parsed ongoing : ' + data[i]._id);

				}
				// end has been reached
				else {

					console.log('This must be true: ' + moment(cStart).isBefore());
					console.log('This must be true: ' + moment(cEnd).isBefore());

					endedChall.push(data[i]);
					console.log('parsed ended : ' + data[i]._id);

				}
			}
		})
});
	// PROFILE SECTION - USER Challenges =========================
	app.get('/myChallenges', isLoggedIn, function(req, res) {

		challenge.getUserChallenges(req.user._id, function( data ) {

			res.render('myChallenges.ejs', {
				currentUser : (req.isAuthenticated()) ? req.user : false,
				user : req.user,
				challenges : data
			});

		})
	});

	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

// =============================================================================
// CHALLENGES ==================================================================
// =============================================================================
// 
	// CHALLENGE DETAILS SECTION =========================
	app.get('/c/:id', function(req, res) {

		var cId = req.params.id;

		challenge.getChallenge(cId , function (data) {

			// console.log(data);

			res.render('challengeDetails.ejs', {
				currentUser : (req.isAuthenticated()) ? req.user : false,
				user : req.user,
				challenge: data
			});

		});
	});	

	// CREATE CHALLENGE SECTION =========================
	app.get('/newChallenge', isLoggedIn, function(req, res) {
		res.render('newChallenge.ejs', {
			currentUser : (req.isAuthenticated()) ? req.user : false,
			user : req.user,
			challenge: false
		});
	});

	app.post('/newChallenge', function(req, res) {

		challenge.create(req, function(done){	

			res.render('newChallenge.ejs', {
				currentUser : (req.isAuthenticated()) ? req.user : false, 
				user : req.user,
				challenge: done 
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
			users.getUser(req.user._id, function( newUser ) {
				res.render('launchChallenge.ejs', {
					currentUser : (req.isAuthenticated()) ? req.user : false,
					user: req.user,
					userList: newUser.friends,
					challenges: challenges
				});
			})
		})
	});

	// process the login form
	app.post('/launchChallenge', isLoggedIn, function(req, res){
		var data = {
			from : req.user._id,
			idChallenged : req.body.idChallenged,
			idChallenge : req.body.idChallenge,
			deadLine : req.body.deadLine,
			launchDate : req.body.launchDate
		};
		
		challenge.launch(data, function( result ) {

			res.send(result);
			//TODO
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
	})
});

	/*
	@todo : complete
	*/
	app.get('/u/:id', function(req, res) {

		users.getUser(req.params.id, function(returned) {

			console.log(req.user.local.pseudo)
			res.render('userDetails.ejs', {
				currentUser : (req.isAuthenticated()) ? req.user : false,
				user: returned
			});
		})
	});

// =============================================================================
// AJAX CALLS ==================================================================
// =============================================================================

		// process the login form
		app.post('/askFriend', function(req, res){
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

			users.askFriend(obj, function( result ) {

				res.send(true);
				//TODO
			})

		});

		app.post('/confirmFriend', function(req, res){

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

				res.send(true);
				//TODO
			})

		});


		app.post('/cancelFriend', function(req, res){

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



		app.post('/denyFriend', function(req, res) {

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

		app.post('/acceptChallenge', function(req, res) {

			var obj = {
				id : req.body.id,
				idUser : req.user._id
			};

			console.log(obj);
			challenge.accept(obj, function( result ) {

				if(result) 
					res.send(true);
				else
					console.log(result);
				//TODO
			})
		});
		app.post('/denyChallenge', function(req, res) {

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
// AUTHENTICATE (FIRST LOGIN) ==================================================
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