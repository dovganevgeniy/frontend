import Vue from 'vue/dist/vue'
import { mapState, mapGetters, mapMutations } from 'vuex';
import store from '../../app.store'

/*
|------------------------------------------------------------------------------
| Заказ после подтверждения заказа
|------------------------------------------------------------------------------
*/

/*
|------------------------------------------------------------------------------
| Регистрация состояния компонента
|------------------------------------------------------------------------------
*/
store.registerModule('CartOrder', {
	namespaced: true,
	
	state() {
		return {}
	},

	getters: {},

	mutations: {},
})

/*
|------------------------------------------------------------------------------
| Объявление объекта опций компонента
|------------------------------------------------------------------------------
*/
const CartOrder = {
	template: require('./cart-order.tpl'),

	props: [
		'orderid',
		'index',
		'orderItems',
	],

	computed: {
		...mapGetters('Cart', ['orders', 'orderShops', 'orderNums'])
	},

	methods: {
		getOrderNum(orderid) {
			return this.orderNums[orderid]
		},

		getOrderSum(orderid) {
			let orderItems = this.orders[orderid]

			if (!orderItems) {
				return 0
			}

			return orderItems.reduce((sum, item) => 
				sum + (+item.total_price
					.replace(/\..?$/, '')
					.replace(/\D/g, '')
				), 0)
		},

		getShopDetails(orderid) {
			let orderItems = this.orders[orderid]
			let shopid = orderItems[0].shopid

			return this.orderShops[shopid]
		}
	}
}

Vue.component('CartOrder', CartOrder);

export default CartOrder;
