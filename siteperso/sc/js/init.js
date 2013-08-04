/* *************************************************************
 *	Loading any js file.
 ************************************************************** */
staticPath ='./js/';
vendorPath='./js/vendor/';

src = [
	{f:'jquery-1.8.3.min.js', n:1},
	{f:'jquery-ui-1.9.2.js', n:1},
	{f:'modernizr-2.6.2.min.js', n:1},
	{f:'jquery.wipetouch.js', n:1},
	{f:'modernizr-2.6.2.min.js', n:1},
	{f:'//apis.google.com/js/plusone.js',n:2},
	{f:'functions.js', n:0},
	{f:'lib.js', n:0},
    
];


for (var i in src)
{
    if (src[i].n === 0) document.write('<' + 'script type="text/javascript" src="' + staticPath + src[i].f + '"></sc' + 'ript>');
    else if (src[i].n === 1)  document.write('<' + 'script type="text/javascript" src="' + vendorPath + src[i].f + '"></sc' + 'ript>');
    else if (src[i].n === 2)  document.write('<' + 'script type="text/javascript" src="' + src[i].f + '"></sc' + 'ript>');	
}

