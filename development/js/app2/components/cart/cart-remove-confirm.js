import Vue from 'vue/dist/vue'
import { mapState, mapGetters, mapMutations } from 'vuex'
import store from '../../app.store'

/*
|------------------------------------------------------------------------------
| Модалка подтверждения на удаление одного товара
|------------------------------------------------------------------------------
*/

/*
|------------------------------------------------------------------------------
| Регистрация состояния компонента
|------------------------------------------------------------------------------
*/
store.registerModule('CartRemoveConfirm', {
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
const CartRemoveConfirm = {
	template: require('./cart-remove-confirm.tpl'),

	props: [],

	computed: {
		...mapGetters('Cart', ['selectedItem']),
	},

	methods: {
		...mapMutations('Cart', [
			'setRemoveIndex'
		]),

		close(remove) {
			if (remove === true) {
				this.$store.commit('Cart/setRemoveIndex')
			}

			this.$modal.hide('remove-confirm')
		}
	}
}

Vue.component('CartRemoveConfirm', CartRemoveConfirm);

export default CartRemoveConfirm;