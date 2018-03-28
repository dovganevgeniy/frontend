<modal name="cart-shops" :adaptive="true" width="900" height="540" @opened="opened">
	<div class="modal__info">
		<div class="modal-shops">
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
					<div class="modal-shops__shopAddress">{{ shop.address }} {{shop.distance}}</div>
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