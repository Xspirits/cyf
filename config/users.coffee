# load up the user model
User = require("../app/models/user")
Challenge = require("../app/models/challenge")
notifs = require("../app/functions/notifications")
relations = require("./relations")
social = require("./social")
_ = require("underscore")
module.exports =
  updateSettings: (data, done) ->
    query = undefined
    if data.target is "facebook" or data.target is "twitter"
      if data.target is "facebook"
        query = $set:
          "share.facebook": data.value
      else
        query = $set:
          "share.twitter": data.value
      console.log query
      User.findByIdAndUpdate data._id, query, (err) ->
        throw err  if err
        done true
        return

    else
      done false
    return

  linkLol: (data, done) ->
    region = data.region
    name = data.summonerName
    social.findSummonerLol region, name, (summoner) ->
      if summoner.id
        User.findById(data._id).exec (err, user) ->
          throw err  if err
          lol = user.leagueoflegend
          lol.idProfile = parseInt(summoner.id, 10)
          lol.name = summoner.name
          lol.profileIconId = parseInt(summoner.profileIconId, 10)
          lol.revisionDate = new Date(summoner.revisionDate * 1000)
          lol.summonerLevel = parseInt(summoner.summonerLevel, 10)
          user.save (err) ->
            throw err  if err
            console.log user
            done true

          return

      else
        done false, "summoner not found"
      return

    return

  
  ###
  Unlink a league of legend account
  @param  {[type]}   user [description]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  unlinkLol: (id, done) ->
    User.findById(id).exec (err, user) ->
      throw err  if err
      lol = user.leagueoflegend
      lol.idProfile = `undefined`
      lol.name = `undefined`
      lol.profileIconId = `undefined`
      lol.revisionDate = `undefined`
      lol.summonerLevel = `undefined`
      user.save (err) ->
        throw err  if err
        console.log user
        done true

      return

    return

  setOffline: (user, done) ->
    User.findByIdAndUpdate user._id,
      isOnline: false
    , (err) ->
      throw err  if err
      done true
      return

    return

  
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
      throw err  if err
      done randomUser

    return

  setJudges: (id, users, done) ->
    query = []
    i = users.length - 1

    while i >= 0
      query.push users[i]._id
      i--
    console.log query
    User.update(
      _id:
        $in: query
    ,
      $addToSet:
        tribunal: id
    ,
      multi: true
    ).exec (err, randomUser) ->
      throw err  if err
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
      throw err  if err
      console.log doc
      idx = (if doc.tribunal then doc.tribunal.indexOf(idSplice) else -1)
      
      # is it valid?
      if idx isnt -1
        
        # remove it from the array.
        doc.tribunal.splice idx, 1
        
        # save the doc
        doc.save (err, doc) ->
          if err
            throw err
          else
            done true
          return

        
        # stop here, otherwise 404
        return
      throw "wrong whilst splicing"

    return

  
  ###
  Return the list of existing users
  @param  {String} arg    [(optional) parameters]
  @param  {[type]} return [description]
  @return {[type]}        [description]
  ###
  getUserList: (done) ->
    User.find({}).sort("-_id").exec (err, data) ->
      throw err  if err
      
      # console.log(data);
      done data

    return

  
  ###
  Return the result of a given query for the user model
  @param  {String} arg    [(optional) parameters]
  @param  {[type]} return [description]
  @return {[type]}        [description]
  ###
  getUser: (id, done) ->
    
    # console.log(arg);
    User.findOne(idCool: id).populate("friends.idUser").exec (err, data) ->
      throw err  if err
      done data

    return

  
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
      throw err  if err
      currentDate = new Date
      
      #existing user
      if data
        relations.create from, uTo, true, (result) ->
          relations.create uTo, from, false, done  if result
          return

      else
        done false, " desired user not found"
      return

    return

  
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
      throw err  if err
      idx = (if doc.challengeRate then doc.challengeRate.indexOf(idSplice) else -1)
      
      # is it valid?
      if idx isnt -1
        
        # remove it from the array.
        doc.challengeRate.splice idx, 1
        
        # save the doc
        doc.save (err, doc) ->
          if err
            throw err
          else
            done doc
          return

        
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
      throw err  if err
      console.log user
      done true

    return

  userToRateChallenges: (idUser, done) ->
    User.findById(idUser).populate("challengeRate").exec (err, data) ->
      
      # if there are any errors, return the error
      return done(err)  if err
      done data

    return

  
  #
  # LEADER BOARD
  #
  globalLeaderboard: (done) ->
    User.find().sort("-globalScore").where("globalScore").gte(1).select("-notifications -friends -challengeRateHistoric").exec (err, challengers) ->
      throw err  if err
      done challengers
      return

    return

  monthlyLeaderboard: (done) ->
    User.find().sort("-monthlyScore").where("monthlyScore").gte(1).select("-notifications -friends -challengeRateHistoric").exec (err, challengers) ->
      throw err  if err
      done challengers
      return

    return

  weeklyLeaderboard: (done) ->
    User.find().sort("-weeklyScore").where("weeklyScore").gte(1).select("-notifications -friends -challengeRateHistoric").exec (err, challengers) ->
      throw err  if err
      done challengers
      return

    return

  dailyLeaderboard: (done) ->
    User.find().sort("-dailyScore").where("dailyScore").gte(1).select("-notifications -friends -challengeRateHistoric").exec (err, challengers) ->
      throw err  if err
      done challengers
      return

    return

  getLeaderboards: (type, done) ->
    buffer = {}
    self = this
    if type is "score"
      
      # I heard you like nested async functions?
      self.globalLeaderboard (global) ->
        buffer.global = global
        self.monthlyLeaderboard (monthly) ->
          buffer.monthly = monthly
          self.weeklyLeaderboard (weekly) ->
            buffer.weekly = weekly
            self.dailyLeaderboard (daily) ->
              buffer.daily = daily
              done buffer

            return

          return

        return

    return