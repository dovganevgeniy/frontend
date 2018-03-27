// Анимированный курсор

(function () {
	'use strict';

	var cursor = Z585.define('Z585.cursor');

	cursor.animateCursor = function() {

		var zone = $('body');
		var xPos;
		var yPos;
		var posObjx;
		var posObjy;
		var scaleVal;
		var mouseOver = false;
		var el = ['2','=','1','='];
		var i = 0;

		var mainmenu = $('.header-menu, .main-nav-item__dropdown');

		mainmenu.hover(
			function() {
				mouseOver = true;
				//console.log(mouseOver);
			},
			function() {
				mouseOver = false;
				//console.log(mouseOver);
			}
		);

		// период появленя элементов

		var timer = setInterval(randomElements, 70);		

		// узнаём положение мышки и сохраняем в переменную

		zone.mousemove(function(event) {

				xPos = event.pageX;
				yPos = event.pageY;
				
		});

		

		function randomElements() {



			if ((xPos - posObjx) == 0 && (yPos - posObjy) == 0 || mouseOver == true) {

				// Если мышь не двигается

 			} else {

 				// Если мышь в движении
 				
 				posObjx = xPos;
      			posObjy = yPos;	
      			scaleVal = 0;

      			//var element = $('<span class="heart"></span>');

      			//console.log(el.length);	

      			if ( i == el.length - 1 ) {
      				var element = $('<span class="cursor-el">'+el[i]+'</span>');
      				zone.append(element);	
      				i = 0;
      			} else {
				  	var element = $('<span class="cursor-el">'+el[i]+'</span>');
      				zone.append(element);	
      				i++;
      			}
      			

      			
				
				// рандомное число от 1 до 10
				var rand = Math.floor((Math.random() * 10) + 1);
				
				element.css({
					'top': yPos - rand,
					'left': xPos - rand
				});

				var p = setTimeout(function() {
					element.addClass('cursor-el-min');
					clearTimeout(p);
				},10);

				var t = setTimeout(function() {
					element.remove();
					clearTimeout(t);
				},2100);

      			//console.log(posObjx+' : '+posObjy);
 			}

 			$('.close-zone').click(function() {
 				mouseOver = false;	
 			});

		}

		
	}

	// запуск функции после загрузки страницы
	$(document).ready(function() {

		//cursor.animateCursor();

	});



} ());