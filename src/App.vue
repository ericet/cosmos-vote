<template>
  <div :class="appTheme" class="pt-0.5">
    <AppHeader />

    <transition name="fade" mode="out-in">
			<router-view :theme="appTheme" />
		</transition>
    
  </div>
</template>

<script>
import AppHeader from './components/AppHeader';
import feather from 'feather-icons';

export default {
  components: {
		AppHeader,
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