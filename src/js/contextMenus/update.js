import contextMenus from './index'
import langUtils from '../utils/lang'
import notifications from '../notifications'
import translateService from '../translateService'

const update = {

  translateSelection: (selectionText) => {

    let targetLanguage = langUtils.getBrowserLanguage()
    translateService.getTranslation('', targetLanguage, selectionText)
    .then(data => {
      let {sourceLanguage, targetLanguage, query, translations} = data
      let {resolvedSourceLanguage} = langUtils.getResolvedSourceLanguage(sourceLanguage, translations)
      let params = {
        translatedText: translations[0].translatedText,
        translateService: translateService.current,
        sourceLanguage: resolvedSourceLanguage,
        targetLanguage: targetLanguage,
        query: query
      }
      return chrome.contextMenus.update(contextMenus.translateSelection, {
        "title": params.translatedText,
      })
    })


  }

}

export default update

