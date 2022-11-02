import { createRouter, createWebHashHistory } from 'vue-router'
import VoteView from '../views/VoteView.vue'
import HomeView from '../views/HomeView.vue'
import TransferView from '../views/TransferView.vue'
import ClaimView from '../views/ClaimView.vue'
import StakeView from '../views/StakeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/vote',
    name: 'vote',
    component: VoteView
  },
  {
    path: '/transfer',
    name: 'transfer',
    component: TransferView
  },
  {
    path: '/stake',
    name: 'stake',
    component: StakeView
  },
  {
    path: '/claim',
    name: 'claim',
    component: ClaimView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
