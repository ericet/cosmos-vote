<template>
  <div class="flex flex-col justify-center items-center" v-if="accounts.length > 0">
    <button type="button" @click="vote"
      class="mt-4 mb-8 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
      Vote
    </button>
  </div>
</template>
<script>
import { coins, Secp256k1HdWallet } from '@cosmjs/launchpad';
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing"
import { stringToPath } from '@cosmjs/crypto';
import { createTxMsgVote } from '@tharsis/transactions';
import {
  broadcast,
  getSender,
  MAINNET_CHAIN,
  signTransaction,
} from '@hanchon/evmos-ts-wallet';
import {
  QueryClient,
  setupGovExtension,
  setupBankExtension,
  SigningStargateClient,
} from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import { validatePrivateKey } from '@/libs/utils';
import { fromHex } from "@cosmjs/encoding"
import {
    PrivateKey,
    InjectiveDirectEthSecp256k1Wallet
} from "@injectivelabs/sdk-ts"

export default {
  props: ['accounts'],
  methods: {
    hasVoted(client, proposal, address) {
      return new Promise((resolve) => {
        client.gov
          .vote(proposal.proposal_id, address)
          // eslint-disable-next-line no-unused-vars
          .then((res) => {
            resolve(true);
          })
          // eslint-disable-next-line no-unused-vars
          .catch((err) => {
            resolve(false);
          });
      });
    },
    async voteProposalEvmos(wallet, chain, proposal, address) {
      const sender = await getSender(wallet, chain.rest);
      const voteTx = createTxMsgVote(
        MAINNET_CHAIN,
        sender,
        {
          amount: chain.min_tx_fee[0],
          denom: chain.denom,
          gas: '' + chain.gas,
        },
        '',
        {
          proposalId: proposal.proposal_id,
          voter: address,
          option: Number(proposal.vote),
        }
      );
      proposal.status_message = 'Ready to vote!';
      proposal.status_code = 'ready';
      try {
        const res = await signTransaction(wallet, voteTx);
        const broadcastRes = await broadcast(res, chain.rest);
        if (broadcastRes.tx_response.code === 0) {
          proposal.status_message = 'Voted';
          proposal.status_code = 'success';
        } else {
          proposal.status_code = 'error';
          proposal.status_message = broadcastRes.tx_response.raw_log;
        }
      } catch (err) {
        proposal.status_code = 'error';
        proposal.status_message = err;
      }
    },
    async voteProposal(client, chain, proposal, address) {
      let ops = [];
      let msg = {
        typeUrl: '/cosmos.gov.v1beta1.MsgVote',
        value: {
          proposalId: proposal.proposal_id,
          voter: address,
          option: Number(proposal.vote),
        },
      };
      ops.push(msg);
      const fee = {
        amount: coins(chain.min_tx_fee[0], chain.denom),
        gas: '' + chain.gas,
      };

      proposal.status_code = 'ready';
      proposal.status_message = 'Ready to vote';

      try {
        let result = await client.signAndBroadcast(address, ops, fee, '');
        if (result.code == 0) {
          proposal.status_code = 'success';
          proposal.status_message = 'Voted';

        } else {
          proposal.status_code = 'error';
          proposal.status_message = result.raw_log;
        }
      } catch (err) {
        proposal.status_code = 'error';
        proposal.status_message = err;
      }
    },
    async getQueryClient(rpcEndpoint) {
      const tendermint34Client = await Tendermint34Client.connect(rpcEndpoint);
      const queryClient = QueryClient.withExtensions(
        tendermint34Client,
        setupBankExtension,
        setupGovExtension
      );
      return queryClient;
    },
    async startVoting(key, proposals) {
      for (let proposal of proposals) {
        let chain = this.$store.state.chainMap.get(proposal.chain);
        try {
          let accounts = [];
          let wallet;
          let client;
          if (chain.slip44 && chain.slip44 === 60) {
            if (validatePrivateKey(key)) {
              wallet = (await InjectiveDirectEthSecp256k1Wallet.fromKey(
                    Buffer.from(key, "hex"), chain.prefix));
            } else {
              const privateKeyFromMnemonic = PrivateKey.fromMnemonic(key)
                wallet = (await InjectiveDirectEthSecp256k1Wallet.fromKey(
                    Buffer.from(privateKeyFromMnemonic.toPrivateKeyHex().replace("0x", ""), "hex"), chain.prefix))
            }
            const [account] = await wallet.getAccounts();
            accounts.push({ address: account.address });
          } else {
            let isvalid = validatePrivateKey(key)
            if (isvalid) {
              wallet = await DirectSecp256k1Wallet.fromKey(fromHex(key),chain.prefix)
            } else {
              wallet = await Secp256k1HdWallet.fromMnemonic(key, {
                hdPaths: chain.hd_path
                  ? [stringToPath(chain.hd_path)]
                  : undefined,
                prefix: chain.prefix,
              });
            }
            client = await SigningStargateClient.connectWithSigner(
              chain.rpc,
              wallet
            );
            accounts = await wallet.getAccounts();
          }
          const queryClient = await this.getQueryClient(chain.rpc);
          for (let account of accounts) {
            let voted = await this.hasVoted(
              queryClient,
              proposal,
              account.address
            );
            if (!voted) {
              if (chain.slip44 && chain.slip44 === 60) {
                await this.voteProposalEvmos(
                  wallet,
                  chain,
                  proposal,
                  account.address
                );
              } else {
                await this.voteProposal(
                  client,
                  chain,
                  proposal,
                  account.address
                );
              }
            } else {
              proposal.status_code = 'voted';
              proposal.status_message = 'Already voted!';
            }
          }
        } catch (err) {
          proposal.status_code = 'error';
          proposal.status_message = err;

        }
      }
    },
    async vote() {
      this.logs = [];
      this.clearVoteStatus()
      for (let ac of this.accounts) {
        let key = ac.key;
        let proposals = ac.proposals;
        this.startVoting(key, proposals)
      }
    },
    clearVoteStatus() {
      for (let account of this.accounts) {
        for (let proposal of account.proposals) {
          proposal.status_code = '';
          proposal.status_message = '';
        }
      }
    }
  },
}
</script>