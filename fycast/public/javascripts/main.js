$(function() {

	var videoPlayer = $("#player")[0].player;
//
	videoPlayer.addEvent("play", filter);
	videoPlayer.addEvent("pause", unfilter);
	videoPlayer.addEvent("fullscreenchange", screenToggle);

	$('#menu li').click(function (e){
    var __PATH = '/dl/'
	, 	__SRT = '/subs/'
	,	url = $(this).data('url')
	,	srt = $(this).data('srt');
		   // $vid_obj.ready(function() {
		   // 	$vid_obj.load()
		   // 	console.log(videoPlayer.textTracks[0].src)
		   // 	videoPlayer.textTracks[0].src =  __SRT+srt;
		   // 	videoPlayer.src({ type: "video/mp4", src: __PATH+url });

			//	$("track").attr('src',  __SRT+srt);
			//	$("video").attr('data-subtitles',  __SRT+srt);
		   // 	//$("video:nth-child(1)").children('track').attr('src',__SRT+srt)
		   // 	//$("video:nth-child(1)").attr('data-subtitles',__SRT+srt)
		   // 	//var nep = '<video id="player_html5_api" preload="no" data-setup="{}" data-subtitles="'+__SRT+srt+'" class="vjs-tech" src="'+__PATH+url+'"><track kind="captions" src="'+__SRT+srt+'" srclang="fr" label="fr"></track></video>';
		   // 	//$("#player")[0].content().remove().prepend(nep)
		   // 	$vid_obj.load()
		   // });
		    //<video id="player_html5_api" preload="no" data-setup="{}" data-subtitles="./subs/Arrow.S01E01.HDTV.x264-LOL.[VTV].srt" class="vjs-tech" src="./dl/Arrow.S01E01.HDTV.x264-LOL.[VTV].mp4"><track kind="captions" src="./subs/Arrow.S01E01.HDTV.x264-LOL.[VTV].srt" srclang="fr" label="fr"></track></video>
		//console.log($("track").attr('src', __SRT+srt));
		//console.log($("track").parent('video')[0].data('subtitles'));

				videoPlayer.src({ type: "video/mp4", src: __PATH+url });
				$("track").attr('src',  __SRT+srt);
				$("video").attr('data-subtitles',  __SRT+srt);


	})
});

var filter = function (){
	  var myPlayer = this;
	$('#player').css('z-index','13');
	$('.vjs-controls').css('z-index','14');
	$('#sfilter').animate({'margin-top':0},0);
	$('#menu').blurjs({
    	customClass: 'blurjs',
    	radius: 5,
    	persist: false
	});
};
var unfilter = function (){
	resetIndex();
	$('#sfilter').animate({'marginTop':'-900%'},0,function (){
		$.blurjs('reset');
	});
};
var resetIndex = function (){
	$('#sfilter').css('marginTop','-900%');
	$('#player').css('z-index','initial').css('position','initial');
	$('.vjs-controls').css('z-index','initial');
	$.blurjs('reset');
}
var screenToggle = function (){

	if(!$('#player').hasClass('fullScreened')){
		$('#player').addClass('fullScreened');
			$('#sfilter').hide().css('marginTop','-900%');
			$('#player').css('z-index','initial').css('position','initial');
			$('.vjs-controls').css('z-index','initial');
			$.blurjs('reset');
	} else {
		$('#player').removeClass('fullScreened');
		filter();
	}

}
/*


loadstart	Fired when the user agent begins looking for media data.
loadedmetadata	Fired when the player has initial duration and dimension information.
loadeddata	Fired when the player has downloaded data at the current playback position.
loadedalldata	Fired when the player has finished downloading the source data.
play	Fired whenever the media begins or resumes playback.
pause	Fired whenever the media has been paused.
timeupdate	Fired when the current playback position has changed. During playback this is fired every 15-250 milliseconds, depnding on the playback technology in use.
ended	Fired when the end of the media resource is reached. currentTime == duration
durationchange	Fired when the duration of the media resource is changed, or known for the first time.
progress	Fired while the user agent is downloading media data.
resize	Fired when the width and/or height of the video window changes.
volumechange	Fired when the volume changes.
error	Fired when there is an error in playback.
fullscreenchange	Fired when the player switches in or out of fullscreen mode.
*/