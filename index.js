const fetch = require('node-fetch');
const recurly = require('recurly');

const {
  API_KEY,
  API_PASS,
  SHOP_URL,
  API_URL,
  RECURLY_API,
  INTERNAL_KEY,
} = process.env;

const apiUrl = `https://${API_KEY}:${API_PASS}@${SHOP_URL}`;
const findCustomerUrl = `${apiUrl}/admin/customers/search.json`;

// -----------------------------------------------------------------------------------------
class RecurlyAPI {
  constructor() {
    this.client = new recurly.Client(RECURLY_API);
    this.counter = 0;
    // eslint-disable-next-line no-console
    console.log('< Starting Recurly API >');
  }

  async getSubscriptions() {
    // eslint-disable-next-line no-console
    console.log('Getting Recurly Active Subscription...');

    const activeSubscriptions = [];
    try {
      const subscriptions = this.client.listSubscriptions({
        limit: 200,
      });

      // eslint-disable-next-line no-restricted-syntax
      for await (const subscription of subscriptions.each()) {
        if (subscription.state === 'active') {
          this.counter += 1;
          activeSubscriptions.push(subscription);
        }
      }
      // eslint-disable-next-line no-console
      console.log('TOTAL ACTIVE SUBSCRIPTION - COUNTER: ', this.counter);
      return activeSubscriptions;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('ERROR IN getSubscriptions: ', e);
      throw new Error('Something went wrong');
    }
  }

  async getAccounts() {
    // eslint-disable-next-line no-console
    console.log('Getting Recurly Account List...');

    const accountList = [];
    const accounts = this.client.listAccounts({
      limit: 200,
    });

    // eslint-disable-next-line no-restricted-syntax
    for await (const account of accounts.each()) {
      accountList.push(account);
    }

    return accountList;
  }
}

/**
 * @name addAccountTokenToMetafield
 * @param {*} accountToken
 * @param {*} customerID
 */
const addAccountTokenToMetafield = async (accountToken, customerID) => {
  const urlAccountTokenized = `https://${API_URL}/account/${accountToken}`;

  const metafieldData = {
    metafield: {
      namespace: 'account-management',
      key: 'recurly-user-account',
      value: urlAccountTokenized,
      value_type: 'string',
    },
  };
  const urlMetafield = `${apiUrl}/admin/customers/${customerID}/metafields.json`;

  const setCustomerMetafield = await fetch(urlMetafield, {
    method: 'POST',
    body: JSON.stringify(metafieldData),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());

  // eslint-disable-next-line no-console
  console.log('> setCustomerMetafield', setCustomerMetafield.metafield);
  return setCustomerMetafield.metafield;
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * @name population
 * Main Function that Populates
 */
const population = async (req, res) => {
  console.log('-->LOGGER : population -> req', req.body);
  if (req.body.code === INTERNAL_KEY) {
    let updatesCounter = 0;
    const emailFailed = [];
    const finalResult = {
    };
    // eslint-disable-next-line no-console
    console.log('---*--- Starting Population ---*---');
    res.write('Starting Population');

    // Get the Recurly Customers with active membership
    const recurlyInstance = new RecurlyAPI();
    const recurlySubscriptionList = await recurlyInstance.getSubscriptions();
    const recurlyAccountList = await recurlyInstance.getAccounts();

    // eslint-disable-next-line no-console
    console.log('Active Subscription From Recurly API Received', recurlySubscriptionList.length);
    // eslint-disable-next-line no-console
    console.log('Account List From Recurly API Received', recurlyAccountList.length);
    res.write(`Total Active Subscription ${recurlySubscriptionList.length}`);

    // eslint-disable-next-line no-restricted-syntax
    for (const recurlySubscription of recurlySubscriptionList) {
      const {
        id,
        email,
      } = recurlySubscription.account;

      const getAccountFromSubscription = recurlyAccountList.find((acc) => acc.id === id);
      const {
        hostedLoginToken,
      } = getAccountFromSubscription;

      const getSearchUrl = `${findCustomerUrl}?query=email:${email}`;

      // eslint-disable-next-line no-await-in-loop
      await delay(1001);
      // eslint-disable-next-line no-await-in-loop
      const getCustomerData = await fetch(getSearchUrl).then((res2) => res2.json());

      // eslint-disable-next-line no-console
      console.log('> Adding metadata to: ', email);
      if (getCustomerData.customers && getCustomerData.customers[0] && getCustomerData.customers[0].id) {
        // eslint-disable-next-line no-await-in-loop
        await delay(1001);
        // eslint-disable-next-line no-await-in-loop
        const data = await addAccountTokenToMetafield(hostedLoginToken, getCustomerData.customers[0].id);
        finalResult[email] = data;
        updatesCounter += 1;
        console.log(`> ${updatesCounter} Customers updated of ${recurlySubscriptionList.length}`);

        res.write(JSON.stringify(finalResult));
      } else {
        emailFailed.push(email);
        console.log('> Warning - something wrong happened, mostly error: Exceeded 2 calls per second for api client...');
        console.log(getCustomerData);
        console.log(emailFailed);
        console.log('---------- END WARNING ----------');
      }
    }
    res.status(200).send(finalResult);
  } else {
    res.status(200).send('WRONG KEY');
  }
};

module.exports = (req, res) => population(req, res);
