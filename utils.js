import Web3 from "web3";
var pool = require('./db')
var mysql = require('mysql');
require('dotenv').config()

export const getWeb3 = () =>
  new Promise((resolve, reject) => {
      // Using websockets as http provider doesn't have support for subscriptions
      const provider = new Web3.providers.WebsocketProvider("wss://kovan.infura.io/ws");
      let web3 = new Web3(provider);
      resolve(web3);
      
  });

export async function initializeSchema () {
  // don't see a point of storing the logs indexed by transactions
  // skipping for now
  // merging transaction receipt with transaction table 
  let transactionSql = `create table if not exists transaction(
    transactionHash char(66) primary key,
    nonce INT(32) not null,
    blockhash char(66) not null,
    blockNumber INT(32) not null,
    transactionIndex INT(32) not null,
    fromAdd char(42) not null,
    toAdd char(42),
    value char(34) not null,
    gasPrice varchar(32) not null,
    gas INT(32) not null,
    input text not null,
    status boolean,
    contractAddress char(42),
    cumulativeGasUsed INT(64),
    gasUsed INT(64),
    FOREIGN KEY fk_blockhash(blockhash) 
    REFERENCES block(hash)
    ON DELETE CASCADE
)`;

  let blockSql = `create table if not exists block(
    hash char(66) primary key,
    number INT(64) not null,
    parentHash char(66) not null,
    nonce char(18),
    sha3Uncles char(66) not null,
    logsBloom text,
    transactionsRoot char(66) not null,
    stateRoot char(66) not null,
    miner char(42) not null,
    difficulty text not null,
    totalDifficulty text not null,
    extraData text,
    blocksize INT(64) not null,
    gasLimit INT(64) not null,
    gasUsed INT(64) not null,
    timestamp INT(64) not null
)`;
   
let uncleSql = `create table if not exists uncle(
  hash char(66) not null primary key,
  blockhash char(66) not null,
  FOREIGN KEY fk_blockhash(blockhash) 
    REFERENCES block(hash)
    ON DELETE CASCADE
)`;

  try {
    await pool.query(blockSql);
    await pool.query(transactionSql);
    await pool.query(uncleSql);
  } catch(err) {
    console.log(err);
  }
}
