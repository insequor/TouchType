/*global define*/
"use strict";

define([], function(){
    var TouchType = {
        _name: 'TouchType',
        _author: 'Ozgur Yuksel',
        _version: 0.0,
        
        currentWordIndex : -1,
        
        init: function (){
            this.words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
            this.currentWordIndex = 0;
        },
        
        next: function(userEntry) {
            if(this.currentWordIndex >= 0 && userEntry !== this.words[this.currentWordIndex])
                return this.words[this.currentWordIndex];
            
            this.currentWordIndex ++;
            if (this.currentWordIndex >= this.words.length)
                this.currentWordIndex = 0;
            return this.words[this.currentWordIndex];
        }
        
    };
    
    return TouchType;
});