<template>
    <div class="mx-auto w-1/2">
        <h1 class="pb-5 text-2xl text-gray-700 dark:text-gray-100 transition-colors">
            Chain
        </h1>
        <div class="mb-3 relative text-gray-700">
            <select v-model="selected" @change="handleSelection"
                class="w-full h-10 pl-3 pr-8 text-base placeholder-gray-600 border rounded-lg focus:shadow-outline disabled:cursor-not-allowed">
                <option value="none">Select a Chain</option>
                <option value="all">All Chains</option>
                <option value="evmos">Evmos</option>
            </select>

        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            selected: 'none'
        }
    },
    methods: {
        handleSelection(){
            console.log(this.selected)
            this.$emit("selection",this.selected);
        }
    },
}
</script>