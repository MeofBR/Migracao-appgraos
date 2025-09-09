#!/usr/bin/env node

module.exports = function(context) {
    /** @external */
    var fs = require('fs'),
        path = require('path'),
        shell = require('shelljs');

    var projectWWWDir = path.join(context.opts.projectRoot, 'www'),
        projectConfigXmlFile = path.join(context.opts.projectRoot, 'config.xml');

    // Determine project package name from config.xml
    var configContent = fs.readFileSync(projectConfigXmlFile).toString();
    var id = /id=\"(.*)\" v/.exec(configContent)[1];

    // Update app config with package name
    shell.sed('-i', /\"appID\": \"\",/, '"appID": "' + id + '",', path.join(projectWWWDir, 'appConfig.js'));
};
