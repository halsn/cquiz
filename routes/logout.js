'use strict';

module.exports = function (req, res) {
  req.session.destroy(err => {
    if (err) {
      res.render('5xx');
    } else {
      res.redirect('/');
    }
  });
}
