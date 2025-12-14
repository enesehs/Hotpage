// Background service worker for HotPage
// Handles CORS-free RSS fetching

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_RSS') {
    fetchRSS(request.url)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

async function fetchRSS(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();

    if (!text.trim().startsWith('<')) {
      throw new Error('Invalid RSS format');
    }

    return text;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
