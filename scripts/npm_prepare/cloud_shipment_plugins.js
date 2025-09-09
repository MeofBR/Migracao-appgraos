#!/usr/bin/env node

/**
 * For CloudShipment, after executing npm install @sap-kapsel/create_fiori_client@4.7.xx, 
 * execute the code logic of the current file to download and install the specified list of plugins.
 */

var fs = require('fs'),
    path = require('path'),
    shell = require('shelljs');

var rootPath = path.normalize(path.join(__dirname, '..', '..', '..')),
    parentPath = path.normalize(path.join(rootPath, '..')),
    downloadPath = path.normalize(path.join(rootPath, 'node_modules', '@sap-kapsel')),
    plugins = {
        "@sap-kapsel/kapsel-plugin-apppreferences": "4.7.32",
        "@sap-kapsel/kapsel-plugin-appupdate": "4.7.32",
        "@sap-kapsel/kapsel-plugin-attachmentviewer": "4.7.32",
        "@sap-kapsel/kapsel-plugin-authproxy": "4.7.32",
        "@sap-kapsel/kapsel-plugin-barcodescanner": "4.7.32",
        "@sap-kapsel/kapsel-plugin-cachemanager": "4.7.32",
        "@sap-kapsel/kapsel-plugin-calendar": "4.7.32",
        "@sap-kapsel/kapsel-plugin-cdsprovider": "4.7.32",
        "@sap-kapsel/kapsel-plugin-consent": "4.7.32",
        "@sap-kapsel/kapsel-plugin-corelibs": "4.7.32",
        "@sap-kapsel/kapsel-plugin-document-service": "4.7.32",
        "@sap-kapsel/kapsel-plugin-e2etrace": "4.7.32",
        "@sap-kapsel/kapsel-plugin-encryptedstorage": "4.7.32",
        "@sap-kapsel/kapsel-plugin-federationprovider": "4.7.32",
        "@sap-kapsel/cordova-plugin-file-transfer": "4.7.32",
        "@sap-kapsel/kapsel-plugin-fioriclient": "4.7.32",
        "@sap-kapsel/kapsel-plugin-i18n": "4.7.32",
        "@sap-kapsel/kapsel-plugin-inappbrowser": "4.7.32",
        "@sap-kapsel/kapsel-plugin-inappbrowser-xwalk": "4.7.32",
        "@sap-kapsel/kapsel-plugin-keychaincertprovider": "4.7.32",
        "@sap-kapsel/kapsel-plugin-logger": "4.7.32",
        "@sap-kapsel/kapsel-plugin-logon": "4.7.32",
        "@sap-kapsel/kapsel-plugin-multidex": "4.7.32",
        "@sap-kapsel/kapsel-plugin-odata": "4.7.32",
        "@sap-kapsel/kapsel-plugin-online": "4.7.32",
        "@sap-kapsel/de.appplant.cordova.plugin.printer": "4.7.32",
        "@sap-kapsel/cordova-plugin-privacyscreen": "4.7.32",
        "@sap-kapsel/kapsel-plugin-push": "4.7.32",
        "@sap-kapsel/kapsel-plugin-xhook": "4.7.32",
        "@sap-kapsel/kapsel-plugin-settings": "4.7.32",
        "@sap-kapsel/cordova-plugin-statusbar": "4.7.32",
        "@sap-kapsel/kapsel-plugin-toolbar": "4.7.32",
        "@sap-kapsel/kapsel-plugin-ui5": "4.7.32",
        "@sap-kapsel/kapsel-plugin-usage": "4.7.32",
        "@sap-kapsel/kapsel-plugin-voicerecording": "4.7.32"
    };

installCloudShipmentPlugins();

function installCloudShipmentPlugins() {
    // Check that the parent directory is '@sap-kapsel'.
    if(parentPath.lastIndexOf('@sap-kapsel') > 0) {
        console.log('For Cloud Shipment, start downloading the kapsel plugin list.');
        for(var key in plugins) {
            var plugin =  key + '@' + plugins[key];
            console.log('Download the plugin "' + plugin + '"...');
            shell.config.silent = true;
            // Download and install the specified plugin from CloudShipment
            shell.exec('npm install ' + plugin);
            shell.config.silent = false;
        }
        console.log('The download is complete, start adjusting the directory structure.');
        // Move all downloaded plugins to the parent directory.
        copyDir(downloadPath, parentPath);
        // Clean up the download directory after copying the directory.
        fs.rmSync(downloadPath, { recursive: true });
        console.log('Directory structure adjustment has been completed, all plugins are stored in the "' + parentPath + '" directory.');
        updConfig();
    }
}

// Copy the source directory files and subdirectory files to the target directory.
function copyDir(sd, td) {
    // Reads the files in the directory and returns the filename and file type.
    sFiles = fs.readdirSync(sd, {withFileTypes: true});
    sFiles.forEach(ele => {
        // source path and filename, target path and filename.
        const src = path.resolve(sd, ele.name), target = path.resolve(td, ele.name);
        if(ele.isDirectory()){
            // create a target directory if ele is directory and target directory does not exists.
            if(!fs.existsSync(target)){
                fs.mkdirSync(target, err => console.log(err));
            }
            copyDir(src, target);
        }
        // copy the source file to target file.
        !ele.isDirectory() && fs.copyFileSync(src, target, fs.constants.COPYFILE_FICLONE);
    });
}

function updConfig(){
    var config = {};
    try {
        var configFile = path.normalize(path.join(rootPath, 'config.json'));
        if(fs.existsSync(configFile)){
            config = JSON.parse(fs.readFileSync(configFile));
            // set local plugin search path
            config.localPluginSearchPath = parentPath;
            // Write updated config file
            fs.writeFileSync(configFile, JSON.stringify(config), 'utf-8');
        }
    } catch (e) {
        console.error('Failed to read config file: ' + configFile);
        console.error(e);
    }
}
