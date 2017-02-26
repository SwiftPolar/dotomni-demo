import React, {Component} from 'react';
import {Grid, Form, Select, Input, Button, Message, Image} from 'semantic-ui-react';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            platform: 'wa',
            submit: false,
            phoneNumber: '',
            phoneCountry: '',
            code: '',
            loadingSend: false,
            loadingVerify: false,
            verifyId: '',
            errorCode: false,
            password: ''
        }
    }

    handleChange(e, {value, id}) {
        if (!id) return;
        
        switch (id) {
            case 'code':
                this.setState({code: value});
                break;

            case 'phoneCountry':
                this.setState({phoneCountry: value});
                break;

            case 'phoneNumber':
                this.setState({phoneNumber: value});
                break;

            case 'password':
                this.setState({password: value});
                break;

        }
    }

    sendCode(event) {
        event.preventDefault();

        const {phoneNumber, phoneCountry, platform, loadingSend, password} = this.state;

        if (loadingSend) {
            //still sending or requesting too soon
            return;
        }

        if (!phoneNumber || !phoneCountry) {
            //inputs are empty
            console.log("Invalid phone input");
            return;
        }

        if (platform !== 'wa') {
            //currently only support WhatsApp
            console.log("Only WhatsApp is supported");
            return;
        }

        //should do some phone validation here
        console.log("SENDING CODE");
        this.setState({loadingSend: true});
        Meteor.call('sendCode', phoneCountry, phoneNumber, platform, password, (err, res) => {
            this.setState({loadingSend: false}); //you might want to put a timeout

            if (err) {
                console.log(err);
                return;
            }

            this.setState({verifyId: res});


        });


    }

    verifyCode(event) {
        event.preventDefault();

        const {verifyId, loadingVerify, code, password} = this.state;
        if (loadingVerify || !code) {
            return;
        }

        console.log("VERIFYING CODE");

        this.setState({loadingVerify: true});
        Meteor.call('verifyCode', verifyId, code, password, (err, res) => {
            this.setState({loadingVerify: false}); //you might want to put a timeout

            if (err) {
                console.log(err);
                return;
            }

            this.setState({submit: res, errorCode: !res});

        });

    }

    render() {
        const {platform, submit, loadingSend, loadingVerify, errorCode, phoneCountry, phoneNumber} = this.state;
        const platformOptions = [
            {key: 'wa', value: 'wa', icon: 'whatsapp', text: 'WhatsApp'},
            {key: 'wc', value: 'wc', icon: 'wechat', text: 'WeChat'},
            {key: 'sms', value: 'sms', icon: 'mail outline', text: 'SMS'}
        ];

        const getPhoneVerification = () => {
            if (!submit) {
                return (
                    [
                        <Form.Group key="phone-number-input">
                            <Form.Input id="phoneCountry" onChange={this.handleChange.bind(this)}
                                        width={3} label="Country" placeholder="65" type="number"/>
                            <Form.Input id="phoneNumber" onChange={this.handleChange.bind(this)}
                                        width={6} label="Phone Number" placeholder="xxx" type="number"/>
                            <Form.Field width={7}>
                                <label>Verification Platform</label>
                                <Select placeholder="Select platform to verify" options={platformOptions}/>
                            </Form.Field>
                        </Form.Group>,
                        <Form.Group key="phone-code-verify">
                            <Form.Field width={12} error={errorCode}>
                                <Input id="code" placeholder="Enter 6 digit code"
                                       onChange={this.handleChange.bind(this)}
                                       action={{
                                           loading: loadingVerify,
                                           color: 'green',
                                           content: 'Verify',
                                           onClick: this.verifyCode.bind(this)
                                       }}
                                       actionPosition="left"
                                />

                                <Message error header="Code is invalid. Please retry"/>
                            </Form.Field>
                            <Form.Field width={6}>
                                <Button loading={loadingSend} icon="lock" content="Send Code"
                                        onClick={this.sendCode.bind(this)}/>
                            </Form.Field>
                        </Form.Group>
                    ]
                )
            } else {
                return (
                    <Message success header="Phone number has been successfully verified"
                        content={"You have verified phone number +" + phoneCountry + " " + phoneNumber}/>
                )
            }
        };

        return (
            <Grid>
                <Grid.Row columns={16} centered={true}>
                    <Image size="medium" centered={true} src="https://docs.dotomni.com/images/logo.png" />
                </Grid.Row>
                <Grid.Row columns={16} centered={true}>
                    <Grid.Column width="8" verticalAlign="middle">
                        <Form onChange={this.handleChange.bind(this)} error={errorCode} success={submit}>
                            <Form.Input label="Username" placeholder="Dotomni" type="text"/>
                            <Form.Input id="password" label="Enter Password" placeholder="password" type="password"
                                        onChange={this.handleChange.bind(this)}/>
                            <Form.Input label="Confirm Password" placeholder="confirm password" type="password"/>
                            {getPhoneVerification()}
                            <Form.Button disabled={!submit} fluid={true} content="Submit"/>
                        </Form>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
}