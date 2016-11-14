(function(){
  var oldBrowser = function(){
    window.location.href = '/unsupported-browser.html';
  };
  
  var ua = detect.parse(window.navigator.userAgent);
  switch (ua.browser.family) {
  case 'IE':
    if (parseInt(ua.browser.version) < 9) {
      oldBrowser();
      return;
    }
    break;
  case 'Firefox':
    if (parseInt(ua.browser.version) < 4) {
      oldBrowser();
      return;
    }
    break;
  case 'Chrome':
    if (parseFloat(ua.browser.version) < 3.8) {
      oldBrowser();
      return;
    }
    break;
  case 'Safari':
    if (parseInt(ua.browser.version) < 6) {
      oldBrowser();
      return;
    }
    break;
  }

  var testKey = 'test', storage = window.localStorage;
  try {
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
  } catch (error) {
    oldBrowser();
    return;
  }
})(window);