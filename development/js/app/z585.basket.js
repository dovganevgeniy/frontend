(function () {
	'use strict';

	var basket = Z585.define('Z585.basket');

	basket.init = function () {
		var self = this;
		
		self.debug = true;
		self.apiUrl = 'https://web-v3.zoloto585.ru/restapi/v2/basket/';
		self.apiData = {};

		self.methods = {
			add: 'post',
			xadd: 'post',
			clear: 'get',
			briefview: 'get',
			view: 'get',
			applycoupon: 'post',
			clearcoupon: 'post',
			applybcard: 'post',
			clearcbcard: 'post',
			checkout: 'post',
			setshop: 'post',
			setcity: 'post',
			setqnt: 'post',
		};

		self.elements = {
			brief: $('.top-basket'),
			page:  $('.page.basket'),
		};

		$.each(self.elements, function (k, $el) {
			var fname;

			if ($el.length) {
				fname = k + 'Init';

				if (self[fname]) {
					self[fname]();
				} else {
					console.log('Z585.basket error: '+ fname +' is not a function');
				}
			} else {
				console.log('Z585.basket notify: elements.' + k + ' is undefined');
			}
		});
	}

	/**
	 * Отдельная страница с корзиной /basket
	 */
	basket.pageInit = function () {
		var self = this;

		return true;

		self.load('view', {
			name: 'content',
			reLoad: false,
			showPreloader: false,
			callback: self.mainStepCallback
		}, false);

		// Выбор шага
		self.elements.page.on('click', '[data-btn=step]', function (e) {
			var method = $(this).data('method');

			self.requestAPI(method, {}, {
				partial: {
					name:  'content',
					state: $(this).data('state'),
					template: $(this).data('template'),
					toTop: true,
				},
			});

			e.preventDefault();
		});

		// Вернуться к покупкам (назад)
		self.elements.page.on('click', '[data-btn=goback]', function (e) {
			e.preventDefault();

			/*
			if (window.history.length) {
				window.history.go(-1);
			} else {
				window.location = '/catalog';
			}
			*/

			window.location = document.referrer || '/catalog/yuvelirnye_izdeliya/';
		});

		// Очистить корзину
		self.elements.page.on('click', '[data-btn=clear]', function (e) {
			e.preventDefault();

			var confirm = new Z585.modal.instance({
				htmlHeader: 'Очистить корзину?',
				htmlInfo: 'Вы уверены, что хотите удалить все товары из корзины?',
				htmlConfirm: 'ОК',
				htmlDecline: 'Отмена',
				fires: {
					confirm: function (elements) {
						self.requestAPI('clear', {}, {
							partial: {
								name: 'content'
							}
						});
					},
				}
			});
	
			confirm.init(true);		
		});

		// Выбор магазина
		self.elements.page.on('change', '[data-el=item-shops]', function (e) {
			var el = this;
			var $itemWrap = $(this).closest('[data-el=item-wrapper]');
			var $shopWrap = $(this).closest('[data-el=shop-wrapper]');
			var showConfirm = self.elements.page.find('[data-el=not-available]').length == 0;
			var shopid = $(this).val().toString();

			self.requestAPI('setshop', 
				{
					uuid: $(this).data('uuid'),
					city: $(this).data('city'),
					shopid: shopid,
				}, {
					callback: function (json) {
						if (json.response.code == 2) {
							// Товара уже нет в корзине
							$itemWrap.remove();
						} else {
							// Устанавливаем статус
							$shopWrap.attr('data-status', shopid == 0 ? 'null' : 'selected');
						}

						self.load('view', {
							name: 'content',
							reLoad: true,
							showPreloader: true,
							callback: self.mainStepCallback,
						}, false);
				
						// Показываем или скрываем форму подтверждения если все магазины выбраны
						// и выбираем такой же магазин в соседнем товаре
						//self.elements.page.find('[data-el=item-shops]').each(function () {
							/*
								Выбор этого же магазина в соседних селекторах
								Временно отключено
								@TODO: $sibling.each
								====================
							if ($(this).is(el) == false) {
								var $sibling = $(this).find('option[value="'+ shopid +'"]');
								var $sibSelector = $sibling.length ? $sibling.closest('select') : null;
			
								if (!!$sibSelector) {
									$sibSelector.val(shopid);
			
									self.requestAPI('setshop', {
										sapcode: $sibSelector.data('sapcode'),
										city: $sibSelector.data('city'),
										shopid: shopid,
									});
			
									$sibSelector.closest('[data-el=shop-wrapper]').attr('data-status', 'selected');
								}
							}
							*/
			
							/*
							if ($(this).val() == 0) {
								showConfirm = false;
								return false;
							}
							*/
						//});
			
						//self.elements.page.find('[data-el=confirm-wrapper]')[showConfirm ? 'slideDown':'slideUp'](200);
					}
				}
			);
		});

		// Удаление товара со страницы корзины
		self.elements.page.on('click', '[data-btn=remove]', function (e) {
			e.preventDefault();

			var $item = $(this).closest('[data-el=item]');
			var uuid = $(this).data('uuid');
			var sap = $(this).data('sap');
			var confirm = new Z585.modal.instance({
				htmlHeader: 'Удалить товар?',
				htmlInfo: 'Вы уверены, что хотите удалить товар из корзины?',
				htmlConfirm: 'ОК',
				htmlDecline: 'Отмена',
				dataSapConfirm: sap,

				fires: {
					confirm: function (elements) {
						self.requestAPI('remove', {
							uuid: uuid
						}, {
							partial: {
								name: 'content',
								callback: self.mainStepCallback,
							}
						});
					},
					decline: function (elements) {
						$item.find('[data-el=quantity] input').val(1).trigger('change');
					},
				},
			});
	
			confirm.init(true);
		});

		// Фокус на инпут кол-ва выделяет значение
		self.elements.page.on('focus', '[data-el=quantity] input', function (e) {
			$(this).select();
		});

		// Изменения значения кол-ва
		self.elements.page.on('keyup change', '[data-el=quantity] input', function (e) {
			var $wrap = $(this).closest('[data-el]');
			var $item = $(this).closest('[data-el=item]');
			var val = parseInt($(this).val().replace(/\D/g, ''));
			var limit = 99999;

			if (isNaN(val)) {
				val = 1;
			}

			if (parseInt(val) > limit) {
				val = limit;
			}

			$(this).val(val);

			if (val == 0) {
				$item.find('[data-btn=remove]').trigger('click');
			} else {
				self.requestAPI('setqnt', {
					sapcode: $wrap.data('sapcode'),
					qnt: val,
				}, {
					partial: {
						name: 'content',
						toTop: false,
					}
				});
			}
		});

		// Изменение кол-ва кнопкой
		self.elements.page.on('click', '[data-el=quantity] button', function (e) {
			e.preventDefault();

			var $wrap = $(this).closest('[data-el]');
			var val = parseInt($wrap.find('input').val().replace(/\D/g, ''));

			val += $(this).index() == 0 ? -1 : 1;

			$wrap.find('input').val(val).trigger('change');
		});

		// Применение купона
		self.elements.page.on('click', '[data-btn=applycoupon]', function (e) {
			var $input = self.elements.page.find('[data-el=coupon-input]');
			var value  = $.trim($input.val());

			if (value.length == 0) {
				$input.trigger('focus');
			} else {
				self.requestAPI('applycoupon', {
					coupon: value
				}, {
					partial: {
						name: 'content',
						toTop: false,
						callback: self.mainStepCallback
					}
				});
			}
		});

		// Удаление купона
		self.elements.page.on('click', '[data-btn=clearcoupon]', function (e) {
			var $input = self.elements.page.find('[data-el=coupon-input]');
			var value  = $(this).data('coupon');
			
			self.requestAPI('clearcoupon', {
				coupon: value
			}, {
				partial: {
					name: 'content',
					toTop: false,
					callback: self.mainStepCallback
				}
			});
		});

		// Форма регистрации бонусной карты
		self.elements.page.on('click', '[data-btn=reg-card]', function (e) {
			e.preventDefault();

			self.elements.page
				.find('[data-el=reg-card]').addClass('is-open')
				.find('[data-btn=reg-card-close]').on('click', function (e) {
					e.preventDefault();
					$(this).closest('[data-wrap]').removeClass('is-open');
				});

			self.loadPartial('regform', {}, {
				reLoad: false,
				toTop: false,
				showPreloader: false,
				callback: function ($partial) {
					var $type = $partial.find('input[name=type]');
					var $cardnum = $partial.find('input[name=dc]');

					if ($type.length) {
						$type.val('new');
					} else {
						console.log('Z585.basket [data-btn=reg-card] error: $type is undefined');
					}

					if ($cardnum.length) {
						$cardnum.val('0000000000000');
					} else {
						console.log('Z585.basket [data-btn=reg-card] error: $cardnum is undefined');
					}
				}
			});
		});

		// Применение бонусной карты
		self.elements.page.on('click', '[data-btn=applybcard]', function (e) {
			var $input = self.elements.page.find('[data-el=bonus-input]');
			var value  = $.trim($input.val());

			e.preventDefault();

			if (value.length == 0) {
				$input.trigger('focus');
			} else {
				self.requestAPI('applybcard', {
					bonus_card: value
				}, {
					partial: {
						name: 'content',
						toTop: false,
						callback: self.mainStepCallback
					}
				});
			}
		});

		// Удаление бонусной карты
		self.elements.page.on('click', '[data-btn=clearbcard]', function (e) {
			var value  = $(this).data('bonus-card');
			
			self.requestAPI('clearbcard', {
				bonus_card: value
			}, {
				partial: {
					name: 'content',
					toTop: false,
					callback: self.mainStepCallback
				}
			});
		});

		// Выбрать на карте адрес магазина
		self.elements.page.on('click', '[data-btn=open-map]', function (e) {
			var $modal = self.elements.page.find('[data-el=modal][data-name=map]');
			var $wrap = $(this).closest('[data-el=shop-wrapper]');
			var $selector = $wrap.find('select');
			var $options = $selector.find('option');
			var content = {
				list: '',
			};
			var mapOptions = {
				zoom: 10,
				onBalloonClick: function (e, obj) {
					var shopid  = obj.properties.get('shopid');
					var $listEl = $modal.find('[data-el=list] [data-shopid="'+ shopid +'"]');

					if ($listEl.length) {
						$listEl
							.addClass('active')
							.siblings().removeClass('active');
					}
				}
			};
			var mapData = [];

			e.preventDefault();

			$options.each(function () {
				var lat, lon, time, addr;

				if (this.value != 0) {
					lat  = $(this).data('lat');
					lon  = $(this).data('lon');
					time = $(this).data('time');
					addr = $(this).text();
					content.list += 
						'<li '+
							'data-shopid="'+ this.value +'" '+
							'data-lat="'+  lat  +'" '+
							'data-lon="'+  lon  +'" '+
							'data-time="'+ time +'">'+ $(this).text() +'</li>';

					mapData.push({
						shopid: this.value,
						coords: [ lat, lon ],
						address: addr,
						time: time,
					});
				}
			});

			if (typeof self.yaMap === 'undefined') {
				// Назначаем экземпляр карты и события

				self.yaMap = new Z585.yamaps.instance(mapOptions);

				// Клик по адресу магазина в списке
				// Установка центра карты и приблежение
				$modal.on('click', '[data-el=list] li', function (e) {
					var $listEl = $(this);
					var coords = [
						$(this).data('lat'),
						$(this).data('lon'),
					];

					$listEl
						.addClass('active')
						.siblings().removeClass('active');

					self.yaMap.setCenter(coords, 16);

					self.yaMap.placemarks.forEach(function (e) {
						if ($listEl.data('shopid') == e.properties.get('shopid')) {
							e.balloon.open();
						}
					});
				});
			}

			// Кнопка "Выбрать магазин" в баллуне карты
			// назначаем каждый раз при клике "выбрать на карте", чтобы попадал правельный селектор
			$modal.one('click', '[data-btn=select-shop]', function (e) {
				$selector.val($(this).attr('data-shopid').toString()).trigger('change');
				self.toggleModal('map', false);
			});

			self.toggleModal('map', true, content);

			self.yaMap.destroyMap();
			self.yaMap.showMap(mapData, $modal.find('[data-el=map-balloon]'));
		});

		// Показывает блок с телефоном для подтверждения или модалку об ошибке
		self.elements.page.on('click', '[data-btn=show-confirm]', function (e) {
			var $confirmWrap = self.elements.page.find('[data-el=confirm-wrapper]');
			var shops = self.elements.page.find('[data-el=item-shops]').map(function () {
				return +$(this).val();
			}).get();
			var permission = $.inArray(0, shops) === -1;
			var scrollPos = 0;

			e.preventDefault();

			if (permission) {
				// Скрываем кнопку, показываем блок с подтверждением
				$(this).hide();
				$confirmWrap.removeClass('is-close');

				scrollPos = $confirmWrap.offset().top;
			} else {
				var notify = new Z585.modal.instance({
					htmlHeader: 'Магазины не выбраны',
					htmlInfo: 'Пожалуйста, выберите магазины у всех товаров',
					buttons: [ 'close', 'confirm' ],
				});

				notify.init(true);
			}

			$('html, body').animate({ scrollTop: scrollPos }, 200);
		});

		// Копирование GPS координат в буфер
		self.elements.page.on('click', '[data-btn=copy-gps]', function (e) {
			var $temp = $('<input>');
			$('body').append($temp);
			$temp.val($(this).data('coords')).select();
			document.execCommand('copy');
			$temp.remove();
			e.preventDefault();
		});

		// Подтверждение заказа. Отправка смс
		self.elements.page.on('click', '[data-btn=send-sms]', function (e) {
			var $input = self.elements.page.find('[data-el=phone]');
			var value  = $.trim($input.val());

			e.preventDefault();

			if (value.length == 0) {
				$input.trigger('focus');
			} else {
				self.requestAPI('checkout', {
					phone: value,
					ch_code: '',
				}, {
					callback: function () {
						self.elements.page
							.find('[data-el=confirm-form]').slideDown(200)
							.find('[data-el=smscode]').trigger('focus');
					}
				});
			}
		});

		// Подтверждение заказа. Отправка проверочного кода
		self.elements.page.on('click', '[data-btn=checkout]', function (e) {
			var $form  = self.elements.page.find('[data-el=confirm-form]');
			var $input = $form.find('[data-el=smscode]');
			var $error = $form.find('[data-el=error]');
			var $phone = self.elements.page.find('[data-el=phone]');
			var $content = self.elements.page.find('[data-partial=content]');

			e.preventDefault();

			$error.hide();

			self.requestAPI('checkout', {
				phone:   $.trim($phone.val()),
				ch_code: $.trim($input.val()),
			}, {
				callback: function (json) {
					var invalid = json.orders.response.error == 'INVALID_CHECK_CODE';

					if (invalid) {
						$error.show();
					} else {
						// Последний шаг
						self.loadPartial('content', json, {
							template: 'orders',
							callback: function () {
								self.elements.page.find('[data-el=confirm-wrapper]').addClass('is-close');
								$('html, body').animate({ scrollTop: 0 }, 200);
							}
						});

						// Очистка корзины
						self.requestAPI('setcity', {
							city: json.city
						});
					}
				}
			});
		});

		// Инпуты связанные с кнопками
		self.elements.page.on('keyup', '[data-send-btn]', function (e) {
			var $btn = self.elements.page.find('[data-btn="'+ $(this).data('send-btn') +'"]');

			// Клик по кнопке по нажатию enter
			if (e.keyCode == 13 && $btn.length) {
				$btn.trigger('click');
			}
		});

		// Загрузка товара для повторного добавления (Кнопка хочу еще)
		self.elements.page.on('click', '[data-btn=like-that]', function (e) {
			var itemid = $(this).data('itemid');
			var data = {
				item: self.apiData.view.items.find(function (el) {
					return el.itemid == itemid;
				}),
				city: self.apiData.view.city,
			};

			var modal = new Z585.modal.instance({
				cssExtra: 'modal__wrap--gray',
				htmlInfo: '<div data-partial="like-that"/>',
				preloader: true,
				buttons: [ 'close' ],
				fires: {
					append: function () {
						var modalSelf = this;
						self.loadPartial('like-that', data, {
							showPreloader: false,
							callback: function ($partial) {
								var $btn = $partial.find('[data-btn=fittingBtn]');
								var $selector = $partial.find('[data-btn=fittingSelector]');
								var item = data.item;
								var setData = function ($el) {
									var $title         = $('<div/>').html(item.title);
									var $size          = $title.find('size');
									var primaryPrice   = $el.data('primary-price');
									var discountPrice  = $el.data('discount-price');
									var bonusPrice     = $el.data('bonus-price') || discountPrice;

									if ($size.length) {
										$size.text($el.data('itemsize'));
									}

									data = {
										title:    $title.html(),
										sapcode:  $el.data('sapcode'),
										article:  $el.data('article'),
										itemid:   $el.data('itemid'),
										itemsize: $el.data('itemsize'),
										weight:   $el.data('weight'),
										price: primaryPrice.replace(/[^0-9]/g, ''),
										discount_price: discountPrice.replace(/[^0-9]/g, ''),
										shopid: 0,
									};

									e.preventDefault();

									$partial
										.find('[data-el=primary-price]').text(primaryPrice).end()
										.find('[data-el=discount-price]').text(discountPrice).end()
										.find('[data-el=bonus-price]').text(bonusPrice).end();

									$el
										.attr('data-selected', 1)
										.siblings().removeAttr('data-selected');

									$partial.find('[data-btn=add]').data('item', data);
								}

								modalSelf.toggleWait();

								// Выбор размера
								$btn.on('click', function (e) {
									setData($(this));
								});

								// Выбор веса
								$selector.on('change', function (e) {
									setData($(this).find('option:selected'));
								});

								if ($selector.length && $selector.find('option').length == 2) {
									// Если вес один выбираем его и скрываем селектор
									$selector.hide().find('option:eq(1)')
										.prop('selected', true)
										.end().trigger('change');
								} else {
									// Выбираем первый размер
									$btn.first().trigger('click');
								}

								// Добавление в корзину
								$partial.find('[data-btn=add]').on('click', function (e) {
									e.preventDefault();

									if (typeof $(this).data('item') === 'undefined') {
										var modal = new Z585.modal.instance({
											htmlInfo: 'Пожалуйста, выберите размер',
											buttons: [ 'close', 'confirm' ],
										}).init(true);
									} else {
										data = $.extend(item, $(this).data('item'));

										data.city = $(this).data('city');
										data.url = data.href;

										delete data.uuid;
										delete data.citycount;
										delete data.total_discount_price;
										delete data.total_price;

										modalSelf.destroy();

										self.requestAPI('xadd', data, {
											partial: {
												name: 'content',
												toTop: false,
												callback: self.mainStepCallback,
											}
										});
									}
								});
							}
						});
					}
				}
			});

			e.preventDefault();
	
			modal.init(true);
		});
	}

	/**
	 * Мини корзина на всех страницах в шапке
	 */
	basket.briefInit = function () {
		var self = this;

		self.load('briefview', {
			name: 'topbasket'
		}, false);

		// Открывашка для тач версии
		self.elements.brief.on('click', '[data-btn=open]', function (e) {
			var opened = parseInt(self.elements.brief.attr('data-opened'));
			
			self.elements.brief.attr('data-opened', +!opened);
		});

		// Удаление товара из мини корзины
		self.elements.brief.on('click', '[data-btn=remove]', function (e) {
			e.preventDefault();

			//if (confirm('Вы уверены, что хотите удалить этот товар из корзины?')) {
				self.requestAPI('remove', {
					uuid: $(this).data('uuid')
				}, {
					partial: {
						name: 'topbasket'
					}
				});
			//}
		});
	}

	/**
	 * 
	 * @param {String} method - api метод
	 * @param {Object} partial - параметры шаблона
	 * @param {Function|Bool} visChangeCond - bool для перезагрузки
	 * @param {Number} visDelay - задержка в сек. для перезагрузки
	 */
	basket.load = function (method, partial, visChangeCond, visDelay) {
		var self = this;
		var stopwatch = 0;
		var loaded = false;
		var $partial = $('[data-partial="'+ partial.name +'"]');
		var sendRequest = function () {
			if (visChangeCond instanceof Function) {
				visChangeCond = visChangeCond();
			}

			if (visChangeCond || loaded === false) {
				self.requestAPI(method, {}, {
					partial: partial
				});

				loaded = true;
			}
		}

		visDelay = visDelay || 5;

		sendRequest();

		setInterval(function () {
			stopwatch++;
		}, 1000);

		if (document.addEventListener) {
			// Перезагрузка корзины при возвращении на вкладку браузера через visDelay сек.
			document.addEventListener('visibilitychange', function () {
				if (document.hidden == false && stopwatch > visDelay) {
					sendRequest();
					stopwatch = 0;
				}
			}, false);
		}
	}

	/**
	 * Запрос к API
	 * @param {String} method  - api метод
	 * @param {Object} data - объект для отправки в api
	 * @param {Object} options - partial, callback, etc
	 */
	basket.requestAPI = function (method, data, options) {
		var self = this;
		var type = 'post';

		if (self.methods[method]) {
			type = self.methods[method];
		}

		data = data || {};
		data['ZOLOTO585_USER_ID'] = $.cookie('ZOLOTO585_USER_ID');

		options = options || {};

		$.ajax({
			url: self.apiUrl + method,
			type: type,
			data: JSON.stringify(data || {}),
			cache: false,
			xhrFields: {
				withCredentials: true
			},
			crossDomain: true, 
			dataType: 'json',
			beforeSend: function () {
				self.setPreloader(true);
			},
			complete: function () {
				self.setPreloader(false);
			},
			success: function (json) {
				self.apiData[method] = json;

				if (json.response.code != 1) {
					if (json.response.code == 5) {
						alert('Не удалось загрузить корзину (UID)');
						return false;
					} else {
						console.log('Z585.basket.requestAPI error ('+ method +'): ' + JSON.stringify(json.response.error));
					}
				}

				if (options.partial) {
					self.loadPartial(options.partial.name, json, options.partial);
				}

				if ($.isFunction(options.callback)) {
					options.callback(json);
				}
			},
			error: function (xhr, status) {
				console.log('Z585.basket.requestAPI error ('+ method +'): ' + JSON.stringify(xhr));
			}
		});
	}

	/**
	 * Загрузка блока корзины
	 * @param {String} name - имя файла с шаблоном
	 * @param {Object} data - объект для отправки в шаблон
	 * @param {Object} options - доп. опции
	 */
	basket.loadPartial = function (name, data, options) {
		var self = this;
		var $partial = $('[data-partial="'+ name +'"]');
		var loaded = false;
		var template;	
		var url;
		var history;

		options = $.extend({
			reLoad: true,
			toTop: false,
			showPreloader: true,
		}, options);

		if ($partial.length) {
			loaded = typeof $partial.data('loaded') !== 'undefined';
			template = options.template || $partial.data('template');

			if (loaded === true && options.reLoad === false) {
				if ($.isFunction(options.callback)) {
					options.callback($partial);
				}
				console.log('Z585.basket.loadPartial: The partial was already loaded. '+ name +' = ('+ JSON.stringify(options) +')');
				return true;
			}

			if (typeof template === 'undefined') {
				template = name;
			}

			url = '/basket/partials/'+ template +'.php';

			if (typeof options.state !== 'undefined') {
				history = '/basket?' + options.state;
			}

			$partial.data('template', template);
			
			$.ajax({
				url: url,
				type: 'post',
				data: {
					json: JSON.stringify(data || {})
				},
				beforeSend: function () {
					if (options.showPreloader) {
						self.setPreloader(true);
					}

					if (options.toTop) {
						$('html, body').animate({ scrollTop: 0 }, 200);
					}
				},
				success: function (response) {
					self.setPreloader(false);
					
					if (history) {
						window.history.pushState(null, null, history);
					}

					$partial.html(response).data('loaded', 1);
	
					if ($.isFunction(options.callback)) {
						options.callback($partial);
					}
				},
				error: function (xhr, status) {
					console.log('Z585.basket.loadPartial "'+ name +'" error: ' + JSON.stringify(xhr));
				}
			});
		} else {
			console.log('Z585.basket.loadPartial: Partial "'+ name +'" is undefined');
		}
	}

	/**
	 * Показывает/скрывает прелоадер на странице корзины
	 * @param {Bool} show - показать/скрыть
	 */
	basket.setPreloader = function (show) {
		if (this.elements.page.length) {
			if (show === true) {
				this.elements.page.attr('data-wait', 1);
			} else {
				this.elements.page.removeAttr('data-wait');
			}
		}
	}

	/**
	 * Модальное окно
	 * @param {String} name - название в аттрибуте data-name
	 * @param {Bool} visible - показать/скрыть 
	 * @param {String|Object} content - строка контента или объект элементов в контейнере контента
	 */
	basket.toggleModal = function (name, visible, content) {
		var self = this;
		var $target = self.elements.page.find('[data-el=modal][data-name="'+ name +'"]');

		if ($target.length) {
			if (visible === false) {
				$target.removeClass('is-open');
				return true;
			}

			$target
				.addClass('is-open')
				.find('[data-el=modal-overlay], [data-btn=modal-close]').one('click', function () {
					$target.removeClass('is-open');
				});
				
			if (content instanceof Object) {
				$.each(content, function (k, val) {
					var $contEl = $target.find('[data-el=content] [data-el="'+ k +'"]');

					if ($contEl.length) {
						$contEl.html(val);
					} else {
						console.log('Z585.basket.toggleModal: content "'+ k +'" is undefined');
					}
				});
			}
			else if (typeof content !== 'undefined') {
				$target.find('[data-el=content]').html(content);
			}
		} else {
			console.log('Z585.basket.toggleModal: "'+ name +'" is undefined');
		}
	}

	/**
	 * Каллбэк для первого/основного шага
	 */
	basket.mainStepCallback = function ($partial) {
		// Селектор магазинов
		$partial.find('[data-el=item-shops]').fancySelect({
			optionTemplate: function(optionEl) {
				if (typeof optionEl.data('time') !== 'undefined') {
					return optionEl.text() + '<div style="display:none;">можно забрать:<br><span data-today="'+ optionEl.data('today') +'">'+ optionEl.data('time') +'</span></div>';
				}

				return optionEl.text();
			}
		}).on('change.fs', function() {
			$(this).trigger('change.$');
		});
	}

} ());
