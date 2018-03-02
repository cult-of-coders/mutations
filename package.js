Package.describe({
    name: 'cultofcoders:mutations',
    version: '0.1.0',
    // Brief, one-line summary of the package.
    summary: 'A new way to think about mutations inside Meteor',
    // URL to the Git repository containing the source code for this package.
    git: 'https://github.com/cult-of-coders/mutations',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md',
});

Package.onUse(function(api) {
    api.versionsFrom('1.3');
    api.use('ecmascript');
    api.use('check');
    api.mainModule('main.js');
});

Package.onTest(function(api) {
    api.use('ecmascript');
    api.use('cultofcoders:mutations');

    api.use('cultofcoders:mocha');
    api.use('practicalmeteor:chai');

    api.mainModule('__tests__/main.server.test.js');
    api.mainModule('__tests__/main.client.test.js');
});
