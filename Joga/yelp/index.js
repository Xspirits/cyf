(function() {
  var Schema, YelpDB, YelpSchema, config, mongoose, yelp;

  mongoose = require('mongoose');

  yelp = require('yelp');

  Schema = mongoose.Schema;

  mongoose.set('debug', false);

  console.log("====== Connecting to the YELP api ======");

  config = {
    key: "ULb0iq52-9JCj2nBLWPdTg",
    secret: "z1HhxKabTug-ZJjaDyLKvSbHYmM",
    tokenKey: "i7_aeh2stEE3G1RN4iDWwa4m8iU0NagY",
    tokenSecret: "k0HLZ-bn3JyPRGopwxRdklUsjPU"
  };

  yelp = yelp.createClient({
    consumer_key: config.key,
    consumer_secret: config.secret,
    token: config.tokenKey,
    token_secret: config.tokenSecret
  });

  YelpSchema = new Schema({
    region: {
      center: {
        latitude: {
          type: Number
        },
        longitude: {
          type: Number
        }
      }
    },
    businesses: {
      display_phone: {
        type: String
      },
      id: {
        type: String
      },
      is_claimed: {
        type: String
      },
      is_closed: {
        type: String
      },
      image_url: {
        type: String
      },
      display_phone: {
        type: String
      },
      location: {
        address: {
          type: String
        },
        city: {
          type: String
        },
        country_code: {
          type: String
        },
        postal_code: {
          type: String
        },
        state_code: {
          type: String
        }
      },
      mobile_url: {
        type: String
      },
      name: {
        type: String
      },
      phone: {
        type: String
      },
      review_count: {
        type: String
      },
      snippet_text: {
        type: String
      },
      url: {
        type: String
      }
    }
  });

  YelpDB = mongoose.model('YelpDB', YelpSchema);

  yelp.search({
    term: "soccer",
    location: "San Francisco",
    limit: "1"
    return console.log("INSERTED - " + data.businesses.name + " with " + data.businesses.review_count + " reviews");
  });

}).call(this);
