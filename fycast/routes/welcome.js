

/*
 * GET home page.
 */

exports.login = function(req, res){
  res.render('login', { title: 'tetot', user: req.user });
}
