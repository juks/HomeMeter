var r = require('request');
var helpers = require('../../../helpers');

var jar = r.jar();
var metersTypes = {1: 'cold', 2: 'hot', 3: 'WhyNot?'};

function pgu(meter, options) {
  this.title = "pgu.mos.ru";
  this.meter = meter;

  this.urlLogin   = 'https://login.mos.ru/eaidit/eaiditweb/outerlogin.do';
  this.urlCountersInfo= 'https://pgu.mos.ru/ru/application/guis/1111/';
  this.urlSubmitValue = 'https://pgu.mos.ru/ru/application/guis/1111/';
  this.username   = options.username;
  this.password   = options.password;
  this.flatNumber = options.flatNumber;
  this.payerId    = options.payerId;
  this.countersInfo   = [];
}

// System login
pgu.prototype.login = function(next) {
  dd('Logging in to PGU');

  r.post({
            url:this.urlLogin,
            jar: jar,
            followAllRedirects: true,
            form: {username: this.username, password: this.password}},

  function(err,httpResponse,body) {в
    if (httpResponse && httpResponse.statusCode == 200) {
      if (next) next();
    } else {
      this.setSubmitResult('Failed to login');
    }
  }.bind(this));
}

// Counters info retrieval
pgu.prototype.getCountersInfo = function(next) {
  dd('Fetching counters info');

  r.post({
            url:this.urlCountersInfo,
            jar: jar,
            followAllRedirects: false,
            form: {getCountersInfo: true, requestParams: {paycodeFlat: {paycode: this.payerId, flat: this.flatNumber }}}},

  function(err, httpResponse, body) {
    if (httpResponse && httpResponse.statusCode == 200) {
      var data = JSON.parse(body);

      if (data) {
        if (data.hasOwnProperty('counter')) {
          this.countersInfo = data.counter;

          if (next) next();
        } else {
          dd('No meters data!');
        }
      }
    } else {
      this.setSubmitResult('Failed to get meters info');
    }
  }.bind(this));
}

// Submit counters values
pgu.prototype.submitValues = function() {
  if (!this.meter) {
    this.setSubmitResult('No meter data');
    return;
  }

  dd('Submitting meter value');

  var d = new Date();
  var period = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).substr(-2) + '-' + ('0' + d.getDate()).substr(-2);

  for (var c in this.countersInfo) {
    var typeString = this.countersInfo[c].hasOwnProperty('type') && metersTypes.hasOwnProperty(this.countersInfo[c].type) ? metersTypes[this.countersInfo[c].type] : '';

    if (!typeString) {
      dd('Incorrect meter type');
      continue;
    }

    if (this.meter.type == 'water' && this.meter.kind == typeString) {
      var formData = {addCounterInfo: true, values: {paycode: this.payerId, indications: [{
        counterNum: this.countersInfo[c].counterId,
        counterVal: this.meter.getMeasure(),
        num:        this.countersInfo[c].num,
        period:     period
      }]}};

      dd(formData);

      new r.post({
          url: this.urlCountersInfo,
          jar: jar,
          followAllRedirects: false,
          form: formData
        },

        function (err, httpResponse, body) {
          if (httpResponse && httpResponse.statusCode == 200) {
            result = JSON.parse(body);
            this.setSubmitResult(result.hasOwnProperty('error') ? result.error : '');
          } else {
            this.setSubmitResult('Failed to submit counter ' + this.meter['alias'] + ' value');
          }
        }.bind(this));
    }
  }
}

// Store submission result
pgu.prototype.setSubmitResult = function(error) {
  this.meter.submitResult = {date: helpers.getDate(), message: error ? error : 'ok'};
  if (error) dd(error);
}

// Main invocant method
pgu.prototype.submit = function() {
  this.login(function() {
                          this.getCountersInfo(function() {
                            this.submitValues();
                          }.bind(this))
                        }.bind(this));
}

module.exports = pgu;