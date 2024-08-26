sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment"
  ],
  function (BaseController, Fragment) {
    "use strict";

    return BaseController.extend("com.app.vendorpageforrequest.controller.BaseController", {
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },
      loadFragment: async function (sFragmentName) {
        const oFragment = await Fragment.load({
          id: this.getView().getId(),
          name: `com.app.vendorpageforrequest.fragments.${sFragmentName}`,
          controller: this
        });
        this.getView().addDependent(oFragment);
        return oFragment
      },

      createData: function (oModel, oPayload, sPath) {
        return new Promise(function (resolve, reject) {
          oModel.create(sPath, oPayload, {
            refreshAfterChange: true,
            success: function () {
              resolve();
            },
            error: function (oError) {
              reject(oError);
            }
          });
        });
      },

      //UUID Generator...
      generateUUID: function () {
        debugger;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },
      //Date and Time Formater...
      formatDateTime: function (date) {
        // Format the date part (e.g., "14 Aug 2024")
        var dateOptions = {
          day: '2-digit',
          month: 'short', // 'short' gives the abbreviated month name (e.g., "Aug")
          year: 'numeric'
        };
        var dateString = new Intl.DateTimeFormat('en-US', dateOptions).format(date);
        // Format the time part (e.g., "04:27:31 PM")
        var timeOptions = {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        var timeString = new Intl.DateTimeFormat('en-US', timeOptions).format(date).toUpperCase();
        // Combine date and time with a newline in between
        return `${dateString}\n${timeString}`;
      },
    });
  }
);