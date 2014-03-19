var User = require('../app/models/user')
, moment = require('moment')
, _      = require('underscore');

// @todo this two function could be merged.
var getScore = function (data, done) {
	var finalScore;

	console.log(data);
	finalScore = (data.xp * (1 + data.level)) + (250* data.shareTW) + (250* data.shareFB);

	return done(finalScore);
}
module.exports = {

	dailyUpdate : function (user, done) {

		var yesterday = user.daily;

		//User calculate score
		getScore(yesterday, function( score ) {
			//Update daily score moment().week();
			console.log('new score for '+user.local.pseudo+' today is ' +score);

			var prepareGlobal = {}
			prepareGlobal.xp = user.xp;
			prepareGlobal.level = user.level;
			prepareGlobal.shareTW = user.global.shareTW;
			prepareGlobal.shareFB = user.global.shareFB;

			getScore(prepareGlobal, function( globalScore ) {
				console.log('new global score for '+user.local.pseudo+' is ' +globalScore);

				User
				.findById(user._id)
				.exec( function (err, user) {

					if (err)
						throw err;

					//Number of the week, for statistics purpose.
					yesterday.day = moment().subtract('days', 1).day();

					//update global score
					user.globalScore    = globalScore;

					//Last week score
					user.dailyScore    = score;
					//reset week
					user.daily.xp      = 0;
					user.daily.level   = 0;
					user.daily.shareFB = 0;
					user.daily.shareTW = 0;

					//take weekly value and push them into the archives
					user.dailyArchives.push(yesterday);
					user.save(function(err) {
						if (err)
							throw err;

						return done(user);

					});
				});
			});
		});
		// 
	},
	weeklyUpdate : function (user, done) {

		var lastWeek = user.weekly;

		//User calculate score
		getScore(lastWeek, function( score ) {
			//Update weekly score moment().week();
			console.log('new score for '+user.local.pseudo+' is ' +score);

			var prepareGlobal = {}
			prepareGlobal.xp = user.xp;
			prepareGlobal.level = user.level;
			prepareGlobal.shareTW = user.global.shareTW;
			prepareGlobal.shareFB = user.global.shareFB;

			getScore(prepareGlobal, function( globalScore ) {
				console.log('new global score for '+user.local.pseudo+' is ' +globalScore);

				User
				.findById(user._id)
				.exec( function (err, user) {

					if (err)
						throw err;

					//Number of the week, for statistics purpose.
					lastWeek.week = moment().subtract('weeks', 1).week();

					//update global score
					user.globalScore    = globalScore;

					//Last week score
					user.weeklyScore    = score;
					//reset week
					user.weekly.xp      = 0;
					user.weekly.level   = 0;
					user.weekly.shareFB = 0;
					user.weekly.shareTW = 0;

					//take weekly value and push them into the archives
					user.weeklyArchives.push(lastWeek);
					user.save(function(err) {
						if (err)
							throw err;

						return done(user);

					});
				});
			});
		});
		// 
	},
	monthlyUpdate : function (user, done) {

		var lastMonth = user.monthly;

		//User calculate score
		getScore(lastMonth, function( score ) {
			//Update weekly score moment().week();
			console.log('new monthly score for '+user.local.pseudo+' is ' +score);

			var prepareGlobal = {}
			prepareGlobal.xp = user.xp;
			prepareGlobal.level = user.level;
			prepareGlobal.shareTW = user.global.shareTW;
			prepareGlobal.shareFB = user.global.shareFB;

			getScore(prepareGlobal, function( globalScore ) {
				console.log('new global score for '+user.local.pseudo+' is ' +globalScore);

				User
				.findById(user._id)
				.exec( function (err, user) {

					if (err)
						throw err;

					//Number of the week, for statistics purpose.
					lastMonth.month = moment().subtract('months', 1).month();

					//update global score
					user.globalScore    = globalScore;

					//Last week score
					user.monthlyScore    = score;
					//reset week
					user.monthly.xp      = 0;
					user.monthly.level   = 0;
					user.monthly.shareFB = 0;
					user.monthly.shareTW = 0;

					//take monthly value and push them into the archives
					user.monthlyArchives.push(lastMonth);
					user.save(function(err) {
						if (err)
							throw err;

						return done(user);

					});
				});
			});
		});
		//
	},

	/**
	 * This will render the leaderboard for the week. Upgrade scores and res
	 * @param  {Function} done [description]
	 * @return {[type]}        [description]
	 */
	 createDailyLadder : function () {
	 	var self = this;
		//Users Loop
		User
		.find({})
		.sort('-_id')
		.exec( function (err, usersList) {

			_.each(usersList, function(element, index, list) {
				self.dailyUpdate(element, function( done ) {
					console.log('User ' + done.local.pseudo +' has been updated day ' + done.dailyScore +' g ' + done.globalScore );
				});
			});

		});
	},
	/**
	 * This will render the leaderboard for the week. Upgrade scores and res
	 * @param  {Function} done [description]
	 * @return {[type]}        [description]
	 */
	 createWeeklyLadder : function () {
	 	var self = this;
		//Users Loop
		User
		.find({})
		.sort('-_id')
		.exec( function (err, usersList) {

			_.each(usersList, function(element, index, list) {
				self.weeklyUpdate(element, function( done ) {
					console.log('User ' + done.local.pseudo +' has been updated w ' + done.weeklyScore +' g ' + done.globalScore );
				});
			});

		});
	},
	/**
	 * This will render the leaderboard for the week. Upgrade scores and res
	 * @param  {Function} done [description]
	 * @return {[type]}        [description]
	 */
	 createMonthlyLadder : function () {
	 	var self = this;
		//Users Loop
		User
		.find({})
		.sort('-_id')
		.exec( function (err, usersList) {

			_.each(usersList, function(element, index, list) {
				self.monthlyUpdate(element, function( done ) {
					console.log('User ' + done.local.pseudo +' has been updated month ' + done.monthlyScore +' g ' + done.globalScore );
				});
			});

		});
	},

	actionInc : function (user, action) {
		var query;
		if(action === 'twitter') 
			query = {'weekly.shareTW' : 1,'monthly.shareTW' : 1,'global.shareTW' : 1};
		else if (action === 'facebook')
			query = {'weekly.shareFB' : 1,'monthly.shareFB' : 1,'global.shareFB' : 1};
		else{
			query = false;
			console.log(' ladders.js line 17 prompted')
		}

		if(query) {

			User
			.findByIdAndUpdate(user._id, { $inc: query } )
			.exec(function (err, userUpdated) {
				if(err) 
					throw err;

				console.log(userUpdated.local.pseudo + ' weekly stats : TW ' + userUpdated.weekly.shareTW + ' FB ' + userUpdated.weekly.shareFB)
				console.log(userUpdated.local.pseudo + ' monthly stats : TW ' + userUpdated.monthly.shareTW + ' FB ' + userUpdated.monthly.shareFB)
			});
		}
	}

}