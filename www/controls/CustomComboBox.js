(function() {
	function isVersionAtLeast(current, required) {
		var c = current.split('.').map(Number);
		var r = required.split('.').map(Number);
		for (var i = 0; i < r.length; i++) {
			if ((c[i] || 0) > r[i]) return true;
			if ((c[i] || 0) < r[i]) return false;
		}
		return true;
	}

	var sVersion = (window.sap && (sap.ui && (sap.ui.version || (sap.ui.getVersionInfo && sap.ui.getVersionInfo().version)))) || "1.71.0";

	if (isVersionAtLeast(sVersion, "1.108.40")) {
		// IMPLEMENTAÇÃO NOVA
		sap.ui.define([
			"sap/m/ComboBox",
			"sap/m/ComboBoxRenderer"
		], function(ComboBox, ComboBoxRenderer) {
			"use strict";

			var bIsMobile = window.fiori_client_appConfig;
			var bIsNewVersion = true;

			if (!bIsMobile && bIsNewVersion) {
				sap.ui.require([
					"sap/m/inputUtils/ListHelpers",
					"sap/m/inputUtils/itemsVisibilityHandler",
					"sap/m/inputUtils/filterItems"
				], function(ListHelpers, itemsVisibilityHandler, filterItems) {
					window.ListHelpers = ListHelpers;
					window.itemsVisibilityHandler = itemsVisibilityHandler;
					window.filterItems = filterItems;
				});
			}

			return ComboBox.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox", {
				renderer: ComboBoxRenderer,

				metadata: {
					library: "sap.m",
					designtime: "sap/m/designtime/ComboBox.designtime",
					properties: {

						/**
						 * Key of the selected item.
						 *
						 * <b>Note:</b> If duplicate keys exist, the first item matching the key is used.
						 */
						selectedKey: {
							type: "string",
							group: "Data",
							defaultValue: ""
						},

						/**
						 * ID of the selected item.
						 */
						selectedItemId: {
							type: "string",
							group: "Misc",
							defaultValue: ""
						},

						/**
						 * Indicates whether the filter should check in both the <code>text</code> and the <code>additionalText</code> property of the
						 * {@link sap.ui.core.ListItem} for the suggestion.
						 * @since 1.46
						 */
						filterSecondaryValues: {
							type: "boolean",
							group: "Misc",
							defaultValue: false
						}
					},
					associations: {

						/**
						 * Sets or retrieves the selected item from the aggregation named items.
						 */
						selectedItem: {
							type: "sap.ui.core.Item",
							multiple: false
						}
					},
					events: {

						/**
						 * This event is fired when the value in the text input field is changed in combination with one of
						 * the following actions:
						 *
						 * <ul>
						 * 	<li>The focus leaves the text input field</li>
						 * 	<li>The <i>Enter</i> key is pressed</li>
						 * </ul>
						 *
						 * In addition, this event is also fired when an item in the list is selected.
						 */
						change: {
							parameters: {

								/**
								 * The new <code>value</code> of the <code>control</code>
								 */
								value: {
									type: "string"
								},

								/**
								 * Indicates whether the change event was caused by selecting an item in the list
								 */
								itemPressed: {
									type: "boolean"
								}
							}
						},

						/**
						 * This event is fired when the user types something that matches with an item in the list;
						 * it is also fired when the user presses on a list item, or when navigating via keyboard.
						 */
						selectionChange: {
							parameters: {

								/**
								 * The selected item.
								 */
								selectedItem: {
									type: "sap.ui.core.Item"
								}
							}
						}
					},
					dnd: {
						draggable: false,
						droppable: true
					}
				},

				oninput: function (oEvent) {
					ComboBox.prototype.oninput.apply(this, arguments);

					this.syncPickerContent();

					// notice that the input event can be buggy in some web browsers,
					// @see sap.m.InputBase#oninput
					if (oEvent.isMarked("invalid")) {
						return;
					}

					var bToggleOpenState = (this.getPickerType() === "Dropdown");

					this.loadItems(function () {

						var oSelectedItem = this.getSelectedItem(),
							sValue = oEvent.target.value,
							bEmptyValue = sValue === "",
							oControl = oEvent.srcControl,
							aVisibleItems;

						if (bEmptyValue && !this.bOpenedByKeyboardOrButton) {
							aVisibleItems = this.getItems();
						} else {
							aVisibleItems = this.filterItems({
								properties: this._getFilters(),
								value: sValue
							});
						}

						//**André Terebinto - Removido o firstItem selected para melhorias no Combo, 
						//**Mudança realizada pois o combo vinha pré selecionadao o valor do primeiro item da lista

						var bItemsVisible = !!aVisibleItems.length;
						//var oFirstVisibleItem = aVisibleItems[0]; // first item that matches the value
						//var bTextMatched = (oFirstVisibleItem && jQuery.sap.startsWithIgnoreCase(oFirstVisibleItem.getText(), sValue));
						//var bSearchBoth = this.getFilterSecondaryValues();
						//var bDesktopPlatform = sap.ui.Device.system.desktop;

						if (!bEmptyValue /*&& oFirstVisibleItem.getEnabled() && oFirstVisibleItem*/ ) {

							/*if (oControl._bDoTypeAhead) {

								if (bSearchBoth && this._oFirstItemTextMatched) {
									oControl.updateDomValue(this._oFirstItemTextMatched.getText());
									//this.setSelection(this._oFirstItemTextMatched);
								} else if (bSearchBoth) {

									if (bTextMatched) {
										oControl.updateDomValue(oFirstVisibleItem.getText());
									} else {
										oControl.updateDomValue(oFirstVisibleItem.getAdditionalText());
									}
									this.setSelection(oFirstVisibleItem);
								} else {
									this.setSelection(oFirstVisibleItem);
								}
							}*/

							if (oSelectedItem !== this.getSelectedItem()) {
								this.fireSelectionChange({
									selectedItem: this.getSelectedItem()
								});
							}

						}

						if (bEmptyValue || !bItemsVisible ||
							(!oControl._bDoTypeAhead && (this._getSelectedItemText() !== sValue))) {

							/*André Terebinto - Adicionado o clearFilter quando nao existe nenhum valor pré selecionado ou filtrado*/
							this.clearFilter();
							this.setSelection(null);

							if (oSelectedItem !== this.getSelectedItem()) {
								this.fireSelectionChange({
									selectedItem: this.getSelectedItem()
								});
							}
						}

						this._sInputValueBeforeOpen = sValue;

						if (this.isOpen()) {
							this._highlightList(sValue);
						}

						if (bItemsVisible) {
							if (bEmptyValue && !this.bOpenedByKeyboardOrButton) {
								this.close();
							} else if (bToggleOpenState) {
								this.open();
								this.scrollToItem(this.getSelectedItem());
							}
						} else if (this.isOpen()) {
							if (bToggleOpenState && !this.bOpenedByKeyboardOrButton) {
								this.close();
							}
						} else {
							this.clearFilter();

						}
					}, {
						name: "input",
						busyIndicator: false
					});

					// if the loadItems event is being processed,
					// we need to open the dropdown list to show the busy indicator
					if (this.bProcessingLoadItemsEvent && bToggleOpenState) {
						this.open();
					}
				},

				onsapfocusleave: function (oEvent) {
					this.bIsFocused = false;
					var oPicker, oRelatedControl, oItem = this.getSelectedItem();
					var valueSelected = (this.getSelectedItem());

					if (sap.ui.Device.system.phone) {
						if ((this.keyBoardValue != undefined) || (valueSelected == null)) {
							if ((this.onKey) || (valueSelected == null)) {
								this.onKey = false;
								if (this.keyBoardValue != valueSelected) {
									this._lastValue = "";
									this.clearFilter();
									this._sInputValueBeforeOpen = "";
									this.updateDomValue("");
									this.setSelection(null);
									this.fireSelectionChange({
										selectedItem: this.getSelectedItem()
									});
									this.synchronizeSelection();
								}
							}
						}
					} else {
						if ((this.getSelectedKey() == "") || (this._lastValue == undefined) || (this._lastValue == "")) {
							if ((oItem == null) || (this.getSelectedText() == "")) {
								this._lastValue = "";
								this._sInputValueBeforeOpen = "";
								this.updateDomValue("");
								this.setSelection(oItem);
								this.fireSelectionChange({
									selectedItem: this.getSelectedItem()
								});
								this.synchronizeSelection();

							}
						}
					}

					if (oItem && this.getFilterSecondaryValues()) {
						this.updateDomValue(oItem.getText());
					}

					ComboBox.prototype.onsapfocusleave.apply(this, arguments);

					if (this.isPickerDialog()) {
						return;
					}

					oPicker = this.getAggregation("picker");

					if (!oEvent.relatedControlId || !oPicker) {
						return;
					}

					oRelatedControl = sap.ui.getCore().byId(oEvent.relatedControlId);

					/*if (containsOrEquals(oPicker.getFocusDomRef(), oFocusDomRef) && !bTablet) {
						// force the focus to stay in the input field
						this.focus();
					}*/
				},
				onkeydown: function (oEvent) {

					var oControl = oEvent.srcControl;
					this.keyBoardValue = this._sInputValueBeforeOpen;
					if (oEvent.target.className != "sapMInputBaseInner") {
						this.onKey = false;
					}

					ComboBox.prototype.onkeydown.apply(oControl, arguments);

					if (!oControl.getEnabled() || !oControl.getEditable()) {
						return;
					}

					var mKeyCode = jQuery.sap.KeyCodes;
					oControl._bDoTypeAhead = (oEvent.which !== mKeyCode.BACKSPACE) && (oEvent.which !== mKeyCode.DELETE);
				},

				syncPickerContent: function () {
					var oPickerTextField,
						oPicker = this.getPicker(),
						aProperties = this.getInputForwardableProperties();

					if (!oPicker) {
						var sSetMutator, sGetMutator;

						oPicker = this.createPicker(this.getPickerType());
						oPickerTextField = this.getPickerTextField();
						this._updateSuggestionsPopoverValueState();

						// Verifica se está em ambiente mobile ou versão antiga
						if (bIsMobile || !bIsNewVersion) {
							this._fillList();
						} else {
							// Usa ListHelpers apenas se não for mobile e for versão nova
							if (window.ListHelpers) {
								window.ListHelpers.fillList(this.getItems(), this._getList(), this._mapItemToListItem.bind(this));
							} else {
								this._fillList();
							}
						}
						
						if (oPickerTextField) {
							aProperties.forEach(function (sProp) {
								sProp = sProp.charAt(0).toUpperCase() + sProp.slice(1);

								sSetMutator = "set" + sProp;
								sGetMutator = "get" + sProp;

								if (oPickerTextField[sSetMutator]) {
									oPickerTextField[sSetMutator](this[sGetMutator]());
								}
							}, this);
						}
					}

					this.synchronizeSelection();

					return oPicker;
				},

				/**
				 * Maps items of <code>sap.ui.core.Item</code> type to <code>sap.m.StandardListItem</code> items.
				 * Só é usado quando não está em ambiente mobile e é versão nova
				 */
				_mapItemToListItem: function (oItem) {
					if (bIsMobile || !bIsNewVersion) {
						return null;
					}

					var oListItem = window.ListHelpers ? window.ListHelpers.createListItemFromCoreItem(oItem, this.getShowSecondaryValues()) : null;

					if (oItem.isA("sap.ui.core.Item")) {
						this.setSelectable(oItem, oItem.getEnabled());
					}

					if (oItem.isA("sap.ui.core.SeparatorItem")) {
						oListItem.addAriaLabelledBy(this._getGroupHeaderInvisibleText().getId());
					}

					oListItem.addStyleClass(this.getRenderer().CSS_CLASS_COMBOBOXBASE + "NonInteractiveItem");

					return oListItem;
				}
			});
		});
	} else {
		// IMPLEMENTAÇÃO ANTIGA
	jQuery.sap.declare("com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox");
		jQuery.sap.require("sap.m.ComboBox");
		jQuery.sap.require("sap.m.ComboBoxRenderer");
		
		sap.m.ComboBox.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox", {
		
			renderer: "sap.m.ComboBoxRenderer",
		
			metadata: {
				library: "sap.m",
				designtime: "sap/m/designtime/ComboBox.designtime",
				properties: {
		
					/**
					 * Key of the selected item.
					 *
					 * <b>Note:</b> If duplicate keys exist, the first item matching the key is used.
					 */
					selectedKey: {
						type: "string",
						group: "Data",
						defaultValue: ""
					},
		
					/**
					 * ID of the selected item.
					 */
					selectedItemId: {
						type: "string",
						group: "Misc",
						defaultValue: ""
					},
		
					/**
					 * Indicates whether the filter should check in both the <code>text</code> and the <code>additionalText</code> property of the
					 * {@link sap.ui.core.ListItem} for the suggestion.
					 * @since 1.46
					 */
					filterSecondaryValues: {
						type: "boolean",
						group: "Misc",
						defaultValue: false
					}
				},
				associations: {
		
					/**
					 * Sets or retrieves the selected item from the aggregation named items.
					 */
					selectedItem: {
						type: "sap.ui.core.Item",
						multiple: false
					}
				},
				events: {
		
					/**
					 * This event is fired when the value in the text input field is changed in combination with one of
					 * the following actions:
					 *
					 * <ul>
					 * 	<li>The focus leaves the text input field</li>
					 * 	<li>The <i>Enter</i> key is pressed</li>
					 * </ul>
					 *
					 * In addition, this event is also fired when an item in the list is selected.
					 */
					change: {
						parameters: {
		
							/**
							 * The new <code>value</code> of the <code>control</code>
							 */
							value: {
								type: "string"
							},
		
							/**
							 * Indicates whether the change event was caused by selecting an item in the list
							 */
							itemPressed: {
								type: "boolean"
							}
						}
					},
		
					/**
					 * This event is fired when the user types something that matches with an item in the list;
					 * it is also fired when the user presses on a list item, or when navigating via keyboard.
					 */
					selectionChange: {
						parameters: {
		
							/**
							 * The selected item.
							 */
							selectedItem: {
								type: "sap.ui.core.Item"
							}
						}
					}
				},
				dnd: {
					draggable: false,
					droppable: true
				}
			},
		
			oninput: function (oEvent) {
				sap.m.ComboBoxBase.prototype.oninput.apply(this, arguments);
		
				this.syncPickerContent();
		
				// notice that the input event can be buggy in some web browsers,
				// @see sap.m.InputBase#oninput
				if (oEvent.isMarked("invalid")) {
					return;
				}
		
				var bToggleOpenState = (this.getPickerType() === "Dropdown");
		
				this.loadItems(function () {
		
					var bIsMobile = window.fiori_client_appConfig;
		
					if (bIsMobile) {
						this.handleInputValidation(oEvent, this.isComposingCharacter());
					}
		
					var oSelectedItem = this.getSelectedItem(),
						sValue = oEvent.target.value,
						bEmptyValue = sValue === "",
						oControl = oEvent.srcControl,
						aVisibleItems;
		
					if (bEmptyValue && !this.bOpenedByKeyboardOrButton) {
						aVisibleItems = this.getItems();
					} else {
						aVisibleItems = this.filterItems({
							properties: this._getFilters(),
							value: sValue
						});
					}
		
					//**André Terebinto - Removido o firstItem selected para melhorias no Combo, 
					//**Mudança realizada pois o combo vinha pré selecionadao o valor do primeiro item da lista
		
					var bItemsVisible = !!aVisibleItems.length;
					//var oFirstVisibleItem = aVisibleItems[0]; // first item that matches the value
					//var bTextMatched = (oFirstVisibleItem && jQuery.sap.startsWithIgnoreCase(oFirstVisibleItem.getText(), sValue));
					//var bSearchBoth = this.getFilterSecondaryValues();
					//var bDesktopPlatform = sap.ui.Device.system.desktop;
		
					if (!bEmptyValue /*&& oFirstVisibleItem.getEnabled() && oFirstVisibleItem*/ ) {
		
						/*if (oControl._bDoTypeAhead) {
		
							if (bSearchBoth && this._oFirstItemTextMatched) {
								oControl.updateDomValue(this._oFirstItemTextMatched.getText());
								//this.setSelection(this._oFirstItemTextMatched);
							} else if (bSearchBoth) {
		
								if (bTextMatched) {
									oControl.updateDomValue(oFirstVisibleItem.getText());
								} else {
									oControl.updateDomValue(oFirstVisibleItem.getAdditionalText());
								}
								this.setSelection(oFirstVisibleItem);
							} else {
								this.setSelection(oFirstVisibleItem);
							}
						}*/
		
						if (oSelectedItem !== this.getSelectedItem()) {
							this.fireSelectionChange({
								selectedItem: this.getSelectedItem()
							});
						}
		
					}
		
					if (bEmptyValue || !bItemsVisible ||
						(!oControl._bDoTypeAhead && (this._getSelectedItemText() !== sValue))) {
		
						/*André Terebinto - Adicionado o clearFilter quando nao existe nenhum valor pré selecionado ou filtrado*/
						this.clearFilter();
						this.setSelection(null);
		
						if (oSelectedItem !== this.getSelectedItem()) {
							this.fireSelectionChange({
								selectedItem: this.getSelectedItem()
							});
						}
					}
		
					this._sInputValueBeforeOpen = sValue;
		
					if (this.isOpen()) {
						this._highlightList(sValue);
					}
		
					if (bItemsVisible) {
						if (bEmptyValue && !this.bOpenedByKeyboardOrButton) {
							this.close();
						} else if (bToggleOpenState) {
							this.open();
							this.scrollToItem(this.getSelectedItem());
						}
					} else if (this.isOpen()) {
						if (bToggleOpenState && !this.bOpenedByKeyboardOrButton) {
							this.close();
						}
					} else {
						this.clearFilter();
		
					}
				}, {
					name: "input",
					busyIndicator: false
				});
		
				// if the loadItems event is being processed,
				// we need to open the dropdown list to show the busy indicator
				if (this.bProcessingLoadItemsEvent && bToggleOpenState) {
					this.open();
				}
			},
		
			onsapfocusleave: function (oEvent) {
				this.bIsFocused = false;
				var oPicker, oRelatedControl, oItem = this.getSelectedItem();
				var valueSelected = (this.getSelectedItem());
		
				if (sap.ui.Device.system.phone) {
					if ((this.keyBoardValue != undefined) || (valueSelected == null)) {
						if ((this.onKey) || (valueSelected == null)) {
							this.onKey = false;
							if (this.keyBoardValue != valueSelected) {
								this._lastValue = "";
								this.clearFilter();
								this._sInputValueBeforeOpen = "";
								this.updateDomValue("");
								this.setSelection(null);
								this.fireSelectionChange({
									selectedItem: this.getSelectedItem()
								});
								this.synchronizeSelection();
							}
						}
					}
				} else {
					if ((this.getSelectedKey() == "") || (this._lastValue == undefined) || (this._lastValue == "")) {
						if ((oItem == null) || (this.getSelectedText() == "")) {
							this._lastValue = "";
							this._sInputValueBeforeOpen = "";
							this.updateDomValue("");
							this.setSelection(oItem);
							this.fireSelectionChange({
								selectedItem: this.getSelectedItem()
							});
							this.synchronizeSelection();
		
						}
					}
				}
		
				if (oItem && this.getFilterSecondaryValues()) {
					this.updateDomValue(oItem.getText());
				}
		
				sap.m.ComboBoxBase.prototype.onsapfocusleave.apply(this, arguments);
		
				if (this.isPickerDialog()) {
					return;
				}
		
				oPicker = this.getAggregation("picker");
		
				if (!oEvent.relatedControlId || !oPicker) {
					return;
				}
		
				oRelatedControl = sap.ui.getCore().byId(oEvent.relatedControlId);
		
				/*if (containsOrEquals(oPicker.getFocusDomRef(), oFocusDomRef) && !bTablet) {
					// force the focus to stay in the input field
					this.focus();
				}*/
			},
			onkeydown: function (oEvent) {
		
				var oControl = oEvent.srcControl;
				this.keyBoardValue = this._sInputValueBeforeOpen;
				if (oEvent.target.className != "sapMInputBaseInner") {
					this.onKey = false;
				}
		
				sap.m.ComboBoxBase.prototype.onkeydown.apply(oControl, arguments);
		
				if (!oControl.getEnabled() || !oControl.getEditable()) {
					return;
				}
		
				var mKeyCode = jQuery.sap.KeyCodes;
				oControl._bDoTypeAhead = (oEvent.which !== mKeyCode.BACKSPACE) && (oEvent.which !== mKeyCode.DELETE);
			},
		
			syncPickerContent: function () {
				var oPickerTextField,
					oPicker = this.getPicker(),
					aProperties = this.getInputForwardableProperties();
		
				if (!oPicker) {
					var sSetMutator, sGetMutator;
		
					oPicker = this.createPicker(this.getPickerType());
					oPickerTextField = this.getPickerTextField();
					this._updateSuggestionsPopoverValueState();
		
					this._fillList();
					if (oPickerTextField) {
						aProperties.forEach(function (sProp) {
							sProp = sProp.charAt(0).toUpperCase() + sProp.slice(1);
		
							sSetMutator = "set" + sProp;
							sGetMutator = "get" + sProp;
		
							if (oPickerTextField[sSetMutator]) {
								oPickerTextField[sSetMutator](this[sGetMutator]());
							}
						}, this);
					}
				}
		
				this.synchronizeSelection();
		
				return oPicker;
			}
		});    
	}
})();