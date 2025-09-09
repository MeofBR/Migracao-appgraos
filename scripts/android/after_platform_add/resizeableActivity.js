module.exports = function(context) {
    var fs = require('fs'),
    path = require('path'),
    xml = context.requireCordovaModule('cordova-common').xmlHelpers;

    var manifestPath = path.join(context.opts.projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
    var doc = xml.parseElementtreeSync(manifestPath);
    doc.getroot().find('./application').attrib['android:resizeableActivity'] = "true";

    if (fs.existsSync(manifestPath)) {
        fs.writeFileSync(manifestPath, doc.write({
            indent: 4
        }), 'utf-8');
    }
};