#!/usr/bin/env node

module.exports = function (context) {

    // Verify if the platform is Windows
    if (context.opts.platforms.indexOf('windows') < 0) {
        console.log('Skip manageManifest hook. Windows platform is not available.');
        return;
    }

    /** @external */
    var path = require('path');
    var platformRoot = path.join(context.opts.projectRoot, '/platforms/windows');

    var fs = require('fs'),
        xml2js = require('xml2js');

    // Here we check the Capabilities because Cordova doesn't generate all the necessary ones
    function addMissingCapabilities(result) {
        var temp = result.Package.Capabilities[0];
        var capabilities = {};
        capabilities['Capability'] = temp['Capability'];
        if (typeof temp['uap:Capability'] !== "undefined" && temp['uap:Capability'] != null) {
            capabilities['uap:Capability'] = temp['uap:Capability'];
        }
        DeviceCapability = [];
        DeviceCapability.push({ $: { Name: "location" } });
        DeviceCapability.push({ $: { Name: "microphone" } });
        DeviceCapability.push({ $: { Name: "webcam" } });
        capabilities['DeviceCapability'] = DeviceCapability;
        result.Package.Capabilities[0] = capabilities;
        var builder = new xml2js.Builder();
        writeManifest(builder.buildObject(result));
    }

    // Here we are reading our generated manifest file to object.
    function readManifest() {
        var parser = new xml2js.Parser();
        var data = fs.readFileSync(platformRoot + '/package.windows10.appxmanifest');
        parser.parseString(data, function (err, result) {
            if (result !== null) {
                addMissingCapabilities(result);
            }
        });
    }

    // Write back our manipulated object to file. 
    function writeManifest(resultString) {
        fs.writeFileSync(platformRoot + "/package.windows10.appxmanifest", resultString);
    }

    readManifest(platformRoot);
};