module.exports = (schedule, ladder) ->
  
  # =============================================================================
  # LADDERS    ==================================================================
  # =============================================================================
  
  # Daily Ladder
  dailyRanking = new schedule.RecurrenceRule()
  dailyRanking.hour = 0
  dailyRanking.minute = 1 # Let's avoid taking risks with setting 0h 0m 0s
  dailyRanking.seconds = 0
  weekLadder = schedule.scheduleJob(dailyRanking, ->
    console.log "Updating the ladder for today."
    ladder.createDailyLadder()
    return
  )
  
  # Weekly Ladder
  weeklyRanking = new schedule.RecurrenceRule()
  weeklyRanking.dayOfWeek = 1 #Monday
  weeklyRanking.hour = 0
  weeklyRanking.minute = 1 # Let's avoid taking risks with setting 0h 0m 0s
  weeklyRanking.seconds = 0
  weekLadder = schedule.scheduleJob(weeklyRanking, ->
    console.log "Updating the ladder for the past week."
    ladder.createWeeklyLadder()
    return
  )
  
  # Monthly Ladder
  monthlyRanking = new schedule.RecurrenceRule()
  monthlyRanking.date = 1 # 1st of each month
  monthlyRanking.hour = 1
  monthlyRanking.minute = 0
  monthlyRanking.seconds = 0
  weekLadder = schedule.scheduleJob(monthlyRanking, ->
    console.log "Updating the ladder for the past month."
    ladder.createMonthlyLadder()
    return
  )
  return