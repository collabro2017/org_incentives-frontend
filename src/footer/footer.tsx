import React, { StatelessComponent } from 'react';
import './footer.less';
import { CONTACT_EMAIL, CONTACT_PHONE } from "../index";

const Footer: StatelessComponent = () => (
    <footer className="footer">
        <div className="flex-1 opacity-7">
            <div>
                <span>Copyright 2018</span>
                <i className="copyright icon" />
                <span>Optio Incentives AS</span>
            </div>
        </div>
        <div className="flex-1 text-center opacity-7">
            <div>{CONTACT_PHONE}</div>
            <div>{CONTACT_EMAIL}</div>
        </div>
        <span className="flex-1" />
    </footer>
);

export default Footer;
