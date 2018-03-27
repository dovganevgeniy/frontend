<div class="cart-wrapper">
	<div class="basket__logo">
		<a href="/">
			<img :src="conf.template + '/frontend/images/top_logo.png'" alt="">
		</a>
	</div>

	<div v-if="!createdOrders">
		<div class="section cart__options">
			<div class="section__inner">
				<a :href="conf.catalogUrl">&lt; вернуться
					<span> к покупкам</span>
				</a>
				<a href="#" class="cart__clearLink" v-if="itemsCount" @click.prevent="showClearConfirm">очистить
					<span> корзину</span>
				</a>
			</div>
		</div>

		<div class="section cart__title">
			<div class="section__inner">
				<h4>Ваша КОРЗИНА</h4>
				<!-- <div class="cart__city">
					Ваш город: Санкт-Петеребург
				</div> -->
			</div>
		</div>
	</div>
	<div v-else>
		<div class="section basket__options">
			<div class="section__inner">
				<a :href="conf.catalogUrl">&lt; перейти в каталог</a>
			</div>
		</div>
		<div class="section basket__title basket__title--step3">
			<div class="section__inner">
				<h4>Благодарим вас за заказ</h4>
				<p v-if="ordersCount > 1">
					Обращаем ваше внимание, что выбранные изделия есть в наличии в разных магазинах вашего города
					<br> и забрать их можно по отдельности по указанным ниже адресам.
				</p>
			</div>
		</div>
	</div>

	<!-- "BASKET-LIST" -->
	<div class="section">
		<div class="section__inner">
			<div class="cart" v-if="!createdOrders">
				<transition-group 
					name="list" 
					tag="div" 
					:class="[
						'cart-list-wrapper',
						{
							'cart-list-wrapper--push': footerFixed
						}
					]" 
				>
					<cart-item 
						v-cloak 
						v-for="item, index in items" 
						:key="item.uuid" 
						:index="index" 
						:uuid="item.uuid" 
						:bxid="item.bxid" 
						:sapcode="item.sapcode" 
						:itemid="item.itemid" 
						:title="item.title" 
						:href="item.href" 
						:img="item.img" 
						:price="item.price" 
						:discount-price="item.discount_price" 
						:total-discount-price="item.total_discount_price" 
						:price-bc="item.price_bc" 
						:shopid="item.shopid" 
						:shop-loading="item.shop_loading" 
						:sanitized-size="item.sanitized_size" 
						:sanitized-price="item.sanitized_price" 
					></cart-item>
				</transition-group>

				<p v-if="itemsCount == 0">Пустая</p>
			</div>
			<div v-else>
				<div class="section basket-finishList">
					<cart-order 
						v-for="(orderItems, orderid, index) in orders" 
						:key="orderid" 
						:orderid="orderid" 
						:index="index" 
						:order-items="orderItems" 
					>
					</cart-order>
				</div>
			</div>
		</div>
	</div>
	<!-- END-of-"BASKET-LIST" -->

	<div 
		v-if="!createdOrders && itemsCount" 
		:class="[
			'cart-total',
			{
				'cart-total--fixed': footerFixed
			}
		]"
	>
		<div class="section__inner">
			<div class="cart-total__row">
				<div 
					:class="[
						'cart-total__price',
						{ 
							'cart-total__price--new': bonusCardCheck || couponCheck
						}
					]"
				>
					<template v-if="bonusCardCheck || couponCheck">
						<small>старая цена:
							<s>{{ data.whole_price | thousandSeparator }}</s>
						</small>
						<i>ИТОГО:</i> {{ data.total_price | thousandSeparator }} Р
						<span>с учетом всех скидок</span>
					</template>
					<template v-else>
						<i>ИТОГО:</i> {{ data.total_price | thousandSeparator }} Р
						<span v-if="discount > 0">ЭКОНОМЬ С БОНУСНОЙ КАРТОЙ <span>-{{ discount | thousandSeparator }} P</span></span>
					</template>
				</div>

				<div class="cart-total__btn">
					<button 
						class="b-button" 
						@click.prevent="checkout" 
						v-scroll-to="'.confirmation-order-wrapper, 0'" 
						v-if="!confirmForm"
					>
						Оформить заказ
					</button>
				</div>
			</div>
			<div class="cart-options">
				<div 
					:class="[
						'cart-options__row',
						{
							'cart-options__row--center': bonusCardCheck
						}
					]">
					<div :class="[ 'cart-options__item cart-options__item--card', { 'is-active': footTab == 'card' } ]">
						<div 
							v-if="bonusCardCheck" 
							:class="[ 
								'cart-options__btn',
								'cart-options__btn--apply',
								{ 'is-disabled': bonusCardCheck }
							]" 
						>
							ВАША БОНУСНАЯ КАРТА:<br> <span>{{ bonusCard }}</span>
							<a href="#" @click.prevent="clearBonusCard">X</a>
						</div>
						<div 
							v-else 
							class="cart-options__btn" 
							@click="setFootTab('card')" 
							v-scroll-to="'.cart-options'"
						>
							<span>У МЕНЯ ЕСТЬ БОНУСНАЯ КАРТА</span>
						</div>

						<div class="cart-options__inner">
							<div class="section__inner">
								<div class="cart-options__row">
									<div>
										<p>
											Введите телефон, указанный
											<br> при регистрации карты
										</p>
									</div>
									<div>
										<div class="cart-options__error" v-if="bonusShowError">Карта не найдена</div>
										<input 
											type="tel" 
											placeholder="+7 (000) 000-00-00" 
											name="cardPhone" 
											v-mask="'+7 (999) 999-99-99'" 
											:value="inputs.cardPhone"
											@keyup="updateInput" 
											@change="updateInput" 
											@keydown.enter="applyBonusCard">
									</div>
									<div>
										<button class="b-button" @click.prevent="applyBonusCard">Применить</button>
									</div>
								</div>
							</div>
						</div>

					</div>

					<div 
						v-if="!bonusCardCheck"
						:class="[ 
							'cart-options__item cart-options__item--noCard', 
							{ 
								'is-active': footTab == 'noCard'
							} 
						]"
					>
						<div 
							class="cart-options__btn" 
							@click="
								setFootTab('noCard');
								includeContent('regForm', {
									js: [
										conf.template +'/js/select2/js/select2.js',
										conf.template +'/js/reg_card.js'
									]
								})
							" 
							v-scroll-to="'.cart-options', 0"
						>
							НЕТ БОНУСНОЙ КАРТЫ?
							<span>ПОЛУЧИ СЕЙЧАС</span>
						</div>

						<div class="cart-options__inner">
							<div class="section__inner">

								<div class="reg-card-form-wrapper" v-html="includes.regForm"></div>

							</div>
						</div>
					</div>

					<div :class="[ 'cart-options__item cart-options__item--promocode', { 'is-active': footTab == 'promocode' } ]">
						<div 
							v-if="couponCheck" 
							class="cart-options__btn cart-options__btn--apply is-disabled"
						>
							промокод учтен:<br> <span>{{ coupon }}</span>
							<a href="#" @click.prevent="clearCoupon">X</a>
						</div>
						<div 
							v-else
							class="cart-options__btn" 
							@click="setFootTab('promocode')" 
							v-scroll-to="'.cart-options', 0"
						>
							<span>У МЕНЯ ЕСТЬ ПРОМОКОД</span>
						</div>

						<div class="cart-options__inner">
							<div class="section__inner">
								<div class="cart-options__row">
									<div></div>
									<div>
										<div class="cart-options__error" v-if="couponShowError">Не верный код</div>
										<input 
											type="text" 
											placeholder="ЕСТЬ ПРОМОКОД? ВВЕДИ"
											name="coupon" 
											:value="inputs.coupon || coupon"
											@input="updateInput">
									</div>
									<div>
										<button class="b-button" @click.prevent="applyCoupon">Применить</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<button 
				class="b-button b-button--checkout" 
				@click.prevent="checkout" 
				v-scroll-to="'.confirmation-order-wrapper, 0'" 
				v-if="!confirmForm"
			>
				Оформить заказ
			</button>
		</div>

		<div class="cart-bonus-success" v-if="footTab == 'noCard'">
			<div class="cart-bonus-success__title">Благодарим вас за регистрацию <br>в бонусной программе лояльности.</div>
			<div class="cart-bonus-success__num">Ваша новая карта: <span>0</span></div>
		</div>
	</div>

	<div class="confirmation-order-wrapper">
		<div class="confirmation-order" v-show="confirmForm && !createdOrders">
			<div class="confirmation-order__title">
				<span>подтверждение заказа</span>
				Введение номера телефона необходимо для подтверждения заказа
			</div>
			<form class="confirmation-order__form">
				<div>
					<input 
						type="tel" 
						placeholder="+7 (000) 000-00-00" 
						name="smsPhone" 
						v-mask="'+7 (999) 999-99-99'" 
						:disabled="smsLock" 
						@keyup="updateInput" 
						@keydown.enter="sendSms">
				</div>
				<div>
					<button class="b-button" v-if="smsLock" disabled>Отправить код повторно через 0:{{ smsCountdown }}</button>
					<button 
						v-else class="b-button" 
						@click.prevent="sendSms" 
						:disabled="inputs.smsPhone.length == 0" 
					>
						отправить проверочный код
					</button>
				</div>
				<div v-if="smsSended">
					<input 
						type="text" 
						placeholder="введите проверочный код из SMS"
						name="smsCode"
						:value="inputs.smsCode"
						@input="updateInput"
						@keyup.enter="sendCheckCode">
				</div>
				<div v-if="smsSended">
					<button 
						class="b-button" 
						@click.prevent="sendCheckCode" 
						:disabled="inputs.smsCode.length == 0"
					>
						подтвердить заказ
					</button>
					<div class="confirmation-order__error" v-if="smsCodeError">Неверный код</div>
				</div>
			</form>
		</div>
	</div>
</div>