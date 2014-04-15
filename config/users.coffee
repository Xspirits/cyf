# load up the user model
User = require("../app/models/user")
Challenge = require("../app/models/challenge")

module.exports =  (_, mailer, appKeys, genUID, social, relations, notifs, moment) ->
  validateEmail: (hash, done) ->
    User.findOne {verfiy_hash:hash}, (err, user) ->
      mailer.cLog 'Error at '+__filename,err if err

      if user
        user.verified = true        
        user.save (err) ->
          mailer.cLog 'Error at '+__filename,err if err
          done user
      else
        done false

  retrievePassword: (email, done) ->
    # Fin our user:
    User.findOne {'local.email': email}, (err, user)->
      mailer.cLog 'Error at '+__filename,err if err
      password = genUID.generate()
      user.local.password = user.generateHash(password)
      user.save (err, user) ->
        mailer.cLog 'Error at '+__filename,err if err
        mailer.sendMail user,'[Cyf]Your password has been reseted','<h2>New Password</h2> <p>At your request we have generated a new password for your.</p><p> Your news credentials: <ul><li>email:<strong>' + user.local.email + '</strong></li><li>password: <strong> ' + password + '</strong></li></p><p>You can login here: <a href="http://www.cyf-app.co/login" target="_blank" title="Login">http://www.cyf-app.co/login</a></p><p><strong> You are the only person who have this information, if you want a new password, please reset it through the same procedure.</strong></p>',false
        done true
        
  changePassword: (user, newPwd, done) ->
    # Fin our user:
    User.findById user._id, (err, user)->
      mailer.cLog 'Error at '+__filename,err if err
      user.local.password = user.generateHash(newPwd)
      user.save (err, user) ->
        mailer.cLog 'Error at '+__filename,err if err
        mailer.sendMail user,'[Cyf]Your password has been changed!','<h2>You have changed your Password</h2> <p>We send you this mail to confirm that your password has been updated successfully.</p><p> Your news credentials: <ul><li>email:<strong> ' + user.local.email + '</strong></li><li>password:<strong> ' + newPwd + '</strong></li></p><p>You can login here: <a href="http://www.cyf-app.co/login" target="_blank" title="Login">http://www.cyf-app.co/login</a></p><p><strong> You are the only person who have this information, if you want a new password, please reset it through the same procedure.</strong></p>',false
        done true

  updateSettings: (data, done) ->
    query = undefined
    if data.target is "facebook" or data.target is "twitter"
      if data.target is "facebook"
        query = $set:
          "share.facebook": data.value
      else
        query = $set:
          "share.twitter": data.value
      User.findByIdAndUpdate data._id, query, (err) ->
        mailer.cLog 'Error at '+__filename,err if err
        done true
    else
      done false

  getFriendList: (id, done) ->
    User.findById(id).populate({path: 'friends.idUser', select: '-notifications' }).exec (err, user) ->
        mailer.cLog 'Error at '+__filename,err if err
        done user

  setOffline: (user, done) ->
    User.findByIdAndUpdate user._id,
      isOnline: false
    , (err) ->
      mailer.cLog 'Error at '+__filename,err if err
      done true

  
  ###
  Return NUMBER users whom will be used as judge in the tribunal
  for a given ongoing case.
  @param  {Object}   exclude [_id of users to exclude: the challenger and challenged]
  @param  {Number}   number  [number of judges we want]
  @param  {Function} done    [callback]
  @return {Array}           [Array of users' object]
  ###
  pickTribunalUsers: (exclude, number, done) ->
    num = ((if (number) then number else 1))
    nearNum = [
      Math.random()
      0
    ]
    User.find(
      $and: [
        {
          _id:
            $ne: exclude.one
        }
        {
          _id:
            $ne: exclude.two
        }
      ]
      userRand:
        $near: nearNum
    ).limit(num).exec (err, randomUser) ->
      mailer.cLog 'Error at '+__filename,err if err
      done randomUser

    return

  setJudges: (id, users, done) ->
    query = []
    i = users.length - 1

    while i >= 0
      query.push users[i]._id
      i--
    User.update(
      _id:
        $in: query
    ,
      $addToSet:
        tribunal: id
    ,
      multi: true
    ).exec (err, randomUser) ->
      mailer.cLog 'Error at '+__filename,err if err
      done true

    return

  
  ###
  Delete the ongoing Case and add an item in the tribunalHistoric
  @param  {[type]}   data [description]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  votedOnCase: (data, done) ->
    query = []
    currentDate = new Date()
    idSplice = data.id

    User.findByIdAndUpdate(data.idUser,
      $push:
        tribunalHistoric:
          idCase: data.id
          answer: data.answer
          voteDate: currentDate
    ).exec (err, doc) ->
      mailer.cLog 'Error at '+__filename,err if err
      idx = (if doc.tribunal then doc.tribunal.indexOf(idSplice) else -1)
      
      # is it valid?
      if idx isnt -1
        
        # remove it from the array.
        doc.tribunal.splice idx, 1
        
        # save the doc
        doc.save (err, doc) ->
          mailer.cLog 'Error at '+__filename,err if err
          done true
      else
        mailer.cLog 'Error at '+__filename,err if err
        return done 'Error when slicing'

  getUsers: (limit, done) ->
    User.find({}).sort("-_id").limit(limit).exec (err, data) ->
      mailer.cLog 'Error at '+__filename,err if err
      done data

  ###
  Return the list of existing users
  @param  {String} arg    [(optional) parameters]
  @param  {[type]} return [description]
  @return {[type]}        [description]
  ###
  getUserList: (done) ->
    User.find({}).sort("-_id").exec (err, data) ->
      mailer.cLog 'Error at '+__filename,err if err
      done data
  ###
  Return the result of a given query for the user model
  @param  {String} arg    [(optional) parameters]
  @param  {[type]} return [description]
  @return {[type]}        [description]
  ###
  getUser: (id, done) ->
    checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    isObj = checkForHexRegExp.test(id)
    if isObj
      User.findById(id).populate("friends.idUser").exec (err, data) ->
        mailer.cLog 'Error at '+__filename,err if err
        done data
    else
      User.findOne(idCool: id).populate("friends.idUser").exec (err, data) ->
        mailer.cLog 'Error at '+__filename,err if err
        done data  
  ###
  Request a friendship with another user
  @param  {Object}   data [From, id, to, id]
  @param  {Function} done [callback]
  @return {Boolean}        [true/false]
  ###
  askFriend: (data, done) ->
    
    # check if the desired user exist, then launch the request
    from = data.from
    uTo = data.to
    
    #Check if the targeted user exist
    User.findById(uTo.id).exec (err, data) ->
      mailer.cLog 'Error at '+__filename,err if err
      currentDate = new Date
      
      #existing user
      if data
        relations.create from, uTo, true, (result) ->
          relations.create uTo, from, false, (result) ->
            return done data 
      else
        done false, " desired user not found"
  
  ###
  Confirm a friend relationship with another user
  @param  {Object}   data [From, id, to, id]
  @param  {Function} done [callback]
  @return {Boolean}        [true/false]
  ###
  confirmFriend: (data, done) ->
    
    # check if the desired user exist, then launch the request
    from = data.from
    uTo = data.to
    relations.accept from, uTo, (result) ->
      relations.accept uTo, from, done  if result
      return

    return

  
  ###
  Confirm a friend relationship with another user
  @param  {Object}   data [From, id, to, id]
  @param  {Function} done [callback]
  @return {Boolean}        [true/false]
  ###
  denyFriend: (data, done) ->
    
    # check if the desired user exist, then launch the request
    from = data.from
    uTo = data.to
    relations.deny from, uTo, (result) ->
      relations.deny uTo, from, done  if result
      return

    return

  
  ###
  Delete the rate request and add an item in challengeRateHistoric
  @param  {[type]}   data [description]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  ratedChallenge: (data, done) ->
    query = []
    currentDate = new Date()
    idSplice = data.id #Challenge ID

    User.findByIdAndUpdate(data.idUser,
      $push:
        challengeRateHistoric:
          _idChallenge: data.id
          rateDate: currentDate
          rating: data.rating
    ).exec (err, doc) ->
      mailer.cLog 'Error at '+__filename,err if err
      idx = (if doc.challengeRate then doc.challengeRate.indexOf(idSplice) else -1)
      
      # is it valid?
      if idx isnt -1
        
        # remove it from the array.
        doc.challengeRate.splice idx, 1
        
        # save the doc
        doc.save (err, doc) ->
          mailer.cLog 'Error at '+__filename,err if err
          return done doc
          

        
        # stop here, otherwise 404
        return
      done false, "wrong whilst splicing. users l.280"

    return

  
  ###
  Ask users to review the challenge they've just done.
  @param  {Object}   idChallenge [id : _idChallenge (Object),idChallenged (Object),idChallenger (Object)]
  @param  {Function} done        [description]
  @return {[type]}               [description]
  ###
  askRate: (data, done) ->
    query = [
      data._idChallenger
      data._idChallenged
    ]
    User.update(
      _id:
        $in: query
    ,
      $addToSet:
        challengeRate: data.id
    ,
      multi: true
    ).exec (err, user) ->
      mailer.cLog 'Error at '+__filename,err if err
      done true

    return

  userToRateChallenges: (idUser, done) ->
    User.findById(idUser).populate("challengeRate").exec (err, data) ->
      
      # if there are any errors, return the error
      return done(err)  if err
      done data
  #
  # GAMES
  #

  linkLol: (data, done) ->
    region = data.region
    name = data.summonerName
    UID = data.id
    social.findSummonerLol region, name, (summoner)->
      if summoner.id
        lol =
          idProfile : parseInt(summoner.id, 10)
          name : summoner.name
          region : region
          profileIconId : parseInt(summoner.profileIconId, 10)
          revisionDate : new Date(summoner.revisionDate * 1000)
          summonerLevel : parseInt(summoner.summonerLevel, 10)
          profileIconId_confirm: 0
        User.findByIdAndUpdate UID,
          leagueoflegend: lol
        , (err, user) ->
          mailer.cLog 'Error at '+__filename,err if err
          return done true
      else
        return done false, "summoner not found"

  linkLolIconPick: (data, done)->
    UID = data.id
    icon = parseInt(data.profileIconId_confirm,10)
    User.findByIdAndUpdate UID,
      'leagueoflegend.profileIconId_confirm': icon
    , (err, user) ->
      mailer.cLog 'Error at '+__filename,err if err
      return done true

  linkLol_confirm: (user, done)->
    region = user.leagueoflegend.region
    name = user.leagueoflegend.name
    UID = user._id
    social.findSummonerLol region, name, (summoner)->
      console.log ( summoner.profileIconId + ' == ' + user.leagueoflegend.profileIconId_confirm)
      mailer.cLog 'linkLol attempt for  '+user.local.pseudo,  summoner.profileIconId + ' == ' + user.leagueoflegend.profileIconId_confirm
      if summoner.profileIconId == user.leagueoflegend.profileIconId_confirm
        User.findByIdAndUpdate UID,
          'leagueoflegend.confirmed': true
        , (err, user) ->
          mailer.cLog 'Error at '+__filename,err if err
          return done true
      else
        return done "Icons did not match!"
  ###
  Unlink a league of legend account
  @param  {[type]}   user [description]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  unlinkLol: (id, done) ->
    User.findById(id).exec (err, user) ->
      mailer.cLog 'Error at '+__filename,err if err
      lol = user.leagueoflegend
      lol.idProfile = `undefined`
      lol.name = `undefined`
      lol.profileIconId = `undefined`
      lol.revisionDate = `undefined`
      lol.summonerLevel = `undefined`
      user.save (err) ->
        mailer.cLog 'Error at '+__filename,err if err
        done true

  ###
  Unlink a league of legend account
  @param  {[type]}   user [description]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  updateLastGames: (user, done) ->
    UID = user._id
    if user.leagueoflegend.confirmed == true
      championsList = social.lol_champion_list()
      social.getLastGames user.leagueoflegend.region, user.leagueoflegend.idProfile, (last10)->

        uGl = user.leagueoflegend.lastGames.length
        test = (uGl == 0 || user.leagueoflegend.lastGames[uGl - 1].gameId != last10[last10.length - 1].gameId)
        console.log test
        if(test == true)
          User.findById(UID).exec (err, user) ->
            mailer.cLog 'Error at '+__filename,err if err

            if(!user.leagueoflegend.lastGames)
              user.leagueoflegend.lastGames = []

            _.each last10, (game) ->
              g = game
              champ = _.find championsList, (champ) -> champ.id == g.championId

              console.log champ
              # Prepare detailed stats
              # prepare object
              aGame=
                championId: g.championId   #int Champion ID associated with game.
                championInfos: champ   
                createDate: moment(g.createDate).format('dddd DD MMMM HH[h]mm')    #long  Date that end game data was recorded, specified as epoch milliseconds.
                fellowPlayers: [game.fellowPlayers]    #[PlayerDto] Other players associated with the game.
                gameId: g.gameId    #long  Game ID.
                gameMode: g.gameMode    #string  Game mode. (legal values: CLASSIC, ODIN, ARAM, TUTORIAL, ONEFORALL, FIRSTBLOOD)
                gameType: g.gameType    #string  Game type. (legal values: CUSTOM_GAME, MATCHED_GAME, TUTORIAL_GAME)
                invalid: g.invalid     # Invalid flag.
                ipEarned: g.ipEarned    #int IP Earned.
                level: g.level     # Level.
                mapId: g.mapId     # Map ID.
                spell1: g.spell1    #int ID of first summoner spell.
                spell2: g.spell2    #int ID of second summoner spell.
                stats: g.stats # Statistics associated with the game for this summoner.
                subType: g.subType     #  Game sub-type. (legal values: NONE, NORMAL, BOT, RANKED_SOLO_5x5, RANKED_PREMADE_3x3, RANKED_PREMADE_5x5, ODIN_UNRANKED, RANKED_TEAM_3x3, RANKED_TEAM_5x5, NORMAL_3x3, BOT_3x3, CAP_5x5, ARAM_UNRANKED_5x5, ONEFORALL_5x5, FIRSTBLOOD_1x1, FIRSTBLOOD_2x2, SR_6x6, URF, URF_BOT)
                teamId: g.teamId    #int Team ID associated with game. Team ID 100 is blue team. Team ID 200 is purple team.

              user.leagueoflegend.lastGames.push aGame

            user.save (err) ->
              mailer.cLog 'Error at '+__filename,err if err
              done true
        else done false, 'already up to date'
    else done false, 'link an account firstly'
