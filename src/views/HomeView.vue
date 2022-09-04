<template>
  <div class="mx-auto mx-5">
    <div class="mx-auto max-w-2xl">
      <header>
        <h1
          class="text-6xl leading-normal mb-2 text-black font-serif text-gray-700 dark:text-gray-100 transition-colors">
          Vote
        </h1>
      </header>
      <p class="ml-4 mb-5 font-serif text-gray-700 dark:text-gray-100 transition-colors">
        Vote multiple proposals in one shot
      </p>
      <h1 class="text-2xl leading-normal mb-2 text-black font-serif text-gray-700 dark:text-gray-100 transition-colors">
        Chain
      </h1>
      <div class="mb-3 relative text-gray-700">
        <select v-model="selected" @change="getProposals"
          class="w-full h-10 pl-3 pr-8 text-base placeholder-gray-600 border rounded-lg focus:shadow-outline disabled:cursor-not-allowed">
          <option value="none" hidden>Select a Chain</option>
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.text }}
          </option>
        </select>
        <label for="default-toggle" class="inline-flex relative items-center mb-4 cursor-pointer mt-2 ml-2">
          <input type="checkbox" v-model="useKeplr" true-value="true" false-value="false" id="default-toggle"
            class="sr-only peer" @change="toggle" />
          <div
            class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
          </div>
          <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Use Keplr</span>
        </label>
      </div>
    </div>
    <ProposalsList :proposals="proposals" class="mx-auto max-w-2xl" v-if="proposals.length > 0" />
    <div v-if="proposals.length == 0 && ready"
      class="mx-auto max-w-2xl mb-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert">
      <span class="block sm:inline">No proposals found or all proposals have been voted!</span>
      <span class="absolute top-0 bottom-0 right-0 px-4 py-3" @click="close">
        <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20">
          <title>Close</title>
          <path
            d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
        </svg>
      </span>
    </div>
    <MnemonicsInput :proposals="proposals" v-if="proposals.length > 0 && useKeplr === 'false'" />
    <KeplrVote :proposals="proposals" :selected="selected" v-if="proposals.length > 0 && useKeplr" />
    <AppFooter />
  </div>
</template>
<script>
import axios from 'axios';
import ProposalsList from '@/components/ProposalsList.vue';
import { chainsList } from '../config/chains';
import MnemonicsInput from '../components/MnemonicsInput.vue';
import AppFooter from '@/components/AppFooter.vue';
import KeplrVote from '../components/KeplrVote.vue';
import {
  QueryClient,
  setupGovExtension,
  setupBankExtension,
} from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';

export default {
  created() {
    for (let chain of chainsList) {
      console.log(chain)
      this.$store.state.chainMap.set(chain.value, chain);
    }
    this.populateOptions();
  },
  mounted(){
    window.addEventListener('keplr_keystorechange', () => {
      this.proposals = [];
      this.selected = 'none';
      this.ready = false;
      this.populateOptions();
        });
  },
  data() {
    return {
      selected: 'none',
      proposals: [],
      chainsList: chainsList,
      ready: false,
      useKeplr: true,
      options: [],
    };
  },

  methods: {
    toggle() {
      this.proposals = [];
      this.selected = 'none';
      this.ready = false;
      this.populateOptions();
    },
    populateOptions() {
      this.options = [];
      if (this.useKeplr == 'false') {
        this.options.push({ text: 'All Chains', value: 'all' });
      }
      for (let chain of chainsList) {
        this.options.push({ text: chain.name, value: chain.value });
      }
    },
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
    async getProposals() {
      this.ready = false;
      this.proposals = [];
      if (this.selected === 'none') {
        this.proposals = [];
      } else if (this.selected === 'all') {
        for (let chain of chainsList) {
          axios
            .get(
              `https://rest.cosmos.directory/${chain.value}/cosmos/gov/v1beta1/proposals?pagination.limit=3000`
            )
            .then((res) => {
              let proposals = res.data.proposals.filter((proposal) => {
                return proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD';
              });
              if (proposals.length > 0) {
                for (let proposal of proposals) {
                  proposal.chain = chain.value;
                  proposal.chain_name = chain.name;
                  proposal.vote = '1';
                }
                this.proposals = this.proposals.concat(proposals);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
        this.ready = true;
      } else {
        let chain = this.$store.state.chainMap.get(this.selected);
        await window.keplr.enable(chain.id);
        const offlineSigner = window.getOfflineSigner(chain.id);
        const accounts = await offlineSigner.getAccounts();
        console.log(accounts[0].address);
        const queryClient = await this.getQueryClient(chain.rpc);
        axios
          .get(
            `https://rest.cosmos.directory/${this.selected}/cosmos/gov/v1beta1/proposals?pagination.limit=3000`
          )
          .then(async (res) => {
            let proposals = res.data.proposals.filter((proposal) => {
              return proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD';
            });
            if (proposals.length > 0) {
              let chain = this.$store.state.chainMap.get(this.selected);
              for (let proposal of proposals) {
                let voted = await this.hasVoted(
                  queryClient,
                  proposal,
                  accounts[0].address
                );
                console.log(voted)
                if(!voted){
                  proposal.chain = chain.value;
                  proposal.chain_name = chain.name;
                  proposal.vote = '1';
                  this.proposals.push(proposal)
                }
              }
              // this.proposals = this.proposals.concat(proposals);
            }
            this.ready = true;
          })
          .catch((err) => {
            console.log(err);
            this.ready = true;
          });
      }
    },
  },
  components: { ProposalsList, MnemonicsInput, AppFooter, KeplrVote },
};
</script>
