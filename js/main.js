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
    function switchPanel(name){
        //Only using show(), hide() methods are not good enough if we use style sheet in html definition
        //if we don't use stylesheet in html definition we have a flicker since elements are hidden after
        //page load
        $('.panel').removeClass('show');
        $('.panel').addClass('hide');
        $(name).addClass('show');
        return false;
    }

    function switchToPractice(start) {
        if(start) {
            var keyMapping = keyMappingComboMapper[keyMappingCombo.val()];
            var keysToPractice = keysToPracticeEdit.val();
            
            TouchType.init(keysToPractice, keyMapping);
            
            $('#id_edit').attr('readonly', false);
            $('#id_edit').focus();
        }
        return switchPanel('#div_practice');
    }

    $('.continue-practice').on('click', function(){return switchToPractice(false);});
    $('.start-practice').on('click', function(){return switchToPractice(true);});
    
    function switchToSettings() {return switchPanel('#div_settings');}
    function switchToStats() {return switchPanel('#div_stats');}

    
    var KeyCodeEnter = 13;
    var KeyCodeSpace = 32;
    
    
    $('#icon_settings').on('click', function(){
        switchToSettings();
    } );
    
    $('#icon_stats').on('click', function(){
        switchToStats();
    } );
    
    
    switchToPractice();
    
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
            console.log('enter');
            switchToStats();
            return false; //So enter is not handled by the target
        }
        
        var mappedKeyValue = TouchType.getMappedKeyValue(keyValue);
        if (mappedKeyValue){
            //If this is a mapped key, we add the mapped version ourselves
            edit.val(edit.val() + mappedKeyValue);
            return false;
        }
            
    }
    
    edit.on("keypress", onKeyPress);

    var dialog = $('#div_settings');
    var keyMappingCombo = dialog.find('#KeyMapping');
    var keysToPracticeEdit = dialog.find('#KeysToPractice');
    
    var keyMappingComboMapper = {
        "none": TouchType.KeyMapping.None,
        "qwerty2dvorak": TouchType.KeyMapping.QwertyToDvorak
    };
    var settingsKeyHandlerFunction = TouchType.keyMapper(TouchType.KeyMapping.None);
    
    keyMappingCombo.on("change", function(event){
        console.log("onchange: " + keyMappingCombo.val());
        var keyMapping = keyMappingComboMapper[keyMappingCombo.val()];
        settingsKeyHandlerFunction = TouchType.keyMapper(keyMapping);
        keysToPracticeEdit.val('');
    });
    
    keysToPracticeEdit.on("keypress", function(keyEvent){
        var keyCode = keyEvent.keyCode;
        var keyValue = String.fromCharCode(keyCode);
        var mappedKeyValue = settingsKeyHandlerFunction(keyValue);
        if (mappedKeyValue){
            //If this is a mapped key, we add the mapped version ourselves
            $(keyEvent.target).val($(keyEvent.target).val() + mappedKeyValue);
            return false;
        }
    });
    
    dialog.find('.btn-primary').on('click', function () {
        var keyMapping = keyMappingComboMapper[keyMappingCombo.val()];
        var keysToPractice = keysToPracticeEdit.val();
        
        TouchType.init(keysToPractice, keyMapping);
        
        edit.focus();
    });
    
    
});