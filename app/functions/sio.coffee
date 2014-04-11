moment = require("moment")
module.exports = (io) ->
  alive: ()->
    io.sockets.emit "alive",
      date: new Date

  glob: (icon, text, desc) ->
    io.sockets.emit "globalevent",
      icon: (if icon then icon else "fa fa-circle-o")
      message: text
      desc: (if desc then desc else "")
      date: new Date