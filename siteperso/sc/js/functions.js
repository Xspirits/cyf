/* *************************************************************
 *	Function.js
 ************************************************************** */
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
	    itemInfos += '<header>';
	    
	if(simple){
	    
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
	    
	    
	} else {
	    
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
	}
	    itemInfos += '</footer>';
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
    //    , toLoad =$('#item'+now).html()
    , toLoad = './page/page'+now+'.html';    
    
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
    $(focusOn).load(toLoad).fadeIn();
	
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