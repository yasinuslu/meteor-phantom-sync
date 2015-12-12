Package.describe({
  name: 'yasinuslu:phantom-sync',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Sync API for phantomjs',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/yasinuslu/meteor-phantom-sync.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  phantom: '0.8.4'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use([
    'underscore',
    'meteorhacks:async@1.0.0'
  ]);

  api.addFiles([
    'phantom.js'
  ], 'server');

  api.export([
    'PS'
  ], 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('yasinuslu:phantom-sync');
  api.addFiles('phantom-tests.js');
});
