# load the things we need
mongoose = require("mongoose")

# define the schema for our user model
badgeSchema = mongoose.Schema(
  ownedBy:[
    type: mongoose.Schema.Types.ObjectId
    index: true
    ref: "User"
  ]
  title: String
  Description: String
  dateCreation:
    type: Date
    default: Date.now
  requirement:[
    reqType: String
    reqValue: Number
  ]

)

# create the model for users and expose it to our app
module.exports = mongoose.model("Badge", badgeSchema)