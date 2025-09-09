sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.warehouseMap.Images", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("warehouseMap.Images").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableSave: false,
				imageCounter: 0
			}), "imagesModel");
		},

		handleRouteMatched: function (oEvent) {
			var oParameters = oEvent.getParameter("data");
			var oKeyData = JSON.parse(decodeURIComponent(oParameters.keyData));
			var sOperation = oParameters.operation;
			this.isEdit = false;

			this.oKeyData = oKeyData;

			if (oKeyData.isEdit) {
				this.isEdit = true;
			}

			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			this.newImages = [];
			this.deletedImages = [];
			this.clearImages();
			this.initializeRepository(oKeyData);
		},

		clearImages: function () {
			for (var index = 1; index < 5; index++) {
				var oImg = this.getView().byId("img" + index);
				var oImgCarousel = this.getView().byId("imgCarousel" + index);

				oImg.setSrc("");
				oImgCarousel.setSrc("");
			}

			this.getView().getModel("imagesModel").setProperty("/imageCounter", 0);
		},

		initializeRepository: function (oKeyData) {
			var oImagesModel = this.getView().getModel("imagesModel");
			this.sKey = oKeyData["HCP_UNIQUE_KEY"].toString();

			this.setBusyDialog("Repositório", "Carregando Informações");
			this.verifyRepositoryExistance().then(function () {
				this.getFolder(this.sKey).then(function (oData) {
					this.setImages(oData).then(function () {
						this.closeBusyDialog();
					}.bind(this)).catch(function () {
						this.closeBusyDialog();
					}.bind(this));
					console.log(oData);
				}.bind(this)).catch(function () {
					sap.m.MessageToast.show("falha ao buscar repositório");
					this.closeBusyDialog();
				}.bind(this));
			}.bind(this)).catch(function () {
				sap.m.MessageToast.show("falha ao buscar repositório");
				this.closeBusyDialog();
			}.bind(this));
		},

		verifyRepositoryExistance: function () {
			return new Promise(function (resolve, reject) {
				this.getFolder(this.sKey).then(function (response) {
					resolve();
				}.bind(this)).catch(function (error) {
					if (error.responseJSON.exception === "objectNotFound") {
						this.createFolder(this.sKey).then(function () {
							resolve();
						}.bind(this)).catch(function (error) {
							sap.m.MessageToast.show("falha ao criar pasta do acompanhamento");
							reject();
						}.bind(this));
					} else {
						sap.m.MessageToast.show("falha ao buscar pasta do repositório");
						reject();
					}
				}.bind(this));
			}.bind(this));
		},

		setImages: function (oFolder) {
			return new Promise(function (resolve, reject) {
				var oImageModel = this.getView().getModel("imagesModel");
				var aPromises = [];

				for (var prop in oFolder.objects) {
					aPromises.push(new Promise(function (resolve, reject) {
						var oObject = oFolder.objects[prop];
						$.ajax({
							type: 'GET',
							url: "/cmisrepository/root/warehouseMap/" + this.sKey + "/" + oObject.object.properties[
								'cmis:name'].value,
							cache: false,
							async: true,
							xhr: function () {
								var xhr = new XMLHttpRequest();
								xhr.responseType = 'blob';
								return xhr;
							},
							success: function (data) {
								data.name = oObject.object.properties['cmis:name'].value;
								data.lastModifiedDate = new Date();

								resolve(data);
							},
							error: function (error) {
								reject(error);
							}
						});
					}.bind(this)));
				}

				Promise.all(aPromises).then(function (data) {
					var iImageCounter = oImageModel.getProperty("/imageCounter");

					for (var image of data) {
						this.newImages.push({
							name: image.name,
							file: image,
							description: "",
							status: "saved"
						});
						iImageCounter = iImageCounter + 1;
						this.updateViewer(image.name, iImageCounter);
					}
					oImageModel.setProperty("/imageCounter", iImageCounter);
					oImageModel.refresh();
					resolve();
				}.bind(this));
			}.bind(this));
		},

		createFolder: function (folderName) {
			var sURL = folderName === this.sKey ? '' : this.sKey;
			return new Promise(function (resolve, reject) {
				var data = {
					cmisaction: "createFolder",
					"propertyId[0]": "cmis:name",
					"propertyValue[0]": folderName,
					"propertyId[1]": "cmis:objectTypeId",
					"propertyValue[1]": "cmis:folder"
				};

				$.ajax("/cmisrepository/root/warehouseMap/" + sURL, {
					type: "POST",
					data: data
				}).done(function (message) {
					resolve(message);
				}).fail(function (jqXHR) {
					reject(jqXHR);
				});
			}.bind(this));
		},

		getFolder: function (folderName) {
			return new Promise(function (resolve, reject) {
				var data = {
					cmisaction: "getFolderTree"
				};
				$.ajax("/cmisrepository/root/warehouseMap/" + folderName, {
					type: "GET",
					data: data
				}).done(function (oData) {
					resolve(oData);
				}).fail(function (jqXHR) {
					reject(jqXHR);
				});
			}.bind(this));
		},

		handleFileUploaderChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var oFile = oEvent.getParameter("files")[0];
			var oImagesModel = this.getView().getModel("imagesModel");
			var iImageCounter = oImagesModel.getProperty("/imageCounter");
			var oFileUploader = this.getView().byId("fileUploaderID");
			var sImageName = oFile.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

			setTimeout(function () {
				var bAlreadyHasImageName = this.newImages.filter(image => image.name === sImageName && image.status !== "deleted").length >
					0 ?
					true : false;
				if (!bAlreadyHasImageName) {
					if (iImageCounter < 4) {
						this.newImages.push({
							name: sImageName,
							file: oFile,
							description: "",
							status: "new"
						});
						oImagesModel.setProperty("/imageCounter", iImageCounter + 1);
						oImagesModel.refresh();
						this.submitImage(oSource, sImageName);
					} else {
						MessageBox.show("limite de imagens excedido");
					}
				} else {
					MessageBox.show("Já existe uma imagem com este nome.");
				}
			}.bind(this), 100);
		},

		submitImage: function (oSource, sImageName) {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var remoteSource = "";
			var bIsLocalTesting = window.location.hostname.indexOf("webidetesting") !== -1 ? true : false;
			var bIsPRDApp = window?.fiori_client_appConfig?.fioriURL?.includes("fx3sa6u5mh");
			var bIsQASApp = window?.fiori_client_appConfig?.fioriURL?.includes("ne6300ec0");

			if (bIsMobile) {
				// VERIFICA SE É MOBILE, E DEPOIS SE ESTA EM PRD OU QAS PARA ALTERAR O REMOTE SOURCE CORRETO.
				if (bIsPRDApp === true && bIsQASApp === false) {
					remoteSource = 'https://mobile-fx3sa6u5mh.br1.hana.ondemand.com/com.sap.webide.xbcf82aaa0ff845a28591c4383178ca34_APP-GRAOS-REP';
				}else if(bIsPRDApp === false && bIsQASApp === true) {
					remoteSource = 'https://mobile-ne6300ec0.br1.hana.ondemand.com/com.sap.webide.x4f84602711c44edca003ae6b548633eb_APP-GRAOS-REP';
				}
			}else if (!bIsLocalTesting) {
				remoteSource = "/sap/fiori/appgraos";
			}
			oSource.removeAllParameters();
			//VERIFICA SE É MOBILE PARA PODER ENCAMINHAR PARA O ENDEREÇO CORRETO DO WAREHOUSE WEB X MOBILE
			if (bIsMobile) {
				oSource.setUploadUrl(remoteSource + "/root/warehouseMap/" + this.sKey);
			}else {
				oSource.setUploadUrl(remoteSource + "/cmisrepository/root/warehouseMap/" + this.sKey);
			}
			
			oSource.addParameter(new sap.ui.unified.FileUploaderParameter({
				name: "cmisaction",
				value: "createDocument"
			}));
			oSource.addParameter(new sap.ui.unified.FileUploaderParameter({
				name: "propertyId[0]",
				value: "cmis:objectTypeId"
			}));
			oSource.addParameter(new sap.ui.unified.FileUploaderParameter({
				name: "propertyValue[0]",
				value: "cmis:document"
			}));
			oSource.addParameter(new sap.ui.unified.FileUploaderParameter({
				name: "propertyId[1]",
				value: "cmis:name"
			}));
			oSource.addParameter(new sap.ui.unified.FileUploaderParameter({
				name: "propertyValue[1]",
				value: sImageName
			}));

			setTimeout(function () {
				this.setBusyDialog("Repositório", "Realizando upload");
				oSource.upload();
			}.bind(this), 100);
		},

		handleUploadComplete: function (oEvent) {
			var oSource = oEvent.getSource();
			var oImageName = oSource.getValue().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

			this.updateViewer(oImageName);
			this.closeBusyDialog();
		},

		removeImage: function (sImageName, sFolderName) {
			return new Promise(function (resolve, reject) {
				$.ajax({
						type: 'POST',
						url: "/cmisrepository/root/warehouseMap/" + this.sKey + "/" + sImageName,
						data: {
							cmisaction: "delete"
						}
					}).done(function (results) {
						resolve();
					}.bind(this)())
					.fail(function (err) {
						reject(err);
					});
			}.bind(this));
		},

		updateViewer: function (sFileName, sPosition) {
			var oImagesModel = this.getView().getModel("imagesModel");
			var oImage = this.newImages.filter(image => image.name === sFileName && image.status !== "deleted");
			var iImageCounter = oImagesModel.getProperty("/imageCounter");
			var oCurrImageSlot = sPosition ? this.getView().byId("img" + sPosition) : this.getView().byId("img" + iImageCounter);
			var oCarousel = this.getView().byId("carouselID");

			if (oImage.length > 0) {
				var oFile = oImage[0].file;
				var url = URL.createObjectURL(oFile);
				var sImageID = sPosition ? "imgCarousel" + sPosition : "imgCarousel" + iImageCounter;
				var oCorrespondingCarouselPosition = oCarousel.getPages().filter(page => page.getId() === this.getView().getId() + "--" +
					sImageID);
				// var oImgCarouselTemplate = this.createImgCarouselTemplate(url, sImageID);

				oImage[0]["url"] = url;
				oImage[0]["id"] = sImageID;
				oImage[0]["position"] = sPosition ? sPosition : iImageCounter;

				if (oCorrespondingCarouselPosition.length > 0) {
					var oCurrImage = oCorrespondingCarouselPosition[0];
					oCurrImage.setSrc(url);
					// oCurrImage.getDetailBox().getImageContent()[0].setImageSrc(url);
					oCarousel.setActivePage(this.getView().getId() + "--" + sImageID);
				}
				sap.m.MessageToast.show("Upload concluído com sucesso!");
				oCurrImageSlot.setSrc(url);
				// oCarousel.addPage(oImgCarouselTemplate);
				// oCarousel.setActivePage(sImageID);
			}
		},

		createImgCarouselTemplate: function (url, sImageID) {
			return new sap.m.Image(sImageID, {
				densityAware: false,
				src: url
			});
		},

		onImageDelete: function (oEvent) {
			var oImagesModel = this.getView().getModel("imagesModel");
			var oSource = oEvent.getSource();
			var imageContainer = oSource.getParent().getParent().getItems()[0].getItems()[0];
			var sUrl = imageContainer.getSrc();
			var oCorrespondingArrayRecord = this.newImages.filter(image => image.url === sUrl);
			var iImageCounter = oImagesModel.getProperty("/imageCounter");

			if (oCorrespondingArrayRecord.length > 0) {

				sap.m.MessageBox.warning(
					"Deseja mesmo remover a imagem? A operação não poderá ser desfeita.", {
						icon: sap.m.MessageBox.Icon.WARNING,
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						onClose: function (oAction) {
							if (oAction === "YES") {
								var oImage = oCorrespondingArrayRecord[0];
								this.setBusyDialog("Repositório", "Removendo imagem");
								this.removeImage(oImage.name).then(function () {
									oImage.status = "deleted";
									sap.m.MessageToast.show("Imagem removida com sucesso!");
									this.removeImageFromViewer(oImage, imageContainer);
									this.reorganizeThings(oImage.position);
									oImagesModel.setProperty("/imageCounter", iImageCounter - 1);
									this.closeBusyDialog();
								}.bind(this)).catch(function (error) {
									sap.m.MessageToast.show("Erro ao remover imagem");
									this.closeBusyDialog();
								}.bind(this));
							}
						}.bind(this)
					}
				);
			}
		},

		reorganizeThings: function (positionDeleted) {
			var oCarousel = this.getView().byId("carouselID");
			for (var pos = positionDeleted; pos < 4; pos++) {
				var oEmptySpace = this.getView().byId("img" + pos);
				var oEmptyCarouselSpace = this.getView().byId(this.getView().getId() + "--" +
					"imgCarousel" + pos);
				var oNextSpaceCarouselSpace = this.getView().byId(this.getView().getId() + "--" +
					"imgCarousel" + (pos + 1));
				var oNextSpace = this.getView().byId("img" + (pos + 1));
				var oNextSpaceSrc = oNextSpace.getSrc();
				var oNextSpaceData = this.newImages.filter(image => image.url === oNextSpaceSrc && image.status !== "deleted");
				var oNextActivePagePos = oNextSpaceCarouselSpace.getSrc() === "" ? (pos - 1) : pos;

				if (oNextSpace) {
					oEmptySpace.setSrc(oNextSpace.getSrc());
					oEmptyCarouselSpace.setSrc(oNextSpace.getSrc());
					oNextSpace.setSrc("");
					oNextSpaceCarouselSpace.setSrc("");
					oCarousel.setActivePage(this.getView().byId(this.getView().getId() + "--" +
						"imgCarousel1"));

					if (oNextSpaceData.length > 0) {
						oNextSpaceData[0]["position"] = pos;
					}
				}
			}
		},

		removeImageFromViewer: function (oArrayImage, oImageContainer) {
			var oCarousel = this.getView().byId("carouselID");
			var sImageID = this.getView().getId() + "--" + oArrayImage.id;
			var oPageToRemove = oCarousel.getPages().filter(page => page.getId() === sImageID);

			oImageContainer.setSrc("");

			if (oPageToRemove.length > 0) {
				oPageToRemove[0].setSrc("");
			}
		},

		navBack: function () {

			if (this.isEdit) {
					this.oRouter.navTo("warehouseMap.Edit", {
					keyData: encodeURIComponent(JSON.stringify(this.oKeyData))
				}, false);
				
			} else {

				this.oRouter.navTo("warehouseMap.New", {
					keyData: encodeURIComponent(JSON.stringify(this.oKeyData))
				}, false);
			}

		},

		onSave: function () {

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

		onImagePress: function (oEvent) {
			var oSource = oEvent.getSource();
			var sSrc = oSource.getSrc();
			var oCarousel = this.getView().byId("carouselID");
			var oImageRecord = this.newImages.filter(image => image.url === oEvent.getSource().getSrc())[0];
			var sPosition = oImageRecord.position;
			var sCarouselID = "imgCarousel" + sPosition;

			oCarousel.setActivePage(this.getView().getId() + "--" + sCarouselID);
		}

	});
});