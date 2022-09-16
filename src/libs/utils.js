// import SigningKeplerEthermintClient from './client/SigningKeplrEthermintClient'
import { SigningStargateClient } from '@cosmjs/stargate'
import { fromBase64,toBase64 } from '@cosmjs/encoding';
import { Int53 } from '@cosmjs/math';
import {
  makeAuthInfoBytes,
  makeSignDoc,
} from '@cosmjs/proto-signing';
import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Any } from 'cosmjs-types/google/protobuf/any';
import axios from 'axios';

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

  async function evmSign (
    signerAddress,
    messages,
    fee,
    memo,
    explicitSignerData,
    signer
  ) {
    const account = await signer.getAccounts();
    const acc = account.find((x) => x.address === signerAddress);
    if (!acc) {
      throw new Error('The signer address dose not exsits in Ledger!');
    }
    // Custom typeUrl for EVMOS
    const pubk = Any.fromPartial({
      typeUrl: '/ethermint.crypto.v1.ethsecp256k1.PubKey',
      value: PubKey.encode({
        key: acc.pubkey,
      }).finish(),
    });

    const txBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: {
        messages,
        memo,
      },
    };
    let client = await SigningStargateClient.offline(signer)
    const txBodyBytes = client.registry.encode(txBodyEncodeObject);
    const gasLimit = Int53.fromString(fee.gas).toNumber();
    const authInfoBytes = makeAuthInfoBytes(
      [{ pubkey: pubk, sequence: explicitSignerData.sequence }],
      fee.amount,
      gasLimit
    );
    const signDoc = makeSignDoc(
      txBodyBytes,
      authInfoBytes,
      explicitSignerData.chainId,
      explicitSignerData.accountNumber
    );
    const { signature, signed } = await signer.signDirect(
      signerAddress,
      signDoc
    );

    // returns txBytes for broadcast
    return Promise.resolve(
      TxRaw.encode({
        bodyBytes: signed.bodyBytes,
        authInfoBytes: signed.authInfoBytes,
        signatures: [fromBase64(signature.signature)],
      }).finish()
    );
  }
  
  export async function sign(chainId, signerAddress, messages, fee, memo, signerData) {
    let client
      if (!window.getOfflineSigner || !window.keplr) {
        throw new Error('Please install keplr extension')
      }
      await window.keplr.enable(chainId)
      const signer = window.getOfflineSigner(chainId)
      if (isEvmosBasedChain(chainId)) {
        // client = await SigningKeplerEthermintClient.offline(signer)
        return evmSign(signerAddress,messages,fee,memo,signerData,signer)
      } else {
        client = await SigningStargateClient.offline(signer)
      }
    const addr = signerAddress
    return client.sign(addr, messages, fee, memo, signerData)
  }

  export async function broadcastTx(bodyBytes, config = null) {
    const txbytes = bodyBytes.authInfoBytes ? TxRaw.encode(bodyBytes).finish() : bodyBytes
    const txString = toBase64(txbytes)
    const txRaw = {
      tx_bytes: txString,
      mode: 'BROADCAST_MODE_SYNC', // BROADCAST_MODE_SYNC, BROADCAST_MODE_BLOCK, BROADCAST_MODE_ASYNC
    }
    return axios.post('https://rest.cosmos.directory/evmos/cosmos/tx/v1beta1/txs', txRaw, config).then(res => {
      if (res.code && res.code !== 0) {
        throw new Error(res.message)
      }
      if (res.tx_response && res.tx_response.code !== 0) {
        throw new Error(res.tx_response.raw_log)
      }
      return res
    })
  }