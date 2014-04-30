module.exports = (CronJob, schedule, mailer, _, sio, ladder, moment, social, appKeys, xp, notifs) ->

  # =============================================================================
  # XP&LEVEL HISTORY   ==========================================================
  # =============================================================================

  # Level and Xp update

  # 6AM
  dailyXpAM = new CronJob(
    cronTime: "00 00 06 * * *"
    # cronTime: "0 15 12 * * *"
    onComplete: ->
      console.log 'job completed dailyXp' + new Date()
    onTick: ->
      xp.updateDaily (result)-> 
        mailer.cLog '[Cyf-auto] Daily xp update done',result
    start: true
  )
  # 6PM
  dailyXpPM = new CronJob(
    cronTime: "00 00 18 * * *"
    # cronTime: "0 15 12 * * *"
    onComplete: ->
      console.log 'job completed dailyXp' + new Date()
    onTick: ->
      xp.updateDaily (result)-> 
        mailer.cLog '[Cyf-auto] Daily xp update done',result
    start: true
  )



  # =============================================================================
  # LADDERS    ==================================================================
  # =============================================================================
  
  # Daily Ladder
  dailyLadder = new CronJob(
    cronTime: "00 30 12 * * 0-6"
    # cronTime: "0 15 12 * * *"
    onComplete: ->
      console.log 'job completed Daily Ladder ' + new Date()
    onTick: ->
      daily = 1
      ladder.generateLadder daily, ->
        ladder.rankUser daily, (top3)-> 
          ladder.spreadUsersSocial daily, ->
            ladder.spreadLadder top3, daily, (done)->
              mailer.cLog '[Cyf-auto] Daily Ladder for ' + moment().subtract('d', 1).format("ddd Do MMM"),done
              console.log done
    start: true
  )


  # Weekly Ladder

  weekLadder = new CronJob(
    cronTime: "00 10 6 * * 0"
    # cronTime: "0 15 12 * * *"
    onComplete: ->
      console.log 'job completed Weekly Ladder ' + new Date()
    onTick: ->
      weekly = 2
      ladder.generateLadder weekly, ->
        ladder.rankUser weekly, (top3)-> 
          ladder.spreadUsersSocial weekly, ->
            ladder.spreadLadder top3, weekly, (done)->
              mailer.cLog '[Cyf-auto] Weekly Ladder for ' + moment().subtract('w', 1).format("w"),done
    
    start: true
  )



  # Monthly Ladder
  monthlyLadder = new CronJob(
    cronTime: "00 10 08 1 * *"
    onComplete: ->
      console.log 'job completed Monthly Ladder ' + new Date()
    onTick: ->
      monthly = 3
      ladder.generateLadder monthly, ->
        ladder.rankUser monthly, (top3)-> 
          ladder.spreadUsersSocial monthly, ->
            ladder.spreadLadder top3, monthly, (done)->
              mailer.cLog '[Cyf-auto] Monthly Ladder for ' + moment().subtract('m', 1).format("MMMM GGGG"),done
    start: true
  )

  # dailyXp.start()
  # dailyLadder.start()
  # weekLadder.start()
  # monthlyLadder.start()

