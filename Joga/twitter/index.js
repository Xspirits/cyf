var Schema, Tweet, TweetSchema, config, mongoose, twit, twitter;

mongoose = require('mongoose');

twitter = require('ntwitter');

Schema = mongoose.Schema;

mongoose.set('debug', false);

console.log("====== Connecting to our Database ======");

mongoose.connect("mongodb://localhost/joga_analytics", function(err) {
  if (err) {
    console.error("Mongo connection failed");
  }
  return console.log("connected to joga_analytics");
});

console.log("====== Connecting to the api ======");

config = {
  key: "jxeE3wqzjEJgaN9kzMsXOA",
  secret: "sA4h2SEpi28SteeIjc2DDpzXmpU5shvZ398spQV5HE",
  tokenKey: "80673759-VaBic5yFFuarZLsXcouC18vvI35ppw4xs427rIss",
  tokenSecret: "W0ReIYC1fh6oBY095Pc12jryOgLqncS2v8lhG2eWHg"
};

twit = new twitter({
  consumer_key: config.key,
  consumer_secret: config.secret,
  access_token_key: config.tokenKey,
  access_token_secret: config.tokenSecret
});

TweetSchema = new Schema({
  id: {
    type: Number
  },
  created_at: {
    type: String
  },
  text: {
    type: String
  },
  retweet_count: {
    type: Number
  },
  user: {
    id: {
      type: Number
    },
    name: {
      type: String
    },
    screen_name: {
      type: String
    },
    location: {
      type: String
    },
    followers_count: {
      type: Number
    },
    friends_count: {
      type: Number
    },
    created_at: {
      type: Date
    },
    verified: {
      type: Boolean
    },
    statuses_count: {
      type: Number
    },
    profile_image_url: {
      type: String
    },
    profile_banner_url: {
      type: String
    }
  }
});

console.log("====== Begin stream parse pickup+soccer, > 200 followers ======");

Tweet = mongoose.model('Tweet', TweetSchema);

twit.stream('statuses/filter', {
  'track': "pickup+soccer"
}, function(stream) {
  return stream.on('data', function(doc) {
    if (doc.user.followers_count > 200) {
      return Tweet.create(doc, function(err, tweet) {
        return console.log("INSERTED - " + tweet.user.screen_name + " with " + tweet.user.followers_count + " followers");
      });
    }
  });
});
