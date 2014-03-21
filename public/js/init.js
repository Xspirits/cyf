/* *************************************************************
 *	Loading any js file.
 ************************************************************** */

 var url = window.location.href;var arr = url.split("/");var result = arr[0] + "//" + arr[2];
 src = [
 '/js/main.js',
 '/js/challengeBox.js',
 '/js/bootstrap.switch.js',
 '/js/nprogress.js',
 '/js/odometer.min.js',
 '/js/nouislider.min.js',
 '/js/touchspin.js',
 '/js/datePicker.js',
 '/js/moment-cd.js',
 '/js/countdown.min.js',
 '/js/moment.min.js',
 '/js/ladda.min.js',
 '/js/spin.min.js',
 '/js/alertify.min.js',
 '/js/navmenu.js',
 '/js/md5.js',
 '/js/file-input.js',
 '/js/identicons.js',
 '/js/bootstrap.min.js',
 '/js/jquery-ui.min.js',
 '/js/jquery.min.js'
 // '//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js',
 // '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js',
 // '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'
 ];
 for (var i = src.length - 1; i >= 0; i--) {
 	document.write('<' + 'script type="text/javascript" src="' + result + src[i] + '"></sc' + 'ript>');
 }
 // '//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js',
 // '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js',
 // '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js',