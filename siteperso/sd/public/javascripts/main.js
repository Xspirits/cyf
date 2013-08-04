;(function ($){
	var mDelay = 211
		, menu = $('#navMenu');

/**
 * MENU
 */
	menu
		.on('mouseleave', function () {
			var launchClose = setTimeout(hideMenu, mDelay);
		});

	menu
		.on('mouseover', function () { 
		setTimeout(showMenu, mDelay);
	});

	
/**
 * TILES
 */
	$('.tile')
		.on('mouseover', 
		  function () {
		    $(this).addClass("animated wiggle");
		  },
		  function () {
		    $(this).removeClass("animated wiggle");
		  }
		);

	var hideMenu = function() {
		menu
			.addClass('bounceOutLeft')
			.removeClass('bounceInLeft');
	}

	var showMenu = function() {
		menu
			.removeClass('bounceOutLeft')
			.addClass('bounceInLeft');
	}
	$(document).swipe({
		 wipeLeft: function() { slidemenu(); },
		 wipeRight: function() { slidemenu(); },
		 min_move_x: 40,
		 min_move_y: 20,
		 preventDefaultEvents: false
	});
})(Zepto)
