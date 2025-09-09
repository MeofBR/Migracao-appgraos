jQuery.sap.declare("com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.m.Slider");
jQuery.sap.require("sap.m.SliderRenderer");

sap.m.Slider.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider", {

	renderer: "sap.m.SliderRenderer",
	
	_ontouchend: function(oEvent) {
		
		//Remove os campos ativos do focmulario
		document.activeElement.blur();
		
		var CSS_CLASS = this.getRenderer().CSS_CLASS,
			sEventNamespace = "." + CSS_CLASS;
	
		oEvent.setMarked();
	
		jQuery(document).off(sEventNamespace);
		var fValue = this.getValue();
	
		this.$("inner").removeClass(CSS_CLASS + "Pressed");
	
		if (this._fInitialValue !== fValue) {
			this.fireChange({ value: fValue });
		}
	},
	_ontouchmove: function(oEvent) {
	
			var touch = sap.m.touch;
			
			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent native document scrolling
			//oEvent.preventDefault();

			// suppress the emulated mouse event from touch interfaces
			if (oEvent.isMarked("delayedMouseEvent") ||
				!this.getEnabled() ||

				// detect which mouse button caused the event and only process the standard click
				// (this is usually the left button, oEvent.button === 0 for standard click)
				// note: if the current event is a touch event oEvent.button property will be not defined
				oEvent.button) {

				return;
			}
	
			

			var fMin = this.getMin(),
				fValue = this.getValue(),
				oTouch = touch.find(oEvent.changedTouches, this._iActiveTouchId),	// find the active touch point
				iPageX = oTouch ? oTouch.pageX : oEvent.pageX,
				fNewValue = (((iPageX - this._fDiffX - this._fSliderOffsetLeft) / this._fSliderWidth) * (this.getMax() - fMin)) +  fMin;

			
			// RTL mirror
			if (sap.ui.getCore().getConfiguration().getRTL()) {
				fNewValue = this._convertValueToRtlMode(fNewValue);
			}

			this.setValue(fNewValue);

			// validated value
			fNewValue = this.getValue();

			if (fValue !== fNewValue) {
				this.fireLiveChange({ value: fNewValue });
			}
		},
		ontouchstart: function(oEvent) {
		
			
			if ((oEvent.target.className === "sapMSliderInner" ) || (oEvent.target.className === "sapMSlider" ) || (oEvent.target.className === "sapMSliderProgress" )){
				return;
			}
			
			var touch = sap.m.touch;
			var fMin = this.getMin(),
				oTouch = oEvent.targetTouches[0],
				fNewValue,
				CSS_CLASS = this.getRenderer().CSS_CLASS,
				sEventNamespace = "." + CSS_CLASS;

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();
			// Should be prevent as in Safari while dragging the handle everything else gets selection.
			// As part of the Slider, Inputs in the tooltips should be excluded
			if (oEvent.target.className.indexOf("sapMInput") === -1) {
				oEvent.preventDefault();
			}

			this.focus();

			// only process single touches
			if (touch.countContained(oEvent.touches, this.getId()) > 1 ||
				!this.getEnabled() ||

				// detect which mouse button caused the event and only process the standard click
				// (this is usually the left button, oEvent.button === 0 for standard click)
				// note: if the current event is a touch event oEvent.button property will be not defined
				oEvent.button ||

				// process the event if the target is not a composite control e.g.: a tooltip
				(oEvent.srcControl !== this)) {

				return;
			}

			// track the id of the first active touch point
			this._iActiveTouchId = oTouch.identifier;

			// registers event listeners
			jQuery(document).on("touchend" + sEventNamespace + " touchcancel" + sEventNamespace + " mouseup" + sEventNamespace, this._ontouchend.bind(this))
							.on(oEvent.originalEvent.type === "touchstart" ? "touchmove" + sEventNamespace : "touchmove" + sEventNamespace + " mousemove" + sEventNamespace, this._ontouchmove.bind(this));

			var oNearestHandleDomRef = this.getClosestHandleDomRef();

			if (oTouch.target !== oNearestHandleDomRef) {

				// set the focus to the nearest slider handle
				setTimeout(oNearestHandleDomRef["focus"].bind(oNearestHandleDomRef), 0);
			}

			// recalculate some styles,
			// those values may change when the device orientation changes
			this._recalculateStyles();
			this._fDiffX = this._fSliderPaddingLeft;
			this._fInitialValue = this.getValue();

			// add active state
			this.$("inner").addClass(CSS_CLASS + "Pressed");

			if (oTouch.target === this.getDomRef("handle")) {

				this._fDiffX = (oTouch.pageX - jQuery(oNearestHandleDomRef).offset().left) + this._fSliderPaddingLeft - (this._fHandleWidth / 2);
			} else {

				fNewValue = (((oTouch.pageX - this._fSliderPaddingLeft - this._fSliderOffsetLeft) / this._fSliderWidth) * (this.getMax() - fMin)) +  fMin;

				if (sap.ui.getCore().getConfiguration().getRTL()) {
					fNewValue = this._convertValueToRtlMode(fNewValue);
				}

				// update the value
				this.setValue(fNewValue);

				// new validated value
				fNewValue = this.getValue();

				if (this._fInitialValue !== fNewValue) {
					this.fireLiveChange({ value: fNewValue });
				}
			}
			
			
		}

});



