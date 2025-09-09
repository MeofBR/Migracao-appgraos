#!/usr/bin/env node

// declare dependencies in package.json of the plugin, e.g.:
//
//  "dependencies": {
//    "shelljs" : "~0.8.3"
//  }
//

module.exports = function (context) {
    console.log("installing shelljs & xml2js & elementtree & semver...");
    var cp = require('child_process'),
        fs = require('fs'),
        path = require('path');
    var sPath =context.opts.searchpath,
        currentCordovaVersion = context.opts.cordova.version;

    // note: do not install the npm package to projectRoot/node_modules, because that folder will be overwritten during `cordova platform add`.
    // So we install shelljs to projectRoot/scripts/node_modules.
    // Install the shelljs & xml2js & elementtree & semver modules to projectRoot/scripts/node_modules to avoid require("shelljs") & require("xml2js") &
    // require("elementtree") & require("semver") failed when the generated project was not under 'SDK/apps/fiori_client folder'
    cp.execSync('npm install --force --no-save --prefix ' + path.join(context.opts.projectRoot, 'scripts') + ' shelljs xml2js elementtree semver', {stdio:'inherit'});
   
    var et = require(path.join(context.opts.projectRoot, 'scripts', 'node_modules','elementtree')),
        semver = require(path.join(context.opts.projectRoot, 'scripts', 'node_modules','semver'));

    // If it is Cordova@11.* and the searchpath is not empty, update the spec property of the plugin to the directory.
    if(semver.gte(currentCordovaVersion, '11.0.0') && (sPath!== undefined && fs.existsSync(sPath))) {
        var configXMLFile = path.join(context.opts.projectRoot, 'config.xml');        
        var contents = fs.readFileSync(configXMLFile, 'utf-8');
        if(contents) {
            // Skip the Byte Order Mark.
            contents = contents.substring(contents.indexOf('<'));
        }
        var doc = new et.ElementTree(et.XML(contents));
        
        // Reads the folder in the directory and returns the folder name and type.
        sFiles = fs.readdirSync(sPath, {withFileTypes: true});
        sFiles.forEach(ele => {
            // plugin directory, plugin root directory plugin.xml file.
            var src = path.resolve(sPath, ele.name), pluginXml = path.join(src, 'plugin.xml');
            if(ele.isDirectory() && fs.existsSync(pluginXml)){
                var xmlContents = fs.readFileSync(pluginXml, 'utf-8');
                var root = new et.ElementTree(et.XML(xmlContents)).getroot();               
                // Update plugin spec
                var pluginElement = doc.find('./plugin/[@name="' + root.attrib.id + '"]');
                if (pluginElement) {
                    pluginElement.attrib.spec = src;
                }
            }
        });
        // Write updated XML file
        fs.writeFileSync(configXMLFile, doc.write({indent: 4}), 'utf-8');
    }
};