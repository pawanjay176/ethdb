import {getWeb3, initializeSchema} from "./utils.js";
import express from "express";
var mysql = require('mysql');
var pool = require('./db')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
let web3;

// Return a subscription object
async function getSubscription () {
  try {
    var subscription = await web3.eth.subscribe('newBlockHeaders');
    return subscription;
  } catch(err) {
    console.log("getSubscription failed", err);
  }
}

// Write a transaction with its receipt data into db
async function writeTransactionToDb(transaction) {
  try {
    let t = await web3.eth.getTransaction(transaction);
    let r = await web3.eth.getTransactionReceipt(t.hash);
    let sql = `INSERT INTO transaction(transactionHash,nonce,blockhash,blockNumber,transactionIndex,fromAdd,toAdd,value,gasPrice,gas,input,status,contractAddress,cumulativeGasUsed,gasUsed)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    let vals = [t.hash, t.nonce, t.blockHash, t.blockNumber, t.transactionIndex, t.from, t.to, t.value, t.gasPrice, t.gas, t.input, r.status, r.contractAddress, r.cumulativeGasUsed, r.gasUsed];
    var res = await pool.query(sql, vals);
  } catch(err) {
    console.log(err);
  }
}

// Write uncle hash to db
async function writeUnclesToDb(uncleHash, blockHash) {
  let sql = `INSERT INTO uncle(hash,blockhash)
  VALUES(?,?)`;
  let vals = [uncleHash, blockHash];
  try {
    var res = await pool.query(sql, vals);
  } catch(err) {
    console.log(err);
  }
}

// Write blocks to db
async function writeBlockToDb(b) {
  let sql = `INSERT INTO block(hash,number,parentHash,nonce,sha3Uncles,logsBloom,transactionsRoot,stateRoot,miner,difficulty,totalDifficulty,extraData,blocksize,gasLimit,gasUsed,timestamp)
  VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  let vals = [b.hash, b.number, b.parentHash, b.nonce, b.sha3Uncles, b.logsBloom, b.transactionsRoot, b.stateRoot, b.miner, b.difficulty, b.totalDifficulty, b.extraData, b.size, b.gasLimit, b.gasUsed, b.timestamp];
  try {
    var res = await pool.query(sql, vals);
  } catch(err) {
    console.log(err);
  }
  b.transactions.map(t => writeTransactionToDb(t).then());
  b.uncles.map(u => writeUnclesToDb(u, b.hash).then());
}

// Init db schema and web3 object
async function init() {
  try {
    web3 = await getWeb3();
    await initializeSchema();
  } catch(err) {
    console.log("init failed ", err);
  }
}

async function getData() {
  await init();
  let subscription = await getSubscription();
  subscription.on("data", async (blockHeader) => {
      // consider getting transaction objects in the same api call
      let block = await web3.eth.getBlock(blockHeader.hash);
      console.log(block);
      io.emit('chat', block);
      await writeBlockToDb(block);
  })
  subscription.on("error", console.error);
}

function main() {
  getData()
  .then(function() {
    console.log("Got result");
  }, function(err) {
    console.log(err);
  });
}


server.listen(5000, () => {
  console.log("Backend Server is running on http://localhost:5000");
})

// start fetching only after client is connected
io.on('connection', () => {
  console.log("Client Successfully Connected");
  main();
});