module.exports = function(app, _, sio, passport, genUID, xp, notifs, moment, challenge, users, relations, games, social,ladder, img) {

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
	app.get('/eval/:hash', function(req, res) {

		var hash = req.params.hash;
		users.validateEmail(hash, function( result ) {
			if(result)
				res.redirect('/login');
			else
				res.redirect('/');
		});
	});
	// LOGOUT ==============================
	app.get('/logout', isLoggedIn, function(req, res) {

		notifs.logout(req.user);

		sio.glob('glyphicon glyphicon-log-out',req.user.local.pseudo + ' disconnected');
		users.setOffline(req.user, function( result ) {
			if(result){
				req.session.notifLog = false;
				req.session.isLogged = false;
				req.logout();
				res.redirect('/');

			}
		});

	});

	// PROFILE SECTION =========================
	app.get('/profile', isLoggedIn, function(req, res) {

		res.render('profile.ejs', {
			currentUser : req.user
		});
	});
	app.get('/settings', isLoggedIn, function(req, res) {

		res.render('setting.ejs', {
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

				// Is the challenge's deadline passed ?
				// If yes, mark it as not completed, failed				
				if(moment(cEnd).isSame() || moment(cEnd).isBefore()) {
					console.log(moment(cEnd).isSame() || moment(cEnd).isBefore())
					console.log(data[i].idCool)
					challenge.crossedDeadline(data[i]._id);
					endedChall.push(data[i]);
				}
				// Challenge is awaiting validation
				// To determine if its belong to the current user or not will be done client-side.
				else if(data[i].waitingConfirm === true && data[i].progress < 100) {

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
			}
		});
});

// =============================================================================
// CHALLENGES ==================================================================
// =============================================================================

	// CHALLENGE LIST SECTION =========================

	app.get('/challenges', function (req, res) {
		challenge.getList(function ( list ) {
			res.render('challenges.ejs', {
				currentUser : (req.isAuthenticated()) ? req.user : false,
				challenges: list
			});

		})
	});

	// CHALLENGE DETAILS SECTION =========================
	app.get('/c/:id', function (req, res) {

		var cId = req.params.id;

		challenge.getChallenge(cId , function (data) {

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

			notifs.createdChallenge(req.user, done.idCool);
			xp.xpReward(req.user, 'challenge.create');
			sio.glob('fa fa-plus-square-o', '<a href="/u/'+req.user.idCool+'" title="'+req.user.local.pseudo+'">'+req.user.local.pseudo+'</a> created a <a href="/c/'+done.idCool+'" title="'+done.title+'">new challenge</a>.');

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
					xp.xpReward(done._idChallenged, 'ongoing.succeed', done._idChallenge.value);

					var ioText = '<a href="/c/'+done._idChallenged.idCool+'" title="'+done._idChallenged.local.pseudo+'">'+done._idChallenged.local.pseudo + '</a> completed the challenge <a href="/c/'+done._idChallenge.idCool+'" title="'+done._idChallenge.title+'">'+done._idChallenge.title+'</a>!'
					sio.glob('glyphicon glyphicon-tower', ioText);

					notifs.successChall(done);

					//automaticall share on Twitter if allowed
					
					if(done._idChallenged.share.twitter === true && done._idChallenged.twitter.token){
						var twitt = "I just completed a challenge (http://goo.gl/gskvYu) on League of Legend! Join me now @cyf_app #challenge";
						social.postTwitter(req.user.twitter, twitt, function( data ){
							var text = '<a href="/u/'+done._idChallenged.idCool+'" title="'+done._idChallenged.local.pseudo+'">'+done._idChallenged.local.pseudo+'</a> shared his success on <a target="_blank" href="https://twitter.com/'+data.user.screen_name+'/status/'+data.id_str+'" title="see tweet">@twitter</a>.'
							sio.glob('fa fa-twitter', text);
							ladder.actionInc(req.user,'twitter');
						});
					}

					//Automatically share on facebook
					if(done._idChallenged.share.facebook === true && done._idChallenged.facebook.token){

						var message = {
							title : 'I won a challenge threw by '+done._idChallenger.local.pseudo + '!',
							body : 'Hurray! I just completed the challenge "'+done.title+'""  on Challenge Your friends! I won ' + xp.getValue('ongoing.succeed') +
							'XP! http://localhost:8080/o/'+done.idCool
						};
						social.postFbMessage(done._idChallenged.facebook.token,message, 'http://localhost:8080/o/'+done.idCool, function(data) {
							var text = '<a href="/u/'+done._idChallenged.idCool+'" title="'+done._idChallenged.local.pseudo+'">'+done._idChallenged.local.pseudo+'</a> shared his success on facebook.'
							sio.glob('fa fa-facebook', text);
							ladder.actionInc(req.user,'facebook');
						} )
					}
					//Ask the challenger and challenged to rate the challenge.
					users.askRate(obj, function( done ) {
						res.send(done);
					});
				} else 
				res.send(true);
			});
			//	
		} else 
		res.send(false, 'not a boolean');		
	});

	// USER CHALLENGE TO BE RATED (ask opinion) ==================
	app.get('/rateChallenges', isLoggedIn, function(req, res) {

		users.userToRateChallenges(req.user._id, function( data ) {

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
			users.getUser(req.user.idCool, function( thisUser ) {

				console.log(thisUser.friends);
				res.render('launchChallenge.ejs', {
					currentUser    : req.user,
					userList: thisUser.friends,
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

		img.googleUrl(req.body.proofLink1, function(imgUrl1){
			console.log('\nuploaded %s to %s'
				,  req.body.proofLink1
				, imgUrl1);
			if(req.body.proofLink2) {
				img.googleUrl(req.body.proofLink2, function(imgUrl2){
					console.log('\nuploaded %s to %s'
						,  req.body.proofLink2
						, imgUrl2);
					var data = {
						idUser : req.user._id,
						idChallenge : req.body.idChallenge,
						proofLink1 : imgUrl1,
						proofLink2 : imgUrl2,
						confirmComment : req.body.confirmComment
					};
					console.log(data);
					challenge.requestValidation(data, function( result ) {
						res.send(result);
					})
				});
			} else {
				var data = {
					idUser : req.user._id,
					idChallenge : req.body.idChallenge,
					proofLink1 : imgUrl1,
					proofLink2 : imgUrl2,
					confirmComment : req.body.confirmComment
				};
				console.log(data);
				challenge.requestValidation(data, function( result ) {
					res.send(result);
				})
			}
		});


	});


// =============================================================================
// USERS PAGES (List and profiles===============================================
// =============================================================================

	// User list
	app.get('/users', function(req, res) {
		users.getUserList(function(returned) {
			res.render('userList.ejs', {
				currentUser : (req.isAuthenticated()) ? req.user : false,
				users: returned
			});
		});
	});

	// leader board
	app.get('/leaderboard', function(req, res) {
		users.getLeaderboards('score' ,function(returned) {
			res.render('leaderBoard.ejs', {
				currentUser : (req.isAuthenticated()) ? req.user : false,
				ranking: returned
			});
		});
	});

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
		app.get('/unlink/game_lol', isLoggedIn, function(req ,res) {

			users.unlinkLol(req.user._id, function( result ) {
				console.log(result);
				res.redirect('/settings');
			})
		});

		app.post('/linkLol', isLoggedIn, function(req, res){

			var obj = {
				_id : req.user._id,
				region : req.body.region,
				summonerName : req.body.summonerName
			};

			users.linkLol(obj, function( result ) {

				if(result === true){

					xp.xpReward(req.user, 'connect.game');
					notifs.linkedGame(req.user, 'League of Legend');
					res.send(true);
				} else {
					res.send(false);

				}
			})
		});

		app.post('/updateSettings', isLoggedIn, function(req, res){

			var obj = {
				_id : req.user._id,
				target : req.body.target,
				value : req.body.value
			};
			users.updateSettings(obj, function( result ) {
				res.send(true);
			})
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
				id: req.body.id, // idCool of the Ongoing
				idUser: req.user._id,
				difficulty: req.body.difficulty,
				quickness: req.body.quickness,
				fun: req.body.fun,
			};

			challenge.rateChallenge(obj, function( data ) {

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
							//If the case is validated
							if(cases.tribunalAnswered === true){
								var ioText = ' The tribunal validated the case <a href="/c/'+cases.idCool+'" title="'+cases._idChallenge.title+'">'+cases.idCool+'</a> for <a href="/c/'+cases._idChallenged.idCool+'" title="'+cases._idChallenged.local.pseudo+'">'+cases._idChallenged.local.pseudo+'</a>.';
								sio.glob('fa fa-legal', ioText);
							}

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

	notifs.askFriend( req.user , obj.to );
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

				sio.glob('fa fa-users', '<a href="/u/'+result[0].idCool+'" title="'+result[0].local.pseudo+'">'+result[0].local.pseudo+'</a> and <a href="/u/'+result[1].idCool+'" title="'+result[1].local.pseudo+'">'+result[1].local.pseudo+'</a> are now friends!');

				res.send(true);
				//TODO
			})

		});
		// a
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

				var ioText = '<a href="/u/'+result._idChallenged.idCool+'" title="'+result._idChallenged.local.pseudo+'">';
				ioText += result._idChallenged.local.pseudo+'</a> accepted <a href="/c/'+result._idChallenge.idCool+'>the challenge</a> of <a href="/u/'
				ioText += result._idChallenger.idCool+' title="'+result._idChallenger.local.pseudo+'">'+result._idChallenger.local.pseudo+'</a>.';

				sio.glob('fa fa-gamepad',ioText)

				res.send(true);
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
		app.get('/signup/:done?', function(req, res) {
			var nowConfirm = req.params.done == 'great' ? true : false;
			res.render('signup.ejs', { waitingConfirm: nowConfirm, message : '' });
		});

		// process the signup form
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/signup/great', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));


	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email', 'publish_actions'] }));

		// handle the callback after facebook has authenticated the user
		app.get('/auth/facebook/callback',
			passport.authenticate('facebook', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/auth/twitter', passport.authenticate('twitter'));

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
		app.get('/connect/facebook', passport.authorize('facebook', { scope : ['email', 'publish_actions'] }));

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