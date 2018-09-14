import React from 'react'
import { Message } from 'semantic-ui-react'

const items = [
    'Hvis subprogrammet er huket av, vil alle transjer som ikke har vestet i det subprogrammet bli påvirket.',
    'Generate Dividend Instruments: Oppretter en ny transje av samme instrument, med antall beregnet etter formelen: (dividend_per_share / share_price_at_dividend_date)  * existing_quantity, hvor existing_quantity er summen av antallet i den originale granten + alle eventuelle dividend grants som tilhører samme transje',
    'Strike Adjustment: Oppretter en ny transaksjon på en transje, hvor striken nedjusteres tilsvarende utbytte per aksje.',
];

const DividendCreateTutorial = () => (
    <Message>
        <Message.Header>Forklaring</Message.Header>
        <Message.List items={items} />
    </Message>
);

export default DividendCreateTutorial;