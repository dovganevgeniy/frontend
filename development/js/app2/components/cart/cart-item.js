import Vue from 'vue/dist/vue'
import { mapState, mapGetters, mapMutations } from 'vuex';
import store from '../../app.store'

/*
|------------------------------------------------------------------------------
| Компонент продукта
|------------------------------------------------------------------------------
*/

/*
|------------------------------------------------------------------------------
| Регистрация состояния компонента
|------------------------------------------------------------------------------
*/
store.registerModule('CartItem', {
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
const CartItem = {
	template: require('./cart-item.tpl'),

	props: [
		'index',
		'bxid',
		'uuid',
		'itemid',
		'sapcode',
		'title',
		'href',
		'img',
		'price',
		'discountPrice',
		'totalDiscountPrice',
		'priceBc',
		'shopid',
		'shopLoading',
		'sanitizedSize',
		'sanitizedPrice',
	],

	computed: {
		...mapState('Cart', ['shops', 'selectedIndex', 'removeIndex']),
		...mapGetters('Cart', ['city', 'bonusCardCheck']),
	},

	methods: {
		...mapMutations('Cart', [
			'removeItem',
			'setItemIndex'
		]),

		// Задает индекс выбранного элемента и показывает модалку
		showModal(name, index) {
			this.$modal.show(name)
			this.$store.commit('Cart/setItemIndex', index)
		},

		getShopsCount(itemid) {
			return this.shops[itemid].length
		},

		getShopAddr(itemid, shopid) {
			let result = this.shops[itemid].filter(shop => 
				shop.xml_id == shopid
			)

			return result[0].address
		},
	}
}

Vue.component('CartItem', CartItem);

export default CartItem;
