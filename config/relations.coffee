
# load up the user model
User = require("../app/models/user")
Challenge = require("../app/models/challenge")
module.exports =
  
  ###
  Return the current pending requests for a given user
  @param  {String}   idUser [user's id]
  @param  {Function} done   [description]
  @return {Object}          [List of ongoing requests]
  ###
  getPending: (idUser, done) ->
    Relation.findOne(idUser: idUser).exec (err, data) ->
      mailer.cLog 'Error at '+__filename,err if err
      console.log data
      
      #return an array of objects
      done data.pendingRequests

    return

  
  ###
  Create or update a relation with either a sending invite or pending one
  @param  {String}   from       [id of the sender]
  @param  {String}   to         [id of the receiver]
  @param  {Boolean}   thisIsSend [true or false]
  @param  {Function} done       [callback]
  @return {Boolean}              [true or false]
  ###
  create: (from, to, thisIsSend, done) ->
    
    #Check if the relation exist or not.
    #For an unknown reason, couldn't addtoset or upsert document :(.
    query = undefined
    pushing = undefined
    if thisIsSend
      pushing = "sentRequests"
      query = $push:
        sentRequests:
          idUser: to.id
          idCool: to.idCool
          userName: to.userName
    else
      pushing = "pendingRequests"
      query = $push:
        pendingRequests:
          idUser: to.id
          idCool: to.idCool
          userName: to.userName
    User.findOne(
      _id: from.id
      $or: [
        {
          "sentRequests.idUser": to.id
        }
        {
          "pendingRequests.idUser": to.id
        }
      ]
    ).exec (err, relation) ->
      mailer.cLog 'Error at '+__filename,err if err
      console.log relation
      unless relation
        console.log "Lets update"
        User.findByIdAndUpdate(from.id, query).exec (err, updated) ->
          done true
          return
      else
        done false, "already asked"
      return

    return

  
  ###
  Accept a relation: add a new row and delete the pending ones
  @param  {[type]}   from [description]
  @param  {[type]}   to   [description]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  acceptRelation: (from, to, done) ->
    User.findByIdAndUpdate from.id,
      $pull:
        sentRequests:
          idUser: to.id

      $push:
        friends:
          idUser: to.id
          idCool: to.idCool
          userName: to.userName
    , (err, relationFrom) ->
      mailer.cLog 'Error at '+__filename,err if err
      console.log relationFrom
      User.findByIdAndUpdate to.id,
        $pull:
          pendingRequests:
            idUser: from.id

        $push:
          friends:
            idUser: from.id
            idCool: to.idCool
            userName: from.userName
      , (err, relationTo) ->
        mailer.cLog 'Error at '+__filename,err if err
        newRelation = [
          relationFrom
          relationTo
        ]
        done newRelation

      return

    return

  cancelRelation: (from, to, done) ->
    User.findByIdAndUpdate from.id,
      $pull:
        pendingRequests:
          idUser: to.id
    , (err, relation) ->
      mailer.cLog 'Error at '+__filename,err if err
      User.findByIdAndUpdate to.id,
        $pull:
          sentRequests:
            idUser: from.id
      , (err, relation) ->
        mailer.cLog 'Error at '+__filename,err if err
        done true

      return

    return

  
  ###
  Deny a relation: delete the pending one from whom denied it.
  @param  {[type]}   from [description]
  @param  {[type]}   to   [description]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  denyRelation: (from, to, done) ->
    User.findByIdAndUpdate to.id,
      $pull:
        sentRequests:
          idUser: from.id
    , (err, relation) ->
      mailer.cLog 'Error at '+__filename,err if err
      done true

    return