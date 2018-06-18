import { testnet, mainnet } from './constants';
const NebPay = require('nebPay/nebpay.js');

const neb = new NebPay();

export const simulateFunction = (network = 'mainnet', name, args) => {
  return new Promise((resolve, reject) => {
    neb.simulateCall(network === 'mainnet' ? mainnet.contract : testnet.contract, '0', name, JSON.stringify(args), {
        listener: function(res) {
          if (res.execute_err !== '') {
            reject(res.execute_err);
          }
          try {
            const result = JSON.parse(res.result);
            resolve(result);
          } catch (e) {
            resolve(res);
          }
        }
    });
  });
}

export const callFunction = (network = 'mainnet', name, args) => {
  return new Promise((resolve, reject) => {
    neb.call(network === 'mainnet' ? mainnet.contract : testnet.contract, '0', name, JSON.stringify(args), {
        listener: function(res) {
          if (typeof res === 'string' && res.indexOf('Error:') >= 0) {
            reject(res);
          }
          // { txHash: '' }
          try {
            resolve(JSON.parse(res));
          } catch (e) {
            resolve(res);
          }
        }
    });
  });
}

export const callFunctionUsePublicAddress = (network = 'mainnet', name, args) => {
  return new Promise((resolve, reject) => {
    const url = network === 'mainnet' ? mainnet.url : testnet.url;
    const contract = network === 'mainnet' ? mainnet.contract : testnet.contract;
    const requestObj = {
      from: 'n1Mzkyry3wCL9BLQtaBKeikWYWdKGDzmSDX',
      to: contract,
      value: '0',
      nonce: 1,
      gasPrice: '1000000',
      gasLimit: '2000000',
      contract: {
        function: name,
        args: JSON.stringify(args)
      }
    }
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestObj)
    })
    .then(res => res.json())
    .then(res => {
      console.log(JSON.parse(res.result.result))
      resolve(JSON.parse(res.result.result))
    })
    .catch(err => {
      reject(err)
    })
  });
}

export const getList = network => callFunctionUsePublicAddress(network, 'get', [10, 1])

export const write = (network, name, score) => callFunction(network, 'write', [name, score])

export const getMine = (network, address) => callFunctionUsePublicAddress(network, 'getOne', [address])
