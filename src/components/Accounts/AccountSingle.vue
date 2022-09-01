<template>
  <div class="px-2 py-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-100 cursor-pointer mb-10 sm:mb-0 mr-2 bg-secondary-light dark:bg-ternary-dark">
    <p class="text-lg font-medium text-gray-800 dark:text-gray-100">
      Wallet {{ number }}
    </p>
    <div class="font-general-semibold text-sm text-ternary-dark dark:text-ternary-light font-semibold mb-4"
      v-for="(proposal, index) in proposals" :key="index">
      <div class="flex justify-between items-center mx-2">
       {{proposal.chain}}:【{{ proposal.proposal_id }}】
        <span v-if="proposal.status_code == 'ready'">
          <div class="group relative ">
            <i data-feather="clock"
              class="stroke-orange-300 text-liText-ternary-dark hover:text-gray-400 dark:text-liText-ternary-light dark:hover:text-liBorder-primary-light w-5">
            </i>
            <span
              class="absolute hidden group-hover:flex -top-1 -right-3 translate-x-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm">
              {{ proposal.status_message }}</span>
          </div>
        </span>
        <span v-else-if="proposal.status_code == 'error'">
          <div class="group relative">
            <i alt="test" data-feather="x-circle"
              class="stroke-red-600 text-liText-ternary-dark hover:text-gray-400 dark:text-liText-ternary-light dark:hover:text-liBorder-primary-light w-5"></i>
            <span
              class="absolute hidden group-hover:flex -top-1 -right-3 translate-x-full w-auto px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm">
              {{ proposal.status_message }}</span>
          </div>
        </span>
        <span v-else-if="proposal.status_code == 'success'">
          <div class="group relative">
            <i data-feather="check-circle"
              class="stroke-green-300 text-liText-ternary-dark hover:text-gray-400 dark:text-liText-ternary-light dark:hover:text-liBorder-primary-light w-5"></i>
            <span
              class="absolute hidden group-hover:flex -top-1 -right-3 translate-x-full w-auto px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm ">
              {{ proposal.status_message }}</span>
          </div>
        </span>
        <span v-else-if="proposal.status_code == 'voted'" class="flex justify-right">
          <div class="group relative flex justify-right">
            <i data-feather="alert-circle"
              class="stroke-red-300 text-liText-ternary-dark hover:text-gray-400 dark:text-liText-ternary-light dark:hover:text-liBorder-primary-light w-5"></i>
            <span
              class="absolute hidden group-hover:flex -top-1 -right-3 translate-x-full w-auto px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm">
              {{ proposal.status_message }}</span>
          </div>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import feather from 'feather-icons';
export default {
  props: ['proposals', 'number'],
  mounted() {
    feather.replace();
  },
  updated() {
    feather.replace();
  },
};
</script>
