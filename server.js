import {getWeb3, initializeTables} from "./utils.js";
import express from "express";
var mysql = require('mysql');
var pool = require('./db')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
let web3;
let db;

async function getSubscription () {
  var subscription = await web3.eth.subscribe('newBlockHeaders');
  return subscription;
}

async function writeTransactionToDb(t) {
  let sql = `INSERT INTO transactions(transactionHash,nonce,blockHash,blockNumber,transactionIndex,fromAdd,toAdd,value,gasPrice,gas,input)
           VALUES(?,?,?,?,?,?,?,?,?,?,?)`;
  let vals = [t.hash, t.nonce, t.blockHash, t.blockNumber, t.transactionIndex, t.from, t.to, t.value, t.gasPrice, t.gas, t.input];
  try {
    var res = await pool.query(sql, vals);
  } catch(err) {
    console.log(err);
  }

}

async function getTransaction(t) {
  let transaction = await web3.eth.getTransaction(t);
  console.log(transaction);
  await writeTransactionToDb(transaction);
}

async function init() {
  web3 = await getWeb3();
  db = await initializeTables();
}


// io.set('origins', '*:*');
io.on('connection', async (socket) => {
  console.log("Client Successfully Connected");
  await init();
  let subscription = await getSubscription();
  
  subscription.on("data", async (blockHeader) => {
      // console.log(blockHeader);
      let block = await web3.eth.getBlock(blockHeader.hash);
      // console.log(block);
      block.transactions.map(t => getTransaction(t).then(console.log));
      io.emit('chat', block);
  })
  subscription.on("error", console.error);
})

server.listen(5000, () => {
	console.log("Backend Server is running on http://localhost:5000");
})
