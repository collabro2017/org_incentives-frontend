import React, { Component, StatelessComponent } from 'react';
import moment, { Moment } from "moment";
import { Window } from "../data/data";
import './exercise-terms.less';
import { formatCurrency, formatNumber } from "../utils/utils";

interface Props {
    employeeName: string,
    companyName: string,
    dateOfAgreement: Moment,
    exerciseWindow: Window,
    instrumentsToExercise: number,
    averageStrikePrice: number,
    commission: string,
    brokerMinimumAmount: number,
    bankAccount: string,
    contact: Contact,
    bufferPercentage: string
}

interface Contact {
    name: string,
    phone: string,
    email: string,
}

class ExerciseAndSellToCoverTerms extends Component<Props, {}> {
    render() {
        const { companyName, employeeName, dateOfAgreement, exerciseWindow, averageStrikePrice,
            instrumentsToExercise, commission, brokerMinimumAmount, bankAccount, contact, bufferPercentage } = this.props;
        return (
            <div className="terms-es-section">
                <div className="block-m">
                    <h2 className="text-center">AGREEMENT CONCERNING SALE OF RIGHTS RELATED TO SHARES IN {companyName} (THE "COMPANY")</h2>
                </div>
                <div className="block-m">
                    <h2 className="text-center">between</h2>
                </div>
                <div className="block-m">
                    <h2 className="text-center">DNB Markets, PART OF DNB Bank ASA ("DNB"),</h2>
                </div>
                <div className="block-m">
                    <h2 className="text-center">and</h2>
                </div>
                <div className="block-m">
                    <h2 className="text-center">{employeeName} ("Employee")</h2>
                    <h2 className="text-center">dated {dateOfAgreement.format('ll')} (the "Agreement")</h2>
                </div>
                <ol className="text-content-center terms-ordered-list block-l">
                    <li>
                        <p>
                            The Employee has received a conditional offer from DNB concerning purchase of rights to acquire shares in the Company (the <strong>"Instruments"</strong>). This offer is valid until {exerciseWindow.to.format('lll')} (the <strong>"Offer Period"</strong>). The Employee confirms, by entering into this Agreement, that he or she has read and understood the intensions and scope of DNB's offer. The communication between the Employee and DNB, including co-ordination with the Company, is organized by Optio Incentives AS (OI) . The Agreement is subject to OI informing DNB in writing that the Agreement is entered into and which rights and obligations are included.
                        </p>
                    </li>
                    <li>
                        <p>
                            The Employee confirms that he or she is entitled to receive Instruments which gives the Employee a right to acquire {formatNumber(instrumentsToExercise)} shares in the Company for a subscription price of NOK {formatCurrency(averageStrikePrice)} per share.
                        </p>
                        <p>
                            This Agreement only covers Instruments where the difference between the closing price of the underlying shares at the expiration of the Offer Period and the exercise price (if any), is larger than a certain percentage of up to {bufferPercentage} of the closing price on the day of the expiry of the Offer Period (the <strong>"Buffer"</strong>). The actual Buffer is set by DNB on the day of the expiry of the Offer Period and is based on DNB's evaluation of the market. Therefore, if the Employee has Instruments at various subscription prices, this Agreement may only apply to some of the Instruments.
                        </p>
                    </li>
                    <li>
                        <p>
                            The Employee assigns all rights and obligations related to the Instruments to DNB
                        </p>
                    </li>
                    <li>
                        <p>
                            The basis of the calculation of the consideration payable to the Employee is found by multiplying the number of shares represented by the Instruments with the average selling price per share obtained from bloc sale(s) as advised by the Company (the <strong>"Calculation Basis"</strong>). If such advice is not received from the Company, the sales of shares will be carried out as deemed appropriate by DNB, and to the best possible price. DNB may as an alternative to selling issued shares, borrow shares in the market and thereafter sell these. In such case, DNB may sell such shares from the expiry of the Offer Period.
                        </p>
                        <p>Depending on the traded volume of the shares and other related circumstances, the shares may be sold in one or more transactions outside the appropriate stock exchange. Current market conditions may lead to the shares being sold at an average price which is below the market price at the time of sale. </p>
                        <p>
                            From the Calculation Basis, the following shall be deducted: (i) The total subscription price (number of shares times subscription price per share), if any, and (ii) a fee (to DNB and OI) equal to {commission} of the Calculation Basis (minimum NOK {brokerMinimumAmount}) (the <strong>"Employee Consideration"</strong>). DNB cannot claim that the Employee covers the balance if the total deduction pursuant to (i) and (ii) exceeds the Calculation Basis
                        </p>
                    </li>
                    <li>
                        <p>
                            If the Employee Consideration is equal to or higher than NOK 100,000, and if the Employee is not already a customer of DNB Markets, and thereby has confirmed his or her identity, the Employee must do so in accordance with instructions from DNB Bank ASA cf. the Norwegian Act on Money Laundering (Nw. Lov om tiltak mot hvitvasking og terrorfinansiering mv. (hvitvaskingsloven) av 6. mars 2009).
                        </p>
                    </li>
                    <li>
                        <p>
                            The Employee Consideration is due no later than ten business days after the shares relating to the Instruments were registered on DNB's securities account or sold in the market, whichever is the later. The Employee Consideration will be transferred to bank account no. {bankAccount}. Note however that the Company may at its own discretion choose that the Employee Consideration shall be transferred to the Company's bank account, due to tax considerations. The Company will in this case transfer the Employee Consideration less any applicable withholding tax to the Employee through local payroll. The Employee further accepts to have read and understood that DNB holds no responsibility for the Company failing for any reason to transfer the Employee Consideration to the Employee. Any and all costs related to the transfer of the Employee Consideration will be payable by the Employee. If these costs exceed the Employee Consideration, the Employee will not receive any amount.
                        </p>
                    </li>
                    <li>
                        <p>
                            In the event that the Company must issue new shares in order to fulfill its obligations under the Instruments, DNB is only obliged under this Agreement if the capital increase following such issuance is registered in the Register of Business Enterprises (Swe. Bolagsverket) no later than three working days after the expiry of the Offer Period. If the capital increase is not registered by this time, DNB may, instead of forfeiting the Agreement, await that the Company brings the matter in order and thereafter carry out the Agreement with binding effect for the parties. OI will, as far as practical, inform the Employee, but DNB has no duty to inform the Employee regarding adjustments in the time schedule for the transaction.
                        </p>
                    </li>
                    <li>
                        <p>
                            The Employee authorizes OI to communicate information contained in this Agreement and other relevant information as necessary to DNB. Should the Employee have any questions related to the implementation of this Agreement, they may contact {contact.name} in the Company at {contact.phone} or {contact.email},  or OI at +47 22 34 33 32 or e-mail support@optioincentives.no
                        </p>
                    </li>
                    <li>
                        <p>
                            OI arranges and provides the electronic platform for this Agreement. The Employee agrees that OI handles personal data regarding the Employee and communicates these to DNB. OI is not responsible for any errors or losses caused by matters outside of OI' control, e.g. disconnection, errors or fault by sub-contractors, or the Employee's free and unhampered access to the Internet. DNB is not responsible for any errors or losses caused by matters outside of DNB's control.
                        </p>
                    </li>
                    <li>
                        <p>
                            The Employee is responsible for any consequences related to taxation of any consideration received by entering into this Agreement.
                        </p>
                    </li>
                    <li>
                        <p>
                            The Employee declares and confirms not to be in possession of insider information regarding the Company, and to have taken all necessary and proper action to ensure this fact.
                        </p>
                        <p>
                            If the Employee is a primary insider, he or she is responsible for fulfilling the notification requirements applicable (Nw. cf. the Norwegian Securities Trading Act § 4-2,Nw. Lov om Verdipapirhandel (verdipapirhandelloven) av 29. juni 2007 § 4-2).
                        </p>
                        <p>
                            If the shares relating to the Instruments are sold in one or more transactions outside the appropriate stock exchange, the Employee hereby accepts that DNB informs buyers that the shares are obtained by purchase of rights to receive shares amongst others from primary insiders in the Company.
                        </p>
                    </li>
                    <li>
                        <p>
                            The Employee confirms to have read, understood and accepted the current commercial terms of DNB Markets'. The terms apply to this Agreement, as applicable. The terms can be found on: <a href="https://www.dnb.no/portalfront/nedlast/no/markets/engelsk/agreements/general-business-terms-mifidII.pdf">DNB General Business Terms</a>
                        </p>
                    </li>
                </ol>
                <div className="terms-parties-section text-content-center">
                    <span className="terms-parties-section-employee">{employeeName}</span>
                    <div className="terms-parties-section-broker">
                        <div>DNB Markets, a part of</div>
                        <div>DNB Bank ASA</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ExerciseAndSellToCoverTerms;