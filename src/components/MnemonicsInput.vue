<template>
  <div class="mx-auto max-w-2xl mt-4">
    <textarea
      rows="10"
      @input="getMnemonics($event)"
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder="One mnemonic per line"
    ></textarea>
  </div>
  <div class="flex flex-col justify-center items-center">
    <button
      type="button"
      @click="vote"
      class="mt-4 m-auto text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
    >
      Vote
    </button>
  </div>

  <div
    class="mx-auto max-w-2xl h-72 mt-4 block p-2.5 text-sm text-green-500 bg-black rounded-lg overflow-auto"
  >
    <p
      v-for="(log, index) in logs"
      :key="index"
      class="font-normal"
      :class="{
        'text-rose-500': log.type === 'error',
        'text-green-500': log.type === 'success',
        'text-amber-400': log.type === 'ready',
      }"
    >
      {{ log.date_time }}: {{ log.message }}
    </p>
  </div>
</template>
<script>
import { validateMnemonic } from 'bip39';
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
  props: ['proposals'],
  data() {
    return {
      input: '',
      mnemonics: [],
      logs: [],
    };
  },
  methods: {
    getVoteOption(value) {
      let options = ['Yes', 'Abstain', 'No', 'No with Veto'];
      return options[value - 1];
    },
    logit(type, output) {
      let dt = new Date().toLocaleTimeString();
      this.logs.push({
        type: type,
        date_time: dt,
        message: output,
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
      this.logit(
        'ready',
        `【${address}】 is ready to vote '${this.getVoteOption(
          Number(proposal.vote)
        )}' on proposal #${proposal.proposal_id}`
      );
      try {
        const res = await signTransaction(wallet, voteTx);
        const broadcastRes = await broadcast(res, chain.rest);

        if (broadcastRes.tx_response.code === 0) {
          this.logit(
            'success',
            `【${address}】 voted '${this.getVoteOption(
              Number(proposal.vote)
            )}'' proposal #${proposal.proposal_id}`
          );
        } else {
          this.logit(
            'error',
            `【${address}】 failed to vote '${this.getVoteOption(
              Number(proposal.vote)
            )}' on proposal #${proposal.proposal_id}: ${
              broadcastRes.tx_response.raw_log
            }`
          );
        }
      } catch (err) {
        this.logit('error', `【${address}】 ${err}`);
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
      this.logit(
        'ready',
        `【${address}】 is ready to vote '${this.getVoteOption(
          Number(proposal.vote)
        )}' on proposal #${proposal.proposal_id}`
      );
      try {
        let result = await client.signAndBroadcast(address, ops, fee, '');
        if (result.code == 0) {
          this.logit(
            'success',
            `【${address}】 voted '${this.getVoteOption(
              Number(proposal.vote)
            )}'' proposal #${proposal.proposal_id}`
          );
        } else {
          this.logit(
            'error',
            `【${address}】 failed to vote '${this.getVoteOption(
              Number(proposal.vote)
            )}' on proposal #${proposal.proposal_id}`
          );
        }
      } catch (err) {
        this.logit('error', `【${address}】 ${err}`);
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
    async vote() {
      this.logs = [];
      this.logit('success', 'Starting...');
      if (this.mnemonics.length > 0) {
        for (let proposal of this.proposals) {
          let chain = this.$store.state.chainMap.get(proposal.chain);
          for (let mnemonic of this.mnemonics) {
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
                  this.logit(
                    'error',
                    `【${account.address}】 has already voted proposal #${proposal.proposal_id}`
                  );
                }
              }
            } catch (err) {
              this.logit('error', err);
            }
          }
        }
        this.logit('success', 'Vote Jobs Completed!');
      } else {
        this.logit('error', 'No valid mnemonic found!');
      }
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
    },
  },
};
</script>
