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
import { stringToPath } from '@cosmjs/crypto';
import { Wallet } from '@ethersproject/wallet';
import { ethToEvmos } from '@tharsis/address-converter';
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
          proposal.status_message = broadcastRes.tx_response.raw_log;
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
    async startVoting(mnemonic, proposals) {
      for (let proposal of proposals) {
        let chain = this.$store.state.chainMap.get(proposal.chain);
        try {
          let accounts = [];
          let wallet;
          let client;
          if (chain.name === 'Evmos') {
            wallet = Wallet.fromMnemonic(mnemonic);
            let address = await wallet.getAddress();
            accounts.push({ address: ethToEvmos(address) });
          } else {
            wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
              hdPaths: chain.hd_path
                ? [stringToPath(chain.hd_path)]
                : undefined,
              prefix: chain.prefix,
            });
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
              if (chain.name === 'Evmos') {
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
      //   this.logit('success', 'Starting...');
        for (let ac of this.accounts) {
          let mnemonic = ac.mnemonic;
          let proposals = ac.proposals;
          this.startVoting(mnemonic, proposals)
        }
        // this.logit('success', 'Vote Jobs Completed!');
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