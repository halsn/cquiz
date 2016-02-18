'use strict';

exports.get = function (req, res) {
  if (req.session.user) {
    var user = req.session.user;
    res.locals.username = user.name;
    res.locals.useremail = user.email;
    res.render('s/home');
  } else {
    res.redirect('login');
  }
}
