User = require("../app/models/user")
moment = require("moment")
_ = require("underscore")

# @todo this two function could be merged.
getScore = (data, done) ->
  finalScore = undefined
  console.log data
  finalScore = (data.xp * (1 + data.level)) + (250 * data.shareTW) + (250 * data.shareFB)
  done finalScore

module.exports =
  rankUser: (type, callback) ->

    sorting = if type == 'dailyRank' then 'dailyScore'  else if type == 'weeklyRank' then 'weeklyScore' else 'monthlyScore'
    sort    = '-' + sorting
    User.find({}).sort(sort).exec (err, userSorted) ->
      throw err if err
      leaders = []
      _.each userSorted, (user, rank) ->

        console.log user.local.pseudo+ ' for ' + rank

        User.findById(user._id).exec (err, user) ->
          throw err  if err
          
          if type == 'dailyRank'
            user.dailyRank            = rank + 1         
          else if type == 'weeklyRank'
            user.weeklyRank           = rank + 1        
          else if type == 'monthlyRank'
            user.monthlyRank          = rank + 1        

          console.log user.local.pseudo + ' who was ' + user.dailyArchives.rank + ' is now #' + user.dailyRank

          user.save (err) ->
            throw err  if err
            leaders.push user if (rank+1 < 4) 
            callback leaders if (rank+1 > 3) or (rank + 1 >= userSorted.length)


  dailyUpdate: (user, done) ->
    yesterday = 
      rank    : user.dailyRank,
      xp      : user.daily.xp,
      level   : user.daily.level,
      shareFB : user.daily.shareFB,
      shareTW : user.daily.shareTW
    
    console.log yesterday
    #User calculate score
    getScore yesterday, (score) ->
      console.log "new score for " + user.local.pseudo + " today is " + score

      prepareGlobal =
        xp      : user.xp
        level   : user.level
        shareTW : user.global.shareTW
        shareFB : user.global.shareFB

      getScore prepareGlobal, (globalScore) ->
        console.log "new global score for " + user.local.pseudo + " is " + globalScore
        User.findById(user._id).exec (err, user) ->
          throw err  if err
          
          #Number of the week, for statistics purpose.
          yesterday.day = moment().subtract("days", 1).day()
          
          #update global score
          user.globalScore = globalScore
          
          #Last week score
          user.dailyScore = score
          
          #reset week
          user.daily.xp           = 0
          user.daily.level        = 0
          user.daily.shareFB      = 0
          user.daily.shareTW      = 0
          
          #take weekly value and push them into the archives
          user.dailyArchives.push yesterday
          user.save (err) ->
            throw err  if err
            done user

  weeklyUpdate: (user, done) ->
    lastWeek = user.weekly
    
    #User calculate score
    getScore lastWeek, (score) ->
      
      #Update weekly score moment().week();
      console.log "new score for " + user.local.pseudo + " is " + score
      prepareGlobal = {}
      prepareGlobal.xp = user.xp
      prepareGlobal.level = user.level
      prepareGlobal.shareTW = user.global.shareTW
      prepareGlobal.shareFB = user.global.shareFB
      getScore prepareGlobal, (globalScore) ->
        console.log "new global score for " + user.local.pseudo + " is " + globalScore
        User.findById(user._id).exec (err, user) ->
          throw err  if err
          
          #Number of the week, for statistics purpose.
          lastWeek.week = moment().subtract("weeks", 1).week()
          
          #update global score
          user.globalScore = globalScore
          
          #Last week score
          user.weeklyScore = score
          
          #reset week
          user.weekly.xp = 0
          user.weekly.level = 0
          user.weekly.shareFB = 0
          user.weekly.shareTW = 0
          
          lastWeek.rank = user.weeklyRank 
          #take weekly value and push them into the archives
          user.weeklyArchives.push lastWeek
          user.save (err) ->
            throw err  if err
            done user

  monthlyUpdate: (user, done) ->
    lastMonth = user.monthly
    
    #User calculate score
    getScore lastMonth, (score) ->
      
      #Update weekly score moment().week();
      console.log "new monthly score for " + user.local.pseudo + " is " + score
      prepareGlobal = {}
      prepareGlobal.xp = user.xp
      prepareGlobal.level = user.level
      prepareGlobal.shareTW = user.global.shareTW
      prepareGlobal.shareFB = user.global.shareFB
      getScore prepareGlobal, (globalScore) ->
        console.log "new global score for " + user.local.pseudo + " is " + globalScore
        User.findById(user._id).exec (err, user) ->
          throw err  if err
          
          #Number of the week, for statistics purpose.
          lastMonth.month = moment().subtract("months", 1).month()
          
          #update global score
          user.globalScore = globalScore
          
          #Last week score
          user.monthlyScore = score
          
          #reset week
          user.monthly.xp = 0
          user.monthly.level = 0
          user.monthly.shareFB = 0
          user.monthly.shareTW = 0
          
          lastMonth.rank = user.monthlyRank 

          #take monthly value and push them into the archives
          user.monthlyArchives.push lastMonth
          user.save (err) ->
            throw err  if err
            done user
  
  ###
  This will render the leaderboard for the week. Upgrade scores and res
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  createDailyLadder: (callback) ->
    self = this
    
    #Users Loop
    User.find({}).sort("-_id").exec (err, usersList) ->
      _.each usersList, (element, ii, list) ->
        self.dailyUpdate element, (done) ->
          ranking =  (user for user in done)
          console.log "User " + done.local.pseudo + " has been updated day " + done.dailyScore + " g " + done.globalScore
          console.log((ii+1)+' ' + usersList.length)
          callback() if (ii+1 >= usersList.length)

  ###
  This will render the leaderboard for the week. Upgrade scores and res
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  createWeeklyLadder: ->
    self = this
    
    #Users Loop
    User.find({}).sort("-_id").exec (err, usersList) ->
      _.each usersList, (element, index) ->
        self.weeklyUpdate element, (done) ->
          console.log "User " + done.local.pseudo + " has been updated w " + done.weeklyScore + " g " + done.globalScore
      callback()

  
  ###
  This will render the leaderboard for the week. Upgrade scores and res
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  createMonthlyLadder: ->
    self = this
    
    #Users Loop
    User.find({}).sort("-_id").exec (err, usersList) ->
      _.each usersList, (element, index, list) ->
        self.monthlyUpdate element, (done) ->
          console.log "User " + done.local.pseudo + " has been updated month " + done.monthlyScore + " g " + done.globalScore
      callback()

  actionInc: (user, action) ->
    query = undefined
    if action is "twitter"
      query =
        "weekly.shareTW": 1
        "monthly.shareTW": 1
        "global.shareTW": 1
    else if action is "facebook"
      query =
        "weekly.shareFB": 1
        "monthly.shareFB": 1
        "global.shareFB": 1
    else
      query = false
      console.log " ladders.js line 17 prompted"
    if query
      User.findByIdAndUpdate(user._id,
        $inc: query
      ).exec (err, userUpdated) ->
        throw err  if err
        console.log userUpdated.local.pseudo + " weekly stats : TW " + userUpdated.weekly.shareTW + " FB " + userUpdated.weekly.shareFB
        console.log userUpdated.local.pseudo + " monthly stats : TW " + userUpdated.monthly.shareTW + " FB " + userUpdated.monthly.shareFB