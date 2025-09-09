/* global cordova */ 
sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.cropTur.Create", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("cropTur.Create").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false,
				enableSaveCreate: false,
				toggleAdd: true,
				enableFields: true,
				headerExpanded: true,
				sampleRows: [],
				itemsCropYear: [],
				decodeURIComp: {},
				textHeader: "",
				textColumn1: "",
				textColumn2: "",
				textColumn3: "",
				textColumn4: ""
			}), "createModel");
			
		},

		handleRouteMatched: function (oEvent) {
		    var oDeviceModel = this.getOwnerComponent().getModel("device");
		    var bIsMobile = oDeviceModel.getData().browser.mobile;
		    let decodeComponent = JSON.parse(decodeURIComponent(oEvent.getParameter("data").keyData));
		
		    this.HCP_LATITUDE = 0;
		    this.HCP_LONGITUDE = 0;
		
		    const getLocation = () => {
		        if (navigator.geolocation) {
		            navigator.geolocation.getCurrentPosition(
		                function (position) {
		                    var iLat = position.coords.latitude;
		                    var iLong = position.coords.longitude;
		                    var oGeoMap = this.getView().byId("GeoMap");
		
		                    var inputLatLong = this.getView().byId("lat-long");
		                    inputLatLong.setText("Lat/Long: " + iLat + " / " + iLong);
		                    inputLatLong.setVisible(true);
		
		                    this.HCP_LATITUDE = iLat.toString();
		                    this.HCP_LONGITUDE = iLong.toString();
		                }.bind(this),
		                function (error) {
		                    // console.log("Erro ao obter geolocalização: ", error);
		                    sap.m.MessageToast.show("Erro ao encontrar localização");
		                    window.history.go(-1);
		                }.bind(this),
		                {
		                    timeout: 5000,
		                    enableHighAccuracy: true
		                }
		            );
		        } else {
		            // console.log("Geolocalização não suportada ou inicializada");
		            window.history.go(-1);
		        }
		    };
		
		    getLocation();
		
		    let oModel = this.getView().getModel("createModel");
		
		    if (decodeComponent.HCP_MATERIAL == "000000000000013307") {
		    	oModel.setProperty("/textHeader", "Espiga");
		        oModel.setProperty("/textColumn1", "Espigas por 2m");
		 		oModel.setProperty("/textColumn2", "Nº de Fileiras por 2m")
		    	oModel.setProperty("/textColumn3", "Nº de Fileiras por espiga")
				oModel.setProperty("/textColumn4", "Nº de Grãos por Fileiras")
		    } else {
		    	oModel.setProperty("/textHeader", "Vagem");
		        oModel.setProperty("/textColumn1", "Plantas por Metro");
		        oModel.setProperty("/textColumn2", "Linha por Metro");
		        oModel.setProperty("/textColumn3", "Nº de Vagem por Planta");
		        oModel.setProperty("/textColumn4", "Nº de Grãos por Vagem");
		    }
		
		    decodeComponent.HCP_CROP_DESC = decodeComponent.HCP_CROP_ID.split("-")[1];
		    decodeComponent.HCP_CROP_ID = decodeComponent.HCP_CROP_ID.split("-")[0];
		    decodeComponent.HCP_COUNTRY_NAME = decodeComponent.HCP_COUNTRY_ID.split("-")[1];
		    decodeComponent.HCP_COUNTRY_ID = decodeComponent.HCP_COUNTRY_ID.split("-")[0];
		    decodeComponent.HCP_REGIO_NAME = decodeComponent.HCP_REGIO.split("-")[1];
		
		    this.getView().getModel("createModel").setProperty("/decodeURIComp", decodeComponent);
		    
		    this.getUser().then(function (userName) {
		        this.userName = userName;
		    }.bind(this));
		
		    this.getCropYear();
		    
		    this.renderTable();
		    
		    var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (bIsMobile) {
				this.getView().getModel("createModel").setProperty("/isMobile", false);
			} else {
				this.getView().getModel("createModel").setProperty("/isMobile", true);
			}
		},
		
		// getCropTourView: function (data) {
		// 	let oModel = this.getView().getModel()
		// 	let oModelLocal = this.getView().getModel("createModel")
		// 	let aFilters = []
			
		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: 'HCP_COUNTRY',
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: data.HCP_COUNTRY_ID
		// 	}));

		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: 'HCP_CROP',
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: data.HCP_CROP_ID
		// 	}));

		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: 'HCP_STATE',
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: data.HCP_STATE.split("-")[0]
		// 	}));

		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: 'HCP_REGIO',
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: data.HCP_REGIO.split("-")[0]
		// 	}));

		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: 'HCP_MATERIAL',
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: data.HCP_MATERIAL
		// 	}));
			
		// 	return new Promise(function (resolve, reject) {
		// 		oModel.read("/View_CropTur_Media_Collect", {
		// 				filters: aFilters,
		// 				success: function (results) {
		// 					if (results.results.length > 0) {
		// 						oModelLocal.setProperty("/cropTourMediaColeta", results.results)
		// 						resolve()
		// 					}
		// 				}.bind(this),
		// 				error: function (error) {
		// 					reject(error);
		// 				}
		// 			});
		// 	}.bind(this));
		// },
		
		getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        
        renderTable: function() {
		    // Get the container
		    var oContainer = this.getView().byId("html-table");
		    
		    // Clear any existing content first
		    oContainer.destroyItems();
		    
		    // Create the HTML control programmatically
		    var oHtmlControl = new sap.ui.core.HTML({
		        content: '<div>' +
		                 '<table style="width:100%; border-collapse: collapse; border: 1px solid #e5e5e5;">' +
		                 '<thead>' +
		                 '<tr>' +
		                 '<th style="width:14%; border: 1px solid #e5e5e5; text-align: center; padding: 8px; background-color: white;"></th>' +
		                 '<th style="width:28%; border: 1px solid #e5e5e5; text-align: center; padding: 8px; background-color: #f7f7f7;" colspan="2">Planta</th>' +
		                 '<th style="width:28%; border: 1px solid #e5e5e5; text-align: center; padding: 8px; background-color: #f7f7f7;" colspan="2">' + this.getView().getModel("createModel").getProperty("/textHeader") + '</th>' +
		                 '<th style="width:26%; border: 1px solid #e5e5e5; text-align: center; padding: 8px; background-color: #f7f7f7;" colspan="2">Produtividade</th>' +
		                 '<th style="width:4%; border: 1px solid #e5e5e5; text-align: center; padding: 8px; background-color: white;"></th>' +
		                 '</tr>' +
		                 '</thead>' +
		                 '</table>' +
		                 '</div>'
		    });
		    
		    // Add the HTML control to the container
		    oContainer.addItem(oHtmlControl);
		},
        
        getText: function (sText, aVariable = []) {
            return this.getResourceBundle().getText(sText, aVariable);
        },
		
		_validateForm: function () {
			var oModel = this.getView().getModel("createModel");
			var oCropYear = this.byId("cropYear"); 
			
					// setTimeout(function () {
		// 	var aInputControls = this._getFormFields();
		// 	var oControl;

		// 	for (var m = 0; m < aInputControls.length; m++) {
		// 		oControl = aInputControls[m].control;
		// 		if (aInputControls[m].required) {
		// 			var sValue = oControl.getValue();
		// 			if (!sValue || oControl.getValueState() !== 'None') {
		// 				oModel.setProperty("/enableCreate", false);
		// 				return;
		// 			}
		// 		}
		// 	}
		// 	// oModel.setProperty("/enableCreate", true);
		// }.bind(this), 100);
		},
		
		_getFormFields: function () {
			var oMainDataForm = this.byId("cropTurKeysForm").getContent();
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oMainDataForm.length; i++) {
				sControlType = oMainDataForm[i].getMetadata().getName();
				if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
					sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
					sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox") {
					if (oMainDataForm[i].getVisible()) {
						aControls.push({
							control: oMainDataForm[i],
							required: oMainDataForm[i - 1].getRequired && oMainDataForm[i - 1].getRequired(),
							text: oMainDataForm[i - 1].getText
						});
					}
				}
			}
			return aControls;
		},
		
		getCropYear: async function () {
			let oModel = this.getView().getModel()
			let oModelCropYear = this.getView().getModel("createModel")
            let oFilters = [];
            let currentDate = new Date()
				
        	oFilters.push(new sap.ui.model.Filter("HCP_ACTIVE", sap.ui.model.FilterOperator.EQ, "1"));
				
			const listCropYears = await new Promise((resolve, reject) => {
				oModel.read("/Crop_Year", {
					filters: oFilters,
					sorters: [new sap.ui.model.Sorter("HCP_RANGE_START", false)],
					success: function (results) {
						return resolve(results.results)
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Ano da Safra!"));
					}
				})
			})

			if (listCropYears)
			oModelCropYear.setProperty("/itemsCropYear", listCropYears)

		},
		
		navBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			var createModel = this.getView().getModel("createModel");
		    if (createModel) {
		        createModel.setData({});
		        createModel.setProperty("/isMobile", false)
		        createModel.setProperty("/enableSaveCreate", false)
		        createModel.setProperty("/toggleAdd", true)
		        createModel.setProperty("/enableFields", true)
		    }

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}
		},
		
		addNewSample: function () {
		    const oModel = this.getView().getModel("createModel");
		    let aItems = oModel.getProperty("/sampleRows") || [];
			let typeSample
			
			if (aItems.length === 0) {
				typeSample = '1'
			} else if (aItems.length === 1) {
				typeSample = '2'
			} else {
				typeSample = '3'
			}
			
		    const oEmptyRow = {
		        HCP_SAMPLE_TYPE: `Amostra ${typeSample}`,
		        HCP_PER_LINE: 0,
		        HCP_PER_LINE_M2: 0,
		        HCP_QUANTITY: 0,
		        HCP_ROW_COUNT: 0,
		        HCP_GRAIN_COUNT_PER_ROW: 0,
		        HCP_GRAIN_TOTAL: 0,
				HCP_PRODUCTIVITY: 0,
				PROD_MEDIA_AMOSTRA: 0,
				PROD_MEDIA_COLETA: 0
		    };
		    aItems.push(oEmptyRow);
		    
		    
		    // Removendo o limite de 3 
		 //   oModel.setProperty("/sampleRows", aItems);
			// oModel.setProperty("/toggleAdd", true);
		
		    oModel.setProperty("/sampleRows", aItems);
		   	if (aItems.length == 3) {
		    	oModel.setProperty("/toggleAdd", false)
		    } else {
		    	oModel.setProperty("/toggleAdd", true)
		    }
		},
		
		recalculateProductivity: function (oEvent,oType) {
			const oModel = this.getView().getModel("createModel");
		    const oSource = oEvent.getSource();
		    const inputId = oSource.getId()
		    
		    let value = oSource.getValue();

	        if (/[^0-9,]/g.test(value)) {
	        	if (/\./g.test(value)) {
				    oSource.setValueState(sap.ui.core.ValueState.Error);
				    oSource.setValueStateText("Por favor, informe somente vírgula.");
				    return;
				} else {
		            oSource.setValueState(sap.ui.core.ValueState.Error);
		            oSource.setValueStateText("Por favor, informe somente números.");
		            return;
				}
	        } else {
	            oSource.setValueState(sap.ui.core.ValueState.None);
	            oSource.setValueStateText("");
	        }

		    const oRowContext = oSource.getBindingContext("createModel");
		
		    if (oRowContext) {
		        const sPath = oRowContext.getPath();
		        const objSelected = this.getView().getModel("createModel").getProperty(sPath);
		        
		        if (inputId.includes("Espiga")) {
		        	let HCP_PER_LINE = objSelected.HCP_PER_LINE && parseFloat(objSelected.HCP_PER_LINE.replace(',', '.'))
		        	let HCP_PER_LINE_M2 = objSelected.HCP_PER_LINE_M2 && parseFloat(objSelected.HCP_PER_LINE_M2.replace(',', '.'))
		        	
	    			let recalculateCobs = HCP_PER_LINE * HCP_PER_LINE_M2;
	    			objSelected.HCP_QUANTITY = recalculateCobs
		        } else if (inputId.includes("Graos")) {
		        	let HCP_ROW_COUNT = objSelected.HCP_ROW_COUNT && parseFloat(objSelected.HCP_ROW_COUNT.replace(',', '.'))
		        	let HCP_GRAIN_COUNT_PER_ROW = objSelected.HCP_GRAIN_COUNT_PER_ROW && parseFloat(objSelected.HCP_GRAIN_COUNT_PER_ROW.replace(',', '.'))
		        	
		        	let recalculateGrains = HCP_ROW_COUNT * HCP_GRAIN_COUNT_PER_ROW;
		        	objSelected.HCP_GRAIN_TOTAL = recalculateGrains
		        }
		        
	        	this._calcProductivity(objSelected, sPath)
		    }
		},
		
		formatNumberWithoutRounding: function (value) {
		    let strValue = value.toString();
		    if (!strValue.includes('.')) return strValue;
		    
		    let [integerPart, decimalPart] = strValue.split('.');
		    return integerPart + ',' + decimalPart.slice(0, 2);
		},
		
		_calcProductivity: function(objSelected, sPath) {
			const oModel = this.getView().getModel("createModel")
			const oData = oModel.oData
			let calcProd = (((objSelected.HCP_QUANTITY * objSelected.HCP_GRAIN_TOTAL) * 0.7) / 60)
			let calcProdFormated = Math.floor(calcProd * 100) / 100
			let averageProdCollect 
			objSelected.HCP_PRODUCTIVITY = this.formatNumberWithoutRounding(calcProdFormated)
			
			oModel.setProperty(sPath, objSelected);
			
			if (oModel.oData.sampleRows.length > 0 && oModel.oData.sampleRows[0].HCP_PRODUCTIVITY !== 0) {
				const totalProductivity = oData.sampleRows.reduce((acc, obj) => {
				    const productivity = parseFloat(String(obj.HCP_PRODUCTIVITY).replace(',', '.'));
				    return acc + (isNaN(productivity) ? 0 : productivity);
				}, 0);
				const averageProductivity = totalProductivity / oData.sampleRows.length;
				
				// if (oData.cropTourMediaColeta && oData.cropTourMediaColeta.length > 0) {
				// 	let filteredCollect = [
				// 	    ...oData.cropTourMediaColeta,
				// 	    { HCP_PRODUCTIVITY: averageProductivity }
				// 	];
					
				// 	const totalProdCollect = filteredCollect.reduce((acc, obj) => {
				// 	    const productivity = parseFloat(String(obj.HCP_PRODUCTIVITY).replace(',', '.'));
				// 	    return acc + (isNaN(productivity) ? 0 : productivity);
				// 	}, 0);
				// 	averageProdCollect = totalProdCollect / filteredCollect.length;
				// }
				
				oData.sampleRows.forEach(obj => {
				    // obj.PROD_MEDIA_AMOSTRA = averageProductivity.toFixed(2).replace('.', ',');
					obj.PROD_MEDIA_COLETA = this.formatNumberWithoutRounding(averageProductivity) 
				});

				oModel.updateBindings();
				
				oModel.setProperty("/enableSaveCreate", true);
			}
		},
		
		generateUniqueKey: function () {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		},
		
		/**
		 * Gera um ID único mais robusto para evitar conflitos em cenários concorrentes
		 * Mantém o tamanho adequado para o campo HCP_ID (máximo 18 caracteres)
		 */
		generateRobustUniqueId: function (index = 0) {
			// Usa apenas os últimos 10 dígitos do timestamp para economizar espaço
			const timestamp = new Date().getTime();
			const timestampShort = timestamp.toString().slice(-10); // 10 caracteres
			
			const randomPart = Math.floor(Math.random() * 1000); // 3 caracteres (com padding)
			const userHash = this.userName ? this.userName.split('').reduce((a, b) => {
				a = ((a << 5) - a) + b.charCodeAt(0);
				return a & a;
			}, 0) : 0;
			const userHashShort = Math.abs(userHash) % 100; // 2 caracteres (com padding)
			const indexPart = index % 10; // 1 caractere
			
			// Combina: timestamp(10) + userHash(2) + random(3) + index(1) = 16 caracteres
			const robustId = `${timestampShort}${userHashShort.toString().padStart(2, '0')}${randomPart.toString().padStart(3, '0')}${indexPart}`;
			
			// console.log(`🔑 Gerando HCP_ID: ${robustId} (${robustId.length} caracteres)`);
			
			// Garantia extra - se ainda assim ficar muito longo, trunca
			if (robustId.length > 18) {
				const truncatedId = robustId.substring(0, 18);
				// console.warn(`⚠️ HCP_ID truncado de ${robustId.length} para ${truncatedId.length} caracteres: ${truncatedId}`);
				return truncatedId;
			}
			
			return robustId;
		},
		
		setBusyDialog: function (aTitle, aMessage) {
			var timestamp = new Date().getTime();
			if (!this.busyDialog) {
				this.busyDialog = new sap.m.BusyDialog("busyDialogID" + this.getView().getId() + timestamp);
			}
			this.busyDialog.setText(aMessage);
			this.busyDialog.setTitle(aTitle);
			this.busyDialog.open();
		},
		
		closeBusyDialog: function () {
			if (this.busyDialog) {
				this.busyDialog.close();
			}
		},
		
		getCropTur: async function () {
			var oModel = this.getView().getModel();
			var oModelFilters = this.getView().getModel("createModel");
			var oData = oModelFilters.getProperty("/");
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var regio = oData.decodeURIComp.HCP_REGIO.split("-");
			var state = oData.decodeURIComp.HCP_STATE.split("-");
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_COUNTRY',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.decodeURIComp.HCP_COUNTRY_ID
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.decodeURIComp.HCP_CROP_ID
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: state[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_REGIO',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: regio[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.decodeURIComp.HCP_MATERIAL
			}));

			try {
				// Se for dispositivo móvel, sempre busca diretamente da coleção
				if (bIsMobile) {
					const collectionResults = await new Promise((resolve, reject) => {
						oModel.read("/CropTur_Collection", {
							length: '999999',
							filters: aFilters,
							success: function (result) {
								return resolve(result.results);
							}.bind(this),
							error: function (error) {
								return reject(error);
							}
						});
					});
					
					return collectionResults;
				} else {
					// Para desktop, primeiro tenta buscar da View
					const viewResults = await new Promise((resolve, reject) => {
						oModel.read("/View_CropTur_Distinct", {
							length: '999999',
							filters: aFilters,
							success: function (result) {
								return resolve(result.results);
							}.bind(this),
							error: function (error) {
								return reject(error);
							}
						});
					});
					
					// Se encontrou resultados na View, retorna eles
					if (viewResults && viewResults.length > 0) {
						return viewResults;
					}
					
					// Se não encontrou na View, busca diretamente na coleção
					const collectionResults = await new Promise((resolve, reject) => {
						oModel.read("/CropTur_Collection", {
							length: '999999',
							filters: aFilters,
							success: function (result) {
								return resolve(result.results);
							}.bind(this),
							error: function (error) {
								return reject(error);
							}
						});
					});
					
					return collectionResults;
				}
			} catch (error) {
				// console.error("Erro ao buscar CropTour:", error);
				sap.m.MessageToast.show("Falha ao Buscar CropTour.");
				return [];
			}
		},

		
		onDeletePress: function (oEvent) {
		    var oButton = oEvent.getSource();
		    var oBindingContext = oButton.getBindingContext("createModel");
		
		    var sPath = oBindingContext.getPath();
		    var iRowIndex = parseInt(sPath.split("/")[2]);
		
		    var oModel = this.getView().getModel("createModel");
		    var aSampleRows = oModel.getProperty("/sampleRows");
		
		    if (iRowIndex >= 0 && iRowIndex < aSampleRows.length) {
		        aSampleRows.splice(iRowIndex, 1); 
		    }
		    
		    if (aSampleRows.length > 0) {
		        aSampleRows.map((obj, i) => {
		            if (i == 0) {
		                obj.HCP_SAMPLE_TYPE = 'Amostra 1'
		            } else if (i == 1) {
		                obj.HCP_SAMPLE_TYPE = 'Amostra 2'
		            } else if (i == 2) {
		                obj.HCP_SAMPLE_TYPE = 'Amostra 3'
		            }
		        });
		        
		        aSampleRows.forEach((row, index) => {
		            const rowPath = "/sampleRows/" + index;
		            this._calcProductivity(row, rowPath);
		        });
		    } else {
		        oModel.setProperty("/enableSaveCreate", false);
		    }
		
		    oModel.setProperty("/sampleRows", aSampleRows);
		    if (aSampleRows.length == 3) {
		        oModel.setProperty("/toggleAdd", false)
		    } else {
		        oModel.setProperty("/toggleAdd", true)
		    }
		},
		
		onToggleHeader: function() {
			var oModel = this.getView().getModel("createModel");
			var bCurrentState = oModel.getProperty("/headerExpanded");
			oModel.setProperty("/headerExpanded", !bCurrentState);
		},

		onMapIconPress: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			let keyData = {
				lat: this.HCP_LATITUDE,
				long: this.HCP_LONGITUDE
			};

			this.oRouter.navTo("cropTur.Map", {
				keyData: encodeURIComponent(JSON.stringify(keyData)),
			}, false);
		},
		
		onSave: async function (oEvent) {
			return this._saveWithRetry(oEvent, 0);
		},
		
		/**
		 * Método principal de salvamento com mecanismo de retry para evitar conflitos de chaves duplicadas
		 */
		_saveWithRetry: async function (oEvent, retryCount = 0) {
			const maxRetries = 3;
			var aUserName = this.userName;
		    var oSource = oEvent.getSource();
		    var oModel = this.getView().getModel();
		    let maxCollect = 0
		    oModel.setUseBatch(true);
		    
		    // Configurando o grupo diferido
		    var aDeferredGroups = oModel.getDeferredGroups();
		    let groupId = "create_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000);
		    
		    // Adicionando grupo diferido único se ainda não estiver na lista
		    if (aDeferredGroups.indexOf(groupId) < 0) {
		        aDeferredGroups.push(groupId);
		        oModel.setDeferredGroups(aDeferredGroups);
		    }
		    
		    var oCreateModel = this.getView().getModel("createModel");
		    var oData = oCreateModel.oData;
		    var oDeviceModel = this.getOwnerComponent().getModel("device");
		    var bIsMobile = oDeviceModel.getData().browser.mobile;
		    let state = oData.decodeURIComp.HCP_STATE.split("-")[0];
		    let regio = oData.decodeURIComp.HCP_REGIO.split("-")[0];
		    
		    // Obter o valor selecionado do RadioButtonGroup de Previsão de Colheita
		    var oRadioButtonGroup = this.getView().byId("rbgPrevisaoColheita");
		    var selectedIndex = oRadioButtonGroup.getSelectedIndex();
		    var yieldProjection = null;
		    
		    switch(selectedIndex) {
		        case 0:
		            yieldProjection = "10";
		            break;
		        case 1:
		            yieldProjection = "15";
		            break;
		        case 2:
		            yieldProjection = "30";
		            break;
		        default:
		            yieldProjection = "0";
		    }
		    
		    if (retryCount === 0) {
		        this.setBusyDialog("CropTour", "Salvando");
		    } else {
		        this.setBusyDialog("CropTour", `Salvando (tentativa ${retryCount + 1}/${maxRetries + 1})`);
		    }
		    
		    let existCropTur = await this.getCropTur()
		    if (existCropTur.length > 0) {
		        maxCollect = Math.max(...existCropTur.map(item => item.HCP_COLLECT));
		    }
		    
		    // console.log(`🔍 [${bIsMobile ? 'MOBILE' : 'DESKTOP'}] maxCollect encontrado: ${maxCollect} - Tentativa: ${retryCount + 1}`);
		    // console.log(`👤 [${bIsMobile ? 'MOBILE' : 'DESKTOP'}] Usuário: ${aUserName} gerando próximo HCP_COLLECT`);
		    
		    // Gera o próximo número HCP_COLLECT (validação feita pela trigger do banco)
		    const finalValidatedNumber = Number(maxCollect) + 1;
		    
		    // console.log(`✅ [${bIsMobile ? 'MOBILE' : 'DESKTOP'}] Próximo HCP_COLLECT: ${finalValidatedNumber} - Tentativa: ${retryCount + 1}`);
		    
		    // Adiciona delay progressivo entre tentativas para reduzir conflitos
		    // if (retryCount > 0) {
		    //     await new Promise(resolve => setTimeout(resolve, retryCount * 500));
		    // }

			const HCP_GLOBAL_UNIQUE_KEY = this.generateUniqueKey();
			
			// console.log(`🔑 [${bIsMobile ? 'MOBILE' : 'DESKTOP'}] Gerando chaves únicas:`);
			// console.log(`   - HCP_GLOBAL_UNIQUE_KEY (1 por coleta): ${HCP_GLOBAL_UNIQUE_KEY}`);
			// console.log(`   - HCP_COLLECT final: ${finalValidatedNumber}`);
			// console.log(`   - Número de amostras: ${oData.sampleRows.length}`);
			// console.log(`   - GroupId: ${groupId}`);
			
		    oData.sampleRows.forEach((obj,i) => {
		        const sampleUniqueKey = this.generateUniqueKey();
		        const robustId = this.generateRobustUniqueId(i);
		        
		        // console.log(`📝 [${bIsMobile ? 'MOBILE' : 'DESKTOP'}] Criando amostra ${i + 1}/${oData.sampleRows.length}:`);
		        // console.log(`   - HCP_ID: ${robustId} (${robustId.length} chars)`);
		        // console.log(`   - HCP_UNIQUE_KEY: ${sampleUniqueKey}`);
		        // console.log(`   - HCP_SAMPLE_TYPE: ${obj.HCP_SAMPLE_TYPE.split(' ')[1]}`);
		        // console.log(`   - HCP_PRODUCTIVITY: ${obj.HCP_PRODUCTIVITY}`);
		        
		        // Validação de tamanho do HCP_ID
		        if (robustId.length > 20) {
		            // console.warn(`⚠️ [${bIsMobile ? 'MOBILE' : 'DESKTOP'}] AVISO: HCP_ID muito longo (${robustId.length} chars): ${robustId}`);
		        }
		        
		        var aData = {
		            HCP_ID: robustId,
		            HCP_COUNTRY: oData.decodeURIComp.HCP_COUNTRY_ID,
		            HCP_CROP: Number(oData.decodeURIComp.HCP_CROP_ID),
		            HCP_STATE: state,
		            HCP_REGIO: regio,
		            HCP_MATERIAL: oData.decodeURIComp.HCP_MATERIAL,
		            HCP_UNIQUE_KEY: sampleUniqueKey,
					HCP_GLOBAL_UNIQUE_KEY: HCP_GLOBAL_UNIQUE_KEY,
		            HCP_ROW_COUNT: obj.HCP_ROW_COUNT.toString().replace(',', '.'),
		            HCP_GRAIN_COUNT_PER_ROW: obj.HCP_GRAIN_COUNT_PER_ROW.toString().replace(',', '.'),
		            HCP_GRAIN_TOTAL: obj.HCP_GRAIN_TOTAL.toString().replace(',', '.'),
		            HCP_QUANTITY: obj.HCP_QUANTITY.toString().replace(',', '.'),
		            HCP_PER_LINE: obj.HCP_PER_LINE.toString().replace(',', '.'),
		            HCP_PER_LINE_M2: obj.HCP_PER_LINE_M2.toString().replace(',', '.'),
		            HCP_SAMPLE_TYPE: obj.HCP_SAMPLE_TYPE.split(' ')[1],
		            HCP_PRODUCTIVITY: obj.HCP_PRODUCTIVITY.toString().replace(',', '.'),
		            HCP_COLLECT: finalValidatedNumber,
		            HCP_LATITUDE: this.HCP_LATITUDE,
		            HCP_LONGITUDE: this.HCP_LONGITUDE,
		            HCP_YIELD_PROJECTION: yieldProjection,
		            HCP_CREATED_BY: aUserName,
		            HCP_CREATED_AT: new Date()
		        };
		        
		        // console.log(`➕ [${bIsMobile ? 'MOBILE' : 'DESKTOP'}] Adicionando entrada ao modelo para amostra ${i + 1}`);
		        oModel.createEntry("/CropTur_Collection", {
		            properties: aData,
		            groupId: groupId
		        });
		    });
		    
		    // console.log(`🚀 [${bIsMobile ? 'MOBILE' : 'DESKTOP'}] Todas as ${oData.sampleRows.length} amostras preparadas para salvamento com HCP_COLLECT: ${finalValidatedNumber}`);
		    
		    return new Promise((resolve, reject) => {
		    	if ((bIsMobile && navigator.connection.type !== "none")) {
		    		// console.log(`📱 [MOBILE] Iniciando submitChanges com groupId: ${groupId}`);
		    		// console.log(`📱 [MOBILE] Conexão detectada. Tipo: ${navigator.connection.type}`);
		    		
		    		oModel.submitChanges({
				        groupId: groupId,
				        success: function () {
				            // console.log(`✅ [MOBILE] submitChanges SUCESSO! HCP_COLLECT: ${finalValidatedNumber}, Usuário: ${aUserName}`);
				            // console.log(`🔄 [MOBILE] Iniciando flushStore...`);
				            
				            this.flushStore("CropTur_Collection, View_CropTur_Distinct, Country_Croptour, Regions_Croptour, Crop_Year_Croptour_Dist").then(function () {
				                // console.log(`✅ [MOBILE] flushStore concluído com sucesso`);
				                // console.log(`🔄 [MOBILE] Iniciando refreshStore...`);
				                
				                this.refreshStore("CropTur_Collection", "View_CropTur_Distinct", "Country_Croptour", "Regions_Croptour", "Crop_Year_Croptour_Dist", "Adms_Croptour", "Regions_Croptour").then(function () {
				                    // console.log(`✅ [MOBILE] refreshStore concluído com sucesso`);
				                    // console.log(`🎉 [MOBILE] Processo completo! CropTour salvo com HCP_COLLECT: ${finalValidatedNumber}`);
				                    
				                    MessageBox.success(
				                        "CropTour criado com sucesso!", {
				                            actions: [sap.m.MessageBox.Action.OK],
				                            onClose: function (sAction) {
				                                this.closeBusyDialog();
				                                this.navBack();
				                                resolve();
				                            }.bind(this)
				                        }
				                    );
				                }.bind(this)).catch(function(error) {
				                    // console.error(`❌ [MOBILE] Erro no refreshStore:`, error);
				                    // Mesmo com erro no refresh, considera sucesso no salvamento
				                    MessageBox.success(
				                        "CropTour criado com sucesso!", {
				                            actions: [sap.m.MessageBox.Action.OK],
				                            onClose: function (sAction) {
				                                this.closeBusyDialog();
				                                this.navBack();
				                                resolve();
				                            }.bind(this)
				                        }
				                    );
				                }.bind(this));
				            }.bind(this)).catch(function(error) {
				                // console.error(`❌ [MOBILE] Erro no flushStore:`, error);
				                // Mesmo com erro no flush, considera sucesso no salvamento
				                MessageBox.success(
				                    "CropTour criado com sucesso!", {
				                        actions: [sap.m.MessageBox.Action.OK],
				                        onClose: function (sAction) {
				                            this.closeBusyDialog();
				                            this.navBack();
				                            resolve();
				                        }.bind(this)
				                    }
				                );
				            }.bind(this));
				        }.bind(this),
				        error: function (error) {
				            // console.error(`❌ [MOBILE] Erro no submitChanges:`, error);
				            // console.error(`❌ [MOBILE] Detalhes do erro:`, {
				            //     status: error.status,
				            //     statusText: error.statusText,
				            //     responseText: error.responseText,
				            //     message: error.message
				            // });
				            
				            // Verifica se é erro de chave duplicada
				            const isDuplicateKeyError = error && error.responseText && 
				                (error.responseText.includes("-10103") || 
				                 error.responseText.includes("duplicate") ||
				                 error.responseText.includes("Duplicate"));
				            
				            if (isDuplicateKeyError) {
				                // console.log(`🔄 [MOBILE] ERRO DE CHAVE DUPLICADA detectado! HCP_COLLECT tentado: ${finalValidatedNumber}`);
				            }
				            
				            if (isDuplicateKeyError && retryCount < maxRetries) {
				                // console.log(`🔄 [MOBILE] Tentando novamente devido a chave duplicada. Tentativa ${retryCount + 1}/${maxRetries + 1}`);
				                // console.log(`🧹 [MOBILE] Limpando mudanças pendentes no modelo...`);
				                
				                // Limpa as entradas pendentes antes de tentar novamente
				                oModel.resetChanges();
				                
				                // setTimeout(() => {
				                //     console.log(`⏰ [MOBILE] Iniciando nova tentativa após delay...`);
				                //     this._saveWithRetry(oEvent, retryCount + 1).then(resolve).catch(reject);
				                // }, 1000);
				                // console.log(`⏰ [MOBILE] Iniciando nova tentativa após delay...`);
				                this._saveWithRetry(oEvent, retryCount + 1).then(resolve).catch(reject);
				            } else {
				                this.closeBusyDialog();
				                
				                const errorMessage = retryCount >= maxRetries ? 
				                    `Erro ao criar CropTour após ${maxRetries + 1} tentativas. Tente novamente.` :
				                    "Erro ao criar CropTour.";
				                
				                // console.error(`❌ [MOBILE] FALHA DEFINITIVA: ${errorMessage}`);
				                // console.error(`❌ [MOBILE] HCP_COLLECT que falhou: ${finalValidatedNumber}, Usuário: ${aUserName}`);
				                    
				                MessageBox.error(errorMessage, {
				                    actions: [sap.m.MessageBox.Action.OK],
				                    onClose: function (sAction) {
				                        reject(error);
				                    }
				                });
				            }
				        }.bind(this)
				    });
		    	} else {
		    		// console.log(`💻 [DESKTOP] Iniciando submitChanges com groupId: ${groupId}`);
		    		
		    		oModel.submitChanges({
				        groupId: groupId,
				        success: function () {
				            // console.log(`✅ [DESKTOP] submitChanges SUCESSO! HCP_COLLECT: ${finalValidatedNumber}, Usuário: ${aUserName}`);
				            // console.log(`🎉 [DESKTOP] CropTour salvo com sucesso!`);
				            
				            MessageBox.success(
				                "CropTour criado com sucesso!", {
				                    actions: [sap.m.MessageBox.Action.OK],
				                    onClose: function (sAction) {
				                        this.closeBusyDialog();
				                        this.navBack();
				                        resolve();
				                    }.bind(this)
				                }
				            );
				        }.bind(this),
				        error: function (error) {
				            // console.error(`❌ [DESKTOP] Erro no submitChanges:`, error);
				            // console.error(`❌ [DESKTOP] Detalhes do erro:`, {
				            //     status: error.status,
				            //     statusText: error.statusText,
				            //     responseText: error.responseText,
				            //     message: error.message
				            // });
				            
				            // Verifica se é erro de chave duplicada
				            const isDuplicateKeyError = error && error.responseText && 
				                (error.responseText.includes("-10103") || 
				                 error.responseText.includes("duplicate") ||
				                 error.responseText.includes("Duplicate"));
				            
				            if (isDuplicateKeyError) {
				                // console.log(`🔄 [DESKTOP] ERRO DE CHAVE DUPLICADA detectado! HCP_COLLECT tentado: ${finalValidatedNumber}`);
				            }
				            
				            if (isDuplicateKeyError && retryCount < maxRetries) {
				                // console.log(`🔄 [DESKTOP] Tentando novamente devido a chave duplicada. Tentativa ${retryCount + 1}/${maxRetries + 1}`);
				                // console.log(`🧹 [DESKTOP] Limpando mudanças pendentes no modelo...`);
				                
				                // Limpa as entradas pendentes antes de tentar novamente
				                oModel.resetChanges();
				                
				                // setTimeout(() => {
				                //     console.log(`⏰ [DESKTOP] Iniciando nova tentativa após delay...`);
				                //     this._saveWithRetry(oEvent, retryCount + 1).then(resolve).catch(reject);
				                // }, 1000);
				                // console.log(`⏰ [DESKTOP] Iniciando nova tentativa após delay...`);
				                this._saveWithRetry(oEvent, retryCount + 1).then(resolve).catch(reject);
				            } else {
				                this.closeBusyDialog();
				                
				                const errorMessage = retryCount >= maxRetries ? 
				                    `Erro ao criar CropTour após ${maxRetries + 1} tentativas. Tente novamente.` :
				                    "Erro ao criar CropTour.";
				                
				                // console.error(`❌ [DESKTOP] FALHA DEFINITIVA: ${errorMessage}`);
				                // console.error(`❌ [DESKTOP] HCP_COLLECT que falhou: ${finalValidatedNumber}, Usuário: ${aUserName}`);
				                    
				                MessageBox.error(errorMessage, {
				                    actions: [sap.m.MessageBox.Action.OK],
				                    onClose: function (sAction) {
				                        reject(error);
				                    }
				                });
				            }
				        }.bind(this)
				    });
		    	}
		    });
		},
		
	});
});