var tplx =
    {
        
        index :
        {
        },
        streams :
        {
            gplus : function()
            {
                //GooglePlus feed
                $.getJSON('https://www.googleapis.com/plus/v1/people/114398539521978407843/activities/public?key=AIzaSyB-n0O3ceqySExifsO_T9wXIjeidrF5K3U', function(data) {
                    //console.log(data);
                    loadStream('googlePlus',data.items,true);
                });
                //GooglePlus Infos
                $.getJSON('https://www.googleapis.com/plus/v1/people/114398539521978407843?key=AIzaSyB-n0O3ceqySExifsO_T9wXIjeidrF5K3U', ggInfos);
                
            },
            twitter : function()
            {	    
                //TWITTER
                $.getJSON("https://api.twitter.com/1/statuses/user_timeline.json?screen_name=Xspirits&count=5&callback=?",
                          function(data){
                              $.each(data, function(i,item){
                                  ct = item.text;
                                  // include time tweeted - thanks to will
                                  mytime = item.created_at;
                                  var strtime = mytime.replace(/(\+\S+) (.*)/, '$2 $1')
                                  var mydate = new Date(Date.parse(strtime)).toLocaleDateString();
                                  var mytime = new Date(Date.parse(strtime)).toLocaleTimeString(); 
                                  ct = ct.replace(/http:\/\/\S+/g,  '<a href="$&" target="_blank">$&</a>');
                                  ct = ct.replace(/\s(@)(\w+)/g,  '@<a onclick="javascript:pageTracker._trackPageview(\'/outgoing/twitter.com/\');" href="http://twitter.com/$2" target="_blank">$2</a>');
                                  ct = ct.replace(/\s(#)(\w+)/g,    ' #<a onclick="javascript:pageTracker._trackPageview(\'/outgoing/search.twitter.com/search?q=%23\');" href="http://search.twitter.com/search?q=%23$2" target="_blank">$2</a>');
                                  
                                  $("#streams").append('<div>'+ct + ' <small><i>(' + mydate + ' @ ' + mytime + ')</i></small></div>');
                              });
                          });
                
            }
        }
    }