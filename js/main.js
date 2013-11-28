/*global require, document*/
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
        
        enterHandler = EnterHandlers[name];
        escapeHandler = EscapeHandlers[name];
        
        return false;
    }

    var started = false;
    
    function switchToPractice(start) {
        switchPanel('#div_practice');
        if(start) {
            started = false;
            $('#id_word').html('TouchType');
            $('#id_edit').val('Press any key to start');
            
            var keyMapping = keyMappingComboMapper[keyMappingCombo.val()];
            var keysToPractice = keysToPracticeEdit.val();
            
            TouchType.init(keysToPractice, keyMapping);
            
            $('#id_edit').attr('readonly', false);
            $('#id_edit').focus();
        }
        return false;
    }

    $('.continue-practice').on('click', function(){return switchToPractice(false);});
    $('.start-practice').on('click', function(){return switchToPractice(true);});
    
    function switchToSettings() {return switchPanel('#div_settings');}
    function switchToStats() {return switchPanel('#div_stats');}

    
    var KeyCodeEnter = 13;
    var KeyCodeSpace = 32;
    var KeyCodeEscape = 27;
    
    var EnterHandlers = {
            '#div_practice': switchToStats,
            '#div_settings': function(){switchToPractice(true);},
            '#div_stats': switchToPractice
    };
    var enterHandler;
    
    var EscapeHandlers = {
            '#div_practice': switchToSettings,
            '#div_settings': switchToPractice,
            '#div_stats': switchToPractice
    };
    
    var escapeHandler;
    
    
    $('#icon_settings').on('click', function(){
        switchToSettings();
    } );
    
    $('#icon_stats').on('click', function(){
        switchToStats();
    } );
    
    
    switchToSettings();
    
    var word = $('#id_word');
    var edit = $('#id_edit');
    
    //timer for the progress
    var duration = 0.5 * 60.0 * 1000.0; //milliseconds
    var refreshInterval = 100.0; //milliseconds
    var progressDelta = refreshInterval / duration * 100.0; //% delta
    
    var progress;
    
    function onKeyPress(keyEvent){
        var keyCode = keyEvent.keyCode;
        var keyValue = String.fromCharCode(keyCode);
        if(!started) {
            started = true;
            word.html(TouchType.next(edit.val()));
            edit.val('');
            
            var bar = $('.progress-bar');
            progress = setInterval(function(){
                var val = parseFloat(bar.attr('aria-valuenow'));
                val += progressDelta;
                bar.width(val + '%');
                bar.attr('aria-valuenow', val);
                if(val >= 100.0) {
                    clearInterval(progress);
                    switchToStats();
                }
            }, refreshInterval);
            
            return false;
        }
        
        //console.log(keyValue + ': ' + keyCode);
        if(keyCode === KeyCodeSpace) {
            word.html(TouchType.next(edit.val()));
            edit.val('');
            return false; //So space is not handled by the target
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
    
    
    $(document).on('keyup', function(keyEvent){
        if(keyEvent.keyCode === KeyCodeEnter)
            enterHandler();
        if(keyEvent.keyCode === KeyCodeEscape)
            escapeHandler();
    });
    
    edit.focus();
    
    
});