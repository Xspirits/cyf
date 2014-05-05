module.exports = (io, Chat, moment) ->
  #global
  alive: ()->
    io.sockets.emit "alive",
      date: moment().utc()

  glob: (icon, text, desc) ->
    io.sockets.emit "globalevent",
      icon: (if icon then icon else "fa fa-circle-o")
      message: text
      desc: (if desc then desc else "")
      date: new Date

  #chat functions
  connected: (text) ->
    io.of('/chat').emit "newUser",
      message: text
      date: new Date
      
  discuss: (user, message) ->
    _t = @
    chat = new Chat()
    chat.user_from = user
    chat.message = message
    chat.save (err, chat) ->
      console.log err if err
      _t.pushMessage chat
      
  pushMessage: (message) ->
    io.of('/chat').emit "message",
      user: message.user_from
      message: message.message
      date: message.dateSent
      
  onlineNumber: (nb) ->
    io.of('/chat').emit "onlineUsers",
      number: nb