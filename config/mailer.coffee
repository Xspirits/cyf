tempMailOpen = '<table cellpadding="0" cellspacing="0"  style="border-radius:4px;margin:0;padding:0;width:100%;max-width:664px;border:1px solid #dadedf" border="0"><tbody><tr><td style="padding:40px 40px 37px 40px;background-color:#f5f6f7;border-bottom:1px solid #dadedf"><table cellpadding="0" cellspacing="0" style="padding:0;width:100%;margin:0;text-align:left" border="0"><tbody><tr><td><img src="http://cyf-app.co/img/logo_black.png" style="max-width: 200px;"></td></tr></tbody></table></td></tr><tr><td style="font-size:17px;color:#47515d;border-bottom:1px solid #dadedf;padding:36px 40px 40px 40px;font-family:Arial,Verdana,sans-serif;text-align:left">';

tempMailClose = '<br><br>- The Team</td></tr><tr><td style="padding:40px;background-color:#f5f6f7"><table cellpadding="0" cellspacing="0" style="padding:0;width:100%;margin:0;text-align:left" border="0"><tbody><tr><td style="color:#92999f;width:100%;font-size:14px;font-family:Arial,Verdana,sans-serif;padding-right:40px">Challenge your Friends (CyF) is a new service which allows you to receive and send challenge to gamers around the world on any game.<a style="color:#0bacff;text-decoration:none" href="http://cyf-app.co/discover" target="_blank"><u></u>Learn more<u></u></a><br> For the latest news, follows us on <a  style="color:#FE480C;text-decoration:none" href="https://plus.google.com/109925245483936264439" title="Follow us on Goolg+!" target="_blank" rel="publisher">Google+</a>, <a  style="color:#0bacff;text-decoration:none" href="https://twitter.com/cyf_app" title="Follow us on Twitter!" target="_blank">Twitter</a> and <a  style="color:#0bacff;text-decoration:none" href="https://www.facebook.com/cyfapp" title="Like us on Facebook!" target="_blank">Facebook</a></td><td><img src="http://cyf-app.co/img/favicon-64.png"></td></tr></tbody></table></td></tr></tbody></table>'
module.exports = (mandrill_client, nMailer, keys, moment) ->

  cLog: (type,message) ->
    cFrom = keys.support.email
    transport = nMailer.createTransport("SMTP",
      service: "Gmail"
      auth:
        user: cFrom
        pass: keys.support.password
    )
    mailOptions =
      from: cFrom
      to: cFrom
      subject: "[Log] "+type
      html: '<p>'+message+'</p>'

    transport.sendMail mailOptions, (err, response)->
      console.log err if err
      console.log response.message
      console.log type+' - A mail has been sent to '+cFrom

  accountConfirm: (user, done) ->
    cFrom = keys.support.email
    gotoUrl = keys.cyf.app_domain + '/eval/'+ user.verfiy_hash
    transport = nMailer.createTransport("SMTP",
      service: "Gmail"
      auth:
        user: cFrom
        pass: keys.support.password
    )
    mailOptions =
      from: cFrom
      to: user.local.email
      subject: user.local.pseudo + " please confirm your email!"
      html: tempMailOpen+ 'Hi ' + user.local.pseudo + ' welcome to Challenge Your Friends there is only one final step remaining!<br><br><p> To become a true challenger one does not simply only create an account but proves himself as a human being!</p><p>Please confirm your email by clicking <a  style="color:#0bacff;text-decoration:none" href="' + gotoUrl + '" title="confirm your email">here</a><br><br> You can also copy/past the following link in your browser: <br>' + gotoUrl + tempMailClose

    transport.sendMail mailOptions, (err, response)->
      console.log err if err
      console.log 'A registration mail has been sent to '+user.local.email

  # user object, title, message, do we track this on mandrill? true/false, strings "aa","bb", cb
  sendMail: (user,title,message,track,tags) ->
    no_reply = keys.support.email
    gotoUrl = keys.cyf.app_domain + '/eval/'+ user.verfiy_hash
    if track == true
      tags = if tags && tags.length > 0 then tags else 'basic-email'
      message =
        html: tempMailOpen + message + tempMailClose
        # text: "Example text content"
        subject: title
        from_email: no_reply
        from_name: 'Challenge your Friends'
        to: [
          email: user.local.email
          name: user.local.pseudo
          type:"to"
        ]
        headers:
          "Reply-To": no_reply
        important: true
        preserve_recipients: true
        tags: [tags]
        metadata:
          website: keys.cyf.app_domain

      mandrill_client.messages.send
        message: message
        async: false
      , ((result) ->
        console.log result
      ), (e) ->
        return console.log "A mandrill error occurred: " + e.name + " - " + e.message
    else
      transport = nMailer.createTransport("SMTP",
        service: "Gmail"
        auth:
          user: keys.support.email
          pass: keys.support.password
      )
      mailOptions =
        from: no_reply
        to: user.local.email
        subject: title
        html: tempMailOpen + message + tempMailClose

      transport.sendMail mailOptions, (err, response)->
        console.log err if err
        console.log response.message
        console.log 'A No-reply mail "'+title+'" has been sent to '+user.local.email