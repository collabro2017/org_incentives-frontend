import React, { StatelessComponent } from 'react';
import { CONTACT_EMAIL, CONTACT_PHONE } from "../index";
import { connect } from "react-redux";
import { injectIntl, InjectedIntlProps } from "react-intl";
import Content from "../texts/content";

const FAQPage = () => (
    <div className="main-content">
        <div className="block-xxl">
            <h2 className="block-m text-center">Support</h2>

            <div className="text-content-center">
                <p>We're available for support during working hours 08:30-17:00 CET.</p>
                <p>If you have any questions, don't hesitate to contact us at {CONTACT_EMAIL}, by calling {CONTACT_PHONE} or by using the chat in the bottom right corner.</p>
            </div>
        </div>
        {/*<div>*/}
            {/*<h2 className="block-m text-center">FAQ</h2>*/}
            {/*<div className="text-content-center">*/}
                {/*<ConnectedFAQList />*/}
            {/*</div>*/}
        {/*</div>*/}
    </div>
);

const FAQList: StatelessComponent<InjectedIntlProps> = ({ intl: { formatMessage }}) => {
    let questions = [];
    let counter = 1;

    while (formatMessage({ id: `faq.${counter}.header` }) !== `faq.${counter}.header`) {
        questions.push(
            <div className="block-m">
                <h3><Content id={`faq.${counter}.header`}/></h3>
                <p><Content id={`faq.${counter}.answer`}/></p>
            </div>
        );
        counter++;
    }

    return (
        <div>
            {questions}
        </div>
    );
};

const ConnectedFAQList = injectIntl<{}>(FAQList);


export default FAQPage;