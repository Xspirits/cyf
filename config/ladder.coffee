User = require("../app/models/user")
moment = require("moment")
_ = require("underscore")

# @todo this two function could be merged.
getScore = (data, done) ->
  finalScore = undefined
  finalScore = (data.xp * (1 + data.level)) + (250 * data.shareTW) + (250 * data.shareFB)
  done finalScore

module.exports = (schedule, mailer, _, sio, ladder, moment, social, appKeys, xp, notifs,users)->
  rankUser: (type, callback) ->
    sorting = if type == 1 then 'dailyScore' else if type == 2 then 'weeklyScore' else 'monthlyScore'

    sort    = '-' + sorting
    User.find({}).sort(sort).exec (err, userSorted) ->
      mailer.cLog 'Error at '+__filename,err if err
      leaders = []
      _.each userSorted, (user, rank) ->
        ranked = rank + 1
        console.log '[' + type + '] Updating ' + user.local.pseudo + ' who will now be ranked ' + ranked
 
        User.findById(user._id).exec (err, user) ->
          mailer.cLog 'Error at '+__filename,err if err
          archives = if type == 'dailyRank' then user.dailyArchives[user.dailyArchives.length-1] else if type == 'weeklyRank' then user.weeklyArchives[user.weeklyArchives.length-1] else user.monthlyArchives[user.monthlyArchives.length-1]

          if type == 1
            user.dailyRank = ranked        
          else if type == 2
            user.weeklyRank = ranked       
          else
            user.monthlyRank = ranked       

          user.save (err) ->
            console.log user.local.pseudo + ' who was ' + archives.rank + ' is now #' + user.dailyRank
            mailer.cLog 'Error at '+__filename,err if err
            leaders.push user if (ranked < 4) 
            callback leaders if (ranked > 3) or (ranked >= userSorted.length)

  scoreUpdate: (type, user, done) ->
    typeTxt =  if type == 1 then  'Today' else if type == 2 then  'last Week' else 'last Month'
    lastData = if type == 1 then  user.daily else if type == 2 then  user.weekly else user.monthly
    
    # Calculate score of the user for the given period of time
    getScore lastData, (score) ->
      console.log "[" + typeTxt + "] new score for " + user.local.pseudo + " " + typeTxt + " is " + score

      # Prepare update for global score of the user
      prepareGlobal =
        xp      : user.xp
        level   : user.level
        shareTW : user.global.shareTW
        shareFB : user.global.shareFB
      # Calculate global score of the user
      getScore prepareGlobal, (globalScore) ->
        console.log "[" + typeTxt + "] new global score for " + user.local.pseudo + " is " + globalScore

        # Update our user
        User.findById(user._id).exec (err, user) ->
          mailer.cLog 'Error at '+__filename,err if err

          #update global score
          user.globalScore = globalScore
          
          #Number of the week, for statistics purpose.
          if type == 1
            lastData.day = moment().subtract("days", 1).day()
          
            #Last week score
            user.dailyScore = score
            
            #reset week
            user.daily.xp = 0
            user.daily.level = 0
            user.daily.shareFB = 0
            user.daily.shareTW = 0
            
            #take weekly value and push them into the archives
            user.dailyArchives.push lastData
          if type == 2
            lastData.week = moment().subtract("weeks", 1).week()
          
            #Last week score
            user.weeklyScore = score
            
            #reset week
            user.weekly.xp = 0
            user.weekly.level = 0
            user.weekly.shareFB = 0
            user.weekly.shareTW = 0
            
            lastData.rank = user.weeklyRank 
            #take weekly value and push them into the archives
            user.weeklyArchives.push lastData

          if type == 3
            lastData.month = moment().subtract("months", 1).month()
          
            #Last week score
            user.monthlyScore = score
            
            #reset week
            user.monthly.xp = 0
            user.monthly.level = 0
            user.monthly.shareFB = 0
            user.monthly.shareTW = 0
            
            lastData.rank = user.monthlyRank 

            #take monthly value and push them into the archives
            user.monthlyArchives.push lastData

          user.save (err) ->
            mailer.cLog 'Error at '+__filename,err if err
            done user
  # TYPE:
  # 1 : daily
  # 2 : weekly
  # 3 : monthly
  generateLadder: (type, callback) ->
    typeTxt = if type == 1 then  'Today' else if type == 2 then  'last Week' else 'last Month'
    self = this
    
    # update the score for all our users.
    User.find({}).sort("-_id").exec (err, usersList) ->
      mailer.cLog 'Error at '+__filename,err if err

      _.each usersList, (user, index) ->
        self.scoreUpdate type, user, (done) ->
          currScore = if type == 1 then 'D-' + done.dailyScore else if type == 2 then 'W-' + done.weeklyScore else 'M-' + done.monthlyScore
          console.log "[" + typeTxt + "] User " + done.local.pseudo + " has been updated " + currScore + " g " + done.globalScore
      callback()

  actionInc: (user, action) ->
    query = undefined
    if action is "twitter"
      query =
        "daily.shareTW": 1
        "weekly.shareTW": 1
        "monthly.shareTW": 1
        "global.shareTW": 1
    else if action is "facebook"
      query =
        "daily.shareFB": 1
        "weekly.shareFB": 1
        "monthly.shareFB": 1
        "global.shareFB": 1
    else
      query = false
    if query
      User.findByIdAndUpdate(user._id,
        $inc: query
      ).exec (err, userUpdated) ->
        mailer.cLog 'Error at '+__filename,err if err


  # Send all the notifications for the daily update
  spreadLadder: (top3,type, done)->
    if type == 1
      yesterday = moment().subtract('d', 1).format("ddd Do MMM")
      typeoff = 'daily'
    if type == 2
      lastWeek = moment().subtract('w', 1).format("w")
      typeoff = 'weekly'
    if type == 3
      lastMonth = moment().subtract('m', 1).format("MMMM GGGG")
      typeoff = 'monthly'
    # Initiate the newLeader variable here, else we'll get an undefined when we post on twitter.
    newLeader   = ''
    nLFb = ''
    newFollower = ''
    nFFB = ''
    _.each top3, (user, it) ->

      if type == 1
        archives = user.dailyArchives || []
        ranked = user.dailyRank
      if type == 2
        archives = user.weeklyArchives || []
        ranked = user.weeklyRank

      if type == 3
        archives = user.monthlyArchives || []
        ranked = user.monthlyRank

      diff = 0
      wasRanked = false
      if archives.length > 0
        lastTime =  archives.length - 1
        diff = archives[lastTime].rank - ranked
        wasRanked = if archives[lastTime].rank > 0 then true else false

      diffIcon  = if diff > 0 then 'arrow-up' else if diff == 0 then 'minus' else 'arrow-down' 
      diff      = Math.abs diff
      variable  = if wasRanked then '<i class="fa fa-' + diffIcon + '"></i> ' + diff else 'previously unranked'
      uText     = user.local.pseudo + ' is now ranked <strong>' + ranked + '</strong>, ' + variable + ' on the ' + typeoff + ' <i class="fa fa-list"></i>. ' 
      #Send a Global message
      sio.glob "fa fa-star", uText

      # Prepare notification
      notif =
        type: 'newLadderRank'
        idFrom: user._id
        from: 'Challenge Master'
        link1: './leaderboard'
        title: 'Congratulation!! You are now ranked ' + ranked
        icon: 'fa fa-star'
        to: ''
        link2: ''
        message: ''
          
      notifs.newNotif([user._id], true, notif);

      #define the new leader
      if ranked == 1
        newLeader += user.local.pseudo + if user.twitter.username then ' (@' + user.twitter.username + ')' else ''
        nLFb += user.local.pseudo
      #define the new follower
      if ranked == 2
        newFollower += 'and '+ user.local.pseudo + if user.twitter.username then ' (@' + user.twitter.username + ') 2nd' else ''
        nFFB += 'and '+ user.local.pseudo + ' for his/her 2nd place'

    # setup our tweet & fb Post
    if type == 1
      tweet = "New daily ranking "+yesterday+" up! #GG "+newLeader+" 1st "+newFollower+"!! http://goo.gl/3VjsJd #CyfLadder #CYFDaily."
      fbWall= "The daily #ranking for yesterday "+yesterday+" is now live! Congratulation to our new leader "+nLFb+" "+nFFB+"! See the leaderboard here: http://goo.gl/3VjsJd #CyfLadder #CYFDaily"
    if type == 2
      tweet = "Weekly ranking #"+lastWeek+" live! #GG "+newLeader+" 1st "+newFollower+"! http://goo.gl/3VjsJd #CyfLadder #CYFWeekly"
      fbWall= "Our weekly #ranking for the week "+lastWeek+" is now live! Congratulation to our new leader "+nLFb+" "+nFFB+"! See the leaderboard here: http://goo.gl/3VjsJd #CyfLadder #CYFWeekly"
    if type == 3
      tweet = "New ranking for "+lastMonth+": 1st "+newLeader+" "+newFollower+" #GG! http://goo.gl/3VjsJd #CyfLadder #CYFMonthly"
      fbWall= "The #ranking for "+lastMonth+" is now available! Our deepest congratulations to the leader of the past month "+nLFb+" "+nFFB+"! You can see the leaderboard here: http://goo.gl/3VjsJd #CyfLadder #CYFMonthly"

    # Lets  spush on our timeline to let players now about the new Leaderboard
    # Tweet
    if appKeys.app_config.twitterPushNews == true
      social.postTwitter false, tweet, (tweetD) ->
        if appKeys.app_config.facebookPushNews == true
          social.updateWall fbWall, false, (dataFB) ->
            # Twitter + Facebook
            if type == 1
              notifText = 'The daily ranking for yesterday <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a> <a target="_blank" href="https://www.facebook.com/cyfapp/posts/'+dataFB.id+'" title="see facebook post"><i class="fa fa-facebook"></i></a>.'
            if type == 2
              notifText = 'The weekly ranking <strong>'+lastWeek+'</strong> <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a> <a target="_blank" href="https://www.facebook.com/cyfapp/posts/'+dataFB.id+'" title="see facebook post"><i class="fa fa-facebook"></i></a>.'
            if type == 3
              notifText = 'The ranking for '+lastMonth+' <a href="./leaderboard" title="leaderboard">is now available</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a> <a target="_blank" href="https://www.facebook.com/cyfapp/posts/'+dataFB.id+'" title="see facebook post"><i class="fa fa-facebook"></i></a>.'
        else
          # Twitter Only
          if type == 1                
            notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a>.'
          if type == 2              
            notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a>.'
          if type == 3
            notifText = 'The ranking for <strong>'+lastMonth+'</strong> <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a>.'
    else if appKeys.app_config.facebookPushNews == true
      social.updateWall fbWall, false, (data) ->
        # Facebook Only
        if type == 1                
          notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://www.facebook.com/cyfapp/posts/'+data.id+'" title="see facebook post"><i class="fa fa-facebook"></i></a>.'
        if type == 2              
          notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a>.'
        if type == 3
          notifText = 'The ranking for <strong>'+lastMonth+'</strong> <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a>.'
    else
      # Cyf Only, no tweet nor fb wall
      if type == 1     
        notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>!'
      if type == 2  
        notifText = 'The ranking for the week #'+lastWeek+' <a href="./leaderboard" title="leaderboard">is live</a>!'
      if type == 3
        notifText = 'The ranking for <strong>'+lastMonth+'</strong> <a href="./leaderboard" title="leaderboard">is live</a>!'
    
    sio.glob "fa fa-list", notifText
    done 'ranking ' + typeoff + ' updated'
