moment = require("moment")
module.exports = (io) ->
  glob: (icon, text, desc) ->
    io.sockets.emit "globalevent",
      icon: (if icon then icon else "fa fa-circle-o")
      message: text
      desc: (if desc then desc else "")
      date: new Date

    return