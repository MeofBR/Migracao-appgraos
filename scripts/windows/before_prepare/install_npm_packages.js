#!/usr/bin/env node

module.exports = function (context) {

    // Verify if the platform is Windows
    if (context.opts.platforms.indexOf('windows') < 0) {
        console.log('Skip install_npm_packages hook. Windows platform is not available.');
        return;
    }

    var exec = require('child_process').execSync,
        child;

    child = exec('npm install xml2js',
        function (error, stdout, stderr) {
            
            if(stdout && typeof stdout != "undefined") {
                console.log('stdout: ' + stdout);    
            }
            if(stderr && typeof stderr != "undefined") {
                console.log('stderr: ' + stderr);
            }
            
            if (error !== null) {
                console.log('exec error: ' + error);
            }
    });

};