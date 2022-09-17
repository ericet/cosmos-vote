import { fromBase64 } from '@cosmjs/encoding';
import { Int53 } from '@cosmjs/math';
import { makeAuthInfoBytes, makeSignDoc, } from '@cosmjs/proto-signing';
import { SigningStargateClient, } from '@cosmjs/stargate';
import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Any } from 'cosmjs-types/google/protobuf/any';
export default class SigningKeplerEthermintClient {
    static async offline(signer, options) {
        const instance = new SigningKeplerEthermintClient();
        instance.client = await SigningStargateClient.offline(signer, options);
        instance.signer = signer;
        return Promise.resolve(instance);
    }
    async sign(signerAddress, messages, fee, memo, explicitSignerData) {
        const account = await this.signer.getAccounts();
        const acc = account.find(x => x.address === signerAddress);
        if (!acc) {
            throw new Error('The signer address dose not exsits in Ledger!');
        }
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
        const txBodyBytes = this.client.registry.encode(txBodyEncodeObject);
        const gasLimit = Int53.fromString(fee.gas).toNumber();
        const authInfoBytes = makeAuthInfoBytes([{ pubkey: pubk, sequence: explicitSignerData.sequence }], fee.amount, gasLimit);
        const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, explicitSignerData.chainId, explicitSignerData.accountNumber);
        const { signature, signed } = await this.signer.signDirect(signerAddress, signDoc);
        return Promise.resolve(TxRaw.encode({
            bodyBytes: signed.bodyBytes,
            authInfoBytes: signed.authInfoBytes,
            signatures: [fromBase64(signature.signature)],
        }).finish());
    }
}
