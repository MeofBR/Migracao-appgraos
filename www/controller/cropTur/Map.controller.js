sap.ui.define([
    "com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
    "use strict";

    return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.cropTur.Index", {
        formatter: formatter,
        onInit: function () {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getTarget("cropTur.Map").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
            this.getView().setModel(this.getOwnerComponent().getModel());
            this.getView().setModel(new sap.ui.model.json.JSONModel(), "cropTurModel");
            
            var oComponent = this.getOwnerComponent();
            var oDeviceModel = oComponent.getModel("device");
            this.getView().setModel(oDeviceModel, "device");
            var bIsMobile = oDeviceModel.getData().browser.mobile;
            
            this.getUser().then(function (userName) {
                this.userName = userName;
            }.bind(this));
        },

        handleRouteMatched: function (oEvent) {
            var oParameters = oEvent.getParameter("data");
            var oKeyData = JSON.parse(decodeURIComponent(oParameters.keyData));
            
            this.getView().setModel(new sap.ui.model.json.JSONModel({
                checkInOn: true,
                textButtonCheckIn: "Realizar Check-In"
            }), "cropTurModel");

            // Configuração atualizada do HERE Maps
            var oGeoMap = this.getView().byId("GeoMap");
            var oMapConfig = {
                "MapProvider": [{
                    "name": "HEREMAPS",
                    "type": "",
                    "description": "",
                    "tileX": "256",
                    "tileY": "256",
                    "maxLOD": "20",
                    "copyright": "Tiles Courtesy of HERE Maps",
                    "Source": [{
                        "id": "s1",
                        "url": "https://maps.hereapi.com/v3/base/mc/{LOD}/{X}/{Y}/png8?apiKey=GBbgU5wK1E9FNRKVZ4BSBcqEdyohjTbiP0pVxvRiQP0&style=explore.day"
                    }, {
                        "id": "s2",
                        "url": "https://maps.hereapi.com/v3/base/mc/{LOD}/{X}/{Y}/png8?apiKey=GBbgU5wK1E9FNRKVZ4BSBcqEdyohjTbiP0pVxvRiQP0&style=explore.day"
                    }]
                }],
                "MapLayerStacks": [{
                    "name": "DEFAULT",
                    "MapLayer": {
                        "name": "layer1",
                        "refMapProvider": "HEREMAPS",
                        "opacity": "1.0",
                        "colBkgnd": "RGB(255,255,255)"
                    }
                }]
            };

            // Configurar e inicializar o mapa
            oGeoMap.setMapConfiguration(oMapConfig);
            oGeoMap.setRefMapLayerStack("DEFAULT");

            this.oKeyData = oKeyData;
            
            // Configurar modelos
            this.getView().setModel(new sap.ui.model.json.JSONModel({
                data: this.oKeyData
            }), "cropTurModalModel");

            var modalModel = this.getView().getModel("cropTurModalModel");
            var modalData = modalModel.oData.data;
            var oPlanningModel = this.getView().getModel("cropTurModel");

            // Atualizar coordenadas
            oPlanningModel.setProperty("/lat", oKeyData.lat);
            oPlanningModel.setProperty("/long", oKeyData.long);
        },

        onCloseCancel: function () {
            if (this._oCheckOutDialog) {
                this._oCheckOutDialog.close();
            }
        },

        backToTheMaster: function () {
            var oSplitApp = this.getView().byId("SplitContDemo");
            oSplitApp.backMaster();
        },

        backToIndex: function () {
            if (this.isEdit) {
                this.oRouter.navTo("cropTur.Edit", {
                    keyData: encodeURIComponent(JSON.stringify(this.oKeyData))
                }, false);
            } else {
                var ocropTurModel = this.getView().getModel("cropTurModel");
                var oData = ocropTurModel.oData;

                this.oRouter.navTo("cropTur.New", {
                    keyData: encodeURIComponent(JSON.stringify(oData))
                }, false);
            }
        },

        navBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Index", true);
            }
        }
    });
}, /* bExport= */ true);