<template>
  <div class="mx-auto mx-5">
    <div class="mx-auto max-w-2xl">
      <header>
        <h1
          class="text-6xl leading-normal mb-2 text-black font-serif text-gray-700 dark:text-gray-100 transition-colors"
        >
          Vote
        </h1>
      </header>
      <p
        class="ml-4 mb-5 font-serif text-gray-700 dark:text-gray-100 transition-colors"
      >
        Vote multiple proposals in one shot
      </p>
      <h1
        class="text-2xl leading-normal mb-2 text-black font-serif text-gray-700 dark:text-gray-100 transition-colors"
      >
        Chain
      </h1>
      <div class="mb-3 relative text-gray-700">
        <select
          v-model="selected"
          @change="getProposals"
          class="w-full h-10 pl-3 pr-8 text-base placeholder-gray-600 border rounded-lg focus:shadow-outline disabled:cursor-not-allowed"
        >
          <option value="none" hidden>Select a Chain</option>
          <option
            v-for="option in options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.text }}
          </option>
        </select>
        <label
          for="default-toggle"
          class="inline-flex relative items-center mb-4 cursor-pointer mt-2 ml-2"
        >
          <input
            type="checkbox"
            v-model="useKeplr"
            true-value="true"
            false-value="false"
            id="default-toggle"
            class="sr-only peer"
            @change="toggle"
          />
          <div
            class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
          ></div>
          <span
            class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
            >Use Keplr</span
          >
        </label>
      </div>
    </div>
    <div v-if="response.type" class="mx-auto max-w-2xl">
      <div
        id="alert-3"
        class="flex p-4 mb-4 bg-green-100 rounded-lg dark:bg-green-200 mx-auto max-w-2xl"
        role="alert"
        v-if="response.type == 'success'"
      >
        <svg
          aria-hidden="true"
          class="flex-shrink-0 w-5 h-5 text-green-700 dark:text-green-800"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <span class="sr-only">Info</span>
        <div
          class="ml-3 text-sm font-medium text-green-700 dark:text-green-800"
        >
          Voted successfully! TX Hash:
          <a
            :href="response.explorer + '/txs/' + response.message"
            target="_blank"
            class="font-semibold underline hover:text-green-800 dark:hover:text-green-900"
            >{{ response.message }}</a
          >.
        </div>
        <button
          type="button"
          class="ml-auto -mx-1.5 -my-1.5 bg-green-100 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex h-8 w-8 dark:bg-green-200 dark:text-green-600 dark:hover:bg-green-300"
          data-dismiss-target="#alert-3"
          aria-label="Close"
          @click="close"
        >
          <span class="sr-only">Close</span>
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
      <div
        id="alert-2"
        class="flex p-4 mb-4 bg-red-100 rounded-lg dark:bg-red-200"
        role="alert"
        v-else-if="response.type == 'error'"
      >
        <svg
          aria-hidden="true"
          class="flex-shrink-0 w-5 h-5 text-red-700 dark:text-red-800"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <span class="sr-only">Info</span>
        <div class="ml-3 text-sm font-medium text-red-700 dark:text-red-800">
          Error:
          <p class="font-bold">{{ response.message }}</p>
        </div>
        <button
          type="button"
          class="ml-auto -mx-1.5 -my-1.5 bg-red-100 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex h-8 w-8 dark:bg-red-200 dark:text-red-600 dark:hover:bg-red-300"
          data-dismiss-target="#alert-2"
          aria-label="Close"
          @click="close"
        >
          <span class="sr-only">Close</span>
          <svg
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </div>
    <ProposalsList
      :proposals="proposals"
      class="mx-auto max-w-2xl"
      v-if="proposals.length > 0"
    />
    <div
      v-if="proposals.length == 0 && ready"
      class="mx-auto max-w-2xl mb-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline"
        >No proposals found or all proposals have been voted!</span
      >
      <span class="absolute top-0 bottom-0 right-0 px-4 py-3" @click="close">
        <svg
          class="fill-current h-6 w-6 text-red-500"
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Close</title>
          <path
            d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
          />
        </svg>
      </span>
    </div>
    <KeysInput
      :proposals="proposals"
      v-if="
        proposals.length > 0 && (useKeplr === 'false' || useKeplr === false)
      "
    />
    <KeplrVote
      :proposals="proposals"
      :selected="selected"
      :account="account"
      @handleResponse="handleResponse"
      v-if="proposals.length > 0 && (useKeplr == true || useKeplr === 'true')"
    />
    <AppFooter />
  </div>
