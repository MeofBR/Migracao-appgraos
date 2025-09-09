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
			this.oRouter.getTarget("cropTur.Edit").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false,
				enableSave: false,
				toggleAdd: true,
				enableFields: true,
				canEdit: false,
				headerExpanded: true,
				sampleRows: [],
				itemsCropYear: [],
				decodeURIComp: {},
				cropTourMediaColeta: [],
				textColumn1: "",
				textColumn2: "",
				textColumn3: "",
				textColumn4: "",
				deletedSamples: []
			}), "editModel");
		},

		handleRouteMatched: function (oEvent) {
			let oModel = this.getView().getModel("editModel")
			let oData = oModel.oData
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			let totalProdColeta
			let averageProdColeta
			this.setBusyDialog("CropTour", "Buscando Registros");
			
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (bIsMobile) {
				this.getView().getModel("editModel").setProperty("/isMobile", false);
			} else {
				this.getView().getModel("editModel").setProperty("/isMobile", true);
			}
			
			let decodeComponent = JSON.parse(decodeURIComponent(oEvent.getParameter("data").contextData))
			this.getUser().then(async function (userName) {
				this.userName = userName;
				if (this.userName === decodeComponent[0].HCP_CREATED_BY) {
					oModel.setProperty("/canEdit", true)
				} else {
					await this._checkUserHasPermissionToEdit(this.userName)
				}
				
				decodeComponent[0].HCP_COUNTRY_NAME = decodeComponent[0].Crop_Tur_Country.HCP_COUNTRY_NAME
				oModel.setProperty("/decodeURIComp", decodeComponent[0])
				
		        if (decodeComponent[0].HCP_YIELD_PROJECTION) {
		            var oRadioButtonGroup = this.getView().byId("rbgPrevisaoColheita");
		            switch(decodeComponent[0].HCP_YIELD_PROJECTION) {
		                case "10":
		                    oRadioButtonGroup.setSelectedIndex(0);
		                    break;
		                case "15":
		                    oRadioButtonGroup.setSelectedIndex(1);
		                    break;
		                case "30":
		                    oRadioButtonGroup.setSelectedIndex(2);
		                    break;
		                default:
		                    oRadioButtonGroup.setSelectedIndex(-1);
		            }
		            
		            oModel.setProperty("/HCP_YIELD_PROJECTION", decodeComponent[0].HCP_YIELD_PROJECTION);
			        }
				
				if (decodeComponent[0].HCP_MATERIAL == "000000000000013307") {
					oModel.setProperty("/textHeader", "Espiga");
					oModel.setProperty("/textColumn1", "Espigas por 2m")
					oModel.setProperty("/textColumn2", "Nº de Fileiras por 2m")
					oModel.setProperty("/textColumn3", "Nº de Fileiras por espiga")
					oModel.setProperty("/textColumn4", "Nº de Grãos por Fileiras")
				} else {
					oModel.setProperty("/textHeader", "Vagem");
					oModel.setProperty("/textColumn1", "Plantas por Metro")
					oModel.setProperty("/textColumn2", "Linha por Metro")
					oModel.setProperty("/textColumn3", "Nº de Vagem por Planta")
					oModel.setProperty("/textColumn4", "Nº de Grãos por Vagem")
				}
				
				const totalProductivity = decodeComponent.reduce((acc, obj) => acc + Number(obj.HCP_PRODUCTIVITY || 0), 0);
				const averageProductivity = totalProductivity / decodeComponent.length;
				
				// await this.getCropTourView(decodeComponent[0])
				
				// if (oData.cropTourMediaColeta) {
				// 	totalProdColeta = oData.cropTourMediaColeta.reduce((acc, obj) => acc + Number(obj.HCP_PRODUCTIVITY || 0), 0);
				// 	averageProdColeta = totalProdColeta / oData.cropTourMediaColeta.length;
				// }
				
				this.renderTable();
				
				const updatedComponent = decodeComponent.map(obj => ({
				    ...obj,
				    HCP_SAMPLE_TYPE: `Amostra ${obj.HCP_SAMPLE_TYPE}`,
				    HCP_PER_LINE: Number(obj.HCP_PER_LINE).toFixed(2).replace('.', ','),
				    HCP_PER_LINE_M2: Number(obj.HCP_PER_LINE_M2).toFixed(2).replace('.', ','),
				    HCP_ROW_COUNT: Number(obj.HCP_ROW_COUNT).toFixed(2).replace('.', ','),
				    HCP_GRAIN_COUNT_PER_ROW: Number(obj.HCP_GRAIN_COUNT_PER_ROW).toFixed(2).replace('.', ','),
				    HCP_PRODUCTIVITY: Number(obj.HCP_PRODUCTIVITY).toFixed(2).replace('.', ','),
				    isUpdate: true,
				    // PROD_MEDIA_AMOSTRA: averageProductivity ? averageProductivity.toFixed(2).replace('.', ',') : 0,
				    PROD_MEDIA_COLETA: this.formatNumberWithoutRounding(averageProductivity)
				}));
				
				oModel.setProperty("/sampleRows", updatedComponent);
				
				// Definir o estado correto do toggleAdd baseado no número de amostras
				if (updatedComponent.length === 3) {
					oModel.setProperty("/toggleAdd", false);
				} else {
					oModel.setProperty("/toggleAdd", true);
				} 
				
						        this.HCP_LATITUDE = updatedComponent[0].HCP_LATITUDE;
		        this.HCP_LONGITUDE = updatedComponent[0].HCP_LONGITUDE;
		        
		        var inputLatLong = this.getView().byId("lat-long-edit");
				inputLatLong.setText("Lat/Long: "+this.HCP_LATITUDE+" / "+this.HCP_LONGITUDE);
				inputLatLong.setVisible(true);
				
				this.getCropYear();
				this.closeBusyDialog();
			}.bind(this));
		},
		
		// getCropTourView: function (data) {
		// 	let oModel = this.getView().getModel()
		// 	let oModelLocal = this.getView().getModel("editModel")
		// 	let aFilters = []
			
		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: 'HCP_COUNTRY',
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: data.Crop_Tur_Country.HCP_ID
		// 	}));

		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: 'HCP_CROP',
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: data.HCP_CROP.toString()
		// 	}));

		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: 'HCP_STATE',
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: data.HCP_STATE
		// 	}));

		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: 'HCP_REGIO',
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: data.HCP_REGIO
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
		
		_checkUserHasPermissionToEdit: async function (user) {
			const profileData = await this._getUserAdmsCropTour(user);
			this.getView().getModel("editModel").setProperty("/canEdit", profileData)
		},
		
		_getUserAdmsCropTour: function (user) {
			var oModel = this.getOwnerComponent().getModel();
			var oProfile;
	
			return new Promise(function (resolve, reject) {
				var aFilters = [];
				
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_USER_ID",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: user
				}));
				
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_ACTIVE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: '1'
				}));
	
				oModel.read("/Adms_Croptour", {
					filters: aFilters,
					success: function (result) {
						if (result.results.length > 0) {
							resolve(true);
						}else{
							resolve(false);
						}
					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Usuário Adm.");
						reject(false);
					}
				});
	
			}.bind(this));	
		},
		
		_validateForm: function () {
			var oModel = this.getView().getModel("editModel");
			var oCropYear = this.byId("cropYear"); 
			
			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							oModel.setProperty("/enableCreate", false);
							return;
						}
					}
				}
				// oModel.setProperty("/enableCreate", true);
			}.bind(this), 100);
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
		                 '<th style="width:28%; border: 1px solid #e5e5e5; text-align: center; padding: 8px; background-color: #f7f7f7;" colspan="2">' + this.getView().getModel("editModel").getProperty("/textHeader") + '</th>' +
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
			let oModelCropYear = this.getView().getModel("editModel")
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
			var oEditModel = this.getView().getModel("editModel");
			var deletedSamples = oEditModel.getProperty("/deletedSamples") || [];
			
			// Verificar se há alterações pendentes
			if (deletedSamples.length > 0 || oEditModel.getProperty("/enableSave")) {
				MessageBox.confirm(
					"Existem alterações não salvas. Deseja sair sem salvar?", {
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						emphasizedAction: MessageBox.Action.NO,
						onClose: function (sAction) {
							if (sAction === MessageBox.Action.YES) {
								this._navigateBack();
							}
						}.bind(this)
					}
				);
			} else {
				this._navigateBack();
			}
		},
		
		_navigateBack: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("cropTur.List", true);
			}
		},
		
		addNewSample: function () {
		    const oModel = this.getView().getModel("editModel");
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
				isUpdate: false
		    };
		    aItems.push(oEmptyRow);
		
			//Removendo a trava de 3 itens 
			// oModel.setProperty("/sampleRows", aItems);
			// oModel.setProperty("/toggleAdd", true);
			
		    oModel.setProperty("/sampleRows", aItems);
		    oModel.setProperty("/toggleAdd", aItems.length !== 3);
		},
		
		recalculateProductivity: function (oEvent,oType) {
			const oModel = this.getView().getModel("editModel");
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

		    const oRowContext = oSource.getBindingContext("editModel");
		
		    if (oRowContext) {
		        const sPath = oRowContext.getPath();
		        const objSelected = this.getView().getModel("editModel").getProperty(sPath);
		        
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
			const oModel = this.getView().getModel("editModel")
			const oData = oModel.oData
			let calcProd = (((Number(objSelected.HCP_QUANTITY) * Number(objSelected.HCP_GRAIN_TOTAL)) * 0.7) / 60)
			let calcProdFormated = Math.floor(calcProd * 100) / 100
			let averageProdCollect
			objSelected.HCP_PRODUCTIVITY = this.formatNumberWithoutRounding(calcProdFormated)
			
			oModel.setProperty(sPath, objSelected);
			
			if (oData.sampleRows.length > 0) {
				const totalProductivity = oData.sampleRows.reduce((acc, obj) => {
				    const productivity = parseFloat(String(obj.HCP_PRODUCTIVITY).replace(',', '.'));
				    return acc + (isNaN(productivity) ? 0 : productivity);
				}, 0);
				const averageProductivity = totalProductivity / oData.sampleRows.length;
				
				// if (oData.cropTourMediaColeta && oData.cropTourMediaColeta.length > 0) {
				// 	let filteredCollect = oData.cropTourMediaColeta.filter(obj => obj.HCP_COLLECT !== oData.sampleRows[0].HCP_COLLECT)
				// 	filteredCollect = [
				// 	    ...filteredCollect,
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
				
				oModel.setProperty("/enableSave", true);
			}
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
		
		onDeletePress: function (oEvent) {
		    var oButton = oEvent.getSource();
		    var oBindingContext = oButton.getBindingContext("editModel");
		
		    var sPath = oBindingContext.getPath();
		    var iRowIndex = parseInt(sPath.split("/")[2]);
		
		    var oModel = this.getView().getModel("editModel");
		    var aSampleRows = oModel.getProperty("/sampleRows");
		
		    if (aSampleRows[iRowIndex].isUpdate === true) {
		        sap.m.MessageBox.information("Deseja deletar essa amostra?", {
		            icon: sap.m.MessageBox.Icon.WARNING,
		            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
		            onClose: async function (oAction) {
		                if (oAction === "YES") {
		                    // Adicionar o ID da amostra à lista de amostras a serem excluídas
		                    var deletedSamples = oModel.getProperty("/deletedSamples") || [];
		                    deletedSamples.push(aSampleRows[iRowIndex].HCP_ID);
		                    oModel.setProperty("/deletedSamples", deletedSamples);
		                    
		                    // Remover da lista de exibição
		                    if (iRowIndex >= 0 && iRowIndex < aSampleRows.length) {
		                        aSampleRows.splice(iRowIndex, 1);
		                    }
		                    
		                    this._updateSampleList(aSampleRows, oModel);
		                    oModel.setProperty("/enableSave", true);
		                    sap.m.MessageToast.show("Amostra marcada para exclusão. Clique em Salvar para confirmar.");
		                }
		            }.bind(this)
		        });
		    } else {
		        // Para amostras que ainda não foram salvas no backend
		        if (iRowIndex >= 0 && iRowIndex < aSampleRows.length) {
		            aSampleRows.splice(iRowIndex, 1);
		        }
		
		        this._updateSampleList(aSampleRows, oModel);
		    }
		},

		_updateSampleList: function (aSampleRows, oModel) {
		    if (aSampleRows.length > 0) {
		        aSampleRows.forEach((obj, i) => {
		            obj.HCP_SAMPLE_TYPE = `Amostra ${i + 1}`;
		        });
		
		        aSampleRows.forEach((row, index) => {
		            const rowPath = "/sampleRows/" + index;
		            this._calcProductivity(row, rowPath);
		        });
		    } else {
		        oModel.setProperty("/enableSaveCreate", false);
		    }
		
		    oModel.setProperty("/sampleRows", aSampleRows);
		    oModel.setProperty("/toggleAdd", aSampleRows.length !== 3);
		},
		
		
		onSave: function (oEvent) {
			var aUserName = this.userName;
			var sTimestamp = new Date().getTime();
			var oModel = this.getView().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			oModel.setUseBatch(true);
			// Configurando o grupo diferido
			var aDeferredGroups = oModel.getDeferredGroups();
			let groupId = "changes";
			
			// Adicionando 'changes' como um grupo diferido se ainda não estiver na lista
			if (aDeferredGroups.indexOf(groupId) < 0) {
				aDeferredGroups.push(groupId);
				oModel.setDeferredGroups(aDeferredGroups);
			}
		    
		    let listObjNotCreated = []
			
			var oEditModel = this.getView().getModel("editModel");
			var oData = oEditModel.oData;
			this.setBusyDialog("CropTour", "Salvando");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
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
			
			// Processar exclusões pendentes
			var deletedSamples = oEditModel.getProperty("/deletedSamples") || [];
			deletedSamples.forEach(function(sampleId) {
				let sPath = "/CropTur_Collection(" + sampleId + ")";
				oModel.remove(sPath, {
					groupId: groupId
				});
			});
			
			oData.sampleRows.forEach((obj) => {
				if (obj.isUpdate === true) {
			        var aData = {
			            HCP_ROW_COUNT: obj.HCP_ROW_COUNT.toString().replace(',', '.'),
			            HCP_GRAIN_COUNT_PER_ROW: obj.HCP_GRAIN_COUNT_PER_ROW.toString().replace(',', '.'),
			            HCP_GRAIN_TOTAL: obj.HCP_GRAIN_TOTAL.toString(),
			            HCP_QUANTITY: obj.HCP_QUANTITY.toString(),
			            HCP_PER_LINE: obj.HCP_PER_LINE.toString().replace(',', '.'),
			            HCP_PER_LINE_M2: obj.HCP_PER_LINE_M2.toString().replace(',', '.'),
			            HCP_PRODUCTIVITY: obj.HCP_PRODUCTIVITY.toString().replace(',', '.'),
			            HCP_SAMPLE_TYPE: obj.HCP_SAMPLE_TYPE.split(' ')[1],
			            HCP_YIELD_PROJECTION: yieldProjection,
			            HCP_UPDATED_BY: aUserName,
			            HCP_UPDATED_AT: new Date()
			        };
		
					let sPath = "/CropTur_Collection("+ obj.HCP_ID + ")";
					oModel.update(sPath, aData, {
						groupId: groupId
					});
					
				} else {
			        var aData = {
			            HCP_ID: (sTimestamp + Math.floor(Math.random() * 10)).toFixed(),
			            HCP_COUNTRY: oData.decodeURIComp.HCP_COUNTRY,
			            HCP_CROP: oData.decodeURIComp.HCP_CROP,
			            HCP_STATE: oData.decodeURIComp.HCP_STATE,
			            HCP_REGIO: oData.decodeURIComp.HCP_REGIO,
			            HCP_MATERIAL: oData.decodeURIComp.HCP_MATERIAL,
			            HCP_UNIQUE_KEY: this.generateUniqueKey(),
			            HCP_ROW_COUNT: obj.HCP_ROW_COUNT.toString().replace(',', '.'),
			            HCP_GRAIN_COUNT_PER_ROW: obj.HCP_GRAIN_COUNT_PER_ROW.toString().replace(',', '.'),
			            HCP_GRAIN_TOTAL: obj.HCP_GRAIN_TOTAL.toString(),
			            HCP_QUANTITY: obj.HCP_QUANTITY.toString(),
			            HCP_PER_LINE: obj.HCP_PER_LINE.toString().replace(',', '.'),
			            HCP_PER_LINE_M2: obj.HCP_PER_LINE_M2.toString().replace(',', '.'),
			            HCP_SAMPLE_TYPE: obj.HCP_SAMPLE_TYPE.split(' ')[1],
			            HCP_PRODUCTIVITY: obj.HCP_PRODUCTIVITY.toString().replace(',', '.'),
			            HCP_COLLECT: oData.decodeURIComp.HCP_COLLECT,
			            HCP_CREATED_BY: aUserName,
			            HCP_CREATED_AT: new Date()
			        };
	
			        oModel.createEntry("/CropTur_Collection", {
			            properties: aData,
			            groupId: groupId
			        });
				}
			});
			
			if ((bIsMobile && navigator.connection.type !== "none")) {
					oModel.submitChanges({
						groupId: groupId,
						success: function () {
							oEditModel.setProperty("/deletedSamples", []);
							
							this.flushStore("CropTur_Collection, View_CropTur_Distinct, Country_Croptour, Regions_Croptour, Crop_Year_Croptour_Dist").then(function () {
								this.refreshStore("CropTur_Collection", "View_CropTur_Distinct", "Country_Croptour", "Regions_Croptour", "Crop_Year_Croptour_Dist", "Adms_Croptour", "Regions_Croptour").then(function () {
									MessageBox.success(
										"CropTour modificado com sucesso!", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												// Limpar flag de alterações pendentes
												oEditModel.setProperty("/enableSave", false);
												this._navigateBack();
												this.closeBusyDialog();
											}.bind(this)
										}
									);
								}.bind(this));
							}.bind(this));
						}.bind(this),
						error: function () {
							MessageBox.success(
								"Erro ao atualizar CropTour.", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
									}.bind(this)
								}
							);
						}.bind(this)
					});
			} else {
				oModel.submitChanges({
						groupId: groupId,
						success: function () {
							oEditModel.setProperty("/deletedSamples", []);
							MessageBox.success(
								"CropTour modificado com sucesso!", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										// Limpar flag de alterações pendentes
										oEditModel.setProperty("/enableSave", false);
										this._navigateBack();
										this.closeBusyDialog();
									}.bind(this)
								}
							);
						}.bind(this),
						error: function () {
							MessageBox.success(
								"Erro ao atualizar CropTour.", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
									}.bind(this)
								}
							);
						}.bind(this)
					});
			}
		
		},
		onToggleHeader: function() {
			var oModel = this.getView().getModel("editModel");
			var bCurrentState = oModel.getProperty("/headerExpanded");
			oModel.setProperty("/headerExpanded", !bCurrentState);
		},

		onPrevisaoColheitaSelect: function(oEvent) {
		    var selectedIndex = oEvent.getParameter("selectedIndex");
		    var dias = null;
		    
		    switch(selectedIndex) {
		        case 0:
		            dias = 10;
		            break;
		        case 1:
		            dias = 15;
		            break;
		        case 2:
		            dias = 30;
		            break;
		        default:
		            dias = null;
		    }
		    
		   this.getView().getModel("editModel").setProperty("/HCP_YIELD_PROJECTION", dias);
		   this.getView().getModel("editModel").setProperty("/enableSave", true);
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
		generateUniqueKey: function () {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		}
		
		
	});
});