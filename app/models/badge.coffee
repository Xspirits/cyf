# load the things we need
mongoose = require("mongoose")
autoIncrement   = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose);

# define the schema for our user model
badgeSchema = mongoose.Schema(
  ownedBy:[
    type: mongoose.Schema.Types.ObjectId
    index: true
    ref: "User"
  ]
  title: String
  icon:
    type: String
    default: 'undefined.png'
  description: String
  dateCreation:
    type: Date
    default: Date.now
  reqBadges: [{
      type: Number
      ref: "Badge"
  }]
  requirement:[
    reqType: String
    reqValue: Number
  ]

)

badgeSchema.plugin(autoIncrement.plugin, 'Badge');
# create the model for users and expose it to our app
module.exports = mongoose.model("Badge", badgeSchema)