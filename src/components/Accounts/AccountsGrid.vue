<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 mt-6 sm:gap-10">
    <AccountSingleVue
      v-for="(account, index) in accounts"
      :key="index"
      :proposals="account.proposals"
      :number="index + 1"
    />
  </div>
</template>
<script>
import AccountSingleVue from './AccountSingle.vue';
export default {
  components: {
    AccountSingleVue,
  },
  props: ['accounts'],
};
</script>
