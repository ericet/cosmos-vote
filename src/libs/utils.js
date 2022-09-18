import { SigningStargateClient } from '@cosmjs/stargate'
import { toBase64 } from '@cosmjs/encoding';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import axios from 'axios';
import SigningKeplerEthermintClient from './client/SigningKeplrEthermintClient'
import { Wallet } from '@ethersproject/wallet';

export function extractAccountNumberAndSequence(ret) {
    let { account } = ret
    if (account && account.base_vesting_account) { // vesting account
      account = account.base_vesting_account?.base_account
    } else if (account && account.base_account) { // evmos based account
      account = account.base_account
    }
    const accountNumber = account.account_number
    const sequence = account?.sequence || 0
  
    return {
      accountNumber,
      sequence,
    }
  }

  function isEvmosBasedChain(chainId) {
    const re = /[_]{1}[\d]{4}[\\-]{1}[\d]+$/g
    return re.test(chainId)
  }
  
  export async function sign(chainId, signerAddress, messages, fee, memo, signerData) {
    let client
      if (!window.getOfflineSigner || !window.keplr) {
        throw new Error('Please install keplr extension')
      }
      await window.keplr.enable(chainId)
      const signer = window.getOfflineSigner(chainId)
      if (isEvmosBasedChain(chainId)) {
        client = await SigningKeplerEthermintClient.offline(signer)
      } else {
        client = await SigningStargateClient.offline(signer)
      }
    const addr = signerAddress
    return client.sign(addr, messages, fee, memo, signerData)
  }

  export async function broadcastTx(bodyBytes, chain) {
    const txbytes = bodyBytes.authInfoBytes ? TxRaw.encode(bodyBytes).finish() : bodyBytes
    const txString = toBase64(txbytes)
    const txRaw = {
      tx_bytes: txString,
      mode: 'BROADCAST_MODE_SYNC', 
    }
    return axios.post(`${chain.rest}/cosmos/tx/v1beta1/txs`, txRaw, chain.id).then(res => {
      if (res.code && res.code !== 0) {
        throw new Error(res.message)
      }
      if (res.tx_response && res.tx_response.code !== 0) {
        throw new Error(res.tx_response.raw_log)
      }
      return res
    })
  }

  export function validatePrivateKey(value) {
    try {
        new Wallet(value);
    } catch (e) { 
      console.log(e)
      return false; }
    return true;
}