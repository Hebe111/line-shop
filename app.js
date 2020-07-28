//app.js 
App({
  onLaunch: function () {
    //获取设备信息
    this.getSystemInfo();
    this.checkUpdateVersion()
  },
  onShow: function () {
    let token = wx.getStorageSync('Authorization');
    // console.log("我能拿到token吗" +token);
    console.log('app----------onshow')
    if(!token){
      this.getInterface();
    }
  },

  login(avatarUrl, nickName, encryptedData, iv) {

    let that = this;
    // return new Promise((resolve, reject) =>{

    // })
    wx.request({
      url: this.globalData.requestPathBase + 'member/mini/login',
      header: {
        'content-type': 'application/x-www-form-urlencoded', // 默认值
        'platform': 'P0501',

      },
      method: "post",
      data: {
        wxAvatar: avatarUrl,
        wxNickname: nickName,
        wxEncryptedData: encryptedData,
        wxIv: iv,
        wxJsCode: this.globalData.wxcode,
      },
      success: res => {
        if (res.data.success == true) {
          wx.setStorageSync('Authorization', res.data.data.id)
          wx.setStorageSync('userId', res.data.data.userId)
          // resolve(res.data.data);
        } else {
          console.log('获取用户登录态失败！1' + res.message);
          // reject('error')

        }
      }
    })

  },
  getSystemInfo: function () {
    let t = this;
    wx.getSystemInfo({
      success: function (res) {
        t.globalData.systemInfo = res;
        let iphoneX = (t.globalData.systemInfo.model).replace(/\s*/g, "");

        if (iphoneX.indexOf("iPhoneX") > -1) {
          t.globalData.iphoneX = 'iphoneX';
        }

      }
    });
  },
  /**
   * 检测当前的小程序
   * 是否是最新版本，是否需要下载、更新
   */
  checkUpdateVersion: function () {
    //判断微信版本是否 兼容小程序更新机制API的使用
    if (wx.canIUse('getUpdateManager')) {
      //创建 UpdateManager 实例
      const updateManager = wx.getUpdateManager();
      //检测版本更新
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          //监听小程序有版本更新事件
          updateManager.onUpdateReady(function () {
            //TODO 新的版本已经下载好，调用 applyUpdate 应用新版本并重启 （ 此处进行了自动更新操作）
            updateManager.applyUpdate();
          })
          updateManager.onUpdateFailed(function () {
            // 新版本下载失败
            wx.showModal({
              title: '已经有新版本喽~',
              content: '请您删除当前小程序，到微信 “小程序” 页，重新搜索打开“蛋小二”哦~',
            })
          })
        }
      })
    } else {
      //TODO 此时微信版本太低（一般而言版本都是支持的）
      wx.showModal({
        title: '溫馨提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  getAuthorization() {
    var wxCode;
    var ed = e.detail;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          // wx.setStorageSync('wxcode', res.code)
          // app.globalData.wxcode = res.code
          wxCode = res.code;
          if (e.detail.userInfo) {
            app.globalData.userInfo = e.detail.userInfo
            api.wxRequest({
              url: "member/mini/login",
              method: "post",
              data: {
                wxAvatar: app.globalData.userInfo.avatarUrl,
                wxNickname: app.globalData.userInfo.nickName,
                wxJsCode: wxCode,
                wxEncryptedData: ed.encryptedData,
                wxIv: ed.iv,
              },
            }).then(res => {
              if (res.data.success == true) {
                wx.setStorageSync('Authorization', res.data.data.id)
                wx.setStorageSync('userId', res.data.data.userId)
                var myEventDetail = {
                  Authorization: res.data.data.id,
                  userInfo: e.detail.userInfo,
                } // detail对象，提供给事件监听函数
                var myEventOption = {} // 触发事件的选项
                this.triggerEvent('myevent', myEventDetail, myEventOption)
                this.getInfo(res.data.data.id)
                Toast.success('授权成功');
                setTimeout(() => {
                  Toast.clear()
                }, 1000);
              }

            })
          }
        }
      }
    })


  }, 
  getInterface: function (argument) {
    console.log('app.js-----onload')
    var that = this;
    let host;
    let loading = true;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: "https://wx.eggxiaoer.com/api/basic/dict/findByName",
        header: {
          'content-type': 'application/json', // 默认值
        },
        method: "post",
        data: {
          // name: "mini_release",//正式接口
          name: "mini_test", //测试接口
        },
        success: res => {
          host = res.data.data.value;
          wx.setStorageSync('apiURL', host);
          wx.getSetting({
            success: settingres => {
              if (settingres.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: userInfores => {
                    console.log(userInfores)
                    wx.checkSession({
                      success (checkSessionres) {
                        //session_key 未过期，并且在本生命周期一直有效
                        // console.log(checkSessionres)
                        // resolve(loading);
                        let token = wx.getStorageSync('Authorization');
                        console.log('checkSessionres---true,app----------onshow')
                        if(!token){
                          wx.login({
                            success: loginres => {
                              console.log(loginres.code + '------------------wxcode1')
                              // 发送 res.code 到后台换取 openId, sessionKey, unionId
                              wx.request({
                                url: host + 'member/mini/login',
                                header: {
                                  'content-type': 'application/json', // 默认值
                                  'platform': 'P0501',
      
                                },
                                method: "post",
                                data: {
                                  wxAvatar: userInfores.userInfo.avatarUrl,
                                  wxNickname: userInfores.userInfo.nickName,
                                  wxEncryptedData: userInfores.encryptedData,
                                  wxIv: userInfores.iv,
                                  wxJsCode: loginres.code,
                                },
                                success: miniloginres => {
                                  if (miniloginres.data.success == true) {
                                    wx.setStorageSync('Authorization', miniloginres.data.data.id)
                                    wx.setStorageSync('userId', miniloginres.data.data.userId);
                                    // 获取用户信息
                                    wx.request({
                                      url: host + 'member/user/info',
                                      header: {
                                        'content-type': 'application/json', // 默认值
                                        "Authorization": miniloginres.data.data.id
                                      },
                                      method: "get",
                                      
                                      success: memberinfores => {
                                        if (memberinfores.data.success == true) {
                                          wx.setStorageSync('userInfo', memberinfores.data.data);
                                          resolve(loading);
                                          
                                        } else {
                                          console.log('获取用户登录态失败！2' + res.message);
                                          reject(!loading);
            
                                        }
                                      }
                                    }) 
                                    
                                  } else {
                                    console.log('获取用户登录态失败！3' + res.message);
                                    // reject(!loading);
                                    wx.login({
                                      success: loginres => {
                                      console.log(loginres.code + '------------------wxcode2')
      
                                        // 发送 res.code 到后台换取 openId, sessionKey, unionId
                                        wx.request({
                                          url: host + 'member/mini/login',
                                          header: {
                                            'content-type': 'application/json', // 默认值
                                            'platform': 'P0501',
                
                                          },
                                          method: "post",
                                          data: {
                                            wxAvatar: userInfores.userInfo.avatarUrl,
                                            wxNickname: userInfores.userInfo.nickName,
                                            wxEncryptedData: userInfores.encryptedData,
                                            wxIv: userInfores.iv,
                                            wxJsCode: loginres.code,
                                          },
                                          success: miniloginres => {
                                            if (miniloginres.data.success == true) {
                                              wx.setStorageSync('Authorization', miniloginres.data.data.id)
                                              wx.setStorageSync('userId', miniloginres.data.data.userId);
                                              // 获取用户信息
                                              wx.request({
                                                url: host + 'member/user/info',
                                                header: {
                                                  'content-type': 'application/json', // 默认值
                                                  "Authorization": miniloginres.data.data.id
                                                },
                                                method: "get",
                                                
                                                success: memberinfores => {
                                                  if (memberinfores.data.success == true) {
                                                    wx.setStorageSync('userInfo', memberinfores.data.data);
                                                    resolve(loading);
                                                    
                                                  } else {
                                                    console.log('获取用户登录态失败！4' + res.message);
                                                    reject(!loading);
                      
                                                  }
                                                }
                                              }) 
                                              
                                            } else {
                                              console.log('获取用户登录态失败！5' + res.message);
                                              // reject(!loading);
                                              
                
                                            }
                                          }
                                        })
                                      }
                                    })  
      
                                  }
                                }
                              })
                            }
                          })  
                        }else{
                        resolve(loading);

                        }
                      },
                      fail () {
                        // session_key 已经失效，需要重新执行登录流程
                        wx.login({
                          success: loginres => {
                            console.log(loginres.code + '------------------wxcode1')
                            // 发送 res.code 到后台换取 openId, sessionKey, unionId
                            wx.request({
                              url: host + 'member/mini/login',
                              header: {
                                'content-type': 'application/json', // 默认值
                                'platform': 'P0501',
    
                              },
                              method: "post",
                              data: {
                                wxAvatar: userInfores.userInfo.avatarUrl,
                                wxNickname: userInfores.userInfo.nickName,
                                wxEncryptedData: userInfores.encryptedData,
                                wxIv: userInfores.iv,
                                wxJsCode: loginres.code,
                              },
                              success: miniloginres => {
                                if (miniloginres.data.success == true) {
                                  wx.setStorageSync('Authorization', miniloginres.data.data.id)
                                  wx.setStorageSync('userId', miniloginres.data.data.userId);
                                  // 获取用户信息
                                  wx.request({
                                    url: host + 'member/user/info',
                                    header: {
                                      'content-type': 'application/json', // 默认值
                                      "Authorization": miniloginres.data.data.id
                                    },
                                    method: "get",
                                    
                                    success: memberinfores => {
                                      if (memberinfores.data.success == true) {
                                        wx.setStorageSync('userInfo', memberinfores.data.data);
                                        resolve(loading);
                                        
                                      } else {
                                        console.log('获取用户登录态失败！6' + res.message);
                                        reject(!loading);
          
                                      }
                                    }
                                  }) 
                                  
                                } else {
                                  console.log('获取用户登录态失败！7' + res.message);
                                  // reject(!loading);
                                  wx.login({
                                    success: loginres => {
                                    console.log(loginres.code + '------------------wxcode2')
    
                                      // 发送 res.code 到后台换取 openId, sessionKey, unionId
                                      wx.request({
                                        url: host + 'member/mini/login',
                                        header: {
                                          'content-type': 'application/json', // 默认值
                                          'platform': 'P0501',
              
                                        },
                                        method: "post",
                                        data: {
                                          wxAvatar: userInfores.userInfo.avatarUrl,
                                          wxNickname: userInfores.userInfo.nickName,
                                          wxEncryptedData: userInfores.encryptedData,
                                          wxIv: userInfores.iv,
                                          wxJsCode: loginres.code,
                                        },
                                        success: miniloginres => {
                                          if (miniloginres.data.success == true) {
                                            wx.setStorageSync('Authorization', miniloginres.data.data.id)
                                            wx.setStorageSync('userId', miniloginres.data.data.userId);
                                            // 获取用户信息
                                            wx.request({
                                              url: host + 'member/user/info',
                                              header: {
                                                'content-type': 'application/json', // 默认值
                                                "Authorization": miniloginres.data.data.id
                                              },
                                              method: "get",
                                              
                                              success: memberinfores => {
                                                if (memberinfores.data.success == true) {
                                                  wx.setStorageSync('userInfo', memberinfores.data.data);
                                                  resolve(loading);
                                                  
                                                } else {
                                                  console.log('获取用户登录态失败！8' + res.message);
                                                  reject(!loading);
                    
                                                }
                                              }
                                            }) 
                                            
                                          } else {
                                            console.log('获取用户登录态失败！9' + res.message);
                                            // reject(!loading);
                                            
              
                                          }
                                        }
                                      })
                                    }
                                  })  
    
                                }
                              }
                            })
                          }
                        })  
                      }
                    })
                   
                  }
                })
              }
            }
          })
        },
        fail: res => {
          // reject(res);
        },
        complete: res => {

        }
      })

    })
  },
  getHost() {
    this.getInterface().then(function (res) {
      console.log(res.data);
      return res.data.data.value;
    })
  },
  
  globalData: {
    Authorization: '',
    requestPath: '',
    requestPathBase: '',
    systemInfo: null, //客户端设备信息
    iphoneX: null, //客户端设备信息
    userInfo: null,
    toGrantAuthorization: "", //是否授权
    chartInfo: {},
    selectAddress: false,
    wxcode: null,
    checkLogin: false,
    fromGoodsInfo:'',
    shoppingCarList: []
  }
})