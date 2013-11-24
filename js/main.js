/*global require*/
"use strict";

require.config({
    baseUrl: '../',
    //Below line ensures that js files will not be cached on client side, good for development
    urlArgs: 'version=',  //+ (new Date()).getTime(),
    paths: {
        "jquery": 'external/jquery-1.10.2',
        "jquery.bootstrap": "external/bootstrap-3.0.2-dist/dist/js/bootstrap.min"
    },
    shim: {
        "jquery.bootstrap": {
            deps: ["jquery"]
        }
    }
});

require(['jquery', "jquery.bootstrap", "js/TouchType"], function($, bs, TouchType) {
    var KeyCodeEnter = 13;
    var KeyCodeSpace = 32;
    
    var word = $('#id_word');
    var edit = $('#id_edit');
    
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
        
        var mappedKeyValue = TouchType.getMappedKeyValue(keyValue);
        if (mappedKeyValue){
            //If this is a mapped key, we add the mapped version ourselves
            edit.val(edit.val() + mappedKeyValue);
            return false;
        }
            
    }
    
    edit.on('keypress', onKeyPress);

    var dialog = $('#SettingsDialog');
    dialog.modal({});
    dialog.find('.btn-primary').on('click', function () {
        var keyMapping = dialog.find('#KeyMapping').val();
        keyMapping = {
            "none": TouchType.KeyMapping.None,
            "qwerty2dvorak": TouchType.KeyMapping.QwertyToDvorak
        }[keyMapping];
        var keysToPractice = dialog.find('#KeysToPractice').val();
        
        TouchType.init(keysToPractice, keyMapping);
        
        edit.focus();
    });
    
    
});