module.exports = (schedule, mailer, _, sio, ladder, moment, social, appKeys, xp, notifs) ->
  
  # =============================================================================
  # XP&LEVEL HISTORY   ==========================================================
  # =============================================================================

  # Level and Xp update
  xpLevelUpdate         = new schedule.RecurrenceRule()
  xpLevelUpdate.hour    = [13,23]
  xpLevelUpdate.minute  = 30
  xpLevelUpdate.seconds = 0

  xpLevel = schedule.scheduleJob xpLevelUpdate, ->
    console.log 'xpLevel update start'

    xp.updateDaily (result)-> 
      mailer.cLog '[Cyf-auto] Daily xp update done',result

  # =============================================================================
  # LADDERS    ==================================================================
  # =============================================================================
  
  # Daily Ladder
  dailyRanking         = new schedule.RecurrenceRule()
  dailyRanking.hour    = 12
  dailyRanking.minute  = 0
  dailyRanking.seconds = 0

  dailyLadder = schedule.scheduleJob dailyRanking, ->
    console.log 'dailyLadder'
    daily = 1
    ladder.generateLadder daily, ->
      ladder.rankUser daily, (top3)-> 
        ladder.spreadUsersSocial daily, ->
          ladder.spreadLadder top3, daily, (done)->
            mailer.cLog '[Cyf-auto] Daily Ladder for ' + moment().subtract('d', 1).format("ddd Do MMM"),done

  # Weekly Ladder
  weeklyRanking           = new schedule.RecurrenceRule()
  weeklyRanking.dayOfWeek = 1 #Monday
  weeklyRanking.hour      = 1
  weeklyRanking.minute    = 1 # Let's avoid taking risks with setting 0h 0m 0s
  weeklyRanking.seconds   = 0

  weekLadder = schedule.scheduleJob weeklyRanking, ->

    weekly = 2
    ladder.generateLadder weekly, ->
      ladder.rankUser weekly, (top3)-> 
        ladder.spreadUsersSocial weekly, ->
          ladder.spreadLadder top3, weekly, (done)->
            mailer.cLog '[Cyf-auto] Weekly Ladder for ' + moment().subtract('w', 1).format("w"),done

  # Monthly Ladder
  monthlyRanking         = new schedule.RecurrenceRule()
  monthlyRanking.date    = 1 # 1st of each month
  monthlyRanking.hour    = 1 # at 1 AM
  monthlyRanking.minute  = 10
  monthlyRanking.seconds = 0

  monthlyLadder = schedule.scheduleJob monthlyRanking, ->

    monthly = 3
    ladder.generateLadder monthly, ->
      ladder.rankUser monthly, (top3)-> 
        ladder.spreadUsersSocial monthly, ->
          ladder.spreadLadder top3, monthly, (done)->
            mailer.cLog '[Cyf-auto] Monthly Ladder for ' + moment().subtract('m', 1).format("MMMM GGGG"),done