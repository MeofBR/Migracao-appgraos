#!/usr/bin/env node

module.exports = function(context) {

    // Verify if the platform is iOS
    if (context.opts.platforms.indexOf('ios') < 0) {
        console.log('Skip addInfoPlistStrings hook. iOS platform is not available.');
        return;
    }

    /** @external */
    var fs = require('fs'),
        path = require('path'),
        shell = require('shelljs'),
        xcode = require('xcode');

    var iosPlatformDir = path.join(context.opts.projectRoot,
            'platforms', 'ios'),
        fileName = 'Root.plist',
        infoPlistStringsDir = path.join(context.opts.projectRoot,
            'scripts', 'ios', 'after_prepare', 'infoPlistStrings');

    if (fs.existsSync(iosPlatformDir)) {
        var xcodeproj = fs.readdirSync(iosPlatformDir).filter(
                function(e) {
                    return e.match(/\.xcodeproj$/i);
                })[0],
            project = xcodeproj.substring(xcodeproj.lastIndexOf(path.sep) + 1, xcodeproj.indexOf('.xcodeproj')),
            resourcesDir = path.join(iosPlatformDir,
                project, 'Resources');

        var infoPlistPaths = [];

        // Copy strings files to project
        fs.readdirSync(infoPlistStringsDir).forEach(locale => {
            var srcFile = path.join(infoPlistStringsDir, locale, 'InfoPlist.strings')
            var destDir = path.join(resourcesDir, locale);
            var destFile = path.join(destDir, 'InfoPlist.strings');
            
            if (fs.existsSync(srcFile) && !fs.existsSync(destFile)) {
                if (!fs.existsSync(destDir)) {
                    shell.mkdir(destDir);
                }
                shell.cp(srcFile, destDir);

                if (fs.existsSync(destFile)) {
                    infoPlistPaths.push(path.join(locale, 'InfoPlist.strings'));
                }
            }
        });

        // Add the strings files to the Xcode project
        if (infoPlistPaths.length > 0) {
            var xcodeprojFile = path.join(iosPlatformDir, project + ".xcodeproj", 'project.pbxproj');
            var proj = xcode.project(xcodeprojFile);
            proj.parseSync();

            var groupName = 'InfoPlist.strings'
            var groupKey = proj.findPBXVariantGroupKey({name: groupName});
            if (!groupKey) {
                var localizableStringVarGroup = proj.addLocalizationVariantGroup(groupName);
                groupKey = localizableStringVarGroup.fileRef;
            }

            infoPlistPaths.forEach(function (path) {
                proj.addResourceFile("Resources/" + path, {variantGroup: true}, groupKey);
            });
            fs.writeFileSync(xcodeprojFile, proj.writeSync());
        }
    }
};