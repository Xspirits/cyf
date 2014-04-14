	window.odometerOptions = {
		selector: '.odometer',
		format: '(,ddd).dd'
	};
function secondsToTime(secs)
{
    var hours = Math.floor(secs / (60 * 60));
   
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);
 
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);
   
    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}
  var readability = function(){
    $('.dateReadability').each( function () {
      var date = $(this).attr('data-date');
      var converted = moment(date).format('dddd DD MMMM HH[h]mm');
      $(this).text(converted);
    })
  };  
  var readabilityMin = function(){
    $('.minutesReadability').each( function () {
      var date = parseInt($(this).attr('data-date'), 10);
      console.log(date)
      var o = secondsToTime(date);
      var h = o.h > 0? ' ' + o.h + ' h' : '';
      var m = o.m > 0? ' ' + o.m + ' m' : '';
      var s = o.s > 0? ' ' + o.s + ' s' : '';
      converted = h + m + s
      $(this).text(converted);
    })
  };
	var readabilityAgo = function(){
		$('.timeAgo').each( function () {
			var date = $(this).attr('data-date');
			var converted = moment(date).fromNow();
			$(this).text(converted);
		})
	};
	var notif = function(queue, i) {  
		var i = i ? i : queue.length - 1;
		console.log(queue)
		console.log(i)
		setTimeout(function () { 
			if(queue[i]) sendNotif(queue[i][0],queue[i][1],queue[i][2]);
			if (--i && i > -1) notif(queue, i);   			
		}, 288)

	};
	var sendNotif= function(msg, idNotif, del) {

		alertify.log(msg, 'info');

		var target = {					
			delete : del,
			id : idNotif
		}
		$.ajax({
			type: 'POST',
			data: JSON.stringify(target),
			contentType: 'application/json',
			url: './markNotifRead',						
			success: function(data) {
				console.log(data);
			}
		});				
	}
