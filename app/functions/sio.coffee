module.exports = (io, moment) ->
  alive: ()->
    io.sockets.emit "alive",
      date: moment().utc()

  glob: (icon, text, desc) ->
    io.sockets.emit "globalevent",
      icon: (if icon then icon else "fa fa-circle-o")
      message: text
      desc: (if desc then desc else "")
      date: new Date