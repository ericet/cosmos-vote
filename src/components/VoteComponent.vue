<template>
  <div
    class="flex flex-col justify-center items-center"
    v-if="accounts.length > 0"
  >
    <button
      type="button"
      @click="vote"
      class="mt-4 mb-8 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
    >
      Vote
    </button>
  </div>
</template>
<script>
import {
  QueryClient,
  setupGovExtension,
  setupBankExtension
} from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import { getSigner } from '@/libs/helpers';
import EthermintSigningClient from '@/libs/client/SigningClient';

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
    async voteProposal(client, address, proposal) {
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

      proposal.status_code = 'ready';
      proposal.status_message = 'Ready to vote';

      try {
        let result = await client.signAndBroadcast(address, ops, '', '');
        if (result.code == 0) {
          proposal.status_code = 'success';
          proposal.status_message = 'Voted';
        } else {
          proposal.status_code = 'error';
          proposal.status_message = result.rawLog;
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
          let wallet = await getSigner(chain, key);
          let client = new EthermintSigningClient(chain, wallet);
          const [account] = await wallet.getAccounts();
          accounts.push({ address: account.address });
          const queryClient = await this.getQueryClient(chain.rpc);
          for (let account of accounts) {
            let voted = await this.hasVoted(
              queryClient,
              proposal,
              account.address
            );
            if (!voted) {
              await this.voteProposal(client, account.address, proposal);
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
      this.clearVoteStatus();
      for (let ac of this.accounts) {
        let key = ac.key;
        let proposals = ac.proposals;
        this.startVoting(key, proposals);
      }
    },
    clearVoteStatus() {
      for (let account of this.accounts) {
        for (let proposal of account.proposals) {
          proposal.status_code = '';
          proposal.status_message = '';
        }
      }
    },
  },
};
</script>
@/libs/client/SigningClient