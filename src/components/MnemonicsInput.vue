<template>
  <div class="mx-auto max-w-2xl mt-4">
    <textarea rows="10" @input="getMnemonics($event)"
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder="One mnemonic per line"></textarea>
    <AccountsGrid :accounts="accounts" />
    <VoteComponent :accounts="accounts" />
  </div>
</template>
<script>
import { validateMnemonic } from 'bip39';
import AccountsGrid from './Accounts/AccountsGrid.vue';
import VoteComponent from './VoteComponent.vue';

export default {
  props: ['proposals'],
  components: { AccountsGrid, VoteComponent },
  data() {
    return {
      input: '',
      mnemonics: [],
      logs: [],
      accounts: [],
    };
  },
  methods: {
    getVoteOption(value) {
      let options = ['Yes', 'Abstain', 'No', 'No with Veto'];
      return options[value - 1];
    },

    getMnemonics(event) {
      this.mnemonics = [];
      let inputs = event.target.value.split('\n');
      for (let input of inputs) {
        if (
          input.length > 0 &&
          input.split(' ').length > 11 &&
          validateMnemonic(input.trim())
        ) {
          this.mnemonics.push(input.trim());
        }
      }
      this.getWallet();
    },
    getWallet() {
      this.accounts = [];
      for (let mnemonic of this.mnemonics) {
        let proposals = [];
        for (let proposal of this.proposals) {
          proposals.push({
            proposal_id: proposal.proposal_id,
            vote: proposal.vote,
            chain: proposal.chain,
            status_code: '',
            status_message: '',
          });
        }
        this.accounts.push({
          mnemonic: mnemonic,
          proposals: proposals,
        });
      }
    },
  },
};
</script>
