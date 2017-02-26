import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
    sendCode(country, phone, platform) {
        //should do some validation to make sure phone number is valid

        try {
            const results = HTTP.call('POST',
                "https://service.dotomni.com/verification/request/json", {
                data: {
                    'api_key': Meteor.settings.public.dotomniApiPub,
                    'api_secret': Meteor.settings.dotomniApiSecret,
                    'phone': phone,
                    'country': country,
                    platform: platform
                }
            });

            const data = results.data;
            if (data.status === 'success') {
                return data.verifyId;
            } else {
                throw new Meteor.Error('500 service down');
            }
        } catch (e) {
            console.log(e);
            throw new Meteor.Error("500 service down");
        }
    },

    verifyCode(verifyId, code) {
        //should do some validation to make sure phone number is valid
        //you should also store the response at your server side for validation

        try {
            const results = HTTP.call('POST',
                "https://service.dotomni.com/verification/verify/json", {
                    data: {
                        'api_key': Meteor.settings.public.dotomniApiPub,
                        'api_secret': Meteor.settings.dotomniApiSecret,
                        'verifyId': verifyId,
                        'code': code
                    }
                });

            const data = results.data;
            console.log(data);
            return data.status === 'success';
        } catch (e) {
            console.log(e);
            throw new Meteor.Error("500 service down");
        }
    },
});