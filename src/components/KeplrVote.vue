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
  SigningStargateClient,
} from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';

export default {
  props: ['proposals', 'selected'],
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
      let chain = this.$store.state.chainMap.get(this.selected);
      await window.keplr.enable(chain.id);
      const offlineSigner = window.getOfflineSigner(chain.id);
      const accounts = await offlineSigner.getAccounts();
      const client = await SigningStargateClient.connectWithSigner(
        chain.rpc,
        offlineSigner
      );
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
          accounts[0].address
        );
        if (!voted) {
          ops.push({
            typeUrl: '/cosmos.gov.v1beta1.MsgVote',
            value: {
              proposalId: proposal.proposal_id,
              voter: accounts[0].address,
              option: Number(proposal.vote),
            },
          });
        }
      }
      if (ops.length > 0) {
        try{
        let result = await client.signAndBroadcast(
          accounts[0].address,
          ops,
          fee,
          ''
        );
        console.log(result);
        }catch(err){
          console.log(err)
        }
      }else{
        console.log('all voted')
      }
    },
  },
};
</script>
