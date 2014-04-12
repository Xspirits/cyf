module.exports = (schedule, mailer, _, sio, ladder, moment, social, appKeys, xp, notifs) ->
  
  # =============================================================================
  # XP&LEVEL HISTORY   ==========================================================
  # =============================================================================

  # Level and Xp update
  xpLevelUpdate         = new schedule.RecurrenceRule()
  xpLevelUpdate.hour    = [0,12]
  xpLevelUpdate.minute  = 30
  xpLevelUpdate.seconds = 0

  xpLevel = schedule.scheduleJob xpLevelUpdate, ->
    console.log 'xpLevel update start'

    xp.updateDaily (result)-> 
      console.log result

  # =============================================================================
  # LADDERS    ==================================================================
  # =============================================================================
  
  # Daily Ladder
  dailyRanking         = new schedule.RecurrenceRule()
  dailyRanking.hour    = 0
  dailyRanking.minute  = 1 # Let's avoid taking risks with setting 0h 0m 0s
  dailyRanking.seconds = 0

  dailyLadder = schedule.scheduleJob dailyRanking, ->
    console.log 'dailyLadder'

    ladder.createDailyLadder ->
      ladder.rankUser 'dailyRank', (top3)-> 
        yesterday = moment().subtract('d', 1).format("ddd Do MMM")
        # Initiate the newLeader variable here, else we'll get an undefined when we post on twitter.
        newLeader   = ''
        nLFb = ''
        newFollower = ''
        nFFB = ''
        _.each top3, (user, it) ->
          lastTime  = user.dailyArchives.length-1
          diff      = user.dailyArchives[lastTime].rank - user.dailyRank
          
          wasRanked = if user.dailyArchives[lastTime].rank > 0 then true else false
          diffIcon  = if diff > 0 then 'arrow-up' else if diff == 0 then 'minus' else 'arrow-down' 
          diff      = Math.abs diff
          variable  = if wasRanked then '<i class="fa fa-' + diffIcon + '"></i> ' + diff else 'previously unranked'
          uText     = user.local.pseudo + ' is now ranked <strong>' + user.dailyRank + '</strong>, ' + variable + '! daily <i class="fa fa-list"></i>. ' 
          #Send a Global message
          sio.glob "fa fa-star", uText

          # Prepare notification
          notif =
            type: 'newLadderRank'
            idFrom: user._id
            from: 'Challenge Master'
            link1: './leaderboard'
            title: 'Congratulation!! You are now ranked ' + user.dailyRank
            icon: 'fa fa-star'
            to: ''
            link2: ''
            message: ''
              
          notifs.newNotif([user._id], true, notif);

          #define the new leader
          if user.dailyRank == 1
            newLeader += user.local.pseudo + if user.twitter.username then ' (@' + user.twitter.username + ')' else ''
            nLFb += user.local.pseudo
          #define the new follower
          if user.dailyRank == 2
            newFollower += 'and '+ user.local.pseudo + if user.twitter.username then ' (@' + user.twitter.username + ') 2nd' else ''
            nFFB += 'and '+ user.local.pseudo + ' for his/her 2nd place'

          if it + 1 >= top3.length
            # Tweet
            if appKeys.app_config.twitterPushNews == true
              # Lets  spush on our timeline to let players now about the new Leaderboard
              twitt     = "New #dailyRanking "+yesterday+" up! #GG "+newLeader+" 1st "+newFollower+"!! http://goo.gl/3VjsJd #CyfLadder #CYFDaily."
            
              social.postTwitter false, twitt, (tweetD) ->

                if appKeys.app_config.facebookPushNews == true
                  message= "The daily #ranking for yesterday "+yesterday+" is now live! Congratulation to our new leader "+nLFb+" "+nFFB+"! See the leaderboard here: http://goo.gl/3VjsJd #CyfLadder #CYFDaily"
                  social.updateWall message, false, (data) ->

                    text = 'The daily ranking for yesterday <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a> <a target="_blank" href="https://www.facebook.com/cyfapp/posts/'+data.id+'" title="see facebook post"><i class="fa fa-facebook"></i></a>.'
                    sio.glob "fa fa-list", text
                else
                  text = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i> see</a>.'
                  sio.glob "fa fa-list", text
            else
              text = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>!'
              sio.glob "fa fa-list", text

  # Weekly Ladder
  weeklyRanking           = new schedule.RecurrenceRule()
  weeklyRanking.dayOfWeek = 1 #Monday
  weeklyRanking.hour      = 0
  weeklyRanking.minute    = 2 # Let's avoid taking risks with setting 0h 0m 0s
  weeklyRanking.seconds   = 0

  weekLadder = schedule.scheduleJob weeklyRanking, ->
    ladder.createWeeklyLadder ->

      ladder.rankUser 'weeklyRank', (top3)-> 

        lastWeek = moment().subtract('w', 1).format("w")
        console.log "Updating ladder for the past week " + lastWeek
        newLeader   = ''
        nLFb = ''
        newFollower = ''
        nFFB = ''
        _.each top3, (user, it) ->
          lastTime  = user.weeklyArchives.length-1
          diff      = user.weeklyArchives[lastTime].rank - user.weeklyRank
          
          wasRanked = if user.weeklyArchives[lastTime].rank > 0 then true else false
          diffIcon  = if diff > 0 then 'arrow-up' else if diff == 0 then 'minus' else 'arrow-down' 
          diff      = Math.abs diff
          variable  = if wasRanked then '<i class="fa fa-' + diffIcon + '"></i> ' + diff else 'previously unranked'
          uText     = user.local.pseudo + ' is now ranked <strong>' + user.weeklyRank + '</strong>, ' + variable + '! weekly <i class="fa fa-list"></i>. ' 

          # Prepare notification
          notif =
            type: 'newLadderRank'
            idFrom: user._id
            from: 'Challenge Master'
            link1: './leaderboard'
            title: 'Congratulation!! You are now ranked ' + user.dailyRank
            icon: 'fa fa-star'
            to: ''
            link2: ''
            message: ''
              
          notifs.newNotif([user._id], true, notif);

          #define the new leader
          if user.weeklyRank == 1
            newLeader += user.local.pseudo + if user.twitter.username then ' (@' + user.twitter.username + ')' else ''
            nLFb += user.local.pseudo
          #define the new follower
          if user.weeklyRank == 2
            newFollower += 'and '+ user.local.pseudo + if user.twitter.username then ' (@' + user.twitter.username + ') 2nd' else ''
            nFFB += 'and '+ user.local.pseudo + ' for his/her 2nd place'

          sio.glob "fa fa-star", '<i class="fa fa-star"></i> ' + uText
          if it + 1 >= top3.length
            # Lets push on our timeline to let players now about the new Leaderboard
            twitt     = "Weekly #ranking #"+lastWeek+" live! #GG "+newLeader+" 1st "+newFollower+"! http://goo.gl/3VjsJd #CyfLadder #CYFWeekly"
            
            if appKeys.app_config.twitterPushNews == true
              social.postTwitter false, twitt, (tweetD) ->

                if appKeys.app_config.facebookPushNews == true
                  message= "Our weekly #ranking for the week "+lastWeek+" is now live! Congratulation to our new leader "+nLFb+" "+nFFB+"! See the leaderboard here: http://goo.gl/3VjsJd #CyfLadder #CYFWeekly"
                  social.updateWall message, false, (data) ->

                    text = 'The weekly ranking <strong>'+lastWeek+'</strong> <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a> <a target="_blank" href="https://www.facebook.com/cyfapp/posts/'+data.id+'" title="see facebook post"><i class="fa fa-facebook"></i></a>.'
                    sio.glob "fa fa-list", text
                else
                  text = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i> see</a>.'
                  sio.glob "fa fa-list", text
            else
              text = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>!'
              sio.glob "fa fa-list", text
  
  # Monthly Ladder
  monthlyRanking         = new schedule.RecurrenceRule()
  monthlyRanking.date    = 1 # 1st of each month
  monthlyRanking.hour    = 0 # at 1 AM
  monthlyRanking.minute  = 3
  monthlyRanking.seconds = 0

  monthlyLadder = schedule.scheduleJob monthlyRanking, ->
    ladder.createMonthlyLadder ->

      ladder.rankUser 'monthlyRank', (top3)-> 
        lastMonth = moment().subtract('m', 1).format("MMMM GGGG")
        console.log "Updated ladder for the past month " + lastMonth
        newLeader   = ''
        nLFb = ''
        newFollower = ''
        nFFB = ''
        _.each top3, (user, it) ->
          lastTime  = user.monthlyArchives.length-1
          diff      = user.monthlyArchives[lastTime].rank - user.monthlyRank
          
          wasRanked = if user.monthlyArchives[lastTime].rank > 0 then true else false
          diffIcon  = if diff > 0 then 'arrow-up' else if diff == 0 then 'minus' else 'arrow-down' 
          diff      = Math.abs diff
          variable  = if wasRanked then '<i class="fa fa-' + diffIcon + '"></i> ' + diff else 'previously unranked'
          uText     = user.local.pseudo + ' is now ranked <strong>' + user.monthlyRank + '</strong>, ' + variable + '! monthly <i class="fa fa-list"></i>. ' 
          
          # Prepare notification
          notif =
            type: 'newLadderRank'
            idFrom: user._id
            from: 'Challenge Master'
            link1: './leaderboard'
            title: 'Congratulation!! You are now ranked ' + user.monthlyRank
            icon: 'fa fa-star'
            to: ''
            link2: ''
            message: ''

          notifs.newNotif([user._id], true, notif);

          #define the new leader
          if user.monthlyRank == 1
            newLeader += user.local.pseudo + if user.twitter.username then ' (@' + user.twitter.username + ')' else ''
            nLFb += user.local.pseudo
          #define the new follower
          if user.monthlyRank == 2
            newFollower += 'and '+ user.local.pseudo + if user.twitter.username then ' (@' + user.twitter.username + ') 2nd' else ''
            nFFB += 'and '+ user.local.pseudo + ' for his/her 2nd place'

          sio.glob "fa fa-star", '<i class="fa fa-star"></i><i class="fa fa-star"></i> ' + uText
          if it + 1 >= top3.length
            # Lets push on our timeline to let players now about the new Leaderboard
            twitt     = "The #ranking for "+lastMonth+": 1st "+newLeader+" "+newFollower+" #GG! http://goo.gl/3VjsJd #CyfLadder #CYFMonthly"
            
            if appKeys.app_config.twitterPushNews == true
              social.postTwitter false, twitt, (tweetD) ->

                if appKeys.app_config.facebookPushNews == true
                  message= "The #ranking for "+lastMonth+" is now available! Our deepest congratulations to the leader of the past month "+nLFb+" "+nFFB+"! You can see the leaderboard here: http://goo.gl/3VjsJd #CyfLadder #CYFMonthly"
                  social.updateWall message, false, (data) ->

                    text = 'The ranking for '+lastMonth+' <a href="./leaderboard" title="leaderboard">is now available</a>! <a target="_blank" href="https://twitter.com/'+ tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a> <a target="_blank" href="https://www.facebook.com/cyfapp/posts/'+data.id+'" title="see facebook post"><i class="fa fa-facebook"></i></a>.'
                    sio.glob "fa fa-list", text
                else
                  text = 'The ranking for <strong>'+lastMonth+'</strong> <a href="./leaderboard" title="leaderboard">is live</a>! <a target="_blank" href="https://twitter.com/'+ data.user.screen_name + '/status/' + data.id_str + '" title="see tweet"><i class="fa fa-twitter"></i> see</a>.'
                  sio.glob "fa fa-list", text
            else
              text = 'The ranking for <strong>'+lastMonth+'</strong> <a href="./leaderboard" title="leaderboard">is live</a>!'
              sio.glob "fa fa-list", text