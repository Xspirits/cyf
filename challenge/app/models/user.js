// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    idCool           : String,
    local            : {
        email        : String,
        password     : String,
        pseudo       : String,
        joinDate     : {type: Date, default: Date.now}
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    friends            : [ 
    {
        idUser   : { type : mongoose.Schema.Types.ObjectId, ref: 'User' }, 
        idCool   : String,
        date     : {type: Date, default: Date.now}, 
        userName : String
    }
    ],
    sentRequests : [ 
    {
        idUser   : { type : mongoose.Schema.Types.ObjectId, ref: 'User' },     
        idCool   : String,   
        date     : {type: Date, default: Date.now}, 
        userName : String
    }
    ],
    pendingRequests : [ 
    {
        idUser   : { type : mongoose.Schema.Types.ObjectId, ref: 'User' },    
        idCool   : String,
        date     : {type: Date, default: Date.now}, 
        userName : String
    }
    ],
    followers : [ 
    {
        idUser   : { type : mongoose.Schema.Types.ObjectId, ref: 'User' },  
        idCool   : String,
        date     : {type: Date, default: Date.now}, 
        userName : String
    }
    ]

});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
