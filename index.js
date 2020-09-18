const axios = require('axios');

const url = 'http://localhost:3000';

const user = 'BankinUser';
const password = '12345678';
const clientId = 'BankinClientId';
const clientSecret = 'secret';

const auth = `Basic ${Buffer.from(clientId + ':' + clientSecret).toString(
  'base64'
)}`;
const headers = {
  headers: {
    Authorization: auth,
    'Content-Type': 'application/json',
  },
};

const fetchRefreshToken = async () => {
  try {
    const response = await axios.post(
      `${url}/login`,
      { user, password },
      headers
    );
    //console.log(response.data.refresh_token);

    return response.data.refresh_token;
  } catch (error) {
    console.error(error);
  }
};

const fetchAccessToken = async () => {
  const refreshToken = await fetchRefreshToken();
  try {
    const response = await axios.post(
      `${url}/token`,
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      headers
    );
    //console.log(response.data.access_token);

    return response.data.access_token;
  } catch (error) {
    console.error(error);
  }
};

const fetchAccounts = async (accessToken) => {
  try {
    const response = await axios.get(`${url}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    //console.log(response.data.account);

    const accounts = [];

    for (const account in response.data.account) {
      if (response.data.account.hasOwnProperty(account))
        accounts.push(response.data.account[account]);
    }

    return accounts;
  } catch (error) {
    console.error(error);
  }
};

const fetchAccountTransactions = async (account, accessToken) => {
  try {
    const response = await axios.get(
      `${url}/accounts/${account.acc_number}/transactions`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    //console.log(response.data.transactions);

    const transactions = [];

    for (const transaction in response.data.transactions) {
      if (response.data.transactions.hasOwnProperty(transaction)) {
        delete transaction.id;
        delete transaction.sign;
        transactions.push(response.data.transactions[transaction]);
      }
    }

    return transactions;
  } catch (error) {
    console.error(error);
  }
};

const fetchAccountData = async (account, accessToken) => {
  const { acc_number, amount } = account;
  const transactions = await fetchAccountTransactions(account, accessToken);

  return {
    acc_number,
    amount,
    transactions,
  };
};

const fetchFormattedAccountsData = async () => {
  try {
    const formattedAccountsData = [];
    const accessToken = await fetchAccessToken();
    const accounts = await fetchAccounts(accessToken);

    accounts.forEach(async (account) => {
      formattedAccountsData.push(await fetchAccountData(account, accessToken));
      console.log(formattedAccountsData);
    });
  } catch (error) {
    console.error(error);
  }
};

fetchFormattedAccountsData();
