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
    input text not null,
    status boolean,
)`;

let createReceipts = `create table if not exists receipts(
  
  blockHash char(66) not null,
  blockNumber INT(64) not null,
  transactionHash char(66) primary key not null,
  transactionIndex INT(64) not null
  fromAdd char(42) not null,
  toAdd char(42),
  contractAddress char(42),
  cumulativeGasUsed INT(64),
  gasUsed INT(64),
)`;

let createBlocks = `create table if not exists blocks(
  hash char(66) primary key,
  number INT(64) not null,
  parentHash char(66) not null,
  nonce char(18) not null,
  sha3Uncles char(66) not null,
  logsBloom text not null,
  transactionsRoot char(66) not null,
  stateRoot char(66) not null,
  miner char(42) not null,
  difficulty text not null,
  totalDifficulty text not null,
  extraData text,
  size INT(64) not null,
  gasLimit INT(64) not null,
  gasUsed INT(64) not null,
  timestamp INT(64) not null,
)`;

  try {
    var res = await pool.query(createTransactions);
  } catch(err) {
    console.log(err);
  }
}
