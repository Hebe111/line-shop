// components/empower/empower.js
import Toast from '@vant/weapp/toast/toast';
const app = getApp();
const api = require("../../utils/request.js");

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    userInfo: {},
    noUserInfo: false, 
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    Authorization: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo: function (e) {
      var myEventDetail = {
        empower: false,
      } // detail对象，提供给事件监听函数
      this.triggerEvent('myevent', myEventDetail)
      Toast.loading({
        mask: true,
        message: '授权中...'
      });
      var wxCode;
      var ed = e.detail;
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          if (res.code) {
            console.log(res)
            // wx.setStorageSync('wxcode', res.code)
            // app.globalData.wxcode = res.code
            wxCode = res.code;
            console.log(wxCode)
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
                  this.setData({
                    Authorization: res.data.data.id,
                    userInfo: e.detail.userInfo,
                  })
                  // var myEventOption = {} // 触发事件的选项
                  // this.triggerEvent('myevent', myEventDetail)
                  this.getInfo(res.data.data.id)
                  console.log("tocken:"+res.data.data.id);
                  Toast.success('授权成功');
                  setTimeout(() => {
                    Toast.clear()
                  }, 1000);
                }

              })
            } else if (!e.detail.userInfo && e.detail.errMsg == 'getUserInfo:fail auth deny') {

              var myEventDetail = {
                empower: false,
              } // detail对象，提供给事件监听函数
              this.triggerEvent('myevent', myEventDetail)
              Toast.fail('授权失败');
              setTimeout(() => {
                Toast.clear()
              }, 1000);

            }
          }
        }
      })


    },
    //获取用户信息 userInfo
    getInfo(token) {
      api.wxRequest({
        url: "member/user/info",
        method: "get",
        data: {
          Authorization: token
        }
      }).then(res => {
        wx.setStorageSync('userInfo', res.data.data);
        if (!res.data.data.phoneNumber) {
          var myEventDetail = {
            phoneNumber: false,

            Authorization: this.data.Authorization,
            userInfo: this.data.userInfo,
          } // detail对象，提供给事件监听函数
          this.triggerEvent('myevent', myEventDetail)
        }else {
          var myEventDetail = {
            Authorization: this.data.Authorization,
            userInfo: res.data.data,
          } // detail对象，提供给事件监听函数
          this.triggerEvent('myevent', myEventDetail)
        }

      })

    },

  }
})
