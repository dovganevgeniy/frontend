import Vue from 'vue/dist/vue'
import { mapState, mapGetters, mapMutations } from 'vuex'
import store from '../../app.store'

/*
|------------------------------------------------------------------------------
| Модалка со списком и картой магазинов
|------------------------------------------------------------------------------
*/

/*
|------------------------------------------------------------------------------
| Регистрация состояния компонента
|------------------------------------------------------------------------------
*/
store.registerModule('CartShops', {
	namespaced: true,
	
	state() {
		return {
			map: null,
			placemarks: [],
			selectedShop: {},
			shopid: 0,
			activeTab: '',
		}
	},

	getters: {},

	mutations: {
		setShopid(state, shopid) {
			state.shopid = shopid
		},

		setTab(state, payload) {
			state.activeTab = payload
		}
	},
})

/*
|------------------------------------------------------------------------------
| Объявление объекта опций компонента
|------------------------------------------------------------------------------
*/
const CartShops = {	
	template: require('./cart-shops.tpl'),

	props: {
		mapid: {
			type: String,
			default: 'shops-map'
		},
		center: {
			type: Array,
			default() {
				return [55.76, 37.64] // Moscow
			}
		},
		zoom: {
			type: Number,
			default: 10
		}
	},

	computed: {
		...mapGetters('Cart', ['selectedItem', 'city']),
		...mapState('Cart', ['data', 'shops']),
		...mapState('CartShops', ['shopid', 'placemarks', 'activeTab']),

		itemShops(state) {
			let itemid = +state.selectedItem.itemid

			return state.shops[itemid]
		},

		selectedShop(state) {
			let shopid = +state.selectedItem.shopid

			if (shopid == 0) {
				return false
			}

			return state.itemShops.filter(shop => shop.xml_id == shopid)[0]
		}
	},

	mounted() {
		const vm = this
		var event = document.createEvent('Event');

		window.addEventListener('resize', () => {
			const tab = window.screen.width >= 768 ? 'all' : 'shopList'

			vm.$store.commit('CartShops/setTab', tab)
		})
		
		event.initEvent('resize', false, true)
		window.dispatchEvent(event)
	},

	methods: {
		...mapMutations('Cart', ['setShopid']),
		...mapMutations('CartShops', ['setShopid', 'setTab']),

		close(selected) {
			this.$modal.hide('cart-shops')
		},

		opened(events) {
			const vm = this
			let curShop = vm.selectedShop
			let coords = vm.center

			vm.$store.commit('Cart/setShopid', 0)

			if (curShop) {
				vm.$store.commit('CartShops/setShopid', curShop.xml_id)
			} else {
				curShop = vm.itemShops[0]
			}

			coords = [ curShop.shopLat, curShop.shopLon ];

			const checkApiLoaded = setInterval(() => {
				if (typeof ymaps !== 'undefined') {
					ymaps.ready(() => {
						// инициализация карты
						vm.map = new ymaps.Map(
							vm.mapid,
							{
								center: coords,
								zoom: vm.zoom,
								controls: []
							},
							{
								searchControlProvider: 'yandex#search'
							}
						)

						/*
						// Контролы карты
						vm.map.controls.add(new ymaps.control.ZoomControl())
						vm.map.behaviors.enable('scrollZoom')
						*/

						// Кастомные кнопки зума
						let ZoomLayout = ymaps.templateLayoutFactory.createClass("<div class='modal-shops__zoom-wrapper'>" +
							"<div class='modal-shops__zoom modal-shops__zoom--in'>+</div>" +
							"<div class='modal-shops__zoom modal-shops__zoom--out'>-</div>" +
							"</div>", {

							build: function () {
								ZoomLayout.superclass.build.call(this);

								this.zoomInCallback = ymaps.util.bind(this.zoomIn, this);
								this.zoomOutCallback = ymaps.util.bind(this.zoomOut, this);

								$('.modal-shops__zoom--in').bind('click', this.zoomInCallback);
								$('.modal-shops__zoom--out').bind('click', this.zoomOutCallback);
							},

							clear: function () {
								$('.modal-shops__zoom--in').unbind('click', this.zoomInCallback);
								$('.modal-shops__zoom--out').unbind('click', this.zoomOutCallback);

								ZoomLayout.superclass.clear.call(this);
							},

							zoomIn: function () {
								var map = this.getData().control.getMap();
								map.setZoom(map.getZoom() + 1, {checkZoomRange: true});
							},

							zoomOut: function () {
								var map = this.getData().control.getMap();
								map.setZoom(map.getZoom() - 1, {checkZoomRange: true});
							}
						}),
						
						zoomControl = new ymaps.control.ZoomControl({options: {layout: ZoomLayout}})
						
						vm.map.controls.add(zoomControl)

						// Добавляем метки на карту
						let placemarkCollection = new ymaps.GeoObjectCollection()

						vm.itemShops.forEach((shop, index) => {
							let coords = [ shop.shopLat, shop.shopLon ];

							vm.placemarks[index] = new ymaps.Placemark(coords,
								{
									shopid: shop.xml_id,
									address: shop.address,
									time: shop.time,
									coords: coords,
								},
								{
									iconLayout: 'default#image',
									iconImageHref: '/bitrix/templates/zoloto/frontend/images/sprites/sprite__primary-icon-set.png',
									iconImageSize: [33, 44],
									iconImageClipRect: [[99, 393], [132, 437]],
									hideIconOnBalloonOpen: false,
									balloonOffset: [0, -100],
								}
							)

							placemarkCollection.add(vm.placemarks[index])
						})

						vm.map.geoObjects.add(placemarkCollection);

						// Добавляем баллун
						let balloonLayout = ymaps.templateLayoutFactory.createClass(require('./cart-map-balloon.tpl'),
							{
								build() {
									let parent = this.getParentElement()
									this.constructor.superclass.build.call(this)

									// Закрытие балуна
									parent.querySelector('[data-btn=close]')
										.addEventListener('click', (e) => {
											vm.map.balloon.close()
										})

									// Выбрать магазин
									parent.querySelector('[data-btn=select]')
										.addEventListener('click', (e) => {
											vm.$store.commit('Cart/setShopid', e.target.dataset.shopid)
											vm.$store.commit('CartShops/setShopid', 0)

											vm.$modal.hide('cart-shops')
										})
								},
								clear() {
									this.constructor.superclass.clear.call(this)
								},
								onCloseClick(e) {
									e.preventDefault()
									this.events.fire('userclose')
								},
							}
						)

						ymaps.layout.storage.add('my#shopsBalloon', balloonLayout);
						placemarkCollection.options.set({balloonLayout:'my#shopsBalloon'})

						// Клик по метке
						vm.map.geoObjects.events.add('click', (e) => {
							var obj = e.get('target')

							vm.map.setCenter(obj.geometry.getCoordinates(), 16)
							vm.$store.commit('CartShops/setShopid', obj.properties.get('shopid'))

							obj.balloon.close()
						});

						// Переходим к выбранному магазину, открываем баллун, центрируем
						if (vm.shopid) {
							vm.placemarks.forEach((e) => {
								if (vm.shopid == e.properties.get('shopid')) {
									e.balloon.open();
									vm.map.setCenter(e.properties.get('coords'), 16)
								}
							});
						}
					})
	
					clearInterval(checkApiLoaded)
				}
			}, 500)
		},

		selectShop(shopid) {
			const vm = this
			
			vm.$store.commit('CartShops/setShopid', shopid)

			vm.placemarks.forEach((e) => {
				if (shopid == e.properties.get('shopid')) {
					e.balloon.open();
					vm.map.setCenter(e.properties.get('coords'), 16)
				}
			});
		}
	},

	watch: {
		activeTab(val) {
			if (val == 'map') {
				const checkApiLoaded = setInterval(() => {
					if (typeof this.map !== 'undefined') {
						this.map.container.fitToViewport()
						
						clearInterval(checkApiLoaded)
					}
				}, 100)
			}
		},

		shopid(val) {
			if (this.activeTab != 'all') {
				this.$store.commit('CartShops/setTab', 'map')
			}
		}
	}
}

Vue.component('CartShops', CartShops);

export default CartShops;


