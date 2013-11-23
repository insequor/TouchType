/*global define*/
"use strict";

define(['js/WordsEn'], function(Words){

    //this shuffle code is taken from: http://bost.ocks.org/mike/shuffle/
    function shuffle(array) {
        var m = array.length, t, i;
        // While there remain elements to shuffle
        while (m) {
            // Pick a remaining element
            i = Math.floor(Math.random() * m--);
            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    var TouchType = {
        _name: 'TouchType',
        _author: 'Ozgur Yuksel',
        _version: 0.0,
        
        currentWordIndex : -1,
        
        init: function (selectedCharacters){
            //Below regular expression finds the characters which are not in the given
            //selectedCharacters string
            var regexp = new RegExp('[^' + selectedCharacters + ']');
            this.words = Words.filter(function(word){return ! regexp.exec(word);});
            this.words = shuffle(this.words);
            console.log(this.words.length + ' words found');
            this.currentWordIndex = -1;
        },
        
        next: function(userEntry) {
            if(this.currentWordIndex >= 0 && userEntry !== this.words[this.currentWordIndex])
                return this.words[this.currentWordIndex];
            
            this.currentWordIndex = Math.floor(Math.random() * this.words.length) + 1;
            return this.words[this.currentWordIndex];
        }
        
    };
    
    return TouchType;
});