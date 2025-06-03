import spinner from '../utils/spinner'

export default chrome.omnibox.onInputCancelled.addListener(() => {
  console.log('canceled')

})

