Challenge = require("../app/models/challenge")
Ongoing = require("../app/models/ongoing")
mangoose = require('mongoose')
# load up the user model

module.exports = (_, mailer, moment, genUID, users) ->
  
  ###
  Create a new challenge
  @param  {array}   req  [form variables]
  @param  {Function} done [callback]
  @return {mixed}        [true or error]
  ###
  create: (req, done) ->
    data = req.body
    user = req.user

    console.log data["idGame"]
    title = data["title"]
    durationH = data["durationH"]
    durationD = data["durationD"]
    description = data["description"]
    game = data["idGame"]
    uID = genUID.generate().substr(-6)
    
    console.log game
    # create the challenge
    newChallenge = new Challenge()
    newChallenge.idCool = uID
    newChallenge.title = title
    newChallenge.description = description
    newChallenge.game = game
    newChallenge.durationH = durationH
    newChallenge.durationD = durationD
    newChallenge.author = user._id
    
    # console.log(newChallenge);
    newChallenge.save (err) ->
      mailer.cLog 'Error at '+__filename,err if err
      # console.log err if err
      # console.log newChallenge
      done newChallenge
  
  ###
  Edit an existing challenge.
  @param  {array}   data [data which have to be updated]
  @param  {Function} done [callback]
  @return {mixed}        [true or error]
  ###
  edit: (data, done) ->

  
  ###
  Favorite a challenge.
  Most favorited challenge are highlighted
  @param  {array}   data [Challenge and user id]
  @param  {Function} done [description]
  @return {mixed}        [true or error]
  ###
  favorite: (data, done) ->

  
  ###
  User evaluation of an existing challenge
  Requiered: User already did this event
  @param  {array}   data [parameters and rate]
  @param  {Function} done [callback]
  @return {mixed}        [true or error]
  ###
  rate: (data, done) ->

  
  ###
  Delete a challenge
  @param  {Array}   data   [Id and user session]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  delete: (data, done) ->
    currentUser = data.user.local.email
    
    ###
    Select the challenge and remove it from our model
    ###
    Challenge.find(_id: data.id).limit(1).exec (err, doc) ->
      
      # if there are any errors, return the error
      return done(err)  if err
      chall = doc[0]
      if chall.author is currentUser
        chall.remove done
      else
        done false, "you are not the owner of this challenge"
  
  ###
  Return all the details for a given challenge
  @param  {String}   id   [id of the challenge]
  @param  {Function} done [callback]
  @return {Object}        [Object containing all the challenge data]
  ###
  getList: (safe, done) ->
    if safe == true
      qs = '-userRand -verfiy_hash -local.email -local.password -sessionKey -facebook.email -google.email -twitter.tokenSecret -notifications -sentRequests -pendingRequests -tribunal -tribunalHistoric -challengeRateHistoric'
    else
      qs = ''
    Challenge.find({}).populate('game completedBy author', qs).sort("-value -rateNumber").exec (err, data) ->
      mailer.cLog 'Error at '+__filename,err if err
      # console.log err if err
      # console.log(data);
      done data
  
  ###
  Return all the details for a given challenge
  @param  {String}   id   [id of the challenge]
  @param  {Function} done [callback]
  @return {Object}        [Object containing all the challenge data]
  ###
  getChallenge: (id, safe, done) ->

    checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    isObj = checkForHexRegExp.test(id);
    if safe == true
      qs = '-userRand -verfiy_hash -local.email -local.password -sessionKey -facebook.email -google.email -twitter.tokenSecret -notifications -sentRequests -pendingRequests -tribunal -tribunalHistoric -challengeRateHistoric'
    else
      qs = ''
    if isObj
      Challenge.findById(id).select(qs).populate('author', qs).exec (err, data) ->
        # if there are any errors, return the error
        mailer.cLog 'Error at '+__filename,err if err      
        # else we return the data
        done data
    else
      Challenge.findOne({idCool: id}).select(qs).populate('author', qs).exec (err, data) ->
        # if there are any errors, return the error
        mailer.cLog 'Error at '+__filename,err if err      
        # else we return the data
        done data



  completedBy: (id, userArray, done) ->
    Challenge.findOneAndUpdate(id,
      $addToSet:
        completedBy: userArray
    ).exec (err, challenge) ->
      mailer.cLog 'Error at '+__filename,err if err
      done true
  
  ###
  [rateChallenge description]
  @param  {Object}   data [id String idCool, user ObjectId, difficulty Number, quickness Number, fun Number ]
  @param  {Function} done [callback]
  @return {Boolean}
  ###
  rateChallenge: (data, done) ->
    Challenge.findOne(idCool: data.id).exec (err, challenge) ->
      
      # if there are any errors, return the error
      mailer.cLog 'Error at '+__filename,err if err
      
      # Add this user on the users historical
      # challenge.completedBy = data.idUser;
      diff = challenge.rating.difficulty
      diffiRate = data.difficulty
      quick = challenge.rating.quickness
      quickRate = data.quickness
      fun = challenge.rating.fun
      funRate = data.fun
      diffiFive = Math.round(diffiRate / 10)
      quickFive = Math.round(quickRate / 10)
      funFive = Math.round(funRate / 10)
      
      # Do Some Maths youhou.
      diffiFive = (if (diffiFive < 1) then 1 else diffiFive)
      quickFive = (if (quickFive < 1) then 1 else quickFive)
      funFive = (if (funFive < 1) then 1 else funFive)
      console.log diffiFive + " o " + quickFive + " o " + funFive
      
      # #DIFFICULTY
      newDiffiCount = ((if (diff.count) then diff.count else 0)) + 1
      newDiffiSum = ((if (diff.sum) then diff.sum else 0)) + diffiRate
      diff.max = diffiRate  if diffiRate > ((if (diff.max) then diff.max else 0))
      diff.min = diffiRate  if diffiRate < ((if (diff.min) then diff.min else 0))
      diff.sum = newDiffiSum
      diff.avg = newDiffiSum / newDiffiCount
      diff.count = newDiffiCount
      switch diffiFive
        when 1
          diff.distribution.one = ((if (diff.distribution.one) then diff.distribution.one else 0)) + 1
        when 2
          diff.distribution.two = ((if (diff.distribution.two) then diff.distribution.two else 0)) + 1
        when 3
          diff.distribution.three = ((if (diff.distribution.three) then diff.distribution.three else 0)) + 1
        when 4
          diff.distribution.four = ((if (diff.distribution.four) then diff.distribution.four else 0)) + 1
        when 5
          diff.distribution.five = ((if (diff.distribution.five) then diff.distribution.five else 0)) + 1
        else
          mailer.cLog 'Error at '+__filename,'error with switch for ' + diffiFive
          console.log "error with switch for " + diffiFive
      
      # #QUICKNESS
      newQuickCount = ((if (quick.count) then quick.count else 0)) + 1
      newQuickSum = ((if (quick.sum) then quick.sum else 0)) + quickRate
      quick.max = quickRate  if quickRate > ((if (quick.max) then quick.max else 0))
      quick.min = quickRate  if quickRate < ((if (quick.min) then quick.min else 0))
      quick.sum = newQuickSum
      quick.avg = newQuickSum / newQuickCount
      quick.count = newQuickCount
      switch quickFive
        when 1
          quick.distribution.one = ((if (quick.distribution.one) then quick.distribution.one else 0)) + 1
        when 2
          quick.distribution.two = ((if (quick.distribution.two) then quick.distribution.two else 0)) + 1
        when 3
          quick.distribution.three = ((if (quick.distribution.three) then quick.distribution.three else 0)) + 1
        when 4
          quick.distribution.four = ((if (quick.distribution.four) then quick.distribution.four else 0)) + 1
        when 5
          quick.distribution.five = ((if (quick.distribution.five) then quick.distribution.five else 0)) + 1
        else
          mailer.cLog 'Error at '+__filename,'error with switch for ' + quickFive
          console.log "error with switch for " + quickFive
      
      # #FUN
      newFunCount = ((if (fun.count) then fun.count else 0)) + 1
      newFunSum = ((if (fun.sum) then fun.sum else 0)) + funRate
      fun.max = funRate  if funRate > ((if (fun.max) then fun.max else 0))
      fun.min = funRate  if funRate < ((if (fun.min) then fun.min else 0))
      fun.sum = newFunSum
      fun.avg = newFunSum / newFunCount
      fun.count = newFunCount
      switch funFive
        when 1
          fun.distribution.one = ((if (fun.distribution.one) then fun.distribution.one else 0)) + 1
        when 2
          fun.distribution.two = ((if (fun.distribution.two) then fun.distribution.two else 0)) + 1
        when 3
          fun.distribution.three = ((if (fun.distribution.three) then fun.distribution.three else 0)) + 1
        when 4
          fun.distribution.four = ((if (fun.distribution.four) then fun.distribution.four else 0)) + 1
        when 5
          fun.distribution.five = ((if (fun.distribution.five) then fun.distribution.five else 0)) + 1
        else
          mailer.cLog 'Error at '+__filename, 'error with switch for ' + funRate
          console.log "error with switch for " + funRate
      difficultyCoeffs = [
        1.00
        1.40
        1.96
        2.74
        3.84
      ]
      quicknessCoeffs = [
        2.67
        2.09
        1.64
        1.28
        1.00
      ]
      funCoeffs = [
        1.00
        1.29
        1.72
        2.50
        4.12
      ]
      ponderatedAvgDiff = (diff.distribution.one * difficultyCoeffs[0]) + (diff.distribution.two * difficultyCoeffs[1]) + (diff.distribution.three * difficultyCoeffs[2]) + (diff.distribution.four * difficultyCoeffs[3]) + (diff.distribution.five * difficultyCoeffs[4])
      averageDifficulty = ponderatedAvgDiff / diff.count
      ponderatedAvgQuick = (quick.distribution.one * quicknessCoeffs[0]) + (quick.distribution.two * quicknessCoeffs[1]) + (quick.distribution.three * quicknessCoeffs[2]) + (quick.distribution.four * quicknessCoeffs[3]) + (quick.distribution.five * quicknessCoeffs[4])
      averageQuick = ponderatedAvgQuick / quick.count
      ponderatedAvgFun = (fun.distribution.one * funCoeffs[0]) + (fun.distribution.two * funCoeffs[1]) + (fun.distribution.three * funCoeffs[2]) + (fun.distribution.four * funCoeffs[3]) + (fun.distribution.five * funCoeffs[4])
      averagefun = ponderatedAvgFun / fun.count
      bonusUpdated = Math.round((averageDifficulty + averageQuick + averagefun) * 1.61803398875)
      console.log "new averages d:" + averageDifficulty + " (" + ponderatedAvgDiff + "/" + diff.count + ") q:" + averageQuick + " (" + ponderatedAvgQuick + "/" + quick.count + ") f:" + averagefun + " (" + ponderatedAvgFun + "/" + fun.count + ") New bonus :" + bonusUpdated
      challenge.value = bonusUpdated
      # Increment of 1
      challenge.rateNumber = challenge.rateNumber + 1
      # Let's put back the value's rating on a scale out of 50
      challenge.rateValue = Math.round((data.difficulty + data.quickness + data.fun) / 3)
      challenge.save (err, result) ->
        mailer.cLog 'Error at '+__filename,err if err
        obj =
          id: result._id
          idUser: data.idUser
          rating:
            difficulty: data.difficulty
            quickness: data.quickness
            fun: data.fun

        theChallenge = result
        theNote = Math.round((data.difficulty + data.quickness + data.fun) / 3)
        users.ratedChallenge obj, (result) ->
          toNotify =
            challenge: theChallenge
            note: theNote
            user: result
          done toNotify

  ###
  Return all the challenges created byt a given user
  @param  {String}   email  [email of the creator]
  @param  {Function} done [callback]
  @return {Object}        [List of challenges]
  ###
  getUserChallenges: (id, done) ->
    Challenge.find(author: id).populate("author").sort("-creation").exec (err, data) ->
      
      # if there are any errors, return the error
      return done(err)  if err
      
      # else we return the data
      done data
  
  # =============================================================================
  # ONGOING CHALLENGES ==========================================================
  # =============================================================================
  
  ###
  Return a challenge's details
  @param  {ObjectId}   id  [idCool of the challenge]
  @param  {Function} done [callback]
  @return {Object}        [List of challenges]
  ###
  ongoingDetails: (id, safe, done) ->
    if safe == true
      qs = '-userRand -verfiy_hash -local.email -local.password -sessionKey -facebook.email -google.email -twitter.tokenSecret -notifications -sentRequests -pendingRequests -tribunal -tribunalHistoric -challengeRateHistoric'
    else
      qs = ''

    Ongoing.findOne({idCool: id}).populate("_idChallenge _idChallenger _idChallenged",qs).exec (err, data) ->
      
      # if there are any errors, return the error
      mailer.cLog 'Error at '+__filename,err if err
      
      # else we return the data
      done data
  
  ###
  Return the challenges accepted by a given user
  @param  {ObjectId}   id  [_id of the creator]
  @param  {Function} done [callback]
  @return {Object}        [List of challenges]
  ###
  userAcceptedChallenge: (id, safe, callback) ->
    if safe == true
      qs = '-userRand -verfiy_hash -local.email -local.password -sessionKey -facebook.email -google.email -twitter.tokenSecret -notifications -sentRequests -pendingRequests -tribunal -tribunalHistoric -challengeRateHistoric'
    else
      qs = ''

    Ongoing.find(
      accepted: true
      $or: [
        {
          _idChallenger: id
        }
        {
          _idChallenged: id
        }
      ]
    ).populate('_idChallenge _idChallenger _idChallenged _idChallenge.game', qs).exec (err, data) ->
      # if there are any errors, return the error
      mailer.cLog 'Error at '+__filename,err if err
      console.log data
      # else we return the data
      callback(data)
  
  ###
  Return all the challenges (request and received) for a given user
  @param  {ObjectId}   id  [_id of the creator]
  @param  {Function} done [callback]
  @return {Object}        [List of challenges]
  ###
  challengerRequests: (id, done) ->
    Ongoing.find(_idChallenger: id).populate("_idChallenge _idChallenger _idChallenged").exec (err, data) ->
      
      # if there are any errors, return the error
      mailer.cLog 'Error at '+__filename,err if err
      
      # else we return the data
      done data
  
  ###
  Return all the challenges (request and received) for a given user
  @param  {ObjectId}   id  [_id of the creator]
  @param  {Function} done [callback]
  @return {Object}        [List of challenges]
  ###
  challengedRequests: (id, done) ->
    Ongoing.find(_idChallenged: id).populate("_idChallenge _idChallenger _idChallenged").exec (err, data) ->
      
      # if there are any errors, return the error
      mailer.cLog 'Error at '+__filename,err if err
      
      # else we return the data
      done data
  
  ###
  Challenge another user !
  @param  {Object}   data [All the required data to throw a challenge]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  launch: (data, done) ->
    if data.deadLine.d > 0
      query =
        hours: data.deadLine.h
        days: data.deadLine.d
    else
      query = hours: data.deadLine.h
    oCha = new Ongoing()
    oCha._idChallenge = data.idChallenge
    oCha._idChallenger = data.from
    oCha._idChallenged = data.idChallenged
    oCha.idCool = genUID.generate().substr(-6)
    oCha.launchDate = moment(data.launchDate).utc()
    oCha.deadLine = moment(data.launchDate).utc().add(query)
    oCha.save (err) ->
      mailer.cLog 'Error at '+__filename,err if err
      done oCha
  ###
  accept an ongoing challenge's request, setting "accepted" to true
  @param  {Object}   data [id challenge and id of user]
  @param  {Function} done [callback]
  @return {Boolean}       [true or false]
  ###
  accept: (data, done) ->
    idChallenge = data.id
    idUser = data.idUser
    
    ###
    Select the challenge and remove it from our model
    ###
    Ongoing.findOne(_id: idChallenge).populate("_idChallenge _idChallenged _idChallenger").exec (err, chall) ->
      passing = chall
      
      # if there are any errors, return the error
      mailer.cLog 'Error at '+__filename,err if err
      testiD = chall._idChallenged._id.toString()
      uString = idUser.toString()
      console.log testiD + " " + uString
      if testiD is uString
        chall.accepted = true
        chall.save (err) ->
          mailer.cLog 'Error at '+__filename,err if err
          done passing
      else
        done false, "you are not the person challenged on this challenge"

  ###
  Deny an ongoing challenge's request by deleting it.
  @param  {Object}   data [id challenge and id of user]
  @param  {Function} done [callback]
  @return {Boolean}       [true or false]
  ###
  deny: (data, done) ->
    idChallenge = data.id
    idUser = data.idUser
    Ongoing.findOne(_id: idChallenge).exec (err, chall) ->
      
      # if there are any errors, return the error
      mailer.cLog 'Error at '+__filename,err if err
      console.log chall._idChallenged + " <> " + idUser
      console.log (chall._idChallenged.toString() is idUser.toString())
      if chall._idChallenged.toString() is idUser.toString()
        chall.remove()
        done true
      else
        done false, "you are not the person challenged on this challenge"

  requestValidation: (data, done) ->
    Ongoing.findOne(
      _id: data.idChallenge
      _idChallenged: data.idUser
    ).populate("_idChallenge _idChallenged _idChallenger").exec (err, ongoing) ->
      
      # if there are any errors, return the error
      mailer.cLog 'Error at '+__filename,err if err
      ongoing.waitingConfirm = true
      ongoing.confirmAsk = moment().utc()
      ongoing.confirmLink1 = data.proofLink1
      ongoing.confirmLink2 = (if (data.proofLink2) then data.proofLink2 else "")
      ongoing.confirmComment = (if (data.confirmComment) then data.confirmComment else "")
      ongoing.save (err) ->
        mailer.cLog 'Error at '+__filename,err if err
        done ongoing
  
  ###
  A challenge has reached or crossed its deadline, invalidate it.
  @param  {[type]} challenge [description]
  @return {[type]}           [description]
  ###
  crossedDeadline: (challenge) ->
    Ongoing.findByIdAndUpdate(challenge,
      waitingConfirm: false
      validated: false
      progress: 100
      crossedDeadline: true
    ).exec (err, done) ->
      console.log err  if err
      return true
  
  ###
  [validateOngoing description]
  @param  {Object}   data [oId : req.params.id, deny : req.body.deny]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  validateOngoing: (data, done) ->
    self = this
    Ongoing.findOne({idCool: data.oId}).populate("_idChallenged _idChallenger _idChallenge").exec (err, ongoing) ->
      
      # if there are any errors, return the error
      mailer.cLog 'Error at '+__filename,err if err
      ongoing.waitingConfirm = false
      ongoing.validated = data.pass
      ongoing.progress = 100
      ongoing.save (err) ->
        mailer.cLog 'Error at '+__filename,err if err
        completedByArr = [ongoing._idChallenged._id]
        self.completedBy ongoing._idChallenge._id, completedByArr, (result) ->
          done ongoing
  
  # =============================================================================
  # TRIBUNAL CASES     ==========================================================
  # =============================================================================
  
  ###
  [userWaitingCases description]
  @param  {[type]}   user [description]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  userWaitingCases: (user, done) ->
    loadCases = user.tribunal
    
    # console.log(loadCases);
    Ongoing.find(_id:
      $in: loadCases
    ).populate("_idChallenge _idChallenger _idChallenged").exec (err, cases) ->
      mailer.cLog 'Error at '+__filename,err if err
      # console.log(cases);
      done cases
  
  ###
  Send an Ongoing event (actually closed) to the tribunal
  @param  {Object}   data [oId]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  sendTribunal: (data, done) ->
    Ongoing.findById(data.id).populate('_idChallenged _idChallenger _idChallenge').exec (err, ongoing) ->
      
      # if there are any errors, return the error
      mailer.cLog 'Error at '+__filename,err if err
      
      #Does this ongoing already has an opened case? 
      #if yes, we do nothing.
      if ongoing.tribunal is false
        
        #Is the person who ask the same as the challenged ?
        if data.idUser.toString() is ongoing._idChallenged.toString()
          exclude =
            one: ongoing._idChallenger
            two: ongoing._idChallenged

          
          # console.log('Going to exclude and pick');
          # console.log(exclude);
          users.pickTribunalUsers exclude, 3, (pickedUser) ->
            
            # console.log(pickedUser);
            users.setJudges ongoing._id, pickedUser, (completed) ->
              if completed
                judges = []
                i = pickedUser.length - 1

                while i >= 0
                  aJudge =
                    idUser: pickedUser[i]._id
                    hasVoted: false
                    answer: false

                  judges.push aJudge
                  i--
                ongoing.tribunal = true
                ongoing.tribunalVote = judges
                
                # console.log(ongoing);
                ongoing.save (err, result) ->
                  mailer.cLog 'Error at '+__filename,err if err
                  done ongoing

              else
                mailer.cLog 'Error at '+__filename, "something went wrong here"
        else
          done false, "Case already taken in account"
      else
        done false, "not the challenged"
  
  ###
  Register a vote on a tribunal case given by an user
  @param  {Object}   data [id (String; idCool of an Ongoing), idUser(ObjectId), answer(Boolean)]
  @param  {Function} done [callback]
  @return {Boolean}
  ###
  voteCase: (data, done) ->
    Ongoing.findOneAndUpdate(
      idCool: data.id
      "tribunalVote.idUser": data.idUser
    ,
      $set:
        "tribunalVote.$.answer": data.answer
        "tribunalVote.$.hasVoted": true
        "tribunalVote.$.voteDate": moment().utc()
    ).exec (err, cases) ->
      mailer.cLog 'Error at '+__filename,err if err
      userData =
        id: cases._id
        idUser: data.idUser
        answer: data.answer

      console.log "Challenge.js l.673 - " + userData
      users.votedOnCase userData, (ret) ->
        
        #return the case
        done cases

  completeCase: (idCase, done) ->
    Ongoing.findOne(idCool: idCase).populate("_idChallenged _idChallenger _idChallenge").exec (err, cases) ->
      mailer.cLog 'Error at '+__filename,err if err
      deny = 0
      validate = 0
      judges = cases.tribunalVote
      i = judges.length - 1

      while i >= 0
        
        #This shouldn't be needed but well, better be certain.
        if judges[i].hasVoted is true
          if judges[i].answer is true
            validate++
          else
            deny++
        i--
      
      # The total of judge is never pair, so this can't be even.
      console.log (if "case: " + cases.idCool + " === [" + validate + "]+1 [" + deny + "]-1 Result: " + (validate > deny) then "validated" else "denied")
      cases.tribunalAnswered = (if (validate > deny) then true else false)
      cases.caseClosed = true
      cases.caseClosedDate = moment().utc()
      cases.save (err) ->
        mailer.cLog 'Error at '+__filename,err if err
        done cases

  remainingCaseVotes: (idCase, done) ->
    Ongoing.findOne(idCool: idCase).exec (err, req) ->
      mailer.cLog 'Error at '+__filename,err if err
      counter = 0
      judges = req.tribunalVote
      i = judges.length - 1

      while i >= 0
        counter++  if judges[i].hasVoted is false
        i--
      done counter