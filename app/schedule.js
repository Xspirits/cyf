module.exports = function(schedule, ladder) {

// =============================================================================
// LADDERS    ==================================================================
// =============================================================================

	// Daily Ladder
	var dailyRanking = new schedule.RecurrenceRule();
	dailyRanking.hour = 0;
	dailyRanking.minute = 1; // Let's avoid taking risks with setting 0h 0m 0s
	dailyRanking.seconds = 0;

	var weekLadder = schedule.scheduleJob(dailyRanking, function(){
		console.log('Updating the ladder for today.');
		ladder.createDailyLadder();
	});

	// Weekly Ladder
	var weeklyRanking = new schedule.RecurrenceRule();
	weeklyRanking.dayOfWeek = 1; //Monday
	weeklyRanking.hour = 0;
	weeklyRanking.minute = 1; // Let's avoid taking risks with setting 0h 0m 0s
	weeklyRanking.seconds = 0;

	var weekLadder = schedule.scheduleJob(weeklyRanking, function(){
		console.log('Updating the ladder for the past week.');
		ladder.createWeeklyLadder();
	});


	// Monthly Ladder
	var monthlyRanking = new schedule.RecurrenceRule();
	monthlyRanking.date = 1; // 1st of each month
	monthlyRanking.hour = 1;
	monthlyRanking.minute = 0;
	monthlyRanking.seconds = 0;

	var weekLadder = schedule.scheduleJob(monthlyRanking, function(){
		console.log('Updating the ladder for the past month.');
		ladder.createMonthlyLadder();
	});
}