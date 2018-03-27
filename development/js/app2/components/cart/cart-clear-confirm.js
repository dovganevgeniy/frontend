import Vue from 'vue/dist/vue'
import { mapState, mapGetters, mapMutations } from 'vuex'
import store from '../../app.store'

/*
|------------------------------------------------------------------------------
| Модалка подтверждения на очистку корзины
|------------------------------------------------------------------------------
*/

/*
|------------------------------------------------------------------------------
| Регистрация состояния компонента
|------------------------------------------------------------------------------
*/
store.registerModule('CartClearConfirm', {
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
const CartClearConfirm = {	
	template: require('./cart-clear-confirm.tpl'),

	props: [],

	methods: {
		...mapMutations('Cart', [
			'clearItems'
		]),
		close(remove) {
			if (remove === true) {
				this.clearItems()
			}

			this.$modal.hide('clear-confirm')
		}
	}
}

Vue.component('CartClearConfirm', CartClearConfirm);

export default CartClearConfirm;
