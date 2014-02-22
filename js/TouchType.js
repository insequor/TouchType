/*global define*/
"use strict";


//If I define the Keys in the below method jshint statement does not work, I could not 
//find a better way to use it. W044 refers to unnecessary escape characters in the 
//mapping strings
/*jshint -W044*/
var Keys = {
    'QWERTY' : "qwertyuiop[]\asdfghjkl;'zxcvbnm,./",
    'DVORAK' : "',.pyfgcrl/=\aoeuidhtns-;qjkxbmwvz"
};
/*jshint +W044 */

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
    
    var QWERTY2DVORAK = {};
    for(var i =  Keys.QWERTY.length - 1; i >= 0; i --)
        QWERTY2DVORAK[Keys.QWERTY[i]] = Keys.DVORAK[i];
    
    var KeyMappingFunctions = {
        0: function(keyValue) {},
        1: function(keyValue) {return QWERTY2DVORAK[keyValue];}
    };
    
    var TouchType = {
        _name: 'TouchType',
        _author: 'Ozgur Yuksel',
        _version: 0.0,
        
        KeyMapping : {
            None: 0,
            QwertyToDvorak: 1
        },
        
        currentWordIndex : -1,
        
        init: function (selectedCharacters, keyMapping){
            //Below regular expression finds the characters which are not in the given
            //selectedCharacters string
            this.getMappedKeyValue = KeyMappingFunctions[keyMapping];
            
            if (selectedCharacters) {
                var regexp = new RegExp('[^' + selectedCharacters + ']');
                this.words = Words.filter(function(word){return ! regexp.exec(word);});
            }
            else
                this.words = Words;
            this.words = shuffle(this.words);
            console.log(this.words.length + ' words found');
            this.currentWordIndex = -1;
        },
        
        next: function(userEntry) {
            if(this.currentWordIndex >= 0 && userEntry !== this.words[this.currentWordIndex])
                return this.words[this.currentWordIndex];
            
            this.currentWordIndex += 1;
            if(this.currentWordIndex >= this.words.length)
                this.currentWordIndex = 0;
            return this.words[this.currentWordIndex];
        },
        
        numberOfCorrectWords: function () {
            return this.currentWordIndex;
        },
        
        keyMapper: function(keyMapping) {
            return KeyMappingFunctions[keyMapping];
        }
    };
    
    return TouchType;
});