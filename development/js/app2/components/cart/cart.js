import Vue from 'vue/dist/vue'
import { mapState, mapGetters, mapMutations } from 'vuex'
import axios from 'axios'
import qs from 'qs'
import store from '../../app.store'
import Cookies from 'js-cookie'

/*
|------------------------------------------------------------------------------
| Основной комопнент корзины
|------------------------------------------------------------------------------
*/

/*
|------------------------------------------------------------------------------
| Регистрация состояния компонента
|------------------------------------------------------------------------------
*/
store.registerModule('Cart', {
	namespaced: true,

	state() {
		return {
			conf:  {},
			data:  { 
				items: []
			},
			shops: {},
			removeIndex: -1,
			itemIndex: -1,
			shopid: 0,
			footTab: '',
			footFix: false,
			footFixCount: 3,
			confirmForm: false,
			smsSended: false,
			smsLock: false,
			smsTimer: 30,
			smsCountdown: 30,
			smsCodeError: false,
			bonusError: false,
			couponError: false,
			inputs: {
				smsPhone: '',
				smsCode: '',
				cardPhone: '',
				coupon: '',
			},
			includes: {
				regForm: null
			}
		}
	},

	getters: {
		items: state => state.data.items,

		selectedItem(state) {
			let index = state.itemIndex;

			if (state.data.items[index]) {
				return state.data.items[index]
			}

			return {}
		},

		discount(state) {
			const totalSum = state.data.items.reduce((sum, item) => 
				sum + (+item.discount_price
					.replace(/\..?$/, '')
					.replace(/\D/g, '')
				), 0)

			const totalSumBc = state.data.items.reduce((sum, item) => 
				sum + (+item.price_bc
					.replace(/\..?$/, '')
					.replace(/\D/g, '')
				), 0)

			return totalSum - totalSumBc
		},

		city: state => state.data.city || state.conf.city,

		itemsCount: state => state.data.items.length,

		bonusCard: state => state.data.bonus_card,

		bonusCardCheck: state => +state.data.bonus_card_check == 1,

		bonusShowError: state => 
			state.bonusError || (state.data.bonus_card.length && !(+state.data.bonus_card_check == 0)),

		coupon: state => state.data.coupon,

		couponCheck: state => +state.data.coupon_check == 1,

		couponShowError: state => 
			state.couponError || (state.data.coupon.length && !state.data.couponCheck),

		orders(state) {
			if (!state.data.orders) {
				return null
			}

			return state.data.orders.orders
		},

		ordersCount(state) {
			if (!state.data.orders) {
				return 0
			}

			return Object.keys(state.data.orders.orders).length
		},

		orderShops: state => state.data.orders ? state.data.orders.shop_detail || {} : {},

		orderNums: state => state.data.orders ? state.data.orders.order_create || [] : [],
		
		createdOrders: state => 
			state.data.orders && state.data.orders.order_create,

		itemsForgetShop: state => state.data.items.filter(item => +item.shopid == 0).length,

		footerFixed: state => !state.confirmForm && state.footFix
	},

	mutations: {
		setConf(state, conf) {
			Vue.set(state, 'conf', conf)
		},

		setData(state, data) {
			// Дополнение для полученных данных
			data.items = data.items.map((item) => {
				return Object.assign(item, {
					// Показывать прелоадер магазина
					shop_loading: false,

					// Размер, если в нем нет грамм
					sanitized_size: /^.+\s+.+$/.test(item.size) ?
						false : parseFloat(item.size),

					// Чистый прайс
					sanitized_price: item.total_discount_price
						.replace(/\..?$/, '')
						.replace(/\D/g, '')
				})
			})

			Vue.set(state, 'data', data)
		},

		setShops(state, shops) {
			Vue.set(state, 'shops', shops)
		},

		setShop(state, payload) {
			state.shops[payload.itemid] = payload.shops
		},

		setShopid(state, payload) {
			state.shopid = payload
		},

		clearItems(state) {
			state.data.items = []
		},

		setItemIndex(state, index) {
			state.itemIndex = index
		},

		setRemoveIndex(state) {
			state.removeIndex = state.itemIndex
		},

		setItemShopLoading(state, payload) {
			if (payload instanceof Object && payload.uuid) {
				let items = state.data.items.filter(item => item.uuid == payload.uuid)

				if (items.length) {
					items[0].shop_loading = payload.state
				}
			} else {
				state.data.items[state.itemIndex].shop_loading = payload
			}
		},

		setFootTab(state, payload) {
			state.footTab = state.footTab != payload ? payload : ''
		},

		setFootFix(state, payload) {
			state.footFix = payload
		},

		setConfirmForm(state, payload) {
			state.confirmForm = payload
		},

		setSmsSended(state, payload) {
			state.smsSended = true
			state.smsLock = true
		},

		setSmsCodeError(state, payload) {
			state.smsCodeError = payload
		},

		resetSmsCountdown(state, payload) {
			state.smsCountdown = state.smsTimer
			state.smsLock = false
		},

		decrementSmsCountdown(state) {
			state.smsCountdown--
		},

		setInput(state, payload) {
			state.inputs[payload.name] = payload.value.toString().trim()
		},

		setInclude(state, payload) {
			state.includes[payload.name] = payload.content
		},

		setBonusError(state, payload) {
			state.bonusError = payload
		},

		setCouponError(state, payload) {
			state.couponError = payload
		}
	}
})

