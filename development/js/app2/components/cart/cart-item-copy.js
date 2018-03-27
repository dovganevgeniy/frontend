import Vue from 'vue/dist/vue'
import { mapState, mapGetters, mapMutations } from 'vuex';
import store from '../../app.store'
import axios from 'axios'
import qs from 'qs'

/*
|------------------------------------------------------------------------------
| Копия продукта с таким же или другим размером (+ 1 изделие)
|------------------------------------------------------------------------------
*/

/*
|------------------------------------------------------------------------------
| Регистрация состояния компонента
|------------------------------------------------------------------------------
*/
store.registerModule('CartItemCopy', {
	namespaced: true,
	
	state() {
		return {
			prices: {
				price: 0,
				discount_price: 0,
				total_discount_price: 0,
			},
			offers: [],
			type: 'SIZE',
			selected: 0,
		}
	},

	getters: {
		offer: state => state.offers[state.selected],
	},

	mutations: {
		setPrices(state, payload) {
			state.prices = payload
		},

		setOffers(state, payload) {
			state.offers = payload
		},

		setType(state, payload) {
			state.type = payload
		},

		setSelectedOffer(state, payload) {
			state.selected = payload
		}
	},
})

/*
|------------------------------------------------------------------------------
| Объявление объекта опций компонента
|------------------------------------------------------------------------------
*/
const CartItemCopy = {
	template: require('./cart-item-copy.tpl'),

	props: [],

	computed: {
		...mapGetters('Cart', ['items', 'selectedItem', 'city']),
		...mapGetters('CartItemCopy', ['offer']),
		...mapState('Cart', ['conf']),
		...mapState('CartItemCopy', ['prices', 'offers', 'type', 'selected']),

		item: state => state.selectedItem,

		title(state) {
			if (typeof state.offer === 'undefined') {
				return state.item.title
			}

			return state.item.title
				.replace(/\<size\>[^<]+\<\/size\>/, '<size>'+ state.offer.SIZE +'</size>')
		}
	},

	methods: {
		...mapMutations('App', [ 
			'setPreloader',
		]),
		...mapMutations('Cart', [
			'setData',
			'setShop',
			'setShopid',
			'setItemShop',
		]),
		...mapMutations('CartItemCopy', [
			'setPrices',
			'setOffers',
			'setType',
			'setSelectedOffer',
		]),

		opened() {
			const vm = this
			let url = 'ajax/offers.php'
			let data = {
				onlyAvailableSku: 'Y',
				city: vm.city,
				productID: vm.selectedItem.bxid
			}

			vm.$store.commit('App/setPreloader', true)

			axios
				.post(url, qs.stringify(data))
				.then(response => {
					let result = response.data[vm.selectedItem.bxid]

					vm.$store.commit('App/setPreloader', false)
					vm.$store.commit('CartItemCopy/setOffers', result.OFFERS)
					vm.$store.commit('CartItemCopy/setType', result.SELECT)

					vm.selectOffer(0)
				})
				.catch(error => {
					console.log(error)
				})
		},

		selectOffer(index) {
			const vm = this
			
			vm.$store.commit('CartItemCopy/setSelectedOffer', index)
			vm.$store.commit('CartItemCopy/setPrices', {
				price: vm.offer.PRICE,
				discount_price: vm.offer.DISCOUNT_PRICE,
				price_bc: vm.offer.CARD_PRICE,
			})
		},

		addToCart() {
			const vm = this
			let data = {
				bxid: vm.offer.PRODUCT_ID,
				itemid: vm.offer.ID,
				size: vm.offer.SIZE,
				itemsize: vm.offer.SIZE,
				price: vm.offer.PRICE,
				discount_price: vm.offer.DISCOUNT_PRICE,
				price_bc: vm.offer.CARD_PRICE,
				sapcode: vm.offer.SAP,
				article: vm.offer.SUPPLIER_CODE,
				weight: vm.offer.WEIGHT_WITH_INSERTS,
				city: vm.city,
				url: vm.item.href,
				img: vm.item.img,
				title: vm.title,
			}

			vm.$store.commit('App/setPreloader', true)
			vm.$store.commit('Cart/setShop', {
				itemid: vm.offer.ID,
				shops: vm.offer.SHOPS,
			})

			axios({
				url: vm.conf.cartApiUrl + 'xadd',
				method: 'post',
				data: JSON.stringify(data),
				withCredentials: true,
				responseType: 'json'
			})
			.then(response => {
				vm.$store.commit('App/setPreloader', false)
	
				if (response.data.response.error) {
					console.log(response.data.response.error)
					return
				}

				vm.$store.commit('Cart/setData', response.data)

				if (+vm.item.shopid) {
					vm.$store.commit('Cart/setShopid', vm.item.shopid)
				}

				vm.$modal.hide('item-copy')
			})
			.catch(error => {
				console.log(error)
			})
		}
	}
}

Vue.component('CartItemCopy', CartItemCopy);

export default CartItemCopy;
