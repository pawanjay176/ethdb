import {getWeb3, createdb} from "./utils.js";
let web3;
let db;


import express from "express";
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

async function fetch () {
  web3 = await getWeb3();
  var subscription = await web3.eth.subscribe('newBlockHeaders');
  var block = await web3.eth.getBlock(8967092);
  console.log(block);
  return subscription;
}

io.set('origins', '*:*');
io.on('connection', async (socket) => {
	console.log("Client Successfully Connected");
  let subscription = await fetch();
  
  subscription.on("data", async (blockHeader) => {
      console.log(blockHeader);
      const block = await web3.eth.getBlock(blockHeader.number);
      console.log(block);
      io.emit('chat', blockHeader);
  })
  subscription.on("error", console.error);
})

server.listen(5000, () => {
	console.log("Backend Server is running on http://localhost:5000");
})
