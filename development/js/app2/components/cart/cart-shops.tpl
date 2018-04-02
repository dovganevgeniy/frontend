<div class="cart-shops-modals">
	<modal 
		name="cart-shops"  
		width="900" 
		height="500" 
		:adaptive="true"
		@opened="opened" 
		v-cloak
	>
		<div class="modal__info" v-if="itemShops">
			<div v-if="itemShops.length == 0" class="modal-shops-empty">
				<div class="modal__header">Упс!</div>

				<p class="modal__info">Выбранного изделия нет в наличии ни в одном магазине</p>

				<button 
					@click.prevent="removeItem" 
					class="modal__button"
				>
					Удалить из корзины
				</button>
			</div>
			<div v-else class="modal-shops">
				<div class="modal-shops__toggles">
					<div :class="{ 'active': activeTab == 'shopList' }" @click.prevent="setTab('shopList')">СПИСКОМ</div>
					<div :class="{ 'active': activeTab == 'map' }"      @click.prevent="setTab('map')">НА КАРТЕ</div>
				</div>

				<div 
					:class="[
						'modal-shops__tabContent',
						'modal-shops__shopList',
						{
							'active': activeTab == 'shopList' || activeTab == 'all'
						}
					]"
				>
					<div class="modal-shops__title">Выберите магазин:</div>

					<div 
						v-for="shop, index in itemShops" 
						@click="selectShop(shop.xml_id)"
						:class="[
							'modal-shops__item',
							{
								'modal-shops__item--active': shopid == shop.xml_id
							}
						]"
					>
						<div class="modal-shops__shopAddress">{{ shop.address }}</div>
						<div class="modal-shops__shopDistance">от меня <span>500 м</span></div>
						<!--
						<span class="red">В наличии</span>
						<div class="modal-shops__day">
							Можно забрать: <span>Сегодня</span>
						</div>
						-->
					</div>
				</div>
				<div
					:class="[
						'modal-shops__tabContent',
						'modal-shops__map',
						{
							'active': activeTab == 'map' || activeTab == 'all'
						}
					]"
				>
					<div class="modal-shops__title">ваш город: <span>{{ city }}</span></div>
					<div id="shops-map" class="shops__map _basket-shops__map"></div>
				</div>
			</div>
		</div>

		<button class="modal__close-but" @click="close(false)"></button>
	</modal>

	<modal name="forget-shops" :adaptive="true" width="500" height="auto" v-cloak>
		<p class="modal__info">Пожалуйста, выберите магазины у всех товаров</p>

		<button @click="$modal.hide('forget-shops')" class="modal__button modal__button--ok">ОК</button>
		<button @click="$modal.hide('forget-shops')" class="modal__close-but"></button>
	</modal>

	<modal name="shop-notavailable" :adaptive="true" width="500" height="auto" v-cloak>
		<p class="modal__info">Некоторых товаров нет в наличии. <br>Пожалуйста, выберите другой магазин</p>

		<button @click="$modal.hide('shop-notavailable')" class="modal__button modal__button--ok">ОК</button>
		<button @click="$modal.hide('shop-notavailable')" class="modal__close-but"></button>
	</modal>
</div>
