###
Let's define our raw formulas

xpFormula = (level^2+level)/2*100-(level*100),
levelFormula = (sqrt(100(2 xp +25))+50)/100,
###
User = require("../models/user")
xpRewardvalue =
  "connect.game": 100
  "user.register": 55
  "user.newFriend": 60
  "user.inviteFB": 75
  "challenge.create": 110
  "challenge.rate": 60
  "ongoing.accept": 60
  "ongoing.validate": 150
  "ongoing.succeed": 330
  "tribunal.vote": 80

xpRewardAction =
  "connect.game": "linking a game account"
  "user.register": "creating an account"
  "user.newFriend": "making a new friend"
  "user.inviteFB": "Inviting friends from Facebook"
  "challenge.create": "creating a new challenge"
  "challenge.rate": "rating a challenge"
  "ongoing.accept": "accepting a challenge"
  "ongoing.validate": "validating a challenge"
  "ongoing.succeed": "completing successfully a challenge"
  "tribunal.vote": "voting on a case in the Tribunal"

getLevel = (xp) ->
  process = Math.round((Math.sqrt(100 * (2 * xp + 25)) + 50) / 100)
  process

getXp = (level) ->
  process = (((Math.pow(level, 2) + level) / 2) * 100) - (level * 100)
  process

module.exports = (_, mailer, notifs, sio) ->
  
  ###
  Return the value of an action
  @param  {[type]} action [description]
  @return {[type]}        [description]
  ###
  getValue: (action) ->
    _.values(_.pick(xpRewardvalue, action))[0]

  isUp: (xp, level) ->
    curLvL = level
    xpNeeded = getXp(curLvL + 1)
    bugCheck = getXp(curLvL + 2)
    nextXpReq = xpNeeded - xp
    
    # console.log('Test ( '+curLvL+' to '+( curLvL + 1)+'): ?' +xp + ' <  ' + xpNeeded + ' || bugCheck  ( '+curLvL+' to '+( curLvL + 2)+')? ' +xp + ' <  ' + bugCheck);
    if xp > xpNeeded
      nextXpReq = bugCheck - xp
      if xp > bugCheck
        flatten = getLevel(xp) - curLvL
        nextXpReq = getXp(flatten + curLvL) - xp
        # console.log xp + " > " + bugCheck + " ==> " + xpNeeded + " inc " + curLvL + " of " + flatten
        [ # $inc of the difference to make the level up to date
          flatten
          nextXpReq
        ]
      else
        [
          1
          nextXpReq
        ]
    else
      [
        false
        nextXpReq
      ]

  xpReward: (user, action, xtime, bonus) ->
    userDoubleXp = (if user.xpDouble then true else false)
    bonus        = (if bonus then bonus else 0)
    multiply     = if xtime then xtime else 1
    value        = (_.values(_.pick(xpRewardvalue, action))[0] * multiply * ((if userDoubleXp then 2 else 1))) + bonus
    uXp          = user.xp
    uLvl         = user.level
    valueNext    = getXp(uLvl + 1)
    valueNext2   = getXp(uLvl + 2)
    newXp        = uXp + value
    levelUp      = @isUp(newXp, uLvl)
    
    if levelUp[0]
      inc =
        level: levelUp[0]
        xp: value
        "daily.xp": value
        "daily.level": levelUp[0]
        "weekly.xp": value
        "weekly.level": levelUp[0]
        "monthly.xp": value
        "monthly.level": levelUp[0]
    else
      inc =
        xp: value
        "daily.xp": value
        "weekly.xp": value
        "monthly.xp": value

    User.findByIdAndUpdate(user._id,
      $inc: inc
      $set:
        xpNext: levelUp[1]
    ).exec (err, userUpdated) ->
      mailer.cLog 'Error at '+__filename,err if err
      text = _.values(_.pick(xpRewardAction, action))[0]
      if levelUp[0]
        notifs.gainedLevel userUpdated, uLvl + 1
        notifs.levelUp userUpdated
        sio.glob "fa fa-angle-double-up", " <a href=\"/u/" + userUpdated.idCool + "\">" + userUpdated.local.pseudo + "</a> is now level " + userUpdated.level + " <i class=\"fa fa-exclamation\"></i>"
      notifs.gainedXp userUpdated, value, bonus, text

  updateDaily: (done)->
    User.find().exec (err, users) ->
      mailer.cLog 'Error at '+__filename,err if err

      _.each users, (user) =>
        #generate object of the day: freez the xp and level achieved
        garbage=
          xp: user.xp
          level: user.level

        User.findByIdAndUpdate(user._id,
          $push:
            xpHistoric: garbage
        ).exec (err, userUpdated) ->
          mailer.cLog 'Error at '+__filename,err if err
          return done true