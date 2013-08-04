/* *************************************************************
 *	Loading any js file.
 ************************************************************** */
staticPath ='/javascripts/';

src = [
	{f:'//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js', n:1},

	{f:'bootstrap.min.js', n:0},
	{f:'bootstrap-transition.js', n:0},
	{f:'bootstrap-collapse.js', n:0},
	{f:'main.js', n:0},
    
];


for (var i in src)
{
    if (src[i].n === 0) document.write('<sc' + 'ript type="text/javascript" src="' + staticPath + src[i].f + '"></sc' + 'ript>');
    else if (src[i].n === 1)  document.write('<sc' + 'ript type="text/javascript" src="' + src[i].f + '"></sc' + 'ript>');	
}
