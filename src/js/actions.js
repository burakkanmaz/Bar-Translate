import translateService from './translateService'

export const openHelpPage = () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("help.html")
  })
}

const actions = {
  openTranslationInSite: (sourceLanguage, targetLanguage, query) => {
    let url = translateService.current.getSiteUrl(sourceLanguage, targetLanguage, query)
    chrome.tabs.create({
      url: url
    })
  },
  openHelpPage: openHelpPage
}

export default actions