</template>
<script>
import axios from 'axios';
import ProposalsList from '@/components/ProposalsList.vue';
import { chainsList } from '../config/chains';
import KeysInput from '../components/KeysInput.vue';
import AppFooter from '@/components/AppFooter.vue';
import KeplrVote from '../components/KeplrVote.vue';
import {
  QueryClient,
  setupGovExtension,
  setupBankExtension,
} from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import { extractAccountNumberAndSequence } from '@/libs/utils';
export default {
  created() {
    for (let chain of chainsList) {
      this.$store.state.chainMap.set(chain.value, chain);
    }
    this.populateOptions();
  },
  mounted() {
    window.addEventListener('keplr_keystorechange', () => {
      this.proposals = [];
      this.selected = 'none';
      this.ready = false;
      this.response = {};
      this.populateOptions();
    });
  },
  data() {
    return {
      selected: 'none',
      proposals: [],
      chainsList: chainsList,
      ready: false,
      useKeplr: false,
      options: [],
      account: null,
      response: {},
    };
  },

  methods: {
    handleResponse(res) {
      this.response = res;
    },
    close() {
      this.response = {};
    },
    toggle() {
      this.response = {};
      this.proposals = [];
      this.selected = 'none';
      this.ready = false;
      this.populateOptions();
    },
    populateOptions() {
      this.options = [];
      if (this.useKeplr === 'false' || this.useKeplr === false) {
        this.options.push({ text: 'All Chains', value: 'all' });
      }
      for (let chain of chainsList) {
        this.options.push({ text: chain.name, value: chain.value });
      }
      this.options.sort((a, b) => {
        if (a.value === 'all' || b.value === 'all') {
          return 1;
        }
        if (a.value < b.value) {
          return -1;
        }
        if (a.value > b.value) {
          return 1;
        }
        return 0;
      });
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
      this.response = {};
      if (this.selected === 'none') {
        this.proposals = [];
      } else if (this.selected === 'all') {
        for (let chain of chainsList) {
          axios
            .get(
              `${chain.rest}/cosmos/gov/v1beta1/proposals?pagination.limit=3000`
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

        const queryClient = await this.getQueryClient(chain.rpc);
        axios
          .get(
            `${chain.rest}/cosmos/gov/v1beta1/proposals?pagination.limit=3000`
          )
          .then(async (res) => {
            let proposals = res.data.proposals.filter((proposal) => {
              return proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD';
            });
            if (this.useKeplr === true || this.useKeplr === 'true') {
              if (!window.getOfflineSigner || !window.keplr) {
                alert('Please install keplr extension');
                return;
              }
              await window.keplr.enable(chain.id);
              const offlineSigner = window.getOfflineSigner(chain.id);
              const accounts = await offlineSigner.getAccounts();
              this.account = accounts[0];
              if (proposals.length > 0) {
                let chain = this.$store.state.chainMap.get(this.selected);
                for (let proposal of proposals) {
                  let voted = await this.hasVoted(
                    queryClient,
                    proposal,
                    this.account.address
                  );
                  if (!voted) {
                    proposal.chain = chain.value;
                    proposal.chain_name = chain.name;
                    proposal.vote = '1';
                    this.proposals.push(proposal);
                  }
                }
                axios
                  .get(
                    `${chain.rest}/cosmos/auth/v1beta1/accounts/${this.account.address}`
                  )
                  .then((res) => {
                    if (res.status === 200) {
                      let account = extractAccountNumberAndSequence(res.data);
                      this.account.accountNumber = account.accountNumber;
                      this.account.sequence = account.sequence;
                    }
                  });
              }
            } else {
              if (proposals.length > 0) {
                for (let proposal of proposals) {
                  proposal.chain = chain.value;
                  proposal.chain_name = chain.name;
                  proposal.vote = '1';
                }
                this.proposals = this.proposals.concat(proposals);
              }
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
  components: { ProposalsList, KeysInput, AppFooter, KeplrVote },
};
</script>
