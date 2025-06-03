async function getUserLangSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([
      'barTranslate.targetLang',
      'barTranslate.sourceLang',
      'barTranslate.secondaryTargetLang'
    ], (data) => {
      resolve({
        targetLang: data['barTranslate.targetLang'] || '',
        sourceLang: data['barTranslate.sourceLang'] || '',
        secondaryTargetLang: data['barTranslate.secondaryTargetLang'] || ''
      });
    });
  });
}

function normalizeLangCode(code) {
  return (code || '').slice(0,2).toLowerCase();
}

async function fetchTranslation({query, sl, tl}) {
  const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${sl}&tl=${tl}&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const translations = data && data[0] ? data[0].map(item => item[0]).join('') : '';
    const detectedSourceLang = data && data[2] ? data[2] : null;
    return {translations, detectedSourceLang};
  } catch (e) {
    return {translations: '', detectedSourceLang: null};
  }
}

function extractLanguageFromQuery(text) {
  const match = text.trim().match(/^(\\w{2,3})\s+(.+)$/);
  let sourceLanguage = undefined;
  let targetLanguage = undefined;
  let query = text;
  if (match) {
    targetLanguage = match[1];
    query = match[2];
  }
  return {
    sourceLanguage,
    targetLanguage: targetLanguage || '',
    query: query.trim()
  };
}

function openTranslationInSite(sourceLanguage, targetLanguage, query) {
  const sl = sourceLanguage ? sourceLanguage : 'auto';
  const tl = targetLanguage ? targetLanguage : 'en';
  const url = `https://translate.google.com/?sl=${sl}&tl=${tl}&text=${encodeURIComponent(query)}&op=translate`;
  chrome.tabs.create({ url });
}

function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'barTranslate.contextMenu.translateSelection',
      title: 'Translate selection',
      contexts: ['selection']
    });
    chrome.contextMenus.create({
      id: 'barTranslate.contextMenu.help',
      title: 'Help',
      contexts: ['action']
    });
  });
}
chrome.runtime.onInstalled.addListener(() => { createContextMenus(); });
chrome.runtime.onStartup && chrome.runtime.onStartup.addListener(() => { createContextMenus(); });
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'barTranslate.contextMenu.help') {
    chrome.tabs.create({ url: 'help.html' });
  }
});

chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const { targetLang, sourceLang, secondaryTargetLang } = await getUserLangSettings();
  const { sourceLanguage, targetLanguage, query } = extractLanguageFromQuery(text);
  let sl = sourceLanguage || sourceLang || 'auto';
  let tl = targetLanguage || targetLang || 'en';
  if (!query) {
    chrome.omnibox.setDefaultSuggestion({ description: 'Type a word or sentence to translate' });
    return;
  }
  chrome.omnibox.setDefaultSuggestion({ description: `Bar Translate: <match>${query}</match>` });
  const quotedQuery = `"${query}"`;
  const {translations, detectedSourceLang} = await fetchTranslation({query: quotedQuery, sl, tl});
  let normDetected = normalizeLangCode(detectedSourceLang);
  let normTarget = normalizeLangCode(tl);
  let finalTargetLang = tl;
  let finalTranslations = translations;
  if (
    normDetected &&
    normDetected === normTarget &&
    secondaryTargetLang &&
    tl !== secondaryTargetLang &&
    sl === 'auto'
  ) {
    finalTargetLang = secondaryTargetLang;
    const second = await fetchTranslation({query: quotedQuery, sl, tl: finalTargetLang});
    finalTranslations = second.translations;
  }
  if (!finalTranslations || finalTranslations.trim() === query.trim()) {
    let reason = !finalTranslations ? 'No translation found' : 'No translation (same as input)';
    let detectedLangInfo = normDetected ? `${normDetected}` : '';
    suggest([{ content: query, description: `(${detectedLangInfo}→${finalTargetLang}) <dim>${reason}${detectedLangInfo}</dim>` }]);
    return;
  }
  let detectedLangInfo = normDetected ? `${normDetected}` : '';
  const cleanQuery = query.replace(/^"|"$/g, '');
  const cleanFinalTranslations = finalTranslations.replace(/^"|"$/g, '');
  suggest([
    {
      content: cleanFinalTranslations,
      description: `(${detectedLangInfo}→${finalTargetLang}) <dim>${cleanQuery}</dim> → <match>${cleanFinalTranslations}</match>`
    }
  ]);
});

chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
  const { targetLang, sourceLang, secondaryTargetLang } = await getUserLangSettings();
  const { sourceLanguage, targetLanguage, query } = extractLanguageFromQuery(text);
  let sl = sourceLanguage || sourceLang || 'auto';
  let tl = targetLanguage || targetLang || 'en';
  if (!query) return;
  const quotedQuery = `"${query}"`;
  const {detectedSourceLang} = await fetchTranslation({query: quotedQuery, sl, tl});
  let normDetected = normalizeLangCode(detectedSourceLang);
  let normTarget = normalizeLangCode(tl);
  let finalTargetLang = tl;
  if (normDetected && normDetected === normTarget && secondaryTargetLang) {
    finalTargetLang = secondaryTargetLang;
  }
  openTranslationInSite(sl, finalTargetLang, query);
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  const { sourceLanguage, targetLanguage, query } = extractLanguageFromQuery(text);
  if (!query) {
    chrome.omnibox.setDefaultSuggestion({
      description: 'Type a word or sentence to translate'
    });
    return;
  }
  chrome.omnibox.setDefaultSuggestion({
    description: `Translating: <match>${query}</match> → <match>${targetLanguage}</match>`
  });

  const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${sourceLanguage ? sourceLanguage : 'auto'}&tl=${targetLanguage}&q=${encodeURIComponent(query)}`;
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      const translations = data && data[0] ? data[0].map(item => item[0]).join('') : '';
      const detectedSourceLang = data && data[2] ? data[2] : (sourceLanguage || 'auto');
      const normDetected = (detectedSourceLang || '').slice(0,2).toLowerCase();
      const normTarget = (targetLanguage || '').slice(0,2).toLowerCase();
      if (translations) {
        suggest([
          {
            content: translations,
            description: `(${normDetected}→${normTarget}) <dim>${query}</dim> → <match>${translations}</match>`
          }
        ]);
      }
    })
    .catch(() => {
    });
});

function setSnapshot() {
  chrome.storage.local.get(null, (localData) => {
    chrome.storage.sync.get(null, (syncData) => {
      const snapshot = { ...localData, ...syncData };
    });
  });
}

setSnapshot();

