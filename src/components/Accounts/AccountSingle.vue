<template>
    <div class="px-1 py-1 border">
        <p class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light font-semibold mb-2">
            Wallet {{number}}
        </p>
        
        <p class="font-general-semibold text-sm text-ternary-dark dark:text-ternary-light font-semibold mb-2"
            v-for="(proposal, index) in proposals" :key="index">
            {{  proposal.proposal_id  }} {{  proposal.status_code  }}
        </p>

    </div>
</template>
<script>
export default {
    props: ['proposals','number']
}
</script>