jQuery(function ($) {
	var socket 				  = io.connect(),
		mayMove               = false,
		mayScroll             = false,
		epicBoxElement        = $('.epicBox'),
		dragElement           = $('.mouse'),
		descriptionElem       = $('.description'),
		scrollDescriptionElem = $('.scrollDescription'),
		scrollingBoxElem      = $('.scrollBox'),
		mouseOwner            = false,
		mouseClass            = '',
		scrollTimer           = false,
		scrollOwner           = false,
		myLastScrollPosition  = {}
	;

	$(document).bind("contextmenu", function () {
    	return false;
    });

	function handleMayMove(mayIMove) {
		if (mayIMove || mouseOwner) {
			dragElement.draggable({
				disabled: false,
				containment: 'parent',
				cursorType: 'move',
				start: function() {
					mouseOwner = true;
					descriptionElem.text('Your mouse move is now broadcasting');
					socket.emit('changeMayMove', false);
				},
				drag: function(drag, helper) {
					socket.emit('castMove', helper.position);
				},
				stop: function() {
					mouseOwner = false;
					socket.emit('changeMayMove', true);
					descriptionElem.text('Drag mouse to broadcast it');
				}
			})
			epicBoxElement.bind('mousedown', function (e) {
				e.preventDefault();
				mouseClass = 'mouseLeftClick';
				switch (e.which) {
					case 2:
						mouseClass = 'mouseScroll';
					break;
					case 3:
						mouseClass = 'mouseRightClick';
					break;
				}

				dragElement.addClass(mouseClass);

				socket.emit('castClick', mouseClass);
			}).bind('mouseup', function (e) {
				e.preventDefault();
				
				dragElement.removeClass(mouseClass);
				socket.emit('undoCastClick', mouseClass);
				mouseClass = '';
			});
		} else {
			dragElement.draggable( 
				{ 
					disabled: true 
				} 
			).unbind('mousedown mouseup DOMMouseScroll mousewheel');
			descriptionElem.text('The mouse is broadcasted by someone else, wait till he stops');
		}
	}

	socket.on('mayMove', function (boolMayMove, lastMousePosition) {
		mayMove = boolMayMove;
		handleMayMove(mayMove);

		if (mayMove) {
			descriptionElem.text('Drag mouse to broadcast it');
		}

		dragElement.fadeIn();
		if (lastMousePosition !== undefined && lastMousePosition.left !== undefined && lastMousePosition.top !== undefined) {
			dragElement.css({ 'left' : lastMousePosition.left, 'top' : lastMousePosition.top});
		}
	});

	socket.on('castMove', function(position) {
		if (!mayMove && !mouseOwner) {
			dragElement.css({ 'left' : position.left, 'top' : position.top});
		}
	});

	function handleScroll(mayIScroll) {

		if (mayIScroll || scrollOwner) {
			scrollingBoxElem
			.bind('scroll DOMMouseScroll mousewheel', function (e) {
				scrollOwner = true;
				clearTimeout(scrollTimer);
				//e.preventDefault();
				scrollDescriptionElem.text('Your now broadcasting your scrolling');

				socket.emit('changeMayScroll', false);
				var scrollPosition = {
					top: scrollingBoxElem.scrollTop(),
					left: scrollingBoxElem.scrollLeft()
				};

				if ( myLastScrollPosition.top === undefined || scrollPosition.top !== myLastScrollPosition.top || scrollPosition.left !== myLastScrollPosition.left) {
					myLastScrollPosition = scrollPosition;
					socket.emit('castScroll', scrollPosition);
				}

				scrollTimer = setTimeout(function () {
					scrollDescriptionElem.text('Scroll to broadcast it');

					socket.emit('changeMayScroll', true);
					setTimeout(function () {
						scrollOwner = false;
					}, 1500);
				}, 1500);
			});
		} else {
			scrollingBoxElem.unbind('scroll DOMMouseScroll mousewheel');
			scrollDescriptionElem.text('The mouse is broadcasted by someone else, wait till he stops');
		}
	}

	socket.on('castClick', function (mouseClass) {
		dragElement.addClass(mouseClass);
	});

	socket.on('undoCastClick', function (mouseClass) {
		dragElement.removeClass(mouseClass);
	});

	socket.on('mayScroll', function (boolMayScroll, lastScrollPosition) {
		mayScroll = boolMayScroll;
		handleScroll(mayScroll);

		if (mayScroll) scrollDescriptionElem.text('Scroll to broadcast it');
	});

	socket.on('castScroll', function(position) {
		if (!mayScroll && !scrollOwner) {			
			scrollingBoxElem.scrollTop(position.top);
			scrollingBoxElem.scrollLeft(position.left);
		}
	});
})