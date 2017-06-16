var config = {
    SalesForce: {
        loginUrl: 'https://login.salesforce.com',
        clientId: '3MVG9ZL0ppGP5UrDtB_98daW.eZQjltrFZQjuUPgrXYy.IYtZpMW63oR06MyLjNDqY.74b_6Cy_MHUruXj77b',
        clientSecret: '8249665414194673479',
        redirectUri: 'http://localhost:3000/api/oauth2/callback'
    },
    DropBox: {
        key: 'g9pacy1g8xmvq7w',
        secret: 'ypsd697om5k0hbh',
        redirect_url: 'http://localhost:3000/api/oauth/dropbox'
    },
    GoogleDrive: {
        client_id: '843570047164-nap5pnpbbf5qfie82u8tlb2nsbb62emg.apps.googleusercontent.com',
        client_secret: 'vHL49ML9DqsjsxWqUizlgM7V',
        redirect_uris: 'http://localhost:3000/api/oauth/drive'
    },
    Box: {
        client_id: 'zaj8m21g5ehqo3foou553sk4517lv1hi',
        client_secret: 'pOJJ7jDaj4L2uvRkBojX2Az5gMkYxFIL',
    },

    StandardSalesForceFields: ["Id", "OwnerId", "IsDeleted", "CreatedById", "CreatedDate", "LastModifiedById", "LastModifiedDate", "SystemModstamp"],
    recordBatchSize: 1,
    primitiveTypes: ["Decimal","Double","Integer","Long"]
}


module.exports = config;

