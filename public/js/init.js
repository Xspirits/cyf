/* *************************************************************
 *	Loading any js file.
 ************************************************************** */

 var url = window.location.href;var arr = url.split("/");var result = arr[0] + "//" + arr[2];
 src = [
 'main.js',
 'completed.js',
 // 'challengeBox.js',
 'bootstrap.switch.js',
 'nprogress.js',
 // 'bg.js',
 'odometer.min.js',
 'nouislider.min.js',
 'touchspin.js',
 'datePicker.js',
 'moment-cd.js',
 'countdown.min.js',
 'moment.min.js',
 'ladda.min.js',
 'spin.min.js',
 'alertify.min.js',
 'navmenu.js',
 'file-input.js',
 'bootstrap.min.js',
 'jquery-ui.min.js',
 'jquery.min.js'
 // '//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js',
 // '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js',
 // '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'
 ];
 for (var i = src.length - 1; i >= 0; i--) {
 	document.write('<' + 'script type="text/javascript" src="' + result +'/js/' +  src[i] + '"></sc' + 'ript>');
 }
 // '//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js',
 // '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js',
 // '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js',