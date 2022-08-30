<template>
    <div class="min-h-full">
        <div class="overflow-x-auto w-full">
            <table class="mx-auto w-full rounded-lg bg-white divide-gray-300 overflow-hidden">
                <thead class="bg-gray-900">
                    <tr class="text-white text-left">
                        <th class="font-semibold text-sm uppercase px-2 py-2 text-center">
                            Chain
                        </th>
                        <th class="font-semibold text-sm uppercase px-2 py-2 text-center">
                            ID
                        </th>
                        <th class="font-semibold text-sm uppercase px-2 py-2 text-center">
                            Title
                        </th>
                        <th class="font-semibold text-sm uppercase px-2 py-2 text-center hidden md:table-cell">
                            Voting End Time
                        </th>
                        <th class="font-semibold text-sm uppercase px-2 py-2 text-center">
                            Vote
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-for="proposal in proposals" :key="proposal.proposal_id" class="hover:bg-blue-100">
                        <td class="px-2 py-2 text-center">
                            <div class="text-center">
                                <div>
                                    <p>{{ proposal.chain_name }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-2 py-2 text-center">
                            <div class="text-center">
                                {{ proposal.proposal_id }}
                            </div>
                        </td>
                        <td class="px-2 py-2 text-center">
                            <div class="text-center">
                                <div>
                                    <p>{{ proposal.content.title }}</p>
                                </div>
                            </div>
                        </td>

                        <td class="px-2 py-2 text-center hidden md:table-cell">
                            {{ getDate(proposal.voting_end_time) }}
                        </td>
                        <td class="text-center">
                            <select :value="proposal.vote" class="text-center "
                                @change.stop="change($event.target.value, proposal)">
                                <option value="1">Yes</option>
                                <option value="3">No</option>
                                <option value="4">No With Veto</option>
                                <option value="2">Abstain</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

</template>
<script>
export default {
    props: ['proposals'],
    data() {
        return {
            selected: "1"
        }
    },
    methods: {
        change(value, proposal) {
            proposal.vote = value;
        },
        getDate(date) {
            return new Date(date).toLocaleDateString();
        }
    },
}
</script>