'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Processing...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('Hi! I\'m ZimBot!')
                .then(() => 'speak');
        }
    },

    /*askName: {
        prompt: (bot) => bot.say('What\'s your name?'),
        receive: (bot, message) => {
            const name = message.text;
            return bot.setProp('name', name)
                .then(() => bot.say(`Hi ${name}!\nSo, you're here to learn more about the real me, right? I'll try to help you!\nJust remember, I\'m a bot 🤖 I only respond to keywords.\nHere is the list of keywords you can use: ABOUT, EDUCATION, EXPERIENCES, SKILLS, PROJECTS & CONTACT. At any time, if you're lost, say I AM LOST\nWell... Ask me what you want 🙂`))
                .then(() => 'speak');
        }
    },*/

    speak: {
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }

                if (!_.has(scriptRules, upperText)) {
                    return bot.say(`Sorry, I didn\'t understand what you said. Remember, I\'m just a bot 🤖 I\'m still learning your language 📚\nPlease try again 🙂 If you're lost, just write I AM LOST 🤓` )
                    .then(() => 'speak');
                }

                var response = scriptRules[upperText];
                var lines = response.split(/(<img src=\'[^>]*\'\/>)/);

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    if (!line.startsWith("<")) {
                        p = p.then(function() {
                            return bot.say(line);
                        });
                    } else {
                        // p = p.then(function() {
                        //     var start = line.indexOf("'") + 1;
                        //     var end = line.lastIndexOf("'");
                        //     var imageFile = line.substring(start, end);
                        //     return bot.sendImage(imageFile);
                        // });
                    }
                })

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});
