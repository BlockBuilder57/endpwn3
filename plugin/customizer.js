/*

    EndPwn3 System (EndPwn Customizer)
    
    Copyright 2018 EndPwn Project
    
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    https://github.com/endpwn/

*/

var internal = {

    print: function (str) {
        console.log(`%c[Customizer]%c ` + str, 'font-weight:bold;color:#0cc', '');
    }

}

exports = {

    replacements: {

        // fix for custom discrims breaking search
        //'#([0-9]{4})': 
        //'#(.{1,4})',

        // endpwn dev badges
        //'return t.hasFlag(H.UserFlags.STAFF)': 
        //'return t.hasFlag(4096)&&r.push({tooltip:"EndPwn Developer",onClick:function(){return window.open("https://endpwn.github.io/","_blank")},class:"endpwn"}),t.hasFlag(H.UserFlags.STAFF)'

    },

    // fallback data
    data: {
        guilds: [],
        devs: [],
        bots: [],
        users: {}
    },

    get me() {
        return {
            bot: exports.data.bots.indexOf($me()) != -1,
            discrim: exports.data.users[$me()]
        }
    },

    update: function () {
        // fetch goodies.json
        internal.print('fetching data from server...');
        fetch('https://endpwn.cathoderay.tube/goodies.json?_=' + Date.now())
            .then(x => x.json())
            .then(r => endpwn.customizer.data = r);
    },

    init: function () {

        // prevent doublecalling
        endpwn.customizer.init = undefined;

        // apply custom discrims/bot tags/badges/server verif from EndPwn Customizer (endpwn.cathoderay.tube)
        internal.print('initializing...');

        // refetch customizer stuff every half hour
        setInterval(endpwn.customizer.update, 1800000);
        endpwn.customizer.update();

        // add the endpwn dev badge to the class obfuscation table
        wc.findFunc('profileBadges:"profileBadges')[0].exports['profileBadgeEndpwn'] = 'profileBadgeEndPwn';

        // hook getUser() so we can apply custom discrims/bot tags/badges
        $api.util.wrapAfter(
            "wc.findCache('getUser')[0].exports.getUser",

            x => {

                if (x === undefined || x === null) return;

                if (endpwn.customizer.data.bots.contains(x.id)) x.bot = true;
                if (endpwn.customizer.data.users[x.id] !== undefined) x.discriminator = endpwn.customizer.data.users[x.id];
                if (endpwn.customizer.data.devs.contains(x.id)) x.flags += x.flags & 4096 ? 0 : 4096;

                return x;
            }
        );

        // make sure devs' badges actually render
        $api.events.hook('USER_PROFILE_MODAL_FETCH_SUCCESS', x => { if (endpwn.customizer.data.devs.contains(x.user.id)) x.user.flags += x.user.flags & 4096 ? 0 : 4096; })

        // hook getGuild() so we can verify servers
        $api.util.wrapAfter(
            "wc.findCache('getGuild')[0].exports.getGuild",

            x => {

                if (x === undefined || x === null) return;

                if (endpwn.customizer.data.guilds.contains(x.id)) x.features.add('VERIFIED');

                return x;
            }
        );

    }

}