var qr = require('qr-image');

function _get(req, res) {
  var url = req.query.url;
  if (!url) res.end('url is needed');
  else {
    var img = qr.image(url, {
      type: 'svg'
    });
    res.type('svg');
    img.pipe(res);
  }
}

module.exports.get = _get;
