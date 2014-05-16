# load the things we need
mongoose = require("mongoose")

# define the schema for our user model
chatSchema = mongoose.Schema(
  user_from:
    idCool: String
    icon: String
    pseudo: String
    level: Number
    dailyRank: Number
    aclLevel: 
      type: Boolean
      default: 99
  message: String
  dateSent:
    type: Date
    default: Date.now
    # expires: 86400 # 24h
)

# create the model for users and expose it to our app
module.exports = mongoose.model("Chat", chatSchema)