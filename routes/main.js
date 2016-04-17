var router = require('express').Router();
var logout = require('./logout');
var forget = require('./forget');
var tLogin = require('./teacher/login');
var tSignup = require('./teacher/signup');
var tHome = require('./teacher/home');
var tCourse = require('./api/t/_course');
var tTeacher = require('./api/t/_teacher');
var tQset = require('./api/t/_qset');
var tClass = require('./api/t/_class');
var tTest = require('./api/t/_test');
var qr = require('./api/qr');

module.exports = router;

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/logout', logout);

router
  .get('/forget', forget)
  .post('/forget', forget);

router
  .get('/t/login', tLogin.get)
  .post('/t/login', tLogin.post);

router
  .get('/t/signup', tSignup.get)
  .post('/t/signup', tSignup.post);

router
  .get('/t/home', tHome.get);

router
  .get('/api/t/course', tCourse.get)
  .post('/api/t/course', tCourse.post)
  .put('/api/t/course', tCourse.put)
  .delete('/api/t/course', tCourse.del);
router
  .get('/api/t/qset', tQset.get)
  .post('/api/t/qset', tQset.post)
  .put('/api/t/qset', tQset.put)
  .delete('/api/t/qset', tQset.del);

router
  .get('/api/t/class', tClass.get)
  .post('/api/t/class', tClass.post)
  .put('/api/t/class', tClass.put)
  .delete('/api/t/class', tClass.del);


router
  .get('/api/t/test/:uuid', tTest.get)
  .post('/api/t/test', tTest.post)
  .put('/api/t/test/:uuid', tTest.put)
  .delete('/api/t/test/:uuid', tTest.del);

router
  .get('/api/qr', qr.get);

router.get('*', (req, res) => {
  res.status(404).render('404');
});
