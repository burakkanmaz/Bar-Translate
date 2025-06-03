import notifications from '../notifications'
import storage from '../storage'



export default chrome.runtime.onStartup.addListener(function() {




  
  chrome.storage.local.remove(`${notifications.tryLoveBuy.id}.${storage.states.alreadyNotified}`, function(result) {
    console.info(`${notifications.tryLoveBuy.id}.${storage.states.alreadyNotified} removed`)
  })
})

