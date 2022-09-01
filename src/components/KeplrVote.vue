<template>
  <div class="flex flex-col justify-center items-center">
    <button
      type="button"
      @click="handleVote"
      class="mt-4 mb-8 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
    >
      Vote
    </button>
  </div>
</template>
<script>
    import {
  SigningStargateClient,
} from '@cosmjs/stargate';
export default {
  props: ['proposals', 'selected'],
  methods: {
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
      for (let proposal of this.proposals) {
        ops.push({
          typeUrl: '/cosmos.gov.v1beta1.MsgVote',
          value:  {
          proposalId: proposal.proposal_id,
          voter: accounts[0].address,
          option: Number(proposal.vote),
        },
        });
      }
      let result = await client.signAndBroadcast(
        accounts[0].address,
        ops,
        fee,
        ''
      );
      console.log(result)
    },
  },
};
</script>
