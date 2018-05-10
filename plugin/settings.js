/*

    EndPwn3 System (settings UI)
    
    Copyright 2018 EndPwn Project
    
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    https://github.com/endpwn/

*/

exports = {

    replacements: {
        '{section:H.SectionTypes.DIVIDER},{section:"logout",': '{section:H.SectionTypes.DIVIDER},{section:"ENDPWN",label:"ΣndPwn Settings",element:window.BlankSettingsElement,color:"#0cc"},{section:H.SectionTypes.DIVIDER},{section:"logout",'
    },

    init: function () {

        var currentSection = '';

        $api.events.listen('ENDPWN_PSEUDO_IPC', msg => {
            $api.localStorage.set('customizer_signature', JSON.parse(msg.data).signature);
            console.log(currentSection);
            renderSettings(currentSection);
        });

        window.BlankSettingsElement = $api.util.findConstructor('FormSection', 'FormSection').FormSection;

        var buttons = $api.util.findFuncExports('button-', 'colorBlack');
        var checkboxes = $api.util.findFuncExports('checkboxEnabled');
        var misc = $api.util.findFuncExports('statusRed-', 'inputDefault');
        var misc2 = $api.util.findFuncExports('multiInputField');
        var headers = $api.util.findFuncExports('h5-', 'h5');

        var panels = wc.findFunc('flexChild-')[0].exports;
        var panels2 = $api.util.findFuncExports('errorMessage-', 'inputWrapper');

        function createVerticalPanel() {
            return createElement("div")
                .withClass(panels2.vertical, 'epButtonPanel')
        }

        function createHorizontalPanel() {
            return createElement("div")
                .withClass(panels.horizontal, 'epButtonPanel')
        }

        function createButton(name) {
            return createElement('button')
                .withContents(name)
                .withClass(
                    buttons.button,
                    buttons.lookFilled,
                    buttons.colorBrand,
                    buttons.sizeSmall,
                    buttons.grow,
                    'epMargin'
                );
        }

        function createWarnButton(name) {
            return createElement('button')
                .withContents(name)
                .withClass(
                    buttons.button,
                    buttons.lookOutlined,
                    buttons.colorYellow,
                    buttons.sizeSmall,
                    buttons.grow,
                    'epMargin'
                );
        }

        function createDangerButton(name) {
            return createElement('button')
                .withContents(name)
                .withClass(
                    buttons.button,
                    buttons.lookOutlined,
                    buttons.colorRed,
                    buttons.sizeSmall,
                    buttons.grow,
                    'epMargin'
                );
        }

        function createH2(text) {
            //h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh2-2LTaUL marginBottom20-32qID7
            return createElement("h2")
                .withClass(
                    headers.h2,
                    headers.title,
                    headers.size16,
                    headers.height20,
                    headers.weightSemiBold,
                    headers.defaultColor,
                    'epMargin'
                )
                .withText(text);
        }

        function createH5(text) {
            return createElement("h5")
                .withClass(
                    headers.h5,
                    headers.title,
                    headers.size12,
                    headers.height16,
                    headers.weightSemiBold
                )
                .withText(text);
        }

        function createInput(v) {
            return createElement("input")
                .withClass(
                    misc.inputDefault,
                    misc.input,
                    misc.size16,
                    'epMargin'
                )
                .modify(x => x.value = v)
        }

        //<input class="checkboxEnabled-CtinEn checkbox-2tyjJg" type="checkbox">
        //switchEnabled-V2WDBB switch-3wwwcV valueUnchecked-2lU_20 value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX
        //switchEnabled-V2WDBB switch-3wwwcV valueChecked-m-4IJZ value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX
        function updateSwitch(s, w) {
            if (s.checked) {
                w.classList.remove(checkboxes.valueUnchecked.split(' ')[0]);
                w.classList.add(checkboxes.valueChecked.split(' ')[0])
            }
            else {
                w.classList.remove(checkboxes.valueChecked.split(' ')[0]);
                w.classList.add(checkboxes.valueUnchecked.split(' ')[0])
            }
        }
        function createSwitch(c, i) {
            if (c === undefined) c = () => { };
            if (i === undefined) i = false;
            var s, w = createElement('div')
                .withClass(
                    checkboxes.switch,
                    checkboxes.switchEnabled,
                    checkboxes.size,
                    checkboxes.sizeDefault,
                    checkboxes.themeDefault
                )
                .withChildren(
                    s = createElement("input")
                        .withClass(
                            checkboxes.checkbox,
                            checkboxes.checkboxEnabled
                        )
                        .modify(x => x.type = 'checkbox')
                        .modify(x => x.checked = i)
                        .modify(x => x.onchange = () => {
                            updateSwitch(s, w);
                            c(s.checked);
                        })
                )
            updateSwitch(s, w);
            return w;
        }

        function authorizeCustomizer() {
            var endpoint = $api.internal.constants.API_HOST;
            var url = `https://${endpoint}/oauth2/authorize?client_id=436715820970803203&redirect_uri=https%3A%2F%2Fendpwn.cathoderay.tube%2Fauth%2Fdiscord%2Fintegratedcallback&response_type=code&scope=identify`;

            var win = new window.electron.BrowserWindow({
                width: 420,
                height: 500,
                transparent: false,
                frame: false,
                resizable: true,
                nodeIntegration: true
            });
            win.loadURL(url);
        }

        function submitCustomizer(d, b) {

            fetch('https://endpwn.cathoderay.tube/set', {
                headers: {
                    'Content-type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    id: $me(),
                    signature: $api.localStorage.get('customizer_signature'),
                    discriminator: d,
                    bot: b
                })
            }).then(r => {

                r.text().then(k => {
                    $api.ui.showDialog({
                        title:'Server Response',
                        body: k
                    });
                });

                endpwn.customizer.update();

            });

        }

        function renderSettings(e) {

            currentSection = e;
            if ($("#ep_settings")) $("#ep_settings").remove();

            if (e.section == "ENDPWN") {

                var pane = $(".content-column.default");
                if (!pane) return;

                var needAuth = !$api.localStorage.get('customizer_signature');

                var content = createElement('div')
                    .withId('ep_settings')
                    .withClass('flex-vertical')
                    .withChildren(
                        createElement("div")
                            .withClass('epSettingsHeader')
                            .withText('ΣndPwn Settings'),
                )
                    .appendTo(pane);

                if (!$api.localStorage.get('customizer_signature')) {

                    createHorizontalPanel()
                        .withChildren(
                            createButton("Authorize EndPwn Customizer")
                                .modify(x => x.onclick = authorizeCustomizer)
                        )
                        .appendTo(content);

                }
                else {

                    var discrim, bot;

                    createVerticalPanel()
                        .withChildren(
                            createH5('Discriminator'),
                            createHorizontalPanel()
                                .withChildren(
                                    discrim = createInput(endpwn.customizer.me.discrim ? endpwn.customizer.me.discrim : '')
                                        .withClass('epDiscrimField')
                                        .modify(x => x.maxLength = 4),
                                    createVerticalPanel()
                                        .withChildren(
                                            createH5('Bot?'),
                                            bot = createSwitch(() => { }, endpwn.customizer.me.bot)
                                        ),
                                    createButton("Submit")
                                        .modify(x => x.onclick = () => submitCustomizer(discrim.value, bot.children[0].checked))
                                )

                        )
                        .appendTo(content);

                }

                createElement("div")
                    .withClass(panels.horizontal, 'epButtonPanel')
                    .withChildren(
                        createButton("Open Data Folder")
                            .modify(x => x.onclick = () => { electron.shell.openExternal($api.data) }),
                        createWarnButton("Restart in safe mode")
                            .modify(x => x.onclick = endpwn.safemode),
                        createDangerButton("Uninstall EndPwn")
                            .modify(x => x.onclick = endpwn.uninstall)
                    )
                    .appendTo(content);

            }

        }

        $api.events.hook("USER_SETTINGS_MODAL_SET_SECTION", renderSettings);
    }

}