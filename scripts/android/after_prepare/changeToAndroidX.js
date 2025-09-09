#!/usr/bin/env node

module.exports = function(context) {

    // Verify if the platform is Android
    if (context.opts.platforms.indexOf('android') < 0) {
        console.log('Skip changeToAndroidX hook. Android platform is not available.');
        return;
    }

    /** @external */
    var fs = require('fs'),
        path = require('path'),
        xml2js = require("xml2js"),
        shell = require('shelljs');

    var cameraPath  = path.join(context.opts.projectRoot,
            'platforms','android','app','src','main','java','org','apache','cordova','camera');
    var fileProviderPath = path.join(cameraPath,'FileProvider.java')
    var cameraLauncherPath = path.join(cameraPath,'CameraLauncher.java')

    var candidateList = [fileProviderPath,cameraLauncherPath]
    for(var i in candidateList){
        var candidatePath = candidateList[i];
        if(!fs.existsSync(candidatePath)){
            continue;
        }

        var data = fs.readFileSync(candidatePath,'utf8');
        var result = data.replace(/android\.support\.v4\.content/g,'androidx.core.content');
        fs.writeFileSync(candidatePath,result,'utf8');
    }
	
    var resDir = path.join(context.opts.projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'res'),
    valuesV27Folder = path.join(context.opts.projectRoot, 'res', 'android', 'values-v27'),
    valuesNightFolder = path.join(context.opts.projectRoot, 'res', 'android', 'values-night');
    shell.cp('-R', valuesV27Folder,resDir);
    shell.cp('-R', valuesNightFolder,resDir);

    // The following part was for Android Splash scrren themes change
    var androidPlatformDir = path.join(context.opts.projectRoot, 'platforms', 'android'),
    themeFileNameThemes = 'themes.xml',
    themesFile = path.join(androidPlatformDir, 'app', 'src', 'main', 'res', 'values', themeFileNameThemes),
    v31ThemeFolder = path.join(androidPlatformDir, 'app', 'src', 'main', 'res', "values-v31"),
    v31ThemeFile = path.join(v31ThemeFolder, themeFileNameThemes);   

    // Try to add "android:windowOptOutEdgeToEdgeEnforcement" item. This is a workaround to support Android SDK 35.
    // Please remove this logic after adopting cordova-android 14.0.1.
    var themmsContent = fs.readFileSync(themesFile);
    var parser = xml2js.Parser({}); // Don't set mergeAttrs as true for parse to avoid write back xml with error format
    parser.parseString(themmsContent,function(err,result){

        if (err) {
            console.error('xml2js.parseString: Error occurred: ', err);
        } else {
            if (result.resources && result.resources.style) {
                var style = result.resources.style,
                index = -1;
                for (let i = 0; i < style[0].item.length; i++) {
                    if (style[0].item[i].$.name == "android:windowOptOutEdgeToEdgeEnforcement") {
                        index = i;
                    }
                }
                if (index == -1) {
                    console.log("Add the property 'android:windowOptOutEdgeToEdgeEnforcement' to " + themesFile)
                    style[0].item.push({
                        $: {
                            name: "android:windowOptOutEdgeToEdgeEnforcement",
                            "tools:targetApi": "35"
                        },
                        _: true
                    });
                    var builder = new xml2js.Builder({ ignoreAttrs: false });
                    var xml = builder.buildObject(result);
                    fs.writeFileSync(themesFile, xml);
                }
            }
        }
    });

    try {
        // Try to duplicate the themes file under new folder 'values-v31/themes' which was used for Android API 31 and above
        if (fs.existsSync(themesFile)) {
            if (fs.existsSync(v31ThemeFile)) {
                fs.unlinkSync(v31ThemeFile);
            }
            if (!fs.existsSync(v31ThemeFolder)){
                fs.mkdirSync(v31ThemeFolder);
            }
            shell.cp('-R', themesFile, v31ThemeFolder);
        }
      } catch(err) {
        console.error(err)
    }

    // Try to remove the 'windowSplashScreenBrandingImage' property which only support for Android API 31 and above
    themmsContent = fs.readFileSync(themesFile);
    parser = xml2js.Parser({}); // Don't set mergeAttrs as true for parse to avoid write back xml with error format
    parser.parseString(themmsContent,function(err,result){
        
        if (err) {
            console.error('xml2js.parseString: Error occurred: ', err);
        } else {
            if (result.resources && result.resources.style) {
                var style = result.resources.style,
                index = -1;
                for (let i = 0; i < style[0].item.length; i++) {
                    if (style[0].item[i].$.name == "windowSplashScreenBrandingImage") {
                        index = i;
                    }
                }
                if (index > -1) {
                    console.log("Remove the unexpected property 'windowSplashScreenBrandingImage' from " + themesFile)
                    delete result.resources.style[0].item[index]
                    var builder = new xml2js.Builder({ ignoreAttrs: false });
                    var xml = builder.buildObject(result);
                    fs.writeFileSync(themesFile, xml);
                }
            }
        }
    });

    // Try to change the 'windowSplashScreenBrandingImage' property to 'android:windowSplashScreenBrandingImage'in V31 themes.xml
    const v31ThemmsContent = fs.readFileSync(v31ThemeFile);
    parser.parseString(v31ThemmsContent,function(err,result){
        
        if (err) {
            console.error('xml2js.parseString: Error occurred: ', err);
        } else {
            if (result.resources && result.resources.style) {
                var style = result.resources.style,
                index = -1;
                var foundStatusBarTheming = false;
                var foundNavigationBarTheming = false;
                for (let i = 0; i < style[0].item.length; i++) {
                    if (style[0].item[i].$.name == "windowSplashScreenBrandingImage") {
                        style[0].item[i].$.name = "android:windowSplashScreenBrandingImage"
                        var builder = new xml2js.Builder();
                        var xml = builder.buildObject(result);
                        fs.writeFileSync(v31ThemeFile, xml);
                    }
                    if(style[0].item[i].$.name == "android:windowLightStatusBar"){
                        foundStatusBarTheming = true
                    }
                    if(style[0].item[i].$.name == "android:windowLightNavigationBar"){
                        foundNavigationBarTheming = true
                    }

                }
                if(!foundStatusBarTheming){
                    style[0].item.push({
                        $:{
                            name: "android:windowLightStatusBar"

                        },
                        _: true
                        
                    })

                    var builder = new xml2js.Builder();
                    var xml = builder.buildObject(result);
                    fs.writeFileSync(v31ThemeFile, xml);
                }
                if(!foundNavigationBarTheming){
                    style[0].item.push({
                        $:{
                            name: "android:windowLightNavigationBar"

                        },
                        _: true
                        
                    })

                    var builder = new xml2js.Builder();
                    var xml = builder.buildObject(result);
                    fs.writeFileSync(v31ThemeFile, xml);
                }
            }
        }
    });
    
    var mainActivityPath = "res/android/MainActivity.java";

    var mainActivityData= fs.readFileSync(mainActivityPath,"utf8");
    var androidJson = path.join(androidPlatformDir,"android.json");
    var data = fs.readFileSync(androidJson);
    var jsonData= JSON.parse(data);
    var packageName = jsonData.installed_plugins["kapsel-plugin-corelibs"].PACKAGE_NAME;
    var newPackageNameInMainActivity = "package "+ packageName+";"
    const modifiedMainActivityData = mainActivityData.replace("package com.sap.fiori.client;", newPackageNameInMainActivity);
    fs.writeFileSync(mainActivityPath,modifiedMainActivityData,"utf8");
    var packageArray = packageName.split(".");
    var javaPath = path.join(androidPlatformDir,"app","src","main","java");
    packageArray.unshift(javaPath);
    packageArray.push("MainActivity.java");
    var targetMainActivityPath = path.join(...packageArray);
    shell.cp(mainActivityPath,targetMainActivityPath);
};
