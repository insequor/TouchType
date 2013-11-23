/*global require*/
"use strict";

require.config({
    baseUrl: '../',
    //Below line ensures that js files will not be cached on client side, good for development
    urlArgs: 'version=',  //+ (new Date()).getTime(),
    paths: {
        // the left side is the module ID,
        // the right side is the path to
        // the jQuery file, relative to baseUrl.
        // Also, the path should NOT include
        // the '.js' file extension. This example
        // is using jQuery 1.9.0 located at
        // js/lib/jquery-1.9.0.js, relative to
        // the HTML page.
        jquery: 'external/jquery-1.10.2'
    }
});

require(['jquery', "js/TouchType"], function($, TouchType) {
    var KeyCodeEnter = 13;
    var KeyCodeSpace = 32;
    
    var word = $('#id_word');
    var edit = $('#id_edit');
    
    edit.focus();
    
    TouchType.init('asdfjkl');
    //TouchType.init('aoeuhtns');
    
    function onKeyPress(keyEvent){
        var keyCode = keyEvent.keyCode;
        var keyValue = String.fromCharCode(keyCode);
        //console.log(keyValue + ': ' + keyCode);
        if(keyCode === KeyCodeSpace) {
            word.html(TouchType.next(edit.val()));
            edit.val('');
            return false; //So space is not handled by the target
        }
        else if(keyCode === KeyCodeEnter) {
            console.log('Pause/Stop...');
            return false; //So enter is not handled by the target
        }
    }
    
    edit.on('keypress', onKeyPress);
    
    
});