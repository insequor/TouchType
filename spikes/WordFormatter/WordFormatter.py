



if __name__ == '__main__':
    print 'WordFormatter.py'
    inFileName = '../../data/wordsEn/wordsEn.txt'
    outFileName = '../../js/WordsEn.js'
    
    inFile = open(inFileName, 'r')
    outFile = open(outFileName, 'w')
    outFile.write('/*global define*/\n');
    outFile.write('"use strict";\n');
    outFile.write('define([], function(){\n');
    outFile.write('   return [\n')
    count = 0
    
    for line in inFile.readlines():
        outFile.write('   "' + line.strip() + '",\n')
       
    outFile.write('   ];\n')
    outFile.write('});');
    inFile.close()
    outFile.close()
    
    