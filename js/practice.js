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
    var cookieUsageCombo = dialog.find('#CookieUsage');
    var keyMappingCombo = dialog.find('#KeyMapping');
    var keysToPracticeEdit = dialog.find('#KeysToPractice');
    var durationEdit = dialog.find("#Duration");

    var word = $('#id_word');
    var edit = $('#id_edit');
    var bar = $('.progress-bar');
    
    var settings = localStorage.getItem('TouchType.settings');
    if (settings)
        settings = JSON.parse(settings);
    else {
        settings = {
            CookieUsage: 'DoNotUse',
            KeyMapping: 'none',
            KeysToPractice: '',
            PracticeDuration: 2.0 //minutes
        };
    }

    var refreshInterval = 100.0; //milliseconds
    var progressDelta = refreshInterval / (settings.PracticeDuration * 60.0 * 1000.0) * 100.0; //% delta
        

    function show_div(div) {
        div.removeClass('hide');
        div.addClass('show');
    }
    
    function hide_div(div) {
        div.removeClass('show');
        div.addClass('hide');
    }
    
    var StateDefault = {name: "default"
        , div : $("#div_default")
        , leave: function() {
            hide_div(this.div);
        }
        , enter: function(returnState) {
            this.returnState = returnState;
            
            StatePractice.updateWordClass(true);
            
            var bar = $('.progress-bar');
            bar.width('0%');
            bar.attr('aria-valuenow', 0);
            
            show_div(this.div);
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
        , leave: function() {
            clearInterval(this.progress);
            
            hide_div(this.div);
            
            var edit = $('#id_edit');
            edit.unbind("keypress", this.keypressOnEdit);
            edit.unbind("input", this.changeOnEdit);
        }
        
        , enter: function(returnState) {
            this.returnState = returnState;
            
            show_div(this.div);
            
            edit.on("keypress", this.keypressOnEdit);
            edit.on("input", this.changeOnEdit);
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
            if(keyEvent.keyCode == Key.Space || keyEvent.keyCode == Key.Enter) {
                var newWord = TouchType.next(edit.val());
                StatePractice.updateWordClass(newWord != word.html());
                word.html(newWord);
                edit.val(''); //We don't trigger the event so last correct status is still displayed in the word
                return false;
            }

            var keyValue = String.fromCharCode(keyEvent.keyCode);
            var mappedKeyValue = TouchType.getMappedKeyValue(keyValue);
            if (mappedKeyValue){
                var val = edit.val() + mappedKeyValue;
                edit.val(val);
                edit.trigger("input"); //Event is not triggered automatically
                return false;
            }
        }
        
        , changeOnEdit: function() {
            var val = edit.val();
            StatePractice.updateWordClass(val == "" || word.html().indexOf(val) ==  0);
        }
        
        ,updateWordClass: function(correct) {
            if(correct)
                word.removeClass("wrong");
            else 
                word.addClass("wrong");
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
             
            cookieUsageCombo.val(settings.CookieUsage);
            keyMappingCombo.val(settings.KeyMapping);
            keysToPracticeEdit.val(settings.KeysToPractice);
            durationEdit.val(settings.PracticeDuration);

            keyMappingCombo.on("change", this.changeOnKeyMappingCombo);
            keysToPracticeEdit.on("keypress", this.keyPressOnPracticeKeys);
           
            var keyMapping = keyMappingComboMapper[keyMappingCombo.val()];
            StateSettings.keyHandlerFunction = TouchType.keyMapper(keyMapping);
        }
        
        , keyup : function (keyEvent){
            switch(keyEvent.keyCode) {
                case Key.Enter:
                    settings.CookieUsage = cookieUsageCombo.val();
                    settings.KeyMapping = keyMappingCombo.val();
                    settings.KeysToPractice = keysToPracticeEdit.val();
                    var val = parseFloat(durationEdit.val());
                    if (val > 0.0)
                        settings.PracticeDuration = val;
                    else
                        settings.PracticeDuration = 2.0; //minutes
                    progressDelta = refreshInterval / (settings.PracticeDuration * 60.0 * 1000.0) * 100.0; //% delta

                    if (settings.CookieUsage == 'DoNotUse') {
                        //Delete the cookie if exist
                        localStorage.removeItem('TouchType.settings');
                    }
                    else if (settings.CookieUsage == 'LocalStorage') {
                        //Store the cookie
                        localStorage.setItem('TouchType.settings', JSON.stringify(settings));
                    }
                    
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
            
            var minutes = parseFloat(bar.attr('aria-valuenow')) * settings.PracticeDuration / 100.0;
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
    
    $(document).on('keyup',  StateManager.keyup);
    
});
