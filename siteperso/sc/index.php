<?php
 $ip = $_SERVER["REMOTE_ADDR"]; 
?>
<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>

        <meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
        <meta name="viewport" content="initial-scale=1,width=device-width">
        <title></title> 
        <meta name="description" content="">
        <link rel="icon" type="image/gif"    href="./favicon.gif" />
	<script type="text/javascript">
	    timer = Date.now();
	    var css = ['normalize','main','style','mediaqueries'];
	    for (var i in css) document.write('<' + 'link rel="stylesheet" href="./css/'+css[i]+'.css"' + ' />');
	    
	    console.log("Welcome <?= $ip; ?> on my website, I hope you'll enjoy your visit.");	    
	</script>
    </head>
    <body>
        <!--[if lt IE 7]>
            <p class="chromeframe">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">activate Google Chrome Frame</a> to improve your experience.</p>
        <![endif]-->

	<div class="container">

	    <!-- INFOSBOX  -->
	    <aside class="info_container"> 

		<section class="sub_c">
		    <section id="iMenuLeft" class="active">  Swipe left to right to show the navigation menu
			<div class="arrow_box"><figure></figure></div></section>
		    <section  id="iMenuTop">  Swipe right to left to show the stream menu
			<div class="arrow_box2"><figure></figure></div></section>
		</section>

	    </aside>
	    <!-- NAVIGATION -->
	    <nav class="menu">
		<div class="topMenu"><a href="#" title="" class="menuButton right">hide</a></div>

		<ul id="mainNav">
		    <li><a href="#tab1" class="goto activeSpan">Home</a></li>
		    <li><a href="#tab1" class="goto">Who ?</a></li>
		    <li><a href="#tab2" class="goto">Projects</a></li>
		    <li><a href="#tab3" class="goto">Skills</a></li>
		    <li><a href="#tab4" class="goto">Studies</a></li>
		    <li><a href="#tab5" class="goto">Experiences</a></li>
		    <li><a href="#tab6" class="goto">Maps</a></li>
		</ul>
	    </nav>
	    <!-- CONTENT -->
	    <section id="showOff">
		<aside class="tickL"><span>menu</span></aside>
		<article id="sCurr" ></article>
		<article id="sNext" class="activeArticle"></article>	
	    </section>
	    <!-- STREAMS -->
	    <aside class="tickR"><span>stream</span></aside>
	    <aside id="streams"> 
		<div class="topMenu"><a href="#" title="" class="menuButton left">hide</a></div>
		<div class="scrollable">    
		    <section id="googlePlus" ></section>
		</div>
	    </aside>
	</div>

	<script src="./js/init.js"></script>
	<script type="text/javascript">
	    //Call our js
	    tplx.index.init();
	    tplx.streams.gplus();
	    //Done, time for analytics
	    var _gaq = _gaq || [];
	    _gaq.push(['_setAccount', 'UA-37573790-1']);
	    _gaq.push(['_trackPageview']);

	    (function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	    })();

	</script>
    </body> 
</html>
