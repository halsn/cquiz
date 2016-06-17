var fs = require('fs');
var https = require('https');

var getURL = (baseURL) => {
  return new Promise((resolve, reject) => {
    https.get(baseURL, res => {
      var data = '';
      res.setEncoding('utf8');
      res.on('data', d => data += d);
      res.on('end', () => {
        var url = data.match(/https.+\"/)[0];
        resolve(url.slice(0, url.length - 1).replace(/amp\;/g, ''));
      });
      res.on('error', err => reject(err));
    }).on('error', err => reject(err));
  });
};

var getImage = (imgURL, file) => {
  return new Promise((resolve, reject) => {
    https.get(imgURL, res => {
      res.pipe(fs.createWriteStream(file));
      res.on('error', err => reject(err));
      resolve('end');
    }).on('error', err => reject(err));
  });
};

var getURLs = Array(7).fill().map(e => getURL('https://source.unsplash.com/category/nature/1080x720'));

Promise.all(getURLs)
  .then(urls => {
    var imgs = urls.map((url, idx) => getImage(url, `${idx}.jpg`));
    return Promise.all(imgs);
  })
  .then(() => {
    console.log('download finished!')
  })
  .catch(err => console.log(err));
