const fs = require('fs');

module.exports = {
    syncTexts: function(client, localTexts) {

        client.connect();

        const configUuid = '71184113-81aa-47c7-b435-d04896853c1d';
        client.query('SELECT * FROM configs WHERE id = $1', [configUuid], (err, res) => {
            const remoteTexts = res.rows[0].texts;

            const localKeysToUpdate = [];
            const remoteKeysToAdd = [];
            const remoteKeysToDelete = [];

            Object.keys(remoteTexts).forEach((key) => {
                if (!localTexts[key]) {
                    // Slett keys som bare eksisterer i db

                    // Sletter ikke atm, da FAQ page er avhengig av å kunne legge til keys dynamisk
                    // remoteKeysToDelete.push(key);
                } else if (localTexts[key] !== remoteTexts[key]) {
                    // Endre på tekster lokalt som har blitt endret remote
                    localKeysToUpdate.push(key)
                }
            });
            const localKeys = Object.keys(localTexts);
            localKeys.forEach((key) => {
                if (!remoteTexts[key]) {
                    // Legg til keys som bare eksisterer lokalt
                    remoteKeysToAdd.push(key)
                }
            });

            remoteKeysToDelete.forEach((key) => delete remoteTexts[key]);
            remoteKeysToAdd.forEach((key) => remoteTexts[key] = localTexts[key]);
            localKeysToUpdate.forEach((key) => localTexts[key] = remoteTexts[key]);

            // Update db
            const text = 'UPDATE configs SET texts = $2 WHERE id = $1 RETURNING *';
            const values = [configUuid, remoteTexts];

            client.query(text, values, (err, res) => {
                if (err) {
                    console.log(err.stack)
                } else {
                    console.log("Database updated")
                }
                client.end()
            })

            // Write to local text file

            const fileString =
                `module.exports = {
${localKeys.map((key, index) => `   "${key}": "${localTexts[key]}"`).join(',\n')}
};
`;
            fs.writeFile('../../src/texts/texts.js', fileString, 'utf8', (err) => {
                if (err) throw err;
                console.log('Local text file overwritten');
            });
        })

    }
}

