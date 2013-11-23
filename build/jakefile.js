/*global desc, task, jake, fail, complete */

"use strict";

task("default", ["lint", "test"]);

function nodeLintOptions(){
    return {
        bitwise:true,
			curly:false,
			eqeqeq:true,
			forin:true,
			immed:true,
			latedef:true,
			newcap:true,
			noarg:true,
			noempty:true,
			nonew:true,
			regexp:true,
			undef:true,
			strict:true,
			trailing:true,
			node:true
    };
}

desc("Lint everything");
task("lint", [], function(){
    console.log("linting the code...");
    var lint = require("./lint/lint_runner.js");
    var files = new jake.FileList();
    files.include("../**/*.js");
    files.exclude("build");
    files.exclude("external");
    
    var passed = lint.validateFileList(files.toArray(), nodeLintOptions(), {});
    if(!passed)
        fail("...failed");
    else
        console.log("...done");
});

desc("Test everything");
task("test", [], function(){
    console.log("testing the code...");
    if(0) {
        var reporter = require("nodeunit").reporters["default"];
        reporter.run(["src/server/server_test.js"], null, function(failures){
            if(failures)
                fail("...failed");
            else
                console.log("...tests done");
            complete();
        });
    }
}, {async: true});

desc("Sample integration task");
task("integrate", ["default"], function() {
    console.log("integration is not implemented yet");
});

