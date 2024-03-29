<template>
  <div class="flex flex-col justify-center items-center">
    <button type="button" @click="handleVote"
      class="mt-4 mb-8 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
      Vote
    </button>
  </div>
</template>
<script>
import {
  QueryClient,
  setupGovExtension,
  setupBankExtension,
} from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import { sign, broadcastTx } from '@/libs/utils';

export default {
  data() {
    return {
      response: {},
    };
  },
  props: ['proposals', 'selected', 'account'],
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
    async getQueryClient(rpcEndpoint) {
      const tendermint34Client = await Tendermint34Client.connect(rpcEndpoint);
      const queryClient = QueryClient.withExtensions(
        tendermint34Client,
        setupBankExtension,
        setupGovExtension
      );
      return queryClient;
    },
    async handleVote() {
      this.response = {};
      let chain = this.$store.state.chainMap.get(this.selected);
      let gas = chain.gas * this.proposals.length;
      const fee = {
        amount: [
          {
            denom: chain.denom,
            amount: chain.min_tx_fee[0],
          },
        ],
        gas: '' + gas,
      };
      let ops = [];
      const queryClient = await this.getQueryClient(chain.rpc);
      for (let proposal of this.proposals) {
        let voted = await this.hasVoted(
          queryClient,
          proposal,
          this.account.address
        );
        if (!voted) {
          ops.push({
            typeUrl: '/cosmos.gov.v1beta1.MsgVote',
            value: {
              proposalId: proposal.proposal_id,
              voter: this.account.address,
              option: Number(proposal.vote),
            },
          });
        }
      }
      const signerData = {
        accountNumber: this.account.accountNumber,
        sequence: this.account.sequence,
        chainId: chain.chainId,
      };
      if (ops.length > 0) {
        sign(chain.chainId, this.account.address, ops, fee, '', signerData).then(
          (bodyBytes) => {
            broadcastTx(bodyBytes, chain).then((res) => {
              if (res.data.tx_response.code === 0) {
                console.log(res.data);
                this.response.type = 'success';
                this.response.message = res.data.tx_response.txhash;
                this.response.explorer = chain.explorer;
              } else {
                console.log(res.data.tx_response.raw_log);
                this.response.type = 'error';
                this.response.message = res.data.tx_response.raw_log;
              }
              this.$emit('handleResponse', this.response);
            });
          }
        );
      } else {
        this.response.type = 'voted';
        this.response.message = 'All proposals have been voted!'
        this.$emit('handleResponse', this.response);

      }
    },
  },
};
</script>
