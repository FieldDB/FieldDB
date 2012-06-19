// Backbone.ModalDialog.js v0.2
//
// Copyright (C)2012 Gareth Elms
// Distributed under MIT License
//
// Documentation and full license availabe at:
// https://github.com/GarethElms/BackboneJSModalView

var ModalView =
    Backbone.View.extend(
    {
        name: "ModalView",
        modalBlanket: null,
        modalContainer: null,
        defaultOptions:
		{
			fadeInDuration:150,
			fadeOutDuration:150,
			showCloseButton:true,
			bodyOverflowHidden:false,
            setFocusOnFirstFormControl:true,
            targetContainer: document.body,
            slideFromAbove: false,
            slideFromBelow: false,
            slideDistance: 150,
			closeImageUrl: "close-modal.png",
			closeImageHoverUrl: "close-modal-hover.png",
            css:
            {
                "border": "2px solid #111",
			    "background-color": "#fff",
			    "-webkit-box-shadow": "0px 0px 15px 4px rgba(0, 0, 0, 0.5)",
			    "-moz-box-shadow": "0px 0px 15px 4px rgba(0, 0, 0, 0.5)",
			    "box-shadow": "0px 0px 15px 4px rgba(0, 0, 0, 0.5)",
                "-webkit-border-radius": "10px",
                "-moz-border-radius": "10px",
                "border-radius": "10px"
            }
		},

        initialize:
            function()
            {
            },
        events:
            {
            },
       
        showModalBlanket:
            function()
            {
                return this.ensureModalBlanket().fadeIn( this.options.fadeInDuration);
            },

        hideModalBlanket:
            function()
            {
                return this.modalBlanket.fadeOut( this.options.fadeOutDuration);
            },

        ensureModalContainer:
            function( target)
            {
                if( target != null)
                {
                    // A target is passed in, we need to re-render the modal container into the target.
                    if( this.modalContainer != null)
                    {
                        this.modalContainer.remove();
                        this.modalContainer = null;
                    }
                }

                if( this.modalContainer == null)
                {
                    this.modalContainer =
                        $("<div id='modalContainer'>")
                            .css({
                                "z-index":"99999",
                                "position":"relative",
                                "-webkit-border-radius": "6px",
                                "-moz-border-radius": "6px",
                                "border-radius": "6px"
                                })
                            .appendTo( target);
                }

                return this.modalContainer;
            },

        ensureModalBlanket:
            function()
            {
                this.modalBlanket = $("#modal-blanket");

                if( this.modalBlanket.length == 0)
                {
                    this.modalBlanket =
                        $("<div id='modal-blanket'>")
                            .css(
                                {
                                    position: "absolute",
                                    top: $(document).scrollTop(), // Use document scrollTop so it's on-screen even if the window is scrolled
                                    left: 0,
                                    height: $(document).height(), // Span the full document height...
                                    width: "100%", // ...and full width
                                    opacity: 0.5, // Make it slightly transparent
                                    backgroundColor: "#000",
                                    "z-index": 99900
                                })
                            .appendTo( document.body)
                            .hide();
                }

                return this.modalBlanket;
            },

        keyup:
            function( event)
            {
                if( event.keyCode == 27)
                {
                    this.hideModal();
                }
            },

        click:
            function( event)
            {
                if( event.target.id == "modal-blanket")
                {
                    this.hideModal();
                }
            },

        setFocusOnFirstFormControl:
            function()
            {
                var controls = $("input, select, email, url, number, range, date, month, week, time, datetime, datetime-local, search, color", $(this.el));
                if( controls.length > 0)
                {
                    $(controls[0]).focus();
                }
            },

        hideModal:
            function()
            {
                this.trigger( "closeModalWindow");
                this.hideModalBlanket();
                $(document.body).unbind( "keyup", this.keyup);
                $(document.body).unbind( "click", this.click);

                if( this.options.bodyOverflowHidden === true)
                {
                    $(document.body).css( "overflow", this.originalBodyOverflowValue);
                }

                var container = this.modalContainer;
                $(this.modalContainer)
                    .fadeOut(
                        this.options.fadeOutDuration,
                        function()
                        {
                            container.remove();
                        });
            },

        getCoordinate:
            function( coordinate, css)
            {
                if( typeof( css[coordinate]) !== "undefined")
                {
                    var value = css[coordinate];
                    delete css[coordinate]; // Don't apply positioning to the $el, we apply it to the modal container. Remove it from options.css

                    return value;
                }
            },

        showModal:
            function( options)
            {
                this.defaultOptions.targetContainer = document.body;
                this.options = $.extend( true, {}, this.defaultOptions, options);

                //Set the center alignment padding + border see css style
                var $el = $(this.el);

				var centreY = $(window).height() / 2;
                var centreX = $(window).width() / 2;
                var modalContainer = this.ensureModalContainer( this.options.targetContainer).empty();

		        $el.addClass( "modal");

                var coords = {
                    top: this.getCoordinate( "top", this.options.css),
                    left: this.getCoordinate( "left", this.options.css),
                    right: this.getCoordinate( "right", this.options.css),
                    bottom: this.getCoordinate( "bottom", this.options.css),
                    isEmpty: function(){return (this.top == null && this.left == null && this.right == null && this.bottom == null);}
                    };

				$el.css( this.options.css);

                this.showModalBlanket();
                this.keyup = _.bind( this.keyup, this);
                this.click = _.bind( this.click, this);
                $(document.body).keyup( this.keyup); // This handler is unbound in hideDialog()
                $(document.body).click( this.click); // This handler is unbound in hideDialog()

                if( this.options.bodyOverflowHidden === true)
                {
                    this.originalBodyOverflowValue = $(document.body).css( "overflow");
                    $(document.body).css( "overflow", "hidden");
                }

                modalContainer
                    .append( $el);

                modalContainer.css({
                        "opacity": 0,
                        "position": "absolute",
                        "z-index": 999999});

                // Only apply default centre coordinates if no css positions have been supplied
                if( coords.isEmpty())
                {
                    var positionY = centreY  - ($el.outerHeight() / 2);
					// Overriding the coordinates with explicit values if they are passed in
                    if( typeof( this.options.y) !== "undefined"){positionY = this.options.y;}
                    modalContainer.css({"top": positionY + "px"});

                    var positionX = centreX - ($el.outerWidth() / 2);
					// Overriding the coordinates with explicit values if they are passed in
                    if( typeof( this.options.x) !== "undefined"){ positionX = this.options.x;}
                    modalContainer.css({"left": positionX + "px"});
                }
                else
                {
                    if( coords.top != null) modalContainer.css({"top": coords.top});
                    if( coords.left != null) modalContainer.css({"left": coords.left});
                    if( coords.right != null) modalContainer.css({"right": coords.right});
                    if( coords.bottom != null) modalContainer.css({"bottom": coords.bottom});
                }

                if( this.options.setFocusOnFirstFormControl)
                {
                    this.setFocusOnFirstFormControl();
                }

                if( this.options.showCloseButton)
                {
                    var view = this;
                    var image =
                        $("<a href='#' id='modalCloseButton'>&#160;</a>")
                            .css({
									"position":"absolute",
									"top":"-10px",
									"right":"-10px",
									"width":"32px",
									"height":"32px",
									"background":"transparent url(" + view.options.closeImageUrl + ") top left no-repeat",
									"text-decoration":"none"})
                            .appendTo( this.modalContainer)
                            .hover(
                                function()
                                {
                                    $(this).css( "background-image", "url(" + view.options.closeImageHoverUrl + ") !important");
                                },
                                function()
                                {
                                    $(this).css( "background-image", "url(" + view.options.closeImageUrl + ") !important");
                                })
                            .click(
                                function( event)
                                {
                                    event.preventDefault();
                                    view.hideModal();
                                });
                }

                var animateProperties = {opacity:1};
                var modalOffset = modalContainer.offset();
                    
                if( this.options.slideFromAbove)
                {
                    modalContainer.css({"top": (modalOffset.top - this.options.slideDistance) + "px"});
                    animateProperties.top = coords.top;
                }

                if( this.options.slideFromBelow)
                {
                    modalContainer.css({"top": (modalOffset.top + this.options.slideDistance) + "px"});
                    animateProperties.top = coords.top;
                }

                this.modalContainer.animate( animateProperties, this.options.fadeInDuration);
            }
    });