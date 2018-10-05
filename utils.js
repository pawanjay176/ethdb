import Web3 from "web3";
var pool = require('./db')
var mysql = require('mysql');
require('dotenv').config()

export const getWeb3 = () =>
  new Promise((resolve, reject) => {
      // Using websockets as http provider doesn't have support for subscriptions
      const provider = new Web3.providers.WebsocketProvider(process.env.INFURA_URL);
      let web3 = new Web3(provider);
      resolve(web3);
      
  });

export async function initializeTables () {
  let createTransactions = `create table if not exists transactions(
    transactionHash varchar(66) primary key,
    nonce INT(32) not null,
    blockHash varchar(66) not null,
    blockNumber INT(32) not null,
    transactionIndex INT(32) not null,
    fromAdd varchar(42) not null,
    toAdd varchar(42),
    value varchar(34) not null,
    gasPrice varchar(32) not null,
    gas INT(32) not null,
    input text not null
)`;

  try {
    var res = await pool.query(createTransactions);
  } catch(err) {
    console.log(err);
  }
}
