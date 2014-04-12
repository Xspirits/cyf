https   = require("https")
request = require("request")
auth    = require("./auth")
RiotApi = require('irelia')
_       = require("underscore")
riotApi  = new RiotApi({host: 'prod.api.pvp.net',path: '/api/lol/',key: auth.leagueoflegend.key,debug: true});

exports.findSummonerLol = (region, name, callback) ->
  console.log region
  console.log name
  riotApi.getSummonerByName region,name, (err, summoner) ->
    throw err if err
    summoner = _.values(summoner)[0]
    callback summoner

exports.getFbData = (accessToken, apiPath, callback) ->
  options =
    host: "graph.facebook.com"
    path: apiPath + "?access_token=" + accessToken
    method: "GET"

  buffer = ""
  request = https.get(options, (result) ->
    result.setEncoding "utf8"
    console.log result
    result.on "data", (chunk) ->
      buffer += chunk
      return

    result.on "end", ->
      callback buffer
      return

    return
  )
  request.on "error", (e) ->
    console.log "error from facebook.getFbData: " + e.message
    return

  request.end()
  return

exports.postTwitter = (accessToken, message, callback) ->
  url = "https://api.twitter.com/1.1/statuses/update.json"
  unless accessToken
    params =
      consumer_key: auth.twitterAuth.consumerKey
      consumer_secret: auth.twitterAuth.consumerSecret
      token: auth.twitterCyf.token
      token_secret: auth.twitterCyf.tokenSecret
  else
    params =
      consumer_key: auth.twitterAuth.consumerKey
      consumer_secret: auth.twitterAuth.consumerSecret
      token: accessToken.token
      token_secret: accessToken.tokenSecret

  r = request.post(
    url: url
    oauth: params
  , (err, resp, body) ->
    return console.error("Error occured: ", err)  if err
    body = JSON.parse(body)
    return console.error("Error returned from  twitter: ", body.error)  if body.error
    console.log body
    return callback body
  )
  form = r.form()
  form.append "status", message
  return
# Post to an user'wall
# https://developers.facebook.com/docs/graph-api/reference/user/feed
# social.postFbMessage req.user.facebook, message, false, (data) ->
exports.postFbMessage = (userFB, message, link, callback) ->
  url = "https://graph.facebook.com/"+userFB.id+"/feed"

  if message
    params =
      access_token: userFB.token
      message: message
  else
    params =
      access_token: userFB.token
      link: link.url || auth.cyf.app_domain
      picture: link.picture || false
      name: link.name || false
      caption: link.caption || false
      description: link.description || false

  request.post
    url: url
    qs: params
  , (err, resp, body) ->
    return console.error("Error occured: ", err)  if err
    body = JSON.parse(body)
    return console.error("Error returned from facebook: ", body.error)  if body.error
    callback JSON.stringify(body, null, "\t")

exports.updateWall = (message,link, callback) ->
  url = "https://graph.facebook.com/"+auth.facebookPage.id+"/feed"
  
  # Get page accsss token here: https://developers.facebook.com/tools/explorer
  # https://developers.facebook.com/docs/graph-api/reference/page/feed/
  # Made with love tx to http://stackoverflow.com/questions/8231877/facebook-access-token-for-pages
  # message:  The main body of the post, otherwise called the status message. Either link or message must be supplied.string
  # OR 
  # link:     The URL of a link to attach to the post. 
  #            Either link or message must be supplied. Additional fields associated with link are shown below.
  #   picture:  Determines the preview image associated with the link.  string
  #   name:     Overwrites the title of the link preview. string
  #   caption:  Overwrites the caption under the title in the link preview. string
  #   description: Overwrites the description in the link preview string
  # OPTIONS ================
  # actions:  The action links attached to the post. array[]
  #   name: The name or label of the action link. string
  #   link: The URL of the action link itself. string  

  # EXEMPLES
    # message= "hoallza jzja kazpon oanzdn aqsdknq bdnqsn azpon oanzdn aqsdknq bdnqsn azpon oanzdn aqsdknq bdnqsn azpon oanzdn aqsdknq bdnqsn azpon oanzdn aqsdknq bdnqsn azpon oanzdn aqsdknq bdnqsn azpon oanzdn aqsdknq bdnqsn d"
    # social.updateWall message, false, (callback)->
    #   console.log callback
    # link=
    #   url: 'http://www.cyf-app.co/leaderboard'
    #   picture: 'http://www.cyf-app.co/img/favicon-128.png'
    #   name: 'Cyf leaderboard'
    #   caption: " this is a caption"
    #   description: "awesome, let's fight for the first place !!!\n test charriot"
    # social.updateWall false, link, (callback)->
    #   console.log callback

  if message
    params =
      access_token: auth.facebookPage.accessToken
      message: message
  else
    params =
      access_token: auth.facebookPage.accessToken
      link: link.url || auth.cyf.app_domain
      picture: link.picture || false
      name: link.name || false
      caption: link.caption || false
      description: link.description || false
  request.post
    url: url
    qs: params
  , (err, resp, body) ->
    return console.error("Error occured: ", err)  if err
    body = JSON.parse(body)
    return console.error("Error returned from facebook: ", body.error)  if body.error
    callback JSON.stringify(body, null, "\t")

exports.userAction =  (user, action, callback) ->
  # cyfbeta:rank
  url = "https://graph.facebook.com/me/cyfbeta:rank"

  params =
    access_token: user.facebook.token
    app_id: auth.facebookAuth.clientID
    website: auth.cyf.app_domain + '/u/' + user.idCool

  request.post
    url: url
    qs: params
  , (err, resp, body) ->
    return console.error("Error occured: ", err)  if err
    body = JSON.parse(body)
    return console.error("Error returned from facebook: ", body.error)  if body.error
    callback JSON.stringify(body, null, "\t")