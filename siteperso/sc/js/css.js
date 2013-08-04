/* *************************************************************
 *	Loading any css file.
 ************************************************************** */

css = [
	{f:'normalize'},
	{f:'main'},
	{f:'style'},
	{f:'mediaqueries'},
    
];

for (var i in css)
    document.write('<' + 'link rel="stylesheet" href="./css/'+css[i].f+'.css"' + ' />');
	

