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

let accounts = [];
let transactions = [];
let finalData = [];

const getRefreshToken = async () => {
  await axios
    .post(`${url}/login`, { user, password }, headers)
    .then((res) => {
      console.log(res.data.refresh_token);
      getAccessToken(res.data.refresh_token);
    })
    .catch((err) => {
      console.error(err);
    });
};

const getAccessToken = async (refreshToken) => {
  await axios
    .post(
      `${url}/token`,
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      headers
    )
    .then((res) => {
      console.log(res.data.access_token);
      getAccountsList(res.data.access_token);
    })
    .catch((err) => console.error(err));
};

const getAccountsList = async (accessToken) => {
  await axios
    .get(`${url}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((res) => {
      console.log(res.data);
      for (const account in res.data.account) {
        if (res.data.account.hasOwnProperty(account)) {
          const element = res.data.account[account];
          accounts.push(element);
          console.log(accounts);
        }
      }
      accounts.forEach((account) => {
        getTransactionsByAccount(accessToken, account);
      });
    })
    .catch((err) => console.error(err));
};

const getTransactionsByAccount = async (accessToken, account) => {
  await axios
    .get(`${url}/accounts/${account.acc_number}/transactions`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((res) => {
      console.log(res.data);
      for (const transaction in res.data.transactions) {
        if (res.data.transactions.hasOwnProperty(transaction)) {
          const element = res.data.transactions[transaction];
          transactions.push(element);
          console.log(transactions);
        }
      }
      parseData(account, transactions);
    })
    .catch((err) => console.error(err));
};

const parseData = (account, transactions) => {
  transactions.forEach((transaction) => {
    delete transaction.id;
    delete transaction.sign;
  });

  finalData.push({
    acc_number: account.acc_number,
    amount: account.amount,
    transactions: transactions,
  });

  console.log(finalData);
};

getRefreshToken();
