/*global require, document*/
"use strict";

require.config({
    baseUrl: './',
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

    var Key = {
           Enter : 13
         , Space : 32
         , Escape : 27
         , F2 : 113
         , F4 : 115
         , F7 : 118
    }
    
    var keyMappingComboMapper = {
        "none": TouchType.KeyMapping.None,
        "qwerty2dvorak": TouchType.KeyMapping.QwertyToDvorak
    };
    
    var dialog = $('#div_settings');
    var keyMappingCombo = dialog.find('#KeyMapping');
    var keysToPracticeEdit = dialog.find('#KeysToPractice');
    
    var word = $('#id_word');
    var edit = $('#id_edit');
    var bar = $('.progress-bar');
    
    var duration = 1.0; //minutes
    var refreshInterval = 100.0; //milliseconds
    var progressDelta = refreshInterval / (duration * 60.0 * 1000.0) * 100.0; //% delta
    
    function show_div(div) {
        div.removeClass('hide');
        div.addClass('show');
    }
    
    function hide_div(div) {
        div.removeClass('show');
        div.addClass('hide');
    }
    
    function show_icons(icons) {
        $.each(icons, function(idx, icon){$(icon).show()});
    }
    
    function hide_icons(icons) {
        $.each(icons, function(idx, icon){$(icon).hide()});
    }
    
    var StateDefault = {name: "default"
        , div : $("#div_practice")
        , icons : ["#icon_settings", "#icon_stats", "#icon_info"]
        , leave: function() {
            hide_div(this.div);
            hide_icons(this.icons);
        }
        , enter: function(returnState) {
            this.returnState = returnState;
            
            var bar = $('.progress-bar');
            bar.width('0%');
            bar.attr('aria-valuenow', 0);
            
            edit.val("Press Space to Start");
            word.html("Touch Type");
            
            show_div(this.div);
            show_icons(this.icons);
        }
        , keyup : function (keyEvent){
            switch(keyEvent.keyCode) {
                case Key.F2:
                    StateManager.transition(StateSettings);
                    break;
                case Key.F4:
                    StateManager.transition(StateStats);
                    break;
                case Key.F7:
                    StateManager.transition(StateHelp);
                    break;
                case Key.Space:
                    StateManager.transition(StatePractice);
                    break;
                default:
                    break;
            }   
        }
    };
    
    var StatePractice = {name: "practice"
        ,  div : $("#div_practice")
        , icons : ["#icon_stats", "#icon_info"]
        , leave: function() {
            clearInterval(this.progress);
            
            hide_div(this.div);
            hide_icons(this.icons);
            
            var edit = $('#id_edit');
            edit.unbind("keypress", this.keypressOnEdit);
        }
        
        , enter: function(returnState) {
            this.returnState = returnState;
            
            show_div(this.div);
            show_icons(this.icons);
            
            edit.on("keypress", this.keypressOnEdit);
            edit.focus();
            
            var val = parseFloat(bar.attr('aria-valuenow'));
            if(!val) {
                val = 0;
            
                //first time coming, start the practice
                edit.val("");
                
                var keyMapping = keyMappingComboMapper[keyMappingCombo.val()];
                var keysToPractice = keysToPracticeEdit.val();
            
                TouchType.init(keysToPractice, keyMapping);
                
                
                word.html(TouchType.next());
                
            
            }
            bar.width(val + '%');
            bar.attr('aria-valuenow', val);
            this.progress = setInterval(function (){
                var val = parseFloat(bar.attr('aria-valuenow'));
                val += progressDelta;
                bar.width(val + '%');
                bar.attr('aria-valuenow', val);
                if(val >= 100.0) {
                    StateManager.transition(StateStats, StateDefault);
                }
            }, refreshInterval);
        }
        
        , keyup : function (keyEvent){
            switch(keyEvent.keyCode) {
                case Key.F4:
                    StateManager.transition(StateStats);
                    break;
                case Key.F7:
                    StateManager.transition(StateHelp);
                    break;
                case Key.Escape:
                    StateManager.transition(StatePause);
                    break;
                default:
                    break;
            }   
        }
        
        , keypressOnEdit: function(keyEvent) {
            //console.log("edit.keyPress: " + keyEvent.keyCode);
            if(keyEvent.keyCode == Key.Space) {
                word.html(TouchType.next(edit.val()));
                edit.val('');
                return false;
            }
            
            var keyValue = String.fromCharCode(keyEvent.keyCode);
            var mappedKeyValue = TouchType.getMappedKeyValue(keyValue);
            if (mappedKeyValue){
                edit.val(edit.val() + mappedKeyValue);
                return false;
            }
        }
    };
    
    
    var StateSettings = {name: "settings"
         , div : $("#div_settings")
        , leave: function() {
            hide_div(this.div);
            
            keyMappingCombo.unbind("change", this.changeOnKeyMappingCombo);
            keysToPracticeEdit.unbind("keypress", this.keyPressOnPracticeKeys);
            
        }
        , enter: function(returnState) {
            this.returnState = returnState;
            show_div(this.div);
            
            keyMappingCombo.on("change", this.changeOnKeyMappingCombo);
            keysToPracticeEdit.on("keypress", this.keyPressOnPracticeKeys);
            
            var keyMapping = keyMappingComboMapper[keyMappingCombo.val()];
            StateSettings.keyHandlerFunction = TouchType.keyMapper(keyMapping);
        }
        
        , keyup : function (keyEvent){
            switch(keyEvent.keyCode) {
                case Key.Enter:
                    //TODO: Save Settings
                    StateManager.transition(this.returnState);
                    break;
                case Key.Escape:
                    StateManager.transition(this.returnState);
                    break;
                default:
                    break;
            }
        }
        
        , changeOnKeyMappingCombo: function(event) {
            var keyMapping = keyMappingComboMapper[keyMappingCombo.val()];
            StateSettings.keyHandlerFunction = TouchType.keyMapper(keyMapping);
            keysToPracticeEdit.val('');
        }
        
        , keyPressOnPracticeKeys : function(keyEvent) {
            var keyCode = keyEvent.keyCode;
            var keyValue = String.fromCharCode(keyCode);
            var mappedKeyValue = StateSettings.keyHandlerFunction(keyValue);
            if (mappedKeyValue){
                //If this is a mapped key, we add the mapped version ourselves
                $(keyEvent.target).val($(keyEvent.target).val() + mappedKeyValue);
                return false;
            }
        }
    };
    
    var StateStats = {name: "stats"
        , div: $("#div_stats")
        , leave: function() {
            hide_div(this.div);
        }
        , enter: function(returnState) {
            this.returnState = returnState;
            show_div(this.div);
            
            var minutes = parseFloat(bar.attr('aria-valuenow')) * duration / 100.0;
            $('#span_words').html(TouchType.numberOfCorrectWords());
            $('#span_minutes').html(minutes.toFixed(0));
            $('#span_speed').html((TouchType.numberOfCorrectWords() / minutes).toFixed(0));
            
        }
        , keyup : function (keyEvent){
            switch(keyEvent.keyCode) {
                case Key.Enter:
                case Key.Escape:
                    StateManager.transition(this.returnState);
                    break;
                default:
                    break;
            }
        }
    };
    
    var StateHelp = {name: "help"
        , div: $("#div_help")
        , leave: function() {
            hide_div(this.div);
        }
        , enter: function(returnState) {
            this.returnState = returnState;
            show_div(this.div);
        }
        , keyup : function (keyEvent){
            switch(keyEvent.keyCode) {
                case Key.Enter:
                case Key.Escape:
                    StateManager.transition(this.returnState);
                    break;
                default:
                    break;
            }
        }
    };
    
    var StatePause = {name: "pause"
        , div: $("#div_pause")
        , leave: function() {
            hide_div(this.div);
        }
        , enter: function(returnState) {
            this.returnState = returnState;
            show_div(this.div);
        }
        , keyup : function (keyEvent){
            switch(keyEvent.keyCode) {
                case Key.Enter:
                    StateManager.transition(StatePractice);
                    break;
                case Key.Escape:
                    StateManager.transition(StateDefault);
                    break;
                default:
                    break;
            }   
            
        }
    };
    
    
    var StateManager = {
          current_state: undefined
        , keyup : function (keyEvent){
            //console.log("keyup: " + keyEvent.keyCode);
            StateManager.current_state.keyup(keyEvent);
        }
        
        //Transition to the next state. 
        //Return State is given as indication to the new state to decide where it should return
        //If not given last state is considered the return state
        , transition : function (newState, returnState) {
            if(!returnState)
                returnState = this.current_state;
                
            if (this.current_state) {
                //console.log("leaving state: " + this.current_state.name);
                this.current_state.leave();
            }
            
            this.current_state = newState;
            //console.log("entering state: " + this.current_state.name);
            this.current_state.enter(returnState);
        }
    };
    
    StateManager.transition(StateDefault);
    
    $('#icon_settings').on('click', function(){
        StateManager.transition(StateSettings, StateDefault);
    } );
    
    $('#icon_stats').on('click', function(){
        StateManager.transition(StateStats, StateDefault);
    } );
    
    $('#icon_info').on('click', function(){
        StateManager.transition(StateHelp, StateDefault);
    } );
    
    $(document).on('keyup',  StateManager.keyup);
    
});
