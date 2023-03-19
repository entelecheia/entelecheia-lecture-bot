export function isMobile() {
  if (navigator.userAgentData) {
    return navigator.userAgentData.getHighEntropyValues(['platform', 'model']).then((data) => {
      return data.platform.includes('Android') || data.platform.includes('iPhone')
    })
  }

  const mobileRegex =
    /(android|iphone|ipod|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i

  return mobileRegex.test(navigator.userAgent || navigator.vendor || window.opera)
}
