var express = require('express');
var router = express.Router();
var app = express();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Домашний счётчик', publishedModules: req.app.get('mainData').publishedModules });
});

router.post('/setMeter', function(req, res, next) {
  var modules = req.app.get('mainData').publishedModules;

  if (req.body.alias && req.body.value) {
    for (var i in modules) {
      if (modules[i].alias == req.body.alias) {
        modules[i].setValue(req.body.value);
      }
    }
  }

  res.redirect('/');
});

router.post('/submitMeasure', function(req, res, next) {
  var modules = req.app.get('mainData').publishedModules;

  if (req.body.alias) {
    for (var i in modules) {
      if (modules[i].alias == req.body.alias) {
        modules[i].submitter.submit();
      }
    }
  }

  res.redirect('/');
});

module.exports = router;
