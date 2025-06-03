import notifications from './index'
import licensing from '../licensing'
import messages from '../messages'
import langUtils from '../utils/lang'
import langNames from '../../json/langNames.json'
import langNativeNames from '../../json/langNativeNames.json'
import helloInAllLanguages from '../../json/helloInAllLanguages.json'



const create = {

  

  tryLoveBuy: () => {
    chrome.notifications.clear(notifications.tryLoveBuy.id, () => {
      return chrome.notifications.create(notifications.tryLoveBuy.id, {
        type: 'basic',
        iconUrl: 'images/square.png',
        title: messages.notifications.tryLoveBuy.title,
        message: messages.notifications.tryLoveBuy.message,
        contextMessage: messages.extensionName,
        silent: true,
        requireInteraction: false,
        buttons: [{
          title: messages.notifications.tryLoveBuy.buttons.buy.title
        }, {
          title: messages.notifications.tryLoveBuy.buttons.sync.title
        }]
      })
    })
  },

  license: (license) => {

    let licenseCreatedDate = new Date(license.createdTime).toLocaleDateString("en", {year: "numeric", month: "long", day: "numeric"})
    let hasLicense = license.accessLevel === 'FULL' ? true : false

    let titleMessage = hasLicense ? messages.notifications.license.title.success : messages.notifications.license.title.fail

    chrome.notifications.clear(notifications.tryLoveBuy.id)

    return chrome.notifications.create(notifications.license.id, {
      type: 'basic',
      iconUrl: 'images/icon@2x.png',
      title: titleMessage,
      message: licensing.getLicenseMessage(license),
      contextMessage: messages.extensionName,
      silent: true,
      requireInteraction: false,
      buttons: hasLicense ? [] : [{
        title: messages.notifications.license.buttons.buy.title
      }]
    })
  },


  translation: (params) => {
    let notif = notifications.translation
    chrome.notifications.clear(notif.id, () => {
      let {translatedText, translateService, sourceLanguage, targetLanguage, query} = params
      let message = `${translatedText}`
      return chrome.notifications.create(notif.id, {
        priority: 2,
        type: 'basic',
        iconUrl: 'images/icon@2x.png',
        title: '',
        message: message,
        contextMessage: `Translated ${sourceLanguage ? `from ${langUtils.getLangOrAliasName(sourceLanguage)} (ᴅᴇᴛᴇᴄᴛᴇᴅ) into` : 'in'} ${langUtils.getLangOrAliasName(targetLanguage)} by ${translateService.smallcase}`,
        silent: true,
        requireInteraction: true,
        buttons: [{
          title: chrome.i18n.getMessage('copyToClipboard', [translateService.name])
        }, {
          title: chrome.i18n.getMessage('openInNewTab', [translateService.name])
        }]
      })
    })
  }

}


export default create

