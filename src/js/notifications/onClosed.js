import notifications from './index'


export default chrome.notifications.onClosed.addListener((notificationId, byUser) => {

    if (notificationId === notifications.translation.id) {




    }
})

