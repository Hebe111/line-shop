// tabBarComponent/tabBar.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabText: {
      type: String,
      value: "首页"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isIphoneX: app.globalData.iphoneX === "iphoneX" ? true : false,
    showOrHidden: false,
    supplyImg: 'https://oss.eggxiaoer.com/web/miniprogram/supplyCircular.png',
    purchaseImg: 'https://oss.eggxiaoer.com/web/miniprogram/purchaseCircular.png',
    groupBuyingImg:'https://oss.eggxiaoer.com/web/miniprogram/groupBuying.png',
    closweImg: 'https://oss.eggxiaoer.com/web/miniprogram/closeGray.png',
    requestPathBase: app.globalData.requestPathBase,
    userInfo: '',
    userDetails: '',
    tabbar: {
    "backgroundColor": "#ffffff",
    "color": "#808080",
      "selectedColor": "#DC281E",
    "list": [
      {
        "pagePath": "/pages/tarBarPages/index/index",
        "iconPath": "https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/homeGray.png",
        "selectedIconPath": "https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/homeRed.png",
        "text": "首页"
      },
      {
        "pagePath": "/pages/tarBarPages/commodity/commodity",
        "iconPath": "https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/classifyGray.png",
        "selectedIconPath": "https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/classifyRed.png",
        "text": "分类"
      },
      {
        "pagePath": "/pages/tarBarPages/mine/mine",
        "iconPath": "https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/myGroupBuy.png",
        "selectedIconPath": "https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/mineRed.png",
        "text": "我的"
      }
    ]
  },

    empower:false,
    groupStatus:false,
    supplyStaus: false,
    purchaseStaus:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //授权监听
    onEmpowerEvent(e) {
      console.log(e)
      if (e.detail.Authorization) {

        this.setData({
          Authorization: e.detail.Authorization,
          empower: false
        })
        this.getInfoDetails()
        // if(this.data.userDetails){
        //   this.getPhone()
        // }
      } else if (e.detail.empower == false) {
        this.setData({
          empower: false
        })
      }


    },
    getInfoDetails(){
      var authorization = wx.getStorageSync('Authorization')

      wx.request({
        url: app.globalData.requestPathBase + 'member/user/info ',
        header: {
          'content-type': 'application/json', // 默认值
          "Authorization": authorization
        },
        method: "get",

        success: res => {
          if (res.data.success == true) {
            this.setData({
              userDetails: res.data.data
            })
            if (this.data.groupStatus){
              this.getPhone(2)
            }
            if (this.data.supplyStaus) {
              this.getPhone(1)
            }
            if (this.data.purchaseStaus) {
              this.getPhone(3)
            }

          }
        }
      });
    },
    change: function () {
      this.setData({
        showOrHidden: true
      })
      var authorization = wx.getStorageSync('Authorization')
      var requestPathBase = app.globalData.requestPathBase
      this.getInfoDetails()
      // wx.request({
      //   url: requestPathBase + 'member/user/info ',
      //   header: {
      //     'content-type': 'application/json', // 默认值
      //     "Authorization": authorization
      //   },
      //   method: "get",

      //   success: res => {
      //     if (res.data.success == true) {
      //       this.setData({
      //         userDetails: res.data.data
      //       })
      //       if (!res.data.data.phoneNumber) {
      //         wx.navigateTo({
      //           url: "/pages/tool/pages/login/login",
      //         })
      //       } else {
              
      //       }

      //     }
      //   }
      // });

    },
    changeTwo: function (e) {
      var authorization = wx.getStorageSync('Authorization')
      var requestPathBase = app.globalData.requestPathBase
      if (e.currentTarget.dataset.path == '我的') {
        wx.switchTab({
          url: "/pages/tabBarPages/mine/mine",
        }) 
      }
      if (e.currentTarget.dataset.path == '首页') {
        wx.switchTab({
          url: "/pages/tabBarPages/home/home",
        })
      }
      if (e.currentTarget.dataset.path == '商品') { 
        wx.switchTab({
          url: '/pages/tabBarPages/commodity/commodity',
        })
      } 
      if (e.currentTarget.dataset.path == '资讯') { 
        wx.switchTab({
          url: '/pages/tabBarPages/information/information',
        })
      }
    },
    closeModel: function () {
      this.setData({
        showOrHidden: false

      })
    },
    toGroupBuying(){
      wx.getSetting({
        success: res => {
          if (!res.authSetting['scope.userInfo']) {
            this.setData({
              empower: true,
              groupStatus:true
            })
            return false;

          } else {
            this.getPhone(2)
          }
        }
      })
  
    },
    getPhone(num){
      var authorization = wx.getStorageSync('Authorization');
      wx.request({
        url: app.globalData.requestPathBase + 'member/user/info ',
        header: {
          'content-type': 'application/json', // 默认值
          "Authorization": authorization
        },
        method: "get",

        success: res => {
          if (res.data.success == true) {
            if (!res.data.data.phoneNumber) {
              wx.navigateTo({
                url: "/pages/tool/pages/login/login",
              })
            } else {
              if (this.data.groupStatus) {
                this.setData({
                  groupStatus: false
                })
              } else if (this.data.supplyStaus) {
                this.setData({
                  supplyStaus: false
                })
              } else if (this.data.purchaseStaus) {
                this.setData({
                  purchaseStaus: false
                })
              }
              if(num == 1){
                this.goSupply()
              }
              if(num == 2){
                this.goGroup()
              }
              if (num == 3) {
                this.goPurchase()
              }

             
            }


          }
        }
      });
    },

    goGroup(){
      if (this.data.userDetails.groupBuy != 1) {
        wx.showToast({
          title: '请联系客服开通权限！',
          icon: 'none',
          duration: 2000
        })
        return false
      } else {
        wx.navigateTo({
          url: "/pages/release/pages/groupBuy/groupBuy",
        })
        setTimeout(() => {
          this.closeModel()
        }, 1000);
      }
    },
    //to
    toSupply: function () {
      wx.getSetting({
        success: res => {
          if (!res.authSetting['scope.userInfo']) {
            this.setData({
              empower: true,
              supplyStaus: true
            })
            return false;

          } else {
            this.getPhone(1)
          }
        }
      })


    },
    goSupply(){
      wx.navigateTo({
        url: "/pages/release/pages/supply/supply",
      })
      setTimeout(() => {
        this.closeModel()
      }, 1000);
      // if (this.data.userDetails.status != 0) {
      //   wx.showToast({
      //     title: '请联系客服开通权限！',
      //     icon: 'none',
      //     duration: 2000
      //   })
      //   return false
      // } else {
      //   wx.navigateTo({
      //     url: "/pages/release/pages/supply/supply",
      //   })
      //   setTimeout(() => {
      //     this.closeModel()
      //   }, 1000);
      // }
    },
    toPurchase: function () {
      wx.getSetting({
        success: res => {
          if (!res.authSetting['scope.userInfo']) {
            this.setData({
              empower: true,
              purchaseStaus: true
            })
            return false;

          } else {
            this.getPhone(3)
          }
        }
      })
    },
    goPurchase(){
      wx.navigateTo({
        url: "/pages/release/pages/purchase/purchase",
      })
      setTimeout(() => {
        this.closeModel()
      }, 1000);
      // if (this.data.userDetails.status != 0) {
      //   wx.showToast({
      //     title: '请联系客服开通权限！',
      //     icon: 'none',
      //     duration: 2000
      //   })
      //   return false
      // } else {
      //   wx.navigateTo({
      //     url: "/pages/release/pages/purchase/purchase",
      //   })
      //   setTimeout(() => {
      //     this.closeModel()
      //   }, 1000);
      // }
    },
  }
})
