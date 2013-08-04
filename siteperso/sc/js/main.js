$(function(){    
    var isMobile = navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|Opera Mini|BlackBerry|IEMobile/i)
    ,	menuLeft = localStorage['menuLeft'] 
    ,	menuTop = localStorage['menuTop']
    ,	winW = $(document).width()
    ,	prev = 1;
    
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);

  
   
    //Loading time
    charginMaLaza(0,1);
    animateTop(menuLeft,menuTop);
    lazyMenu('#mainNav');

    //Feed loading    
    $.getJSON('https://www.googleapis.com/plus/v1/people/114398539521978407843/activities/public?key=AIzaSyB-n0O3ceqySExifsO_T9wXIjeidrF5K3U', function(data) {
	//console.log(data);
	loadStream('googlePlus',data.items,true);
    });
    
    $.getJSON('https://www.googleapis.com/plus/v1/people/114398539521978407843?key=AIzaSyB-n0O3ceqySExifsO_T9wXIjeidrF5K3U', ggInfos);
    // UPDATE 10-17-2012: change in Twitter API!
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
    //MENU actions
    $('.menu .menuButton, .tickL').click(function() {
	toggleTOC();
    });
    $('#streams .menuButton, .tickR').click(function() {
	toogleStream();
    });
    $('.click').toggle(function(){
	$(this).addClass('flip');
    },function(){
	$(this).removeClass('flip');
    });
    // Actions availables
    $(document).swipe({
	swipeLeft:toogleStream,
	swipeRight:toggleTOC
    });
    $(document).dblclick(function(){
	toogleAll();
    });
    
    //Menu page load
    $('.goto').click(function() {
	
	tagetPos = $(this).attr('id');
	loadPos = tagetPos.substring(4);
	charginMaLaza(prev,loadPos);	
	prev = loadPos;
	
	if(isMobile)
	    toggleTOC();
    });

    if(isMobile){
	//browsing from mobile ? Let's give you a good nav 
	$('.menu').css('width',winW-50);
	$('#streams').css('width',winW);
	$('#streams').css('margin-right', -winW);
	$('.menuButton').text('Back');
	    
    } else {	
	toggleTOC();
	toogleStream();
    }
        

    
/* 
    var mapOptions = {
	center: new google.maps.LatLng(48.7833, 2.2667),
	zoom: 9,
	mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"),
	mapOptions);
    var markers = [
    ['Plessis Robinson',48.7833, 2.2667],
    ['Coogee Beach', -33.923036, 151.259052],
    ['Cronulla Beach', -34.028249, 151.157507],
    ['Manly Beach', -33.80010128657071, 151.28747820854187],
    ['Maroubra Beach', -33.950198, 151.259302]
    ];
    var infowindow = new google.maps.InfoWindow(), marker, i;
    for (i = 0; i < markers.length; i++) {  
	marker = new google.maps.Marker({
	    position: new google.maps.LatLng(markers[i][1], markers[i][2]),
	    map: map
	});
	google.maps.event.addListener(marker, 'click', (function(marker, i) {
	    return function() {
		infowindow.setContent(markers[i][0]);
		infowindow.open(map, marker);
	    }
	})(marker, i));
    }
     */
});

function ggPhotos(photos) {
    console.log(photos);

}
function ggInfos (google) {
    console.log(google);
    
    var gIdiv = $('#g_picture')
    ,	img = google.image.url.substring(0,  google.image.url.length-2)+'189';
    
    returnImage = '<div class="front"><img src="'+img+'" alt="" /></div>';
    returnSpan = '<div class="back">"If dogs are man\'s best friends, why couldn\'t they enjoy humans\' daily life pleasure?" <br /><h5>'+google.name.givenName+' '+google.name.familyName+'</h5></div>';
    
    returned = returnImage + returnSpan;
    gIdiv.html(returned);
}
/*
 *
 * = Load Stream from social networks
 *
 */
function loadStream(id,data,simple){
    var feed = $('section#'+id)
    ,	itemInfos='';
    
    
    
    $.each(data, function(i, item) {
	var base = (item.object.attachments)?item.object.attachments[0]:false
	,	image = (base && base.image)?base.image.url:false
	,	content = base.content;
	
	if(item.title == ''){
	    title = base.content;
	    content ='';
	}
	else
	    title = item.title;
	itemInfos += '<article id="gplus_'+i+'">';
	    
	if(simple){
	    
	    itemInfos += '<header>';
	    itemInfos += '<h5><a href="'+item.url+'" title="more">'+title+'</a></h5>';
	    itemInfos += '</header>';	    
	    itemInfos += '<footer>';
	    itemInfos += '<p class="author">';
	    itemInfos += '<a href="'+item.actor.url+'" title="see profile"><img src="'+item.actor.image.url+'" alt="" /></a>';
	    itemInfos += '</p>';	    
	    itemInfos += '<p>';	    
	    itemInfos += '<time datetime="'+item.published+'" pubdate>'+item.published.substring(0,10)+'</time>';	    
	    itemInfos += '<a href="https://plus.google.com/share?url='+item.object.url+'" onclick="javascript:window.open(this.href,\'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600\');return false;">\n\
			<img   src="./img/24c.png" alt="Share on Google+"/></a>';	        
	    itemInfos += '</p>';	    
	    
	    itemInfos += '</footer>';
	    
	} else {
	    
	    itemInfos += '<header>';
	    itemInfos += '<h3>'+title+'</h3>';
	    if(image)
		itemInfos += '<figure><img src="'+image+'" alt="attachments" /></figure>';
	    itemInfos += '</header>';
	    itemInfos += '<p>';
	    itemInfos += content;
	    itemInfos += '</p>';
	    
	    itemInfos += '<footer>';
	    itemInfos += '<p><span class="replies">'+item.object.replies.totalItems+'</span>';
	    itemInfos += '<span class="plusoners">'+item.object.plusoners.totalItems+'</span>';
	    itemInfos += '<span class="reshares">'+item.object.resharers.totalItems+'</span></p>';
	    itemInfos += '<p class="author">';
	    itemInfos += '<img src="'+item.actor.image.url+'" alt="" /><a href="'+item.actor.url+'" title="see profile" class="bigLink">'+item.actor.displayName+'</a>';
	    itemInfos += '</p>';
	    
	    itemInfos += '<p><time datetime="'+item.published+'" pubdate>'+item.published.substring(0,10)+'</time></p>';
	    itemInfos += '</footer>';	    
	}
	itemInfos += '</article>';    
	    
    });

	
    feed.html(itemInfos);
}

