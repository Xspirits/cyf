// Generated by CoffeeScript 1.7.1
(function() {
  var RiotApi, auth, https, request, riotApi, _;

  https = require("https");

  request = require("request");

  auth = require("./auth");

  RiotApi = require('irelia');

  _ = require("underscore");

  riotApi = new RiotApi({
    host: 'prod.api.pvp.net',
    path: '/api/lol/',
    key: auth.leagueoflegend.key,
    debug: true
  });

  exports.lol_champion_list = function() {
    var json;
    json = [
      {
        "id": 412,
        "title": "the Chain Warden",
        "name": "Thresh",
        "key": "Thresh"
      }, {
        "id": 266,
        "title": "the Darkin Blade",
        "name": "Aatrox",
        "key": "Aatrox"
      }, {
        "id": 23,
        "title": "the Barbarian King",
        "name": "Tryndamere",
        "key": "Tryndamere"
      }, {
        "id": 79,
        "title": "the Rabble Rouser",
        "name": "Gragas",
        "key": "Gragas"
      }, {
        "id": 69,
        "title": "the Serpent's Embrace",
        "name": "Cassiopeia",
        "key": "Cassiopeia"
      }, {
        "id": 13,
        "title": "the Rogue Mage",
        "name": "Ryze",
        "key": "Ryze"
      }, {
        "id": 78,
        "title": "the Iron Ambassador",
        "name": "Poppy",
        "key": "Poppy"
      }, {
        "id": 14,
        "title": "the Undead Champion",
        "name": "Sion",
        "key": "Sion"
      }, {
        "id": 1,
        "title": "the Dark Child",
        "name": "Annie",
        "key": "Annie"
      }, {
        "id": 111,
        "title": "the Titan of the Depths",
        "name": "Nautilus",
        "key": "Nautilus"
      }, {
        "id": 43,
        "title": "the Enlightened One",
        "name": "Karma",
        "key": "Karma"
      }, {
        "id": 99,
        "title": "the Lady of Luminosity",
        "name": "Lux",
        "key": "Lux"
      }, {
        "id": 103,
        "title": "the Nine-Tailed Fox",
        "name": "Ahri",
        "key": "Ahri"
      }, {
        "id": 2,
        "title": "the Berserker",
        "name": "Olaf",
        "key": "Olaf"
      }, {
        "id": 112,
        "title": "the Machine Herald",
        "name": "Viktor",
        "key": "Viktor"
      }, {
        "id": 34,
        "title": "the Cryophoenix",
        "name": "Anivia",
        "key": "Anivia"
      }, {
        "id": 86,
        "title": "The Might of Demacia",
        "name": "Garen",
        "key": "Garen"
      }, {
        "id": 27,
        "title": "the Mad Chemist",
        "name": "Singed",
        "key": "Singed"
      }, {
        "id": 127,
        "title": "the Ice Witch",
        "name": "Lissandra",
        "key": "Lissandra"
      }, {
        "id": 57,
        "title": "the Twisted Treant",
        "name": "Maokai",
        "key": "Maokai"
      }, {
        "id": 25,
        "title": "Fallen Angel",
        "name": "Morgana",
        "key": "Morgana"
      }, {
        "id": 28,
        "title": "the Widowmaker",
        "name": "Evelynn",
        "key": "Evelynn"
      }, {
        "id": 105,
        "title": "the Tidal Trickster",
        "name": "Fizz",
        "key": "Fizz"
      }, {
        "id": 238,
        "title": "the Master of Shadows",
        "name": "Zed",
        "key": "Zed"
      }, {
        "id": 74,
        "title": "the Revered Inventor",
        "name": "Heimerdinger",
        "key": "Heimerdinger"
      }, {
        "id": 68,
        "title": "the Mechanized Menace",
        "name": "Rumble",
        "key": "Rumble"
      }, {
        "id": 37,
        "title": "Maven of the Strings",
        "name": "Sona",
        "key": "Sona"
      }, {
        "id": 82,
        "title": "the Master of Metal",
        "name": "Mordekaiser",
        "key": "Mordekaiser"
      }, {
        "id": 96,
        "title": "the Mouth of the Abyss",
        "name": "Kog'Maw",
        "key": "KogMaw"
      }, {
        "id": 55,
        "title": "the Sinister Blade",
        "name": "Katarina",
        "key": "Katarina"
      }, {
        "id": 117,
        "title": "the Fae Sorceress",
        "name": "Lulu",
        "key": "Lulu"
      }, {
        "id": 22,
        "title": "the Frost Archer",
        "name": "Ashe",
        "key": "Ashe"
      }, {
        "id": 30,
        "title": "the Deathsinger",
        "name": "Karthus",
        "key": "Karthus"
      }, {
        "id": 12,
        "title": "the Minotaur",
        "name": "Alistar",
        "key": "Alistar"
      }, {
        "id": 122,
        "title": "the Hand of Noxus",
        "name": "Darius",
        "key": "Darius"
      }, {
        "id": 67,
        "title": "the Night Hunter",
        "name": "Vayne",
        "key": "Vayne"
      }, {
        "id": 77,
        "title": "the Spirit Walker",
        "name": "Udyr",
        "key": "Udyr"
      }, {
        "id": 110,
        "title": "the Arrow of Retribution",
        "name": "Varus",
        "key": "Varus"
      }, {
        "id": 89,
        "title": "the Radiant Dawn",
        "name": "Leona",
        "key": "Leona"
      }, {
        "id": 126,
        "title": "the Defender of Tomorrow",
        "name": "Jayce",
        "key": "Jayce"
      }, {
        "id": 134,
        "title": "the Dark Sovereign",
        "name": "Syndra",
        "key": "Syndra"
      }, {
        "id": 80,
        "title": "the Artisan of War",
        "name": "Pantheon",
        "key": "Pantheon"
      }, {
        "id": 92,
        "title": "the Exile",
        "name": "Riven",
        "key": "Riven"
      }, {
        "id": 121,
        "title": "the Voidreaver",
        "name": "Kha'Zix",
        "key": "Khazix"
      }, {
        "id": 42,
        "title": "the Daring Bombardier",
        "name": "Corki",
        "key": "Corki"
      }, {
        "id": 51,
        "title": "the Sheriff of Piltover",
        "name": "Caitlyn",
        "key": "Caitlyn"
      }, {
        "id": 76,
        "title": "the Bestial Huntress",
        "name": "Nidalee",
        "key": "Nidalee"
      }, {
        "id": 85,
        "title": "the Heart of the Tempest",
        "name": "Kennen",
        "key": "Kennen"
      }, {
        "id": 3,
        "title": "the Sentinel's Sorrow",
        "name": "Galio",
        "key": "Galio"
      }, {
        "id": 45,
        "title": "the Tiny Master of Evil",
        "name": "Veigar",
        "key": "Veigar"
      }, {
        "id": 104,
        "title": "the Outlaw",
        "name": "Graves",
        "key": "Graves"
      }, {
        "id": 90,
        "title": "the Prophet of the Void",
        "name": "Malzahar",
        "key": "Malzahar"
      }, {
        "id": 254,
        "title": "the Piltover Enforcer",
        "name": "Vi",
        "key": "Vi"
      }, {
        "id": 10,
        "title": "The Judicator",
        "name": "Kayle",
        "key": "Kayle"
      }, {
        "id": 39,
        "title": "the Will of the Blades",
        "name": "Irelia",
        "key": "Irelia"
      }, {
        "id": 64,
        "title": "the Blind Monk",
        "name": "Lee Sin",
        "key": "LeeSin"
      }, {
        "id": 60,
        "title": "The Spider Queen",
        "name": "Elise",
        "key": "Elise"
      }, {
        "id": 106,
        "title": "the Thunder's Roar",
        "name": "Volibear",
        "key": "Volibear"
      }, {
        "id": 20,
        "title": "the Yeti Rider",
        "name": "Nunu",
        "key": "Nunu"
      }, {
        "id": 4,
        "title": "the Card Master",
        "name": "Twisted Fate",
        "key": "TwistedFate"
      }, {
        "id": 24,
        "title": "Grandmaster at Arms",
        "name": "Jax",
        "key": "Jax"
      }, {
        "id": 102,
        "title": "the Half-Dragon",
        "name": "Shyvana",
        "key": "Shyvana"
      }, {
        "id": 36,
        "title": "the Madman of Zaun",
        "name": "Dr. Mundo",
        "key": "DrMundo"
      }, {
        "id": 63,
        "title": "the Burning Vengeance",
        "name": "Brand",
        "key": "Brand"
      }, {
        "id": 131,
        "title": "Scorn of the Moon",
        "name": "Diana",
        "key": "Diana"
      }, {
        "id": 113,
        "title": "the Winter's Wrath",
        "name": "Sejuani",
        "key": "Sejuani"
      }, {
        "id": 8,
        "title": "the Crimson Reaper",
        "name": "Vladimir",
        "key": "Vladimir"
      }, {
        "id": 154,
        "title": "the Secret Weapon",
        "name": "Zac",
        "key": "Zac"
      }, {
        "id": 133,
        "title": "Demacia's Wings",
        "name": "Quinn",
        "key": "Quinn"
      }, {
        "id": 84,
        "title": "the Fist of Shadow",
        "name": "Akali",
        "key": "Akali"
      }, {
        "id": 18,
        "title": "the Megling Gunner",
        "name": "Tristana",
        "key": "Tristana"
      }, {
        "id": 120,
        "title": "the Shadow of War",
        "name": "Hecarim",
        "key": "Hecarim"
      }, {
        "id": 15,
        "title": "the Battle Mistress",
        "name": "Sivir",
        "key": "Sivir"
      }, {
        "id": 236,
        "title": "the Purifier",
        "name": "Lucian",
        "key": "Lucian"
      }, {
        "id": 107,
        "title": "the Pridestalker",
        "name": "Rengar",
        "key": "Rengar"
      }, {
        "id": 19,
        "title": "the Blood Hunter",
        "name": "Warwick",
        "key": "Warwick"
      }, {
        "id": 72,
        "title": "the Crystal Vanguard",
        "name": "Skarner",
        "key": "Skarner"
      }, {
        "id": 54,
        "title": "Shard of the Monolith",
        "name": "Malphite",
        "key": "Malphite"
      }, {
        "id": 157,
        "title": "the Unforgiven",
        "name": "Yasuo",
        "key": "Yasuo"
      }, {
        "id": 101,
        "title": "the Magus Ascendant",
        "name": "Xerath",
        "key": "Xerath"
      }, {
        "id": 17,
        "title": "the Swift Scout",
        "name": "Teemo",
        "key": "Teemo"
      }, {
        "id": 75,
        "title": "the Curator of the Sands",
        "name": "Nasus",
        "key": "Nasus"
      }, {
        "id": 58,
        "title": "the Butcher of the Sands",
        "name": "Renekton",
        "key": "Renekton"
      }, {
        "id": 119,
        "title": "the Glorious Executioner",
        "name": "Draven",
        "key": "Draven"
      }, {
        "id": 35,
        "title": "the Demon Jester",
        "name": "Shaco",
        "key": "Shaco"
      }, {
        "id": 50,
        "title": "the Master Tactician",
        "name": "Swain",
        "key": "Swain"
      }, {
        "id": 115,
        "title": "the Hexplosives Expert",
        "name": "Ziggs",
        "key": "Ziggs"
      }, {
        "id": 40,
        "title": "the Storm's Fury",
        "name": "Janna",
        "key": "Janna"
      }, {
        "id": 91,
        "title": "the Blade's Shadow",
        "name": "Talon",
        "key": "Talon"
      }, {
        "id": 61,
        "title": "the Lady of Clockwork",
        "name": "Orianna",
        "key": "Orianna"
      }, {
        "id": 9,
        "title": "the Harbinger of Doom",
        "name": "Fiddlesticks",
        "key": "FiddleSticks"
      }, {
        "id": 114,
        "title": "the Grand Duelist",
        "name": "Fiora",
        "key": "Fiora"
      }, {
        "id": 31,
        "title": "the Terror of the Void",
        "name": "Cho'Gath",
        "key": "Chogath"
      }, {
        "id": 33,
        "title": "the Armordillo",
        "name": "Rammus",
        "key": "Rammus"
      }, {
        "id": 7,
        "title": "the Deceiver",
        "name": "LeBlanc",
        "key": "Leblanc"
      }, {
        "id": 26,
        "title": "the Chronokeeper",
        "name": "Zilean",
        "key": "Zilean"
      }, {
        "id": 16,
        "title": "the Starchild",
        "name": "Soraka",
        "key": "Soraka"
      }, {
        "id": 56,
        "title": "the Eternal Nightmare",
        "name": "Nocturne",
        "key": "Nocturne"
      }, {
        "id": 222,
        "title": "the Loose Cannon",
        "name": "Jinx",
        "key": "Jinx"
      }, {
        "id": 83,
        "title": "the Gravedigger",
        "name": "Yorick",
        "key": "Yorick"
      }, {
        "id": 6,
        "title": "the Headsman's Pride",
        "name": "Urgot",
        "key": "Urgot"
      }, {
        "id": 21,
        "title": "the Bounty Hunter",
        "name": "Miss Fortune",
        "key": "MissFortune"
      }, {
        "id": 62,
        "title": "the Monkey King",
        "name": "Wukong",
        "key": "MonkeyKing"
      }, {
        "id": 53,
        "title": "the Great Steam Golem",
        "name": "Blitzcrank",
        "key": "Blitzcrank"
      }, {
        "id": 98,
        "title": "Eye of Twilight",
        "name": "Shen",
        "key": "Shen"
      }, {
        "id": 5,
        "title": "the Seneschal of Demacia",
        "name": "Xin Zhao",
        "key": "XinZhao"
      }, {
        "id": 29,
        "title": "the Plague Rat",
        "name": "Twitch",
        "key": "Twitch"
      }, {
        "id": 11,
        "title": "the Wuju Bladesman",
        "name": "Master Yi",
        "key": "MasterYi"
      }, {
        "id": 44,
        "title": "the Gem Knight",
        "name": "Taric",
        "key": "Taric"
      }, {
        "id": 32,
        "title": "the Sad Mummy",
        "name": "Amumu",
        "key": "Amumu"
      }, {
        "id": 41,
        "title": "the Saltwater Scourge",
        "name": "Gangplank",
        "key": "Gangplank"
      }, {
        "id": 48,
        "title": "the Troll King",
        "name": "Trundle",
        "key": "Trundle"
      }, {
        "id": 38,
        "title": "the Void Walker",
        "name": "Kassadin",
        "key": "Kassadin"
      }, {
        "id": 161,
        "title": "the Eye of the Void",
        "name": "Vel'Koz",
        "key": "Velkoz"
      }, {
        "id": 143,
        "title": "Rise of the Thorns",
        "name": "Zyra",
        "key": "Zyra"
      }, {
        "id": 267,
        "title": "the Tidecaller",
        "name": "Nami",
        "key": "Nami"
      }, {
        "id": 59,
        "title": "the Exemplar of Demacia",
        "name": "Jarvan IV",
        "key": "JarvanIV"
      }, {
        "id": 81,
        "title": "the Prodigal Explorer",
        "name": "Ezreal",
        "key": "Ezreal"
      }
    ];
    return json;
  };

  exports.findSummonerLol = function(region, name, callback) {
    console.log(region);
    console.log(name);
    return riotApi.getSummonerByName(region, name, function(err, summoner) {
      if (err) {
        console.log(err);
      }
      summoner = _.values(summoner)[0];
      return callback(summoner);
    });
  };

  exports.getLastGames = function(region, summonerId, callback) {
    return riotApi.getRecentGamesBySummonerId(region, summonerId, function(err, object) {
      if (err) {
        console.log(err);
      }
      return callback(object.games);
    });
  };

  exports.getFbData = function(accessToken, apiPath, callback) {
    var buffer, options;
    options = {
      host: "graph.facebook.com",
      path: apiPath + "?access_token=" + accessToken,
      method: "GET"
    };
    buffer = "";
    request = https.get(options, function(result) {
      result.setEncoding("utf8");
      result.on("data", function(chunk) {
        buffer += chunk;
      });
      return result.on("end", function() {
        return callback(buffer);
      });
    });
    request.on("error", function(e) {
      return console.log("error from facebook.getFbData: " + e.message);
    });
    return request.end();
  };

  exports.postTwitter = function(accessToken, message, callback) {
    var form, params, r, url;
    url = "https://api.twitter.com/1.1/statuses/update.json";
    if (!accessToken) {
      params = {
        consumer_key: auth.twitterAuth.consumerKey,
        consumer_secret: auth.twitterAuth.consumerSecret,
        token: auth.twitterCyf.token,
        token_secret: auth.twitterCyf.tokenSecret
      };
    } else {
      params = {
        consumer_key: auth.twitterAuth.consumerKey,
        consumer_secret: auth.twitterAuth.consumerSecret,
        token: accessToken.token,
        token_secret: accessToken.tokenSecret
      };
    }
    r = request.post({
      url: url,
      oauth: params
    }, function(err, resp, body) {
      if (err) {
        console.error("Error occured: ", err);
      }
      body = JSON.parse(body);
      if (body.error) {
        console.error("Error returned from  twitter: ", body.error);
      }
      console.log(body);
      return callback(body);
    });
    form = r.form();
    return form.append("status", message);
  };

  exports.postFbMessage = function(userFB, message, link, callback) {
    var params, url;
    url = "https://graph.facebook.com/me/feed";
    if (message) {
      params = {
        access_token: userFB.token,
        message: message
      };
    } else {
      params = {
        access_token: userFB.token,
        link: link.url || auth.cyf.app_domain,
        picture: link.picture || false,
        name: link.name || false,
        caption: link.caption || false,
        description: link.description || false
      };
    }
    return request.post({
      url: url,
      qs: params
    }, function(err, resp, body) {
      if (err) {
        return console.log(err);
      }
      body = JSON.parse(body);
      if (body.error) {
        return console.error("Error returned from facebook: ", body.error);
      }
      return callback(JSON.stringify(body, null, "\t"));
    });
  };

  exports.updateWall = function(message, link, callback) {
    var params, url;
    url = "https://graph.facebook.com/" + auth.facebookPage.id + "/feed";
    if (message) {
      params = {
        access_token: auth.facebookPage.accessToken,
        message: message
      };
    } else {
      params = {
        access_token: auth.facebookPage.accessToken,
        link: link.url || auth.cyf.app_domain,
        picture: link.picture || false,
        name: link.name || false,
        caption: link.caption || false,
        description: link.description || false
      };
    }
    return request.post({
      url: url,
      qs: params
    }, function(err, resp, body) {
      if (err) {
        return console.log(err);
      }
      body = JSON.parse(body);
      if (body.errors) {
        return console.error("Error returned from facebook: ", body.errors);
      }
      return callback(JSON.stringify(body, null, "\t"));
    });
  };

  exports.userActionWallPost = function(user, object, callback) {
    var params, url;
    url = "https://graph.facebook.com/me/feed";
    params = {
      access_token: user.facebook.token,
      name: object.name || false,
      message: object.message || false,
      application: auth.facebookAuth.clientID,
      description: object.description || false,
      actions: JSON.stringify([
        {
          "name": "Challenge Your Friend",
          "link": auth.cyf.app_domain
        }
      ]),
      status_type: 'published_story',
      type: "status"
    };
    return request.post({
      url: url,
      qs: params
    }, function(err, resp, body) {
      if (err) {
        return console.log(err);
      }
      body = JSON.parse(body);
      if (body.error) {
        return console.error("Error returned from facebook: ", body.error);
      }
      return callback(JSON.stringify(body, null, "\t"));
    });
  };

  exports.userAction = function(user, action, callback) {
    var obj, params, url;
    url = "https://graph.facebook.com/me/cyfbeta:" + action.name;
    console.log('FB Actions for ' + user.local.pseudo);
    params = {
      access_token: user.facebook.token,
      app_id: auth.facebookAuth.clientID,
      notify: true,
      'fb:explicitly_shared': true,
      message: action.message || false,
      image: action.image || auth.cyf.app_domain + '/img/favicon-128.png',
      ref: action.link || auth.cyf.app_domain
    };
    if (action.name === 'rank') {
      obj = {
        ladder: {
          title: action.rankText || 'Join me on Challenge your Friends!'
        }
      };
    }
    if (action.name === 'reach') {
      obj = {
        level: {
          title: action.levelText || 'Join me on Challenge your Friends!'
        }
      };
    }
    _.extend(params, obj);
    return request.post({
      url: url,
      qs: params
    }, function(err, resp, body) {
      if (err) {
        return console.log(err);
      }
      body = JSON.parse(body);
      if (body.error) {
        return console.error("Error returned from facebook: ", body.error);
      }
      return callback(JSON.stringify(body, null, "\t"));
    });
  };

}).call(this);
