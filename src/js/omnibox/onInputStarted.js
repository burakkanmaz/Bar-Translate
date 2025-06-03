import notifications from "../notifications";
import storage from "../storage";
import licensing from "../licensing";


export default chrome.omnibox.onInputStarted.addListener(function() {
  storage.setSnapshot();

  

  licensing.getStorageLicense().then(license => {
    console.info(license, "license");
    console.info(licensing.getLicenseMessage(license));
    if (!license || (license && license.accessLevel === "FREE_TRIAL")) {

      storage.local
        .getValue(
          `${notifications.tryLoveBuy.id}.${storage.states.alreadyNotified}`
        )
        .then(alreadyNotified => {
          if (!alreadyNotified) {
            notifications.show("tryLoveBuy");
            storage.local.set(
              `${notifications.tryLoveBuy.id}.${
                storage.states.alreadyNotified
              }`,
              true
            );
          }
        });

      
    }
  });
});

