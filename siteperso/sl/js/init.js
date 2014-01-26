/* *************************************************************
 *	Loading any js file.
 ************************************************************** */
staticPath ='./js/';
vendorPath='./js/vendor/';

src = [
 {f:'//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js', n:2},
 {f:'//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js', n:2},
 {f:'//apis.google.com/js/plusone.js',n:2},
 {f:'gnmenu.js', n:0},
 {f:'classie.js', n:0},
 {f:'lib.js', n:0},
 
];
 
 
 for (var i in src)
 {
 if (src[i].n === 0) document.write('<' + 'script type="text/javascript" src="' + staticPath + src[i].f + '"></sc' + 'ript>');
else if (src[i].n === 1)  document.write('<' + 'script type="text/javascript" src="' + vendorPath + src[i].f + '"></sc' + 'ript>');
else if (src[i].n === 2)  document.write('<' + 'script type="text/javascript" src="' + src[i].f + '"></sc' + 'ript>');	
}

