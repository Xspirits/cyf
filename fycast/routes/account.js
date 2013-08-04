
/*
 * GET home page.
 */

exports.account = function(req, res){
  res.render('account', { title: 'tetot', user: req.user });
}