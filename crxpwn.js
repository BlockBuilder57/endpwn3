/*

    EndPwn3 Stage 2 Payload (crxpwn)
    
    Copyright 2018 EndPwn Project
    
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    https://github.com/endpwn/

*/

(() => {

    function __crxprint(str) {
        console.log(`%c[crxpwn]%c ` + str, 'font-weight:bold;color:#0cc', '');
    }

    if (location.hostname.indexOf('discordapp') == -1) return;
    __crxprint('extension loaded successfully, loading CRISPR and EPAPI...');

    // use the discord native api to require electron and get electron.remote
    var electron = DiscordNative.nativeModules.requireModule('discord_/../electron').remote;
    var fs = electron.require('original-fs');

    // get the data path (where epapi.js should be)
    var ___data = electron.app.getPath('userData').replace(/\\\\/g, "/") + '/';

    // shakily reimplemented of require() intended for loading plugins and EPAPI itself
    function __krequire(path) {
        return eval('(()=>{var exports={};' + fs.readFileSync(___data + path, 'utf8').toString() + ';return exports})()');
    }

    // load CRISPR and EPAPI
    var crispr = __krequire('crispr.js');
    var epapi = __krequire('epapi.js');

    // call their entrypoints
    crispr.go();
    electron.getCurrentWindow().webContents.on('dom-ready', () => epapi.go({
        name: 'EndPwn3',
        version: {
            major: 3,
            minor: 1,

            toString: function () {
                return `v${this.major}.${this.minor}`;
            }
        },
        method: 'crxpwn',
        brand: true
    }));

})();