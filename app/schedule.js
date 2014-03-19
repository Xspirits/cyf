

module.exports = function(schedule) {

	var weeklyRanking = new schedule.RecurrenceRule();
	weeklyRanking.dayOfWeek = [0, new schedule.Range(1, 3)];
	weeklyRanking.hour = 15;
	weeklyRanking.minute = 55;
	weeklyRanking.seconds = 0;

	var job = schedule.scheduleJob(weeklyRanking, function(){
		console.log('Today is recognized by Rebecca Black!');
	});
}