const app = getApp(); 
// console.log(app.globalData.requestPathBase)
var apiURL = '';
// const apiURL = 'https://wx.eggxiaoer.net/api/';
// console.log(apiURL)
 

const wxRequest = (param) => {

  let url = '';
  if (param.url.substr(0, 5) === 'https' || param.url.substr(0, 4) === 'http') {
    url = param.url;
  } else {
    apiURL = wx.getStorageSync('apiURL');

    if (param.url.substr(0, 1) == '/') {
      param.url = param.url.substr(1)
    }
    url = apiURL + param.url;
  }
  if (!param.method) {
    param.method = 'POST';
  }
  let token = wx.getStorageSync('Authorization')
  let header = {
    'content-type': 'application/json', // 默认值
    "Authorization": token, //token
    'platform': '0501'
  }
  if (param.header) {
    header = Object.assign({}, header, param.header)
  }
  console.log("Header：：：："+JSON.stringify(header));
  const method = param.method.toUpperCase();
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      header: header,
      method: method,
      data: param.data || {},
      success(res) {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}
module.exports = {
  wxRequest
}
