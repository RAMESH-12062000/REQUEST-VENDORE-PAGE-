sap.ui.define([
    //"sap/ui/core/mvc/Controller",
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    function (Controller, JSONModel, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("com.app.vendorpageforrequest.controller.Home", {
            onInit: function () {

                var oView = this.getView();
                var oDatePicker = oView.byId("idDatePickerfromVendorPage");
                // Get today's date
                var today = new Date();
                // Set minDate to today
                oDatePicker.setMinDate(today);
            },

            //If click on the Book a slot function then a Pop-up slowly appear...
            onBookSlotPress: function () {
                var oLoginContainer = this.byId("idVBoxLoginContainer");
                var oMainContainer = this.byId("idVBoxMain");
                var oDescriptionContainer = this.byId("idVBoxDescription");

                if (oLoginContainer.hasStyleClass("hidden")) {
                    oLoginContainer.removeStyleClass("hidden");
                    oLoginContainer.addStyleClass("slideDown");
                    oLoginContainer.addStyleClass("rightAligned");

                    oMainContainer.removeStyleClass("centered");
                    oMainContainer.addStyleClass("leftAligned");

                    oDescriptionContainer.addStyleClass("leftAligned");
                } else {
                    oLoginContainer.addStyleClass("hidden");
                    oLoginContainer.removeStyleClass("slideDown");
                    oLoginContainer.removeStyleClass("rightAligned");

                    oMainContainer.removeStyleClass("leftAligned");
                    oMainContainer.addStyleClass("centered");

                    oDescriptionContainer.removeStyleClass("leftAligned");
                }
            },

            //Sumbite code for Requesting slot...
            onSubmitPress: async function () {
                debugger;
                var sVendorName = this.getView().byId("idVendornameInput").getValue();
                var sVendorNumber = this.getView().byId("idVendorNumberInput").getValue();
                var sDriverName = this.getView().byId("idDrivernameInput").getValue();
                var sDriverNumber = this.getView().byId("idDriverNumberInput").getValue();
                var sVehicleType = this.getView().byId("idVehTypeInput").getValue();
                var sVehicleNumber = this.getView().byId("idVehNumberInput").getValue();
                var sServiceType = this.getView().byId("idTypeofTransport").getSelectedKey();
                var sDatepicker = this.getView().byId("idDatePickerfromVendorPage").getDateValue();
                var oThis = this;
                let bValid = true;

                // Validate all required fields
                if (!sVendorName || !sVendorNumber || !sDriverName || !sDriverNumber || !sVehicleType || !sVehicleNumber || !sServiceType || !sDatepicker) {
                    MessageBox.error("All fields are required.");
                    return;
                }

                // Validate name length
                if (sVendorName.length < 4 || sDriverName.length < 4 || sVehicleType.length < 3) {
                    MessageBox.error("Names & Vehicle Type must contain at least 3 to 4 letters.");
                    this.getView().byId("idVendornameInput").setValueState("Error").setValueStateText("Names Vehicle Type should be '3 to 4 Letters'.");
                    this.getView().byId("idDrivernameInput").setValueState("Error").setValueStateText("Names Vehicle Type should be '3 to 4 Letters'.");
                    this.getView().byId("idVehTypeInput").setValueState("Error").setValueStateText("Names Vehicle Type should be '3 to 4 Letters'.");
                    bValid = false;
                } else {
                    this.getView().byId("idVendornameInput").setValueState("None");
                    this.getView().byId("idDrivernameInput").setValueState("None");
                    this.getView().byId("idVehTypeInput").setValueState("None");
                }

                // Validate phone numbers and vehicle number
                if (!/^\d{10}$/.test(sVendorNumber)) {
                    this.getView().byId("idVendorNumberInput").setValueState("Error").setValueStateText("Mobile number must be a '10-digit number'.");
                    bValid = false;
                } else {
                    this.getView().byId("idVendorNumberInput").setValueState("None");
                }

                if (!/^\d{10}$/.test(sDriverNumber)) {
                    this.getView().byId("idDriverNumberInput").setValueState("Error").setValueStateText("Mobile number must be a '10-digit number'.");
                    bValid = false;
                } else {
                    this.getView().byId("idDriverNumberInput").setValueState("None");
                }

                if (!/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(sVehicleNumber)) {  // Example format: XX00XX0000
                    this.getView().byId("idVehNumberInput").setValueState("Error").setValueStateText("Vehicle number format Should be like this 'AP09AA1234'.");
                    bValid = false;
                } else {
                    this.getView().byId("idVehNumberInput").setValueState("None");
                }

                if (!sServiceType) {
                    this.getView().byId("idTypeofTransport").setValueState(sap.ui.core.ValueState.Error);
                    this.getView().byId("idTypeofTransport").setValueStateText("Select Service Type in 'Dropdown'");
                    bValid = false;
                } else {
                    this.getView().byId("idTypeofTransport").setValueState(sap.ui.core.ValueState.None);
                }

                if (!bValid) {
                    return;
                }

                // Format the date
                //var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd MMM yyyy" });
                //var sFormattedDate = oDateFormat.format(sDatepicker);

                //Date formate..
                var oDate = new Date(sDatepicker);
                var options = { day: '2-digit', month: 'short', year: 'numeric' };
                var formattedDate = oDate.toLocaleDateString('en-US', options);

                var oModel = this.getView().getModel();
                const Reservations = await new Promise((resolve, reject) => {
                    oModel.read("/ZEWM_T_RESERVSSet", {
                        success: function (oData) {
                            resolve(oData.results);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                });
                // Check if the Vendor Number, vehicle Number already exists
                const bVendorNumberExists = Reservations.some(Data => Data.Vendornumber === sVendorNumber);
                if (bVendorNumberExists) {
                    MessageBox.error("Vendor Number already existed!");
                    return;  // Stop further execution
                }
                const bVehicleNumberExists = Reservations.some(Data => Data.Vehiclenumber === sVehicleNumber);
                if (bVehicleNumberExists) {
                    MessageBox.error("Vehicle Number already existed!");
                    return;  // Stop further execution
                }

                //UUID generator...
                var sUUID = this.generateUUID();
                const reservationModel = new sap.ui.model.json.JSONModel({
                    Id: sUUID,
                    Vendorname: sVendorName,
                    Vendornumber: sVendorNumber,
                    Drivername: sDriverName,
                    Drivernumber: sDriverNumber,
                    Vehicletype: sVehicleType,
                    Vehiclenumber: sVehicleNumber,
                    Servicetype: sServiceType,
                    Intime: formattedDate
                });

                this.getView().setModel(reservationModel, "reservationModel");
                const oPayload = this.getView().getModel("reservationModel").getProperty("/");
                //console.log("Payload: ", oPayload);

                try {
                    await this.createData(oModel, oPayload, "/ZEWM_T_RESERVSSet");
                    MessageBox.success("Your details have been registered for requesting a slot and sent to the warehouse..!");

                    // After successfully passing the test cases and created, the details will be cleared...
                    this.getView().byId("idVendornameInput").setValue("");
                    this.getView().byId("idVendorNumberInput").setValue("");
                    this.getView().byId("idDrivernameInput").setValue("");
                    this.getView().byId("idDriverNumberInput").setValue("");
                    this.getView().byId("idVehTypeInput").setValue("");
                    this.getView().byId("idVehNumberInput").setValue("");
                    this.getView().byId("idTypeofTransport").setSelectedKey("");
                    this.getView().byId("idDatePickerfromVendorPage").setDateValue(null);
                } catch (error) {
                    console.error("Error: ", error);
                    MessageBox.error("Some technical issue");
                }
            },
        });
    });
