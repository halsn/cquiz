'use strict';

module.exports.get = function (req, res) {
  if (!req.session.user) return res.redirect('login');
  var user = req.session.user;
  res.locals.username = user.name;
  res.locals.useremail = user.email;
  res.render('t/home');
};
