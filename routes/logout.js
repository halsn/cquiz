var logout = function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            res.render('5xx');
        } else {
            res.redirect('/');
        }
    });
}

module.exports = logout;