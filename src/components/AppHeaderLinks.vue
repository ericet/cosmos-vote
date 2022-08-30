<script>
export default {
	props: ['showModal', 'isOpen'],
};
</script>

<template>
	<!-- Header links -->
	<div
		:class="isOpen ? 'block' : 'hidden'"
		class="m-0 sm:ml-4 mt-5 sm:mt-3 sm:flex p-5 sm:p-0 justify-center items-center shadow-lg sm:shadow-none"
	>
		<!-- <router-link
			to="/"
			class="font-general-medium block text-left text-lg font-medium text-primary-dark dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300  sm:mx-4 mb-2 sm:py-2 "
			aria-label="Home"
			>Home</router-link
		> -->
	</div>
</template>

<style lang="scss" scoped></style>
