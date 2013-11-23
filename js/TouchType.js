/*global define*/
"use strict";

define(['js/WordsEn'], function(Words){
    var TouchType = {
        _name: 'TouchType',
        _author: 'Ozgur Yuksel',
        _version: 0.0,
        
        currentWordIndex : -1,
        
        init: function (selectedCharacters){
            this.words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
            
            //Below regular expression finds the characters which are not in the given
            //selectedCharacters string
            var regexp = new RegExp('[^' + selectedCharacters + ']');
            this.words = Words.filter(function(word){return ! regexp.exec(word);});
            console.log(this.words.length + ' words found');
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