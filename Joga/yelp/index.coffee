
# API v1.0
#   YWSID           2VDfAi2vUJXZ0nE68x7HPg

# API v2.0
# Consumer Key      ULb0iq52-9JCj2nBLWPdTg
# Consumer Secret   z1HhxKabTug-ZJjaDyLKvSbHYmM
# Token             i7_aeh2stEE3G1RN4iDWwa4m8iU0NagY
# Token Secret      k0HLZ-bn3JyPRGopwxRdklUsjPU

mongoose = require 'mongoose'
yelp  = require 'yelp'
Schema   = mongoose.Schema

mongoose.set 'debug', off

console.log "====== Connecting to the YELP api ======"
# yelp api config
config =
  key          : "ULb0iq52-9JCj2nBLWPdTg"
  secret       : "z1HhxKabTug-ZJjaDyLKvSbHYmM"
  tokenKey     : "i7_aeh2stEE3G1RN4iDWwa4m8iU0NagY"
  tokenSecret  : "k0HLZ-bn3JyPRGopwxRdklUsjPU"
  

yelp = yelp.createClient
  consumer_key: config.key
  consumer_secret: config.secret
  token: config.tokenKey
  token_secret: config.tokenSecret
  
YelpSchema = new Schema
  region:
    center:
      latitude            : {type: Number}
      longitude           : {type: Number}  
  businesses:
    display_phone       : {type: String}  
    id                  : {type: String}  
    is_claimed          : {type: String}  
    is_closed           : {type: String}  
    image_url           : {type: String}  
    display_phone       : {type: String}  
    location:
      address             : {type: String} 
      city                : {type: String}
      country_code        : {type: String}
      postal_code         : {type: String}
      state_code          : {type: String}
    mobile_url          : {type: String} 
    name                : {type: String} 
    phone               : {type: String} 
    review_count        : {type: String} 
    snippet_text        : {type: String} 
    url                 : {type: String} 

YelpDB = mongoose.model 'YelpDB', YelpSchema     
    
# See http://www.yelp.com/developers/documentation/v2/search_api

yelp.search {term: "soccer",location: "San Francisco", limit : "1"}, (error, stream) ->
 console.log stream.businesses