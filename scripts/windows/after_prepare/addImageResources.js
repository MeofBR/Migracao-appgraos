#!/usr/bin/env node

module.exports = function(context) {

    // Verify if the platform is Windows
    if (context.opts.platforms.indexOf('windows') < 0) {
        console.log('Skip addImageResources hook. Windows platform is not available.');
        return;
    }

    /** @external */
    var fs = require('fs'),
    path = require('path');

    // Copy the source directory files and subdirectory files to the target directory.
    const copyDir = (sd, td) => {
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
            //console.log('Copy file ' + src + ' to ' + target);
            // copy the source file to target file.
            !ele.isDirectory() && fs.copyFileSync(src, target, fs.constants.COPYFILE_FICLONE);
        });
    }
    var sourceDir = path.join(context.opts.projectRoot, "/res/windows"),
        targetDir = path.join(context.opts.projectRoot, "/platforms/windows/images");
    // console.log('Copy source directory ' + sourceDir + ' to ' + targetDir);
    copyDir(sourceDir, targetDir);
};