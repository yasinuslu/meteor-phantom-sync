// Write your package code here!
var phantom = Npm.require('phantom');
PS = {};
PS._phantom = phantom;
PS._defaults = {
  dnodeOpts: {
    weak: false
  }
};

var runSync = function (fn) {
  var response = Async.runSync(fn);
  if(response.error) {
    throw response.error;
  } else {
    return response.result;
  }
};

var syncPhantomCreate = function (/* phantomjs arguments */) {
  var phCreateArguments = _.toArray(arguments);
  var options = _.clone(PS._defaults);
  if(phCreateArguments.length) {
    var lastArgument = phCreateArguments[phCreateArguments.length - 1];
    if(_.isFunction(lastArgument)) {
      throw new Meteor.Error('callback-not-allowed', "You shouldn't provide any callbacks");
    }

    if(_.isObject(lastArgument)) {
      phCreateArguments[phCreateArguments.length - 1] = _.extend(options, lastArgument);
    } else {
      phCreateArguments.push(options);
    }
  } else {
    phCreateArguments.push(options);
  }

  return runSync(function (done) {
    phantom.create.apply(phantom, phCreateArguments.concat([function (ph) {
      done(null, ph);
    }]));
  });
};

var syncCreatePage = function (/* createPage arguments */) {
  var ph = this;
  return runSync(function (done) {
    ph.createPage.call(ph, function (page) {
      done(null, page);
    });
  });
};

PS.getInstance = function (/* we may provide some arguments if we're optimistic */) {
  if(!PS._instance) {
    PS._instance = PS.create.apply(PS, arguments);
  }
  return PS._instance;
};

PS.create = function (/* phantom arguments */) {
  var ph = syncPhantomCreate.apply(phantom, arguments);
  return {
    _ph: ph,  // just in case
    exit: function () {
      ph.exit();
    },
    createPage: function () {
      var page = syncCreatePage.apply(ph, arguments);
      var psPage = {
        _page: page,  // just in case

        open: function (/* page.open arguments */) {
          var pageOpenArguments = _.toArray(arguments);
          return runSync(function (done) {
            page.open.apply(page, pageOpenArguments.concat([function (status) {
              done(null, status);
            }]));
          });
        },

        evaluate: function (/* page.evaluate arguments */) {
          var pageEvaluateArguments = _.toArray(arguments);
          return runSync(function (done) {
            page.evaluate.apply(page, pageEvaluateArguments.concat([function (result) {
              done(null, result);
            }]));
          });
        },

        close: function () {
          page.close();
        }
      };

      psPage.waitForVar = function (varName) {
        return runSync(function (done) {
          let startTime = new Date();
          let endTime = new Date(startTime.getTime() + 1000 * 4);
          let checkFunction = new Function(
            `
              return !!!window['${varName}'];
            `
          );

          let check = function () {
            if(psPage.evaluate(checkFunction)) {
              done(null, varName);
            } else if(new Date() < endTime) {
              setTimeout(check, 100);
            } else {
              done(new Error('Timeout '));
            }
          };

          check();
        });
      };

      psPage.getValue = function (varName) {
        psPage.waitForVar(varName);

        return psPage.evaluate(new Function(
          `
            return window['${varName}'];
          `
        ));
      };

      _.each(_.functions(psPage), (fnName) => {
        psPage[fnName] = Meteor.bindEnvironment(psPage[fnName]);
      });

      return psPage;
    }
  };
};