/*
|------------------------------------------------------------------------------
| Объявление объекта опций компонента
|------------------------------------------------------------------------------
*/
const Cart = {
	template: require('./cart.tpl'),

	props: {
		initialConf: {
			type: Object,
			default() {
				return {};
			}
		},
		initialData: {
			type: Object,
			default() {
				return {};
			}
		},
		initialShops: {
			type: Object,
			default() {
				return {};
			}
		}
	},

	created() {
		this.setConf(this.initialConf)
		this.setData(this.initialData)
		this.setShops(this.initialShops)
	},

	mounted() {},

	computed: {
		...mapState('Cart', [
			'conf', 
			'data',
			'shops',
			'shopid',
			'inputs',
			'includes',
			'itemIndex', 
			'removeIndex',
			'shopid',
			'footTab', 
			'footFix', 
			'footFixCount', 
			'confirmForm',
			'smsSended',
			'smsTimer',
			'smsCountdown',
			'smsLock',
			'smsCodeError',
		]),
		...mapGetters('Cart', [
			'items',
			'city',
			'discount',
			'selectedItem',
			'itemsCount',
			'bonusCard',
			'bonusCardCheck',
			'bonusShowError',
			'coupon',
			'couponCheck',
			'couponShowError',
			'orders',
			'ordersCount',
			'orderNums',
			'itemsForgetShop',
			'createdOrders',
			'footerFixed',
		]),
	},
	
	methods: {
		...mapMutations('App', [ 
			'setPreloader',
		]),
		...mapMutations('Cart', [
			'setConf',
			'setData',
			'setShops',
			'setInput',
			'setInclude',
			'setItemShopLoading',
			'setFootTab',
			'setFootFix',
			'setConfirmForm',	
			'setSmsSended',
			'setSmsCodeError',
			'resetSmsCountdown',
			'decrementSmsCountdown',
			'setBonusError',
			'setCouponError',
		]),

		// Мутация полей
		updateInput (e) {
			this.$store.commit('Cart/setInput', {
				name:  e.target.name,
				value: e.target.value
			})

			Cookies.set('cart.'+ e.target.name, e.target.value, { expires: 7 });
		},

		// Отправка запроса в api
		sendRequest(options) {
			const vm = this

			let data = Object.assign(options.data || {}, {
				[vm.conf.cookieKey]: Cookies.get(vm.conf.cookieKey)|| ''
			})

			if (options.preloader === true) {
				vm.$store.commit('App/setPreloader', true)
			}

			axios({
				url: vm.conf.cartApiUrl + options.apiMethod,
				method: options.sendMethod || 'post',
				data: JSON.stringify(data),
				withCredentials: true,
				responseType: 'json'
			})
			.then(response => {
				vm.$store.commit('App/setPreloader', false)
	
				if (response.data.response.error) {
					console.log(response.data.response.error)
					alert('Возникла ошибка!')
					return
				}

				if (response.data.items && options.refresh !== false) {
					vm.$store.commit('Cart/setData', response.data)
				}

				if (options.onResponse instanceof Function) {
					options.onResponse(response)
				}
			})
			.catch(error => {
				vm.$store.commit('App/setPreloader', false)

				if (options.onError instanceof Function) {
					options.onError(error)
				} else {
					alert('Возникла ошибка!')
				}

				console.log(error)
			})
		},

		// Модалка с подтверждением очистки
		showClearConfirm() {
			this.$modal.show('clear-confirm')
		},

		// Проверяет магазины, 
		// открывает форму подтверждения
		// или если введен телефон бонусной карты отправляет сразу заказ
		checkout() {
			const vm = this

			if (vm.itemsForgetShop) {
				vm.$modal.show('forget-shops')
			} else {
				if (vm.bonusCardCheck) {
					vm.sendRequest({
						apiMethod: 'checkout',
						sendMethod: 'post',
						preloader: true,
						data: {
							phone: Cookies.get('cart.cardPhone'),
							ch_code: ''
						},
						onResponse(response) {
							if (!response.error) {
								// Очистка корзины
								vm.sendRequest({
									apiMethod: 'setcity',
									refresh: false,
									data: {
										city: vm.city
									}
								})

								// Аналитика
								vm.setDataLayer()
							}
						}
					})
				} else {
					vm.$store.commit('Cart/setConfirmForm', true)
				}
			}
		},

		// Отправка смс, запуск таймера на кнопке
		sendSms() {
			const vm = this

			if (vm.smsLock) {
				return false
			}

			vm.$store.commit('Cart/setSmsSended')

			let timer = setInterval(() => {
				vm.$store.commit('Cart/decrementSmsCountdown')

				if (vm.smsCountdown == 0) {
					clearInterval(timer)

					vm.$store.commit('Cart/resetSmsCountdown')
				}
			}, 1000)

			vm.sendRequest({
				apiMethod: 'checkout',
				sendMethod: 'post',
				preloader: true,
				data: {
					phone: vm.inputs.smsPhone,
					ch_code: ''
				}
			})
		},

		// Отправка проверочного кода из смс, подтверждение заказа
		sendCheckCode() {
			const vm = this

			vm.sendRequest({
				apiMethod: 'checkout',
				sendMethod: 'post',
				preloader: true,
				data: {
					phone: vm.inputs.smsPhone,
					ch_code: vm.inputs.smsCode
				},
				onResponse(json) {
					let error = json.data.orders.response.error == 'INVALID_CHECK_CODE'
	
					vm.$store.commit('Cart/setSmsCodeError', error)

					if (!error) {
						// Очистка корзины
						vm.sendRequest({
							apiMethod: 'setcity',
							refresh: false,
							data: {
								city: vm.city
							}
						})

                        axios.get('/basket/ajax/unomi.php?phone='+ vm.inputs.smsPhone)
					}

					// Аналитика
					vm.setDataLayer()
				}
			})
		},

		// Применение бонусной карты
		applyBonusCard($event) {
			const vm = this
			let phone = Cookies.get('cart.cardPhone')
				.replace(/\D/g, '')
				.substring(1)

			if (phone.length != 10) {
				vm.$store.commit('Cart/setBonusError', true)
				return
			}

			$event.target.blur()

			vm.$store.commit('App/setPreloader', true)

			axios({
					url: '/api/bcard/getNumberByPhone/'+ phone +'/',
					method: 'get',
					withCredentials: true,
					responseType: 'json'
				})
				.then(response => {
					vm.$store.commit('App/setPreloader', false)

					vm.$store.commit('Cart/setBonusError', response.data.NUMBER == null)

					if (!!response.data.NUMBER) {
						vm.sendRequest({
							apiMethod: 'applybcard',
							sendMethod: 'post',
							preloader: true,
							data: {
								bonus_card: response.data.NUMBER,
							},
							onResponse() {
								if (vm.bonusCardCheck) {
									// Если карта прошла убираем таб с формой
									vm.$store.commit('Cart/setFootTab', '')
								}
							}
						})
                        axios.get('/basket/ajax/unomi.php?phone='+ phone)
                    }
				})
				.catch(error => {
					console.log(error)
				})
		},

		// Отмена бонусной карты
		clearBonusCard() {
			const vm = this

			vm.sendRequest({
				apiMethod: 'clearbcard',
				sendMethod: 'post',
				preloader: true,
				data: {
					bonus_card: vm.bonusCard,
				},
				onResponse() {
					// Показываем таб с формой карты
					vm.$store.commit('Cart/setFootTab', 'card')
				}
			})
		},

		// Применение купона
		applyCoupon() {
			const vm = this

			vm.sendRequest({
				apiMethod: 'applycoupon',
				sendMethod: 'post',
				preloader: true,
				data: {
					coupon: vm.inputs.coupon,
				},
				onResponse() {
					if (vm.couponCheck) {
						// Если купон прошел убираем таб с формой
						vm.$store.commit('Cart/setFootTab', '')
					}
				},
				onError() {
					vm.$store.commit('Cart/setCouponError', true)
				}
			})
		},

		// Отмена купона
		clearCoupon() {
			const vm = this

			vm.sendRequest({
				apiMethod: 'clearcoupon',
				sendMethod: 'post',
				preloader: true,
				data: {
					coupon: vm.coupon,
				},
				onResponse() {
					// Показываем таб с формой купона
					vm.$store.commit('Cart/setFootTab', 'promocode')
				}
			})
		},

		// Добавление стороннего кода
		includeContent(name, assets) {
			const vm = this
			let url = '/'+ vm.conf.dir + '/include/' + name + '.php'

			if (!!vm.includes[name] && vm.includes[name].length) {
				return false
			}

			vm.$store.commit('App/setPreloader', true)
			
			axios
				.get(url)
				.then(response => {
					vm.$store.commit('App/setPreloader', false)
					vm.$store.commit('Cart/setInclude', {
						name: name,
						content: response.data
					})

					if (assets.js) {	
						assets.js.forEach(src => {
							const el = document.createElement('script')

							el.setAttribute('src', src)
							document.body.appendChild(el);
						});
					}
				})
				.catch(error => {
					console.log(error)
				})
		},

		// Аналитика
		setDataLayer() {
			const vm = this

			window.dataLayer = window.dataLayer || [];
 
			for (let orderid in vm.data.orders.order_create) {
				let items = vm.data.orders.orders[orderid]
				let layer = {
					event: 'e-commerce',
					ecommerce: {
						purchase: {
							actionField: {
								id: vm.data.orders.order_create[orderid],
								revenue: items.reduce((sum, item) => 
									sum + (+item.total_price
										.replace(/\..?$/, '')
										.replace(/\D/g, '')
									), 0),
							},
							products: []
						}
					}
				}

				if (vm.couponCheck) {
					layer.ecommerce.purchase.actionField.coupon = vm.data.coupon
				}

				items.forEach(item => {
					layer.ecommerce.purchase.products.push({
						name: item.title,
						id: item.sapcode.substring(8),
						price: item.discount_price,
						quantity: 1,
						id_region: vm.data.orders.shop_detail[orderid].city_abbr,
						vendorCode: item.bxid,
					})
				})

				window.dataLayer.push(layer)
			}
		}
	},

	watch: {
		// Удаление одного продукта
		removeIndex(newVal, value) {
			let item = this.data.items[newVal]
			
			if (item) {
				this.data.items.splice(newVal, 1)

				this.sendRequest({
					apiMethod: 'remove',
					sendMethod: 'post',
					data: {
						uuid: item.uuid
					}
				})
			}
		},

		// Очистка корзины
		// Фиксирование футера
		itemsCount() {
			if (this.itemsCount == 0) {
				this.sendRequest({
					apiMethod: 'clear',
					sendMethod: 'get'
				})
			}

			this.$store.commit('Cart/setFootFix', this.itemsCount > this.footFixCount)
		},

		// Установка магазина
		shopid() {
			const vm = this

			if (+vm.shopid === 0) {
				return
			}
			
			const items = vm.items
				// Товары с невыбранным магазином и выбранный элемент
				.filter(item => +item.shopid == 0 || item.uuid == vm.selectedItem.uuid)
				// Формирование объекта для отправки с магазином
				.map((item) => {
					return {
						uuid: item.uuid,
						shops: vm.shops[item.itemid].filter(shop => 
							shop.xml_id == vm.shopid
						).length
					}
				})
				// Если есть магазин
				.filter(item => +item.shops > 0)
				// Конечный массив с uuid
				.map(item => item.uuid)

			const data = [
				{
					shopid:  vm.shopid,
					city:    vm.city,
					items:   items
				}
			]

			if (items.length) {
				items.forEach(uuid => {
					vm.$store.commit('Cart/setItemShopLoading', {
						uuid:  uuid,
						state: true
					})
				});

				vm.sendRequest({
					apiMethod:  'setshops',
					sendMethod: 'post',
					data: data,
					refresh: true
				})
			}

			vm.$store.commit('Cart/setShopid', 0)
		},

		// Скрываем форму оформления если выбрана вкладка
		footTab(value) {
			if (value != '') {
				this.$store.commit('Cart/setConfirmForm', false)
				this.$store.commit('Cart/setFootFix', false)
			}
		},

		// Сбрасываем вкладки, если показывается форма оформления
		confirmForm(value) {
			if (value == true) {
				this.$store.commit('Cart/setFootTab', '')
			}
		},
	}
}

Vue.component('Cart', Cart);

export default Cart;
