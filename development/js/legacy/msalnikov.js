/*

 */
// ==============
// == forms.js ==
// ==============
//
//
// что делает: стилизует состояния для полей форм,
// в зависимости от действия/манипуляции с полем формы
;$(function () {
	// старый вариант текстовго поля
	$('.form').on('focusin', function (event) {
		var $_this = $(event.target);
		if($_this.hasClass('form__field-input')) $_this.parent().addClass('focus');
	});
	$('.form').on('focusout', function (event) {
		var $_this = $(event.target);
		if($_this.hasClass('form__field-input')) $_this.parent().removeClass('focus');
	});


	// кастомизированное текстовое поле input type="text" (form-textline.less)
	$('.form-textline').on('focusin', function (event) {
		$(this).addClass('form-textline--active');
	});
	$('.form-textline').on('focusout', function (event) {
		$(this).removeClass('form-textline--active');
	});
});
//
//
//
//
//
//
//
//
//
// =======================
// = ПОПАП ВЫБОРА ГОРОДА =
// =======================
;$(function () {
	function topGeoModal(a) {
		if(a) {
			$('.top-geo-modal').addClass('top-geo-modal--active');
			$('.top-geo-modal__inner').addClass('top-geo-modal__inner--active');
		}
		else if(!a) {
			$('.top-geo-modal').removeClass('top-geo-modal--active');
			$('.top-geo-modal__inner').removeClass('top-geo-modal__inner--active');
		}
	}

	//
	// Search
	//
	$(document).on('keyup', '.js-top-geo-form__search input', function(e) {
		var $wrap = $(this).closest('[data-wrap]');
		var $next = [];
		var list  = [];
		var query = $.trim($(this).val()); // То что ввели
		var tag = 'span';
		var regex = RegExp('^'+query, 'gi');
		var replacement = '<'+ tag +'>$&</'+ tag +'>';
		var scrollApi = $('.js-top-geo-form__cities').data('jsp');
		var cityName;

		

		if (e.keyCode == 13 && $wrap.find('[data-menu] li').length) {
			// enter
			cityName = $.trim($wrap.find('[data-menu] .active').text());
			set_city(cityName);
			$('.top-geo__button>span').text(cityName); // устанавлмвает в рзамтке в шапке название выбранного города
			$('.top-geo-form__chosen-city-result').text(cityName); // для мобильной версии
			topGeoModal(false); // закрывает окно

			// Посылаем город в корзину, обновляем корзину в шапке
			Z585.basket.requestAPI('setcity', {
				city: cityName,
			}, {
				partial: {
					name: 'topbasket'
				}
			});



			return false;
		}
		else if ($.inArray(e.keyCode, [ 40, 38 ]) != -1) {
			if (e.keyCode == 40) {
				// down
				$next = $wrap.find('[data-menu] .active').next().length ?
					$wrap.find('[data-menu] .active').next() :
					$wrap.find('[data-menu] li').first();
			}

			if (e.keyCode == 38) {
				// up
				$next = $wrap.find('[data-menu] .active').prev().length ?
					$wrap.find('[data-menu] .active').prev() :
					$wrap.find('[data-menu] li').last();
			}

			if ($next.length) {
				$next.addClass('active').siblings().removeClass('active');
			}
		} else {
			$wrap.find('[data-menu] li').remove();

			$('.js-top-geo-form__cities [data-city]').each(function() {
				if ($(this).text().search(regex) != -1) {
					$wrap.find('[data-menu]').append('<li>'+ $(this).text() +'</li>');
				}
			});

			if ($wrap.find('[data-menu] li').length) {
				$wrap.find('[data-menu]').show();
				if ($wrap.find('[data-menu] .active').length == 0) {
					$wrap.find('[data-menu] li').first().addClass('active');
				}
			} else {
				$wrap.find('[data-menu]').hide();
			}
		}

		$('.top-geo-form__pop-cities')[query.length >= 2 ? 'hide':'show']();

		if (query.length < 2) {
			return false;
		}

		$('.js-top-geo-form__cities a[data-city] span').contents().unwrap();

		$('.js-top-geo-form__cities a[data-city]').each(function() {
			if ($(this).text().search(regex) != -1 && scrollApi !== false) {
				scrollApi.scrollToElement(this, true);
				scrollApi = false;
			}

			//выделяет набранный город в списке

			$(this).html(function() {
				return $(this).text().replace(regex, replacement);
			});
		});
	});

	$(document).on('click', '.js-top-geo-form__search [data-menu] li', function(e) {
		var cityName = $.trim($(this).text());

		set_city(cityName);
		$('.top-geo__button>span').text(cityName); // устанавлмвает в рзамтке в шапке название выбранного города
		$('.top-geo-form__chosen-city-result').text(cityName); // для мобильной версии
		topGeoModal(false); // закрывает окно

		// Посылаем город в корзину, обновляем корзину в шапке
		Z585.basket.requestAPI('setcity', {
			city: cityName,
		}, {
			partial: {
				name: 'topbasket'
			}
		});
	});

	// при нажатии на крестик в поиске

	$(document).on('click', '.js-top-geo-form__search [data-btn=clear]', function(e) {
		var $wrap = $(this).closest('[data-wrap]');

		$wrap
			.find('input').val('').end()
			.find('[data-menu]').hide().end();

		$('.top-geo-form__pop-cities').show();

		 // очистка выделенного фрагмента в списке

		$('.js-top-geo-form__cities a[data-city]').html(function() {
			return $(this).text().replace();
		});
		
	});

	$(document).on('submit', '.top-geo-form', function () {
		return false;
	});

	// Открытие окна выбора города

	$(document).on('click', '.top-geo__button, #cityChange', function () {
		topGeoModal(true);
	});

	// Закрытие окна выбора города

	$(document).on('click', '.top-geo-modal__close', function () {
		topGeoModal(false);
	});

	$(document).on('click', '.top-geo-modal', function (event) {
		if($(event.target).hasClass('top-geo-modal')) topGeoModal(false);
	});

	$(document).on('click', '.top-geo-form a', function (event) {
		event.preventDefault();

		var cityName = $(this).text(); //выбранный город

		$('.js-top-geo-form__search input').val("").trigger("keyup"); //очистим город в строке поиска

		// код взаимодейтвия с сервером для установки выбранного города
		set_city(cityName);
		$('.top-geo__button>span').text(cityName); // устанавлмвает в рзамтке в шапке название выбранного города
		$('.top-geo-form__chosen-city-result').text(cityName); // для мобильной версии
		topGeoModal(false); // закрывает окно

		// Посылаем город в корзину, обновляем корзину в шапке
		Z585.basket.requestAPI('setcity', {
			city: cityName,
		}, {
			partial: {
				name: 'topbasket'
			}
		});
	});
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// ====================
// = ПОДБОР УКРАШЕНИЯ =
// ====================
;$(function () {
	var tab = 'index-filter__header',
		$tab = $('.' + tab),
		active = tab + '--active',

		filter = 'filter-mini',
		$filter = $('.' + filter),
		opened = filter + '--opened';

	$tab.on('click', function () {
		if($filter.hasClass(opened)) {
			$filter.removeClass(opened);
			$tab.removeClass(active);
		}
		else {
			$filter.addClass(opened);
			$tab.addClass(active);
		}
	});
});
//
//
//
// =======================
// = ФИЛЬТР ДЛЯ КАТАЛОГА =
// =======================
;$(function() { // фильтр для каталога
	$('.js-filter-group-scroll-pane').jScrollPane({
		autoReinitialise : true,
		verticalDragMinHeight: 9,
		verticalDragMaxHeight: 9,
		horizontalDragMinWidth: 9,
		horizontalDragMaxWidth: 9
	});

	// открытие закрытие фильтра
	$('#catalog-filter-change-button').on('click', function (event) {
		event.preventDefault();
		$('.filter').hasClass('filter--closed') ? $('.filter').removeClass('filter--closed') : $('.filter').addClass('filter--closed');
	});

	// кнопка reset фильтра
	$('#catalog-filter-reset-button').on('click', function (event) {

	});

	// кнопка submit фильтра
	$('#catalog-filter-submit-button').on('click', function (event) {
		event.preventDefault();

		//
		// отправка значений с формы фильтра на сервер
		//

		$('.filter').addClass('filter--closed');
	});

	// кнопка с выбранным тегом поиска
	$('.filter-tags__tab').on('click', function (event) {
		$(this).remove();
	});
});
// Юля Остапенко
$(function(){
	$('#catalog_filter_form .js-scroll-pane').jScrollPane(
		{
			autoReinitialise : true,
			verticalDragMinHeight: 9,
			verticalDragMaxHeight: 9,
			horizontalDragMinWidth: 9,
			horizontalDragMaxWidth: 9
		}
	);
});
//
//
//
// =======================
// = Включение горизонтального скролла на тач устройствах =
// =======================
$(function() {
	if( $('.js-scroll-touch').length > 0 ) {
		if(parseInt(window.innerWidth) < 999) {
			$('.js-scroll-touch').jScrollPane({
				autoReinitialise : true,
			});
		} else {
			$('.js-scroll-touch').jScrollPane().data('jsp').destroy();
		}

		$(window).on('resize', function () {
			if(parseInt(window.innerWidth) < 999) {
				$('.js-scroll-touch').jScrollPane({
					autoReinitialise : true,
				});
			} else {
				$('.js-scroll-touch').jScrollPane().data('jsp').destroy();
			}
		});
	}
});
//
//
//
// ===========================
// = Нижний попап с бонусами =
// ===========================
$(function() {
	var $contentSect = $('.section.content');
	var $bonusCont = $('.footer-bonus');
	var docHeight = $(document).height();
	var contentOffset = $contentSect.length ? $contentSect.offset().top : 0;
	var checkHeight = (docHeight - contentOffset) / 2;
	var bonusCheck = false;
	var bonusCookie = $.cookie('foot-bonus-closed');

	if ($bonusCont.length == 0 || bonusCookie) {
		return false;
	}

	$(window).on('scroll', function() {
		var winScroll = $(window).scrollTop();

		if (bonusCheck === true) {
			return false;
		}

		// если доскролили до середины контента показываем блок и пишем куку на день
		if (winScroll > checkHeight) {
			$bonusCont.fadeIn(250);
			$.cookie('foot-bonus-closed', 'yes', { expires: 1 });
			bonusCheck = true;
		}
	});

	// Закрываем блок, записываем куку на 7 дней
	$('.js-footer-bonus__close').on('click', function () {
		$(this).closest('[data-wrap]').hide();
		$.cookie('foot-bonus-closed', 'yes', { expires: 7 });
	});
});

// ===========================
// = Корзина =
// ===========================
if (window.frameCacheVars !== undefined) {
	BX.addCustomEvent('onFrameDataReceived' , function(json) {
		Z585.basket.init();
	});
} else {
	BX.ready(function() {
		Z585.basket.init();
	});
}
