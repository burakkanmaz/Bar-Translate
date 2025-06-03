import notifications from './index'
import actions from '../actions'

import storage from '../storage'
import textUtils from '../utils/text'


export default chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (notificationId === notifications.tryLoveBuy.id) {

      if (buttonIndex === 0) {
        chrome.notifications.clear(notifications.tryLoveBuy.id)
        actions.openBuyPage()
      }
      if (buttonIndex === 1) {

        actions.openRegisterPage()
        chrome.notifications.clear(notifications.tryLoveBuy.id)
      }

    }
    


    if (notificationId === notifications.translation.id) {

      
      if (buttonIndex === 0) {
        textUtils.copyToClipboard(notifications.translation.params.translatedText)

      }
      if (buttonIndex === 1) {
        let {sourceLanguage, targetLanguage, query} = notifications.translation.params
        actions.openTranslationInSite(sourceLanguage, targetLanguage, query)
        chrome.notifications.clear(notifications.translation.id)
      }

    }
})