/* 
 * 
 *  = Automatically build the ID of our pages.
 *  Thus we can add page easily, juste by adding a menu link + an article
 * 
 */
function lazyMenu(id){
    
    $(id+' li a').each(function(i) {
	i++;
	$(this).attr('id','link'+i);    
    });    
    $('.item').each(function(i) {
	i++;
	$(this).attr('id','item'+i);    
    });
}
/* 
 * 
 *  = Load pages
 * 
 */
function charginMaLaza(prev,now){
    var sNext = $('article#sNext')
    , sCurr = $('article#sCurr')
    , toLoad =$('#item'+now).html();    
    
    $('#link'+prev).removeClass("activeSpan");		
    $('#link'+now).addClass("activeSpan");
    $('#showOff').removeClass("item"+prev).addClass("item"+now);
       
    if(sNext.hasClass('activeArticle')){
	focusOff = sNext;    	
	focusOn = sCurr;
    }
    else{
	focusOff = sCurr;
	focusOn = sNext;
    }
	
    focusOff.removeClass('activeArticle');
    focusOn.addClass('activeArticle');
	
    $(focusOff).empty().fadeOut();
    //    //needed in order to allow scroll within article
    //    toLoad = '<div class="scrollable">'+toLoad+'</div>';
    $(focusOn).html(toLoad).fadeIn();
	
}

/* 
 * 
 *  = Automatically resize the windows according to the browser
 * 
 */
function resizeAuto(height){
    
    $('.container').height(height);
    $('#showOff').height(height);
    $('#showOff article').height(height);
}

/* 
 * 
 *  = Menu functions
 * 
 */
function toogleAll(){
    toggleTOC();
    toogleStream();
}
function toggleTOC() {
    currWidth = $('.menu').css("width");
               
    if(!$('#showOff').hasClass('needDirection'))
	$("#showOff").animate({
	    marginLeft: currWidth
	}, 300, function(){
	    storeInfos('menuLeft',true);  
	    $(".info_container").slideUp();
	    
	    $('.tickL').fadeOut();
	    
	    $(this).addClass( 'needDirection' );
	}); 
    else
	$("#showOff").animate({
	    marginLeft: 0
	}, 300, function(){
	    $('.tickL').fadeIn();	    
	    $(this).removeClass( 'needDirection' );
	}); 
}
function toogleStream(){
    currWidth = $('#streams').css("width");
    
    if(!$('#streams').hasClass('procrastinationOn')){
	
	$('.tickR').fadeOut();
	$("#streams").animate({
	    marginRight : 0
	}, 300, function(){
	    storeInfos('menuTop',true);
	    $(".info_container").slideUp();
	    $(this).addClass( 'procrastinationOn' );
	}); 
    }
	
    else
	$("#streams").animate({
	    marginRight : '-'+currWidth
	}, 300, function(){
	
	    $('.tickR').fadeIn();
	    $(this).removeClass( 'procrastinationOn' );
	}); 
	    
}

/* 
 * 
 *  = Local storag of informations
 * 
 */
function storeInfos(key,value){

    localStorage[key] = value;
}    

/* 
 * 
 *  = Infos Menu popup
 * 
 */
function animateTop(menuLeft,menuTop){    
    if(!menuLeft && !menuTop)
	$('.info_container').slideDown('slow',rotateInfo(3500));
    
    else if (menuLeft && !menuTop)
	$('.info_container').slideDown('slow',function(){
	    $('#iMenuTop').fadeIn('slow');
	});
	
    
    else if (!menuLeft && menuTop)
	$('.info_container').slideDown('slow',function(){
	    $('#iMenuLeft').fadeIn('slow');
	});
}
// Alternate the menu informations
function rotateInfo(speed){

    $('.arrow_box2').hide();
    $('.arrow_box').show();
    $('#iMenuLeft').fadeIn('slow', function(){   	
	$('#iMenuLeft').delay(speed).fadeOut('slow',function(){	    
	    $('.arrow_box').hide();
	    $('.arrow_box2').show();	
	    $('#iMenuTop').fadeIn('slow', function(){			
		$('#iMenuTop').delay(speed).fadeOut('slow',function(){
		    rotateInfo(speed);
		});
	    });
	   
	})
    })
}