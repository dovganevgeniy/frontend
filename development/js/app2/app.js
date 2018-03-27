import Vue from 'vue/dist/vue';
import bowser from 'bowser';
import store from './app.store';
//import 'vue-clicky';
import { mapState, mapMutations } from 'vuex';
import { FingerprintSpinner } from 'epic-spinners'
import VModal from 'vue-js-modal'
import VScrollTo from 'vue-scroll-to'
import './filters'

const VueInputMask = require('vue-inputmask').default

Vue.use(VModal)
Vue.use(VScrollTo)
Vue.use(VueInputMask)

Vue.config.productionTip = false
Vue.config.performance = process.env.NODE_ENV === 'dev'
Vue.config.devtools = process.env.NODE_ENV === 'dev'
Vue.config.ignoredElements = ['vue-ignore', 'noindex']

const App = new Vue({
	el: '#app',
	name: 'App',
	store,

	components: {
		FingerprintSpinner
	},

	data: {
		device: {},
		options: {},
		plugins: {
			bowser: {
				enable: true
			},
		},
		noScroll: false
	},

	methods: {

		// plugins
		bowser() {
			function detectBrowserEngine() {
				let browser;
				if (bowser.blink) {
					browser = 'blink';
				} else if (bowser.webkit) {
					browser = 'webkit';
				} else if (bowser.gecko) {
					browser = 'gecko';
				} else if (bowser.msie) {
					browser = 'msie';
				} else if (bowser.msedge) {
					browser = 'msedge';
				}
				return browser;
			}

			function detectDeviceType() {
				let deviceType;
				if (bowser.mobile) {
					deviceType = 'mobile';
				} else if (bowser.tablet) {
					deviceType = 'tablet';
				} else {
					deviceType = 'laptop';
				}
				return deviceType;
			}

			function detectOs() {
				let os;
				if (bowser.mac) {
					os = 'mac';
				} else if (bowser.windows) {
					os = 'windows';
				} else if (bowser.windowsphone) {
					os = 'windowsphone';
				} else if (bowser.linux) {
					os = 'linux';
				} else if (bowser.chromeos) {
					os = 'chromeos';
				} else if (bowser.android) {
					os = 'android';
				} else if (bowser.ios) {
					os = 'ios';
				} else if (bowser.blackberry) {
					os = 'blackberry';
				} else if (bowser.firefoxos) {
					os = 'firefoxos';
				} else if (bowser.webos) {
					os = 'webos';
				} else if (bowser.bada) {
					os = 'bada';
				} else if (bowser.tizen) {
					os = 'tizen';
				} else if (bowser.sailfish) {
					os = 'sailfish';
				}
				return os;
			}

			this.device.browser = bowser.name;
			this.device.browserVersion = bowser.version;
			this.device.browserEngine = detectBrowserEngine();
			this.device.type = detectDeviceType();
			this.device.os = detectOs();
			this.device.osVersion = bowser.osversion;
		}
	},

	computed: {
		...mapState('App', [
			'alert',
			'preloader'
		])

	},

	beforeMount() {
		// plugins
		if (this.plugins.bowser.enable) {
			this.bowser();
		}
	},

	watch: {
		alert(value) {
			let method = value.show === true ? 'show' : 'hide'
			this.$modal[method]('alert')
		}
	}
})
