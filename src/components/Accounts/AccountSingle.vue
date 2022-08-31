<template>
  <div class="px-1 py-1 border">
    <p class="text-lg font-medium text-gray-800 dark:text-gray-100">
      Wallet {{ number }}
    </p>
    <div
      class="font-general-semibold text-sm text-ternary-dark dark:text-ternary-light font-semibold mb-2"
      v-for="(proposal, index) in proposals"
      :key="index"
    >
      <div class="flex items-center">
        <span class="flex mx-4 text-gray-700 dark:text-gray-300">
          {{ proposal.proposal_id }}
          <span v-if="proposal.status_code == 'ready'">
            <div class="group relative">
              <i
                data-feather="clock"
                class="ml-4 stroke-orange-300 text-liText-ternary-dark hover:text-gray-400 dark:text-liText-ternary-light dark:hover:text-liBorder-primary-light w-5"
              >
              </i>
              <span
                class="absolute hidden group-hover:flex -top-2 -right-3 translate-x-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm before:content-[''] before:absolute before:top-1/2 before:right-[100%] before:-translate-y-1/2 before:border-8 before:border-y-transparent before:border-l-transparent before:border-r-gray-700"
              >
                {{ proposal.status_message }}</span
              >
            </div>
          </span>
          <span v-else-if="proposal.status_code == 'error'">
            <div class="group relative">
              <i
                alt="test"
                data-feather="x-circle"
                class="ml-4 stroke-red-300 text-liText-ternary-dark hover:text-gray-400 dark:text-liText-ternary-light dark:hover:text-liBorder-primary-light w-5"
              ></i>
              <span
                class="absolute hidden group-hover:flex -top-2 -right-3 translate-x-full w-auto px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm"
              >
                {{ proposal.status_message }}</span
              >
            </div>
          </span>
          <span v-else-if="proposal.status_code == 'success'">
            <div class="group relative">
              <i
                data-feather="check-circle"
                class="ml-4 stroke-green-300 text-liText-ternary-dark hover:text-gray-400 dark:text-liText-ternary-light dark:hover:text-liBorder-primary-light w-5"
              ></i>
              <span
                class="absolute hidden group-hover:flex -top-2 -right-3 translate-x-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm before:content-[''] before:absolute before:top-1/2 before:right-[100%] before:-translate-y-1/2 before:border-8 before:border-y-transparent before:border-l-transparent before:border-r-gray-700"
              >
                {{ proposal.status_message }}</span
              >
            </div>
          </span>
          <span v-else-if="proposal.status_code == 'voted'">
            <div class="group relative">
              <i
                data-feather="alert-circle"
                class="ml-4 stroke-red-300 text-liText-ternary-dark hover:text-gray-400 dark:text-liText-ternary-light dark:hover:text-liBorder-primary-light w-5"
              ></i>
              <span
                class="absolute hidden group-hover:flex -top-2 -right-3 translate-x-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm before:content-[''] before:absolute before:top-1/2 before:right-[100%] before:-translate-y-1/2 before:border-8 before:border-y-transparent before:border-l-transparent before:border-r-gray-700"
              >
                {{ proposal.status_message }}</span
              >
            </div>
          </span>
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
