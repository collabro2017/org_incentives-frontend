import { Link } from "react-router-dom";
import React, { ReactElement, StatelessComponent } from "react";
import { Icon, Popup, Button, Message } from 'semantic-ui-react';
import numeral from 'numeral';
import { formatNumber } from "../utils/utils";
import { PerformanceYesPopup } from "../instruments/instruments-page";
import Content from "../texts/content";

interface InstrumentSection {
    title: string,
    totalGains: number,
    vestedGains: number,
    totalGainText?: string,
    totalGainHelpText?: string,
    vestedGainsText?: string,
    vestedGainHelpText?: string,
    linkPath: string,
    totalNumberOfInstruments?: number,
    totalNumberOfInstrumentsText?: string,
    vestedQuantity?: number,
    vestedInstrumentsActionComponent?: ReactElement<any>,
    viewOrdersComponent?: ReactElement<any>,
    performance: boolean,
}

const texts = {
    totalGainText: 'ESTIMATED GAIN, ALL OPTIONS',
    vestedGainsText: 'ESTIMATED GAIN, VESTED OPTIONS',
    totalGainHelpText: 'An estimate of the net total gain if all your options would be exercised and then all shares sold at the market price displayed above.  Not taking into account any remaining vesting, restrictions, fees or other costs associated with exercising and/or selling.',
    vestedGainHelpText: 'An estimate of the net total gain if all your fully vested/earned and unrestricted options would be exercised and then all shares sold at the market price displayed above.  Not taking into account any fees or other costs associated with exercising and/or selling.',
};


const InstrumentSection: StatelessComponent<InstrumentSection> =
    ({
         totalGainText = texts.totalGainText, totalGainHelpText = texts.totalGainHelpText, vestedGainsText = texts.vestedGainsText, vestedGainHelpText = texts.vestedGainHelpText,
         title, totalGains, vestedGains, linkPath, totalNumberOfInstruments, totalNumberOfInstrumentsText, vestedInstrumentsActionComponent, viewOrdersComponent, vestedQuantity, performance
     }) =>
        (
            <div className="overview-section">
                <div className="text-center">
                    <h2 className="overview-section-header">{title}</h2>
                </div>
                <div className="main-content block-xl overview-section-content">
                    <div className="overview-section-content-element overview-section-content-element-margin-bottom">
                                <span
                                    className="overview-text-highlight margin-center text-secondary">{numeral(totalGains).format('0,0 $')}</span>
                        <span
                            className="overview-text-subtitle margin-center">{totalGainText} <Popup
                            trigger={<Icon name='question circle outline' />}
                            content={totalGainHelpText}
                        /></span>
                    </div>
                    <div className="overview-section-content-element overview-section-content-element-margin-bottom">
                                <span
                                    className="overview-text-highlight margin-center box-num-highlight-positive">{numeral(vestedGains).format('0,0 $')}</span>
                        <span
                            className="overview-text-subtitle margin-center">{`${vestedGainsText} ${vestedQuantity ? `(${formatNumber(vestedQuantity)})` : ''}`} <Popup
                            trigger={<Icon name='question circle outline' />}
                            content={vestedGainHelpText}
                        /></span>
                        <div className="overview-section-action-panel">
                            {
                                vestedInstrumentsActionComponent
                            }
                        </div>


                    </div>

                    {
                        typeof totalNumberOfInstruments === 'number' &&
                        <div className="overview-section-content-element overview-section-content-element-margin-bottom">
                        <span
                            className="overview-text-highlight margin-center text-secondary">{numeral(totalNumberOfInstruments).format('0,0')}</span>
                            <span className="overview-text-subtitle margin-center">
                            {totalNumberOfInstrumentsText}
                        </span>
                        </div>
                    }
                </div>
                {
                    performance &&
                    <div className="performance-criteria">
                        <Message ><Icon name="info circle" className="banner-icon" size="large"/><Content id="performace.information"/> <PerformanceYesPopup/></Message>
                    </div>
                }
                <div className="text-center">
                    <Button content='View details' as={Link} to={linkPath} size="big" basic primary />
                    {
                        viewOrdersComponent
                    }
                </div>
            </div>
        );

export const CompactInstrumentsSection: StatelessComponent<InstrumentSection> =
    ({
         totalGainText = texts.totalGainText, totalGainHelpText = texts.totalGainHelpText, vestedGainsText = texts.vestedGainsText, vestedGainHelpText = texts.vestedGainHelpText,
         title, totalGains, vestedGains, linkPath, totalNumberOfInstruments, totalNumberOfInstrumentsText, vestedInstrumentsActionComponent, viewOrdersComponent, vestedQuantity, performance
     }) => (
    <div>
        <div className="text-center">
            <h2 className="overview-section-header overview-section-header-compact">{title}</h2>
        </div>
        <div className="main-content block-m overview-section-content">
            <div className="overview-section-content-element overview-section-content-element-compact">
                                <span
                                    className="overview-text-highlight overview-text-highlight-compact margin-center text-secondary">{numeral(totalGains).format('0,0 $')}</span>
                <span
                    className="overview-text-subtitle margin-center">{totalGainText} <Popup
                    trigger={<Icon name='question circle outline' />}
                    content={totalGainHelpText}
                /></span>
            </div>
            <div className="overview-section-content-element overview-section-content-element-compact">
                <span className="overview-text-highlight overview-text-highlight-compact margin-center box-num-highlight-positive">{numeral(vestedGains).format('0,0 $')}</span>
                <span
                    className="overview-text-subtitle margin-center">{`${vestedGainsText} ${vestedQuantity ? `(${formatNumber(vestedQuantity)})` : ''}`} <Popup
                    trigger={<Icon name='question circle outline' />}
                    content={vestedGainHelpText}
                /></span>
                <div className="overview-section-action-panel">
                    {
                        vestedInstrumentsActionComponent
                    }
                </div>


            </div>

            {
                typeof totalNumberOfInstruments === 'number' &&
                <div className="overview-section-content-element overview-section-content-element-compact">
                        <span
                            className="overview-text-highlight overview-text-highlight-compact margin-center text-secondary">{numeral(totalNumberOfInstruments).format('0,0')}</span>
                    <span className="overview-text-subtitle margin-center">
                            {totalNumberOfInstrumentsText}
                        </span>
                </div>
            }
        </div>
        {
            performance &&
            <div className="performance-criteria performance-criteria-compact">
                <Message ><Icon name="info circle" className="banner-icon" size="large"/><Content id="performace.information"/> <PerformanceYesPopup/></Message>
            </div>
        }
        <div className="text-center block-xxl">
            <Button content='View details' as={Link} to={linkPath} basic primary />
            {
                viewOrdersComponent
            }
        </div>
    </div>
);

export default InstrumentSection;