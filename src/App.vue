<template>
  <div :class="appTheme" class="pt-0.5">
	<div class="h-screen flex">
    <AppMenu />
    <div class="flex-1 flex overflow-hidden">
      <div class="flex-1 overflow-y-scroll">
        <router-view :theme="appTheme" />
      </div>
    </div>
  </div>
    
  </div>
</template>

<script>
import AppMenu from '@/components/AppMenu';
import feather from 'feather-icons';
export default {
  components: {
		AppMenu,
	},
  data: () => {
		return {
			appTheme: localStorage.getItem('theme'),
		};
	},
	mounted() {
		feather.replace();
	},
	updated() {
		feather.replace();
	},
}
</script>