# config/auth.js 

# expose our config directly to our application using module.exports
module.exports =
  app_config:
    email_confirm: false
    twitterPushNews: false
    facebookPushNews: false
  cyf :
    app_domain: "http://www.cyf-app.co"
    # app_domain: "http://localhost:8080"
  mandrill_key: "w_F27RXK5GmLNtZoePLczA"
  support :
    email: "cyf.app@gmail.com"
    password: "evoweb88"
    name: "CyF validator"
  express_sid_key: "chachompcha.sid"
  cookie_secret: "oneDoesNotSimplychompi"
  aws:
    key: 'AKIAIYPYHIXS2GGY2FDQ'
    secret: '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'
  steam:
    key: "02130312F2CCF046E4710C189E8481BA"
    domain: "challenge-friends.herokuapp.com"
  leagueoflegend:
    key: "e95d7edc-2645-4790-b514-bac09bbb03d0"

  facebookPage:
    id: '483062845127553'
    accessToken: "CAAI4WFn0zWoBABZA5tvAvSsCIf8VkuzJ8Wsh0y3OrZAb13qGvSY7iXp7mQ4lSoexXZBbH6rZBFqZCcNhL5pY2YZAZBXhARM8a1BR0XlBvKm0vjZBKePtoCLWNnPaZAGAsUKt0vyj8I5titTJUSAYcMgN6E0ZAu9YoHIcWML7ldL49ZCbPAZBHoVXfQn2"

  facebookAuth:
    clientID: "624902070914410" # your App ID
    clientSecret: "adeff0ed4fa13ed526ba4c133b1eed92" # your App Secret
    callbackURL: "http://www.cyf-app.co/auth/facebook/callback"

  twitterAuth:
    consumerKey: "KqGJkpnwthwuOcrVpLoKA"
    consumerSecret: "DmWpNqUNnctc2hoPj36rsWVRsItsKhwhbqfhSmcXOQ"
    callbackURL: "http://www.cyf-app.co/auth/twitter/callback"

  twitterCyf:
    token : "2396246222-NAnfkkJen2abruUEgDM9dZHRD1NpPZxblWeLPSy"
    tokenSecret : "adZoD4YiIpQOvDEFzodKjBIx83zYAPkCxSLt0HbuPB7Cn"
    username: "cyf_app"
    displayName: "Cyf app"
    id: "2396246222"

  googleAuth:
    clientID: "90650508831.apps.googleusercontent.com"
    clientSecret: "PvPJ5cCT_AgKNU0dDEP98HTb"
    callbackURL: "http://www.cyf-app.co/auth/google/callback"