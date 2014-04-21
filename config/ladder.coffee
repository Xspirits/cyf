User = require("../app/models/user")

getScore = (data, done) ->
  finalScore = undefined
  finalScore = (data.xp * (1 + data.level)) + (250 * data.shareTW) + (250 * data.shareFB)
  done finalScore

module.exports = (async, schedule, mailer, _, sio, ladder, moment, social, appKeys, xp, notifs,users)->

  #
  # LEADER BOARD
  #
  getLeaderboards: (type,scale, done) ->
    self = this
    if type is "score"
      if scale == 'global'
        query = '-globalScore level'
        where = 'globalScore'
      else
        query = scale + "Rank level"
        where = scale + "Score"
      User.find({}).sort(query).where(where).gte(1).select("-notifications -friends -challengeRateHistoric").exec (err, challengers) ->
        mailer.cLog 'Error at '+__filename,err if err
        console.log challengers
        done challengers

  rankUser: (type, callback) ->
    typeTxt =  if type == 1 then  'yesterday' else if type == 2 then  'the last Week' else 'the last Month'
    hash =  if type == 1 then  '#dailyLadder' else if type == 2 then  '#weeklyLadder' else '#monthlyLadder'
    sorting = if type == 1 then 'dailyScore' else if type == 2 then 'weeklyScore' else 'monthlyScore'

    sort    = '-' + sorting
    User.find({}).sort(sort).gte(1).exec (err, userSorted) ->
      mailer.cLog 'Error at '+__filename,err if err
      buffed = []
      leaders = []

      _.each userSorted, (user, index)->
        buffed.push
          id: index
          u: user
          tt:typeTxt
          h:hash
          s:sorting
      async.eachSeries buffed, ((dataU, cb) ->

        user = dataU.u
        ranked = dataU.id + 1
        typeTxt= dataU.tt
        hash=  dataU.h
        console.log '[' + typeTxt + '] Updating ' + user.local.pseudo + ' who will now be ranked ' + ranked
 
        User.findById(user._id).exec (err, user) ->
          mailer.cLog 'Error at '+__filename,err if err
          archives = if type == 1 then user.dailyArchives[user.dailyArchives.length-1] else if type == 2 then user.weeklyArchives[user.weeklyArchives.length-1] else user.monthlyArchives[user.monthlyArchives.length-1]

          if type == 1
            user.dailyRank = ranked
            if typeof user.facebook.token != 'undefined' and user.share.facebook == true
              action=
                name: 'rank'
                link: appKeys.cyf.app_domain + '/u/' + user.idCool
                message: "This is #awesome! I am now ranked #" + ranked + " on Challenge your friends! Who could dare challenging me on any game now haha?! The competition is here http://goo.gl/MofE3n! " + hash
                ladder:
                  title: ranked
              social.userAction user, action, (cb)->
                mailer.sendMail user,user.local.pseudo + ' Congratulation, you are now ranked #' + ranked + ' on Cyf','<p>Wow, you were able to reach the <strong>' + ranked + ' place</strong> on the ladder for ' + typeTxt + '. Amazing!</p><p>Stay strong, share and don\'t forget to have FUN on Challenge your Friends(Cyf)</p> <p><a href="http://goo.gl/MofE3n" target="_blank" title="See the leaderboard" > See Live </a></p>',true,'ladder_' + ranked 

            if typeof user.twitter.token != 'undefined' and user.share.twitter == true
              uTweet = 'Yea! I am now ranked ' + ranked + ' on the #CyfLadder of ' + typeTxt + ', that\'s great! @' + appKeys.twitterCyf.username + ' ' + hash 
              social.postTwitter user.twitter, uTweet, (cb)->
          else if type == 2
            user.weeklyRank = ranked
            if typeof user.facebook.token != 'undefined'  and user.share.facebook == true
              action=
                name: 'rank'
                link: appKeys.cyf.app_domain + '/u/' + user.idCool
                ladder:
                  title: ranked
              social.userAction user, action, (cb)->
                obj=
                  name: "I ranked " + ranked
                  description: user.local.pseudo + ' is now ranked ' + ranked + ' for ' + typeTxt + ' leaderboard on Challenge your friends'
                  message: "This is #awesome! I am now ranked #" + ranked + " among the challengers of #cyfapp. Well, I hope I will be able to keep things up and keep reaching the top, but the competition is here http://goo.gl/MofE3n! " + hash
                social.userActionWallPost user, obj, (cb)->
                  mailer.sendMail user,user.local.pseudo + ' Congratulation, you are now ranked #' + ranked + ' on Cyf','<p>Wow, you were able to reach the <strong>' + ranked + ' place</strong> on the ladder for ' + typeTxt + '. Amazing!</p><p>Stay strong, share and don\'t forget to have FUN on Challenge your Friends(Cyf)</p> <p><a href="http://goo.gl/MofE3n" target="_blank" title="See the leaderboard" > See Live </a></p>',true,'ladder_' + ranked 

            if typeof user.twitter.token != 'undefined' and user.share.twitter == true
              uTweet = 'Yea! I am now ranked ' + ranked + ' on the #CyfLadder of ' + typeTxt + ', that\'s great! @' + appKeys.twitterCyf.username + ' ' + hash 
              social.postTwitter user.twitter, uTweet, (cb)->      
          else
            user.monthlyRank = ranked    
            if typeof user.facebook.token != 'undefined'  and user.share.facebook == true
              action=
                name: 'rank'
                link: appKeys.cyf.app_domain + '/u/' + user.idCool
                ladder:
                  title: ranked
              social.userAction user, action, (cb)->
                obj=
                  name: "I ranked " + ranked
                  description: user.local.pseudo + ' is now ranked ' + ranked + ' for ' + typeTxt + ' leaderboard on Challenge your friends'
                  message: "This is #awesome! I am now ranked #" + ranked + " among the challengers of #cyfapp. Well, I hope I will be able to keep things up and keep reaching the top, but the competition is here http://goo.gl/MofE3n! " + hash
                social.userActionWallPost user, obj, (cb)->
                  mailer.sendMail user,user.local.pseudo + ' Congratulation, you are now ranked #' + ranked + ' on Cyf','<p>Wow, you were able to reach the <strong>' + ranked + ' place</strong> on the ladder for ' + typeTxt + '. Amazing!</p><p>Stay strong, share and don\'t forget to have FUN on Challenge your Friends(Cyf)</p> <p><a href="http://goo.gl/MofE3n" target="_blank" title="See the leaderboard" > See Live </a></p>',true,'ladder_' + ranked 

            if typeof user.twitter.token != 'undefined' and user.share.twitter == true
              uTweet = 'Yea! I am now ranked ' + ranked + ' on the #CyfLadder of ' + typeTxt + ', that\'s great! @' + appKeys.twitterCyf.username + ' ' + hash 
              social.postTwitter user.twitter, uTweet, (cb)->       

          user.save (err) ->
            console.log user.local.pseudo + ' who was ' + archives.rank + ' is now #' + user.dailyRank
            mailer.cLog 'Error at '+__filename,err if err
            leaders.push user if (ranked < 4) 
            cb() # show that no errors happened
        return
      ), (err) ->
        if err
          console.log "There was an error" + err
        else
          console.log 'Got the new leaders: ' + leaders.length
          callback leaders
        return

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

      async.eachSeries usersList, ((user, cb) ->
        self.scoreUpdate type, user, (done) ->
          currScore = if type == 1 then 'D-' + done.dailyScore else if type == 2 then 'W-' + done.weeklyScore else 'M-' + done.monthlyScore
          console.log "[" + typeTxt + "] User " + done.local.pseudo + " has been updated " + currScore + " g " + done.globalScore
        cb() # show that no errors happened
        return
      ), (err) ->
        if err
          console.log "There was an error" + err
        else
          callback()
        return

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
  spreadLadder: (top3, type, done)->
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

    _.each top3, (user) ->

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
        newFollower += 'and '+ user.local.pseudo + ' 2nd' + if user.twitter.username then ' (@' + user.twitter.username + ') 2nd' else ''
        nFFB += 'and '+ user.local.pseudo + ' for his/her 2nd place'

    # setup our tweet & fb Post
    if type == 1
      tweet = "New daily ranking "+yesterday+" up! GG "+newLeader+" 1st "+newFollower+"!! http://goo.gl/MofE3n #CyfLadder #CYFDaily."
      fbWall= "The daily #ranking for yesterday "+yesterday+" is now live! Congratulation to our new leader "+nLFb+" "+nFFB+"! See the leaderboard here: http://goo.gl/MofE3n #CyfLadder #CYFDaily"
    else if type == 2
      tweet = "Weekly ranking "+lastWeek+" live! GG "+newLeader+" 1st "+newFollower+"! http://goo.gl/MofE3n #CyfLadder #CYFWeekly"
      fbWall= "Our weekly #ranking for the week "+lastWeek+" is now live! Congratulation to our new leader "+nLFb+" "+nFFB+"! See the leaderboard here: http://goo.gl/MofE3n #CyfLadder #CYFWeekly"
    else
      tweet = "New ranking for "+lastMonth+": 1st "+newLeader+" "+newFollower+" GG! http://goo.gl/MofE3n #CyfLadder #CYFMonthly"
      fbWall= "The #ranking for "+lastMonth+" is now available! Our deepest congratulations to the leader of the past month "+nLFb+" "+nFFB+"! You can see the leaderboard here: http://goo.gl/MofE3n #CyfLadder #CYFMonthly"

    # Lets  spush on our timeline to let players now about the new Leaderboard
    # Tweet
    if appKeys.app_config.twitterPushNews == true
      social.postTwitter false, tweet, (tweetD) ->
        sLink = '<a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a>'
        if appKeys.app_config.facebookPushNews == true
          social.updateWall fbWall, false, (dataFB) ->
            # Twitter + Facebook
            fLink = '<a target="_blank" href="https://www.facebook.com/cyfapp/posts/'+dataFB.id+'" title="see facebook post"><i class="fa fa-facebook"></i></a>'
            if type == 1
              notifText = 'The daily ranking for yesterday <a href="./leaderboard" title="leaderboard">is live</a>! ' + sLink + ' ' + fLink + '.'
            if type == 2
              notifText = 'The weekly ranking <strong>'+lastWeek+'</strong> <a href="./leaderboard" title="leaderboard">is live</a>!  ' + sLink + ' ' + fLink + '.'
            if type == 3
              notifText = 'The ranking for '+lastMonth+' <a href="./leaderboard" title="leaderboard">is now available</a>!  ' + sLink + ' ' + fLink + '.'
            sio.glob "fa fa-list", notifText
            done 'ranking ' + typeoff + ' updated. <br>' + notifText
        else
          # Twitter Only
          if type == 1                
            notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! ' + sLink + '.'
          if type == 2              
            notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! ' + sLink + '.'
          if type == 3
            notifText = 'The ranking for <strong>'+lastMonth+'</strong> <a href="./leaderboard" title="leaderboard">is live</a>! ' + sLink + '.'
          sio.glob "fa fa-list", notifText
          done 'ranking ' + typeoff + ' updated <br> ' + notifText
    else if appKeys.app_config.facebookPushNews == true
      social.updateWall fbWall, false, (dataFB) ->
        fLink = '<a target="_blank" href="https://www.facebook.com/cyfapp/posts/'+dataFB.id+'" title="see facebook post"><i class="fa fa-facebook"></i></a>'
        # Facebook Only
        if type == 1                
          notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! ' + fLink + '.'
        if type == 2              
          notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! ' + fLink + '.'
        if type == 3
          notifText = 'The ranking for <strong>'+lastMonth+'</strong> <a href="./leaderboard" title="leaderboard">is live</a>! ' + fLink + '.'
        sio.glob "fa fa-list", notifText
        done 'ranking ' + typeoff + ' updated <br> ' + notifText
    else
      # Cyf Only, no tweet nor fb wall
      if type == 1     
        notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>!'
      if type == 2  
        notifText = 'The ranking for the week #'+lastWeek+' <a href="./leaderboard" title="leaderboard">is live</a>!'
      if type == 3
        notifText = 'The ranking for <strong>'+lastMonth+'</strong> <a href="./leaderboard" title="leaderboard">is live</a>!'
      sio.glob "fa fa-list", notifText
      return done 'ranking ' + typeoff + ' updated <br> ' + notifText
    

