import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import 'react-datepicker/dist/react-datepicker.css';
import './less/flexbox-utils.less';
import App from "./app";
import numeral from "numeral";
import "numeral/locales/no.js";
import "moment/locale/nb.js";
import {default as moment} from 'moment';

numeral.locale('no');
moment.locale('nb');

export const CONTACT_EMAIL = 'support@optioincentives.no';
export const CONTACT_PHONE = '+47 22 34 33 32';

ReactDOM.render(<App />, document.getElementById('root'));
