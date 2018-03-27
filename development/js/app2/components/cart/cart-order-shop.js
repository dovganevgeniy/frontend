import Vue from 'vue/dist/vue';

/*
|------------------------------------------------------------------------------
| Магазин из заказа после подтверждения
|------------------------------------------------------------------------------
*/

Vue.component('CartOrderShop', {
	template: require('./cart-order-shop.tpl'),

	data() {
		return {
			copiedText: 'Добавлено в буфер'
		}
	},

	props: {
		details: {
			type: Object,
			required: true
		}
	},

	computed: {
		// Маршрут на яндекс карте
		yamapRoute() {
			return 'http://maps.yandex.ru/?rtext=~' 
				+ this.details.gps.lat +','+ this.details.gps.lon
		}
	},

	methods: {
		// Скопировать координаты в буфер
		copyCoords(text, event) {
			let el = document.createElement('textarea');
			el.style.position = 'absolute';
			el.style.left = '-9999px';
			el.setAttribute('readonly', '');
			el.value = text;

			document.body.appendChild(el);
			el.select();
			var success = document.execCommand('copy');
			document.body.removeChild(el);

			event.target.innerText = this.copiedText
		}
	}
	
});
