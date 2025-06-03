let getMessage = (name) => {
  return chrome.i18n.getMessage(name)
}

const messages = {

  extensionName: "Bar Translate",

  notifications: {
    translation: {},
    help: {
      title: getMessage('helpAndTips'),
      buttons: {
        alwaysHide: {
          title: getMessage('dontShowAnymore')
        },
        goHelp: {
          title: getMessage('goHelp')
        }
      }
    }
  },

  contextMenus: {
    help: {
      title: getMessage('helpAndTips')
    }
  },

}
export default messages

