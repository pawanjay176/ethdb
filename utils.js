import Web3 from "web3";
var pool = require('./db')
var mysql = require('mysql');
require('dotenv').config()

export const getWeb3 = () =>
  new Promise((resolve, reject) => {
      // Using websockets as vanila http provider doesn't have support for subscriptions
      const provider = new Web3.providers.WebsocketProvider(process.env.INFURA_URL);
      let web3 = new Web3(provider);
      resolve(web3);
      
  });

export async function createdb () {
  try {
    var result = await pool.query('CREATE DATABASE ethdb')
  } catch(err) {
    console.log(err);
  }
}
