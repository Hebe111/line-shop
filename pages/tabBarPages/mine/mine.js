// pages/mine/mine.js
import Toast from '@vant/weapp/toast/toast';
const api = require("../../../utils/request");
const app = getApp();
var that = this;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    requestPath: '',
    userInfo: {},
    Authorization: '',
    empower: false, //授权
    buyList: [{
        src: 'https://oss.eggxiaoer.com/web/underTheLine/tobepaid.png',
        text: '待支付',
        num: 0,
        index: '1'
      },
      {
        src: 'https://oss.eggxiaoer.com/web/underTheLine/waitShare.png',
        text: '待分享',
        num: 0,
        index: '2'
      },
      {
        src: 'https://oss.eggxiaoer.com/web/underTheLine/tobeshipped.png',
        text: '待发货',
        num: 0,
        index: '3'
      },
      {
        src: 'https://oss.eggxiaoer.com/web/underTheLine/tobereceived.png',
        text: '待收货',
        num: 0,
        index: '4'
      },
      {
        src: 'https://oss.eggxiaoer.com/web/underTheLine/cancelled.png',
        text: '已取消',
        num: '',
        index: '5'

      },
    ],
    myServiceList: [{
        src: 'https://oss.eggxiaoer.com/web/underTheLine/myAddress.png',
        text: '地址管理',
        num: '',
        index: '1'
      },
      {
        src: 'https://oss.eggxiaoer.com/web/underTheLine/privacy.png',
        text: '隐私政策',
        num: '',
        index: '2'

      },
      // {
      //   src: 'https://oss.eggxiaoer.com/web/underTheLine/setting.png',
      //   text: '设置',
      //   num: '',
      //   index: '3'

      // },
    ],

  },

  //
  toPersonalHomepage() {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          this.setData({
            empower: true
          })
          return false

        }  
      }
    })


  },
  getCountMyOrder() {
    api.wxRequest({
      url: "trade/order/countMyOrder",

    }).then(res => {
      if (res.data.success == true) {
        let data = res.data.data;
        this.setData({
          'buyList[0].num': Number(data.buy[0]),
          'buyList[1].num': Number(data.buy[3]),
          'buyList[2].num': Number(data.buy[1]),
          'buyList[3].num': Number(data.buy[2])
        })
        console.log(typeof (this.data.buyList[3].num))
      }
    })
  },
  submitOrder() {
    api.wxRequest({
      url: "trade/order/submit",
      data: {
        pickedUp: 10,
        payWay: 2,
        appointment: "2020-07-15 14:30",
        shopId: wx.getStorageSync('storeInfo').id,
        groupPurchaseId:11,
        commodityList: [{
          activityId: 3,
          commodityId: "EXRS18010107",
          stockId: "STCK18010490",
          skuId: "SKU07",
          buyQuantity: 1,
          price: 2
        }]
      }
    }).then(res => {
      if (res.data.success == true) {
        let paymentInfo = res.data.data
        this.pay(paymentInfo.timestamp, paymentInfo.nonceStr, paymentInfo.packet, paymentInfo.signType, paymentInfo.sign, paymentInfo.orderNumber)

      } else {
        Toast(res.data.message);
        this.setData({
          buttonStatus: false
        })
        setTimeout(() => {
          Toast.clear()
        }, 1000);

      }
    })

  },

  pay(timeStamp, nonceStr, packet, signType, paySign, orderNumber) {
    var that = this;
    wx.requestPayment({
      timeStamp: timeStamp,
      nonceStr: nonceStr,
      package: packet,
      signType: signType,
      paySign: paySign,
      success(res) {
        console.log(res)
        if (res.errMsg == 'requestPayment:ok') {
          Toast.success('支付成功！');
          that.setData({
            buttonStatus: false
          })
          setTimeout(() => {
            Toast.clear()
          }, 2000);
          wx.navigateTo({
            url: "/pages/orderDetails/orderDetails?orderNumber=" + orderNumber,
          })
        }
      },
      fail(res) {
        console.log(res)
        if (res.errMsg == 'requestPayment:fail cancel') {
          Toast.fail('支付失败');
          // that.getGoodsList(that.data.storeInfo.id);
          that.setData({
            buttonStatus: false,
            // totalPrice: 0,
            // buyListNumberLength: 0
          })
          setTimeout(() => {
            Toast.clear()
          }, 1000);

        }

      },
      complete(res) {
        // console.log(res)
        // wx.showToast({
        //   title: res.errMsg,
        //   icon: 'none',
        //   duration: 2000
        // })

      }

    })

  },

  goOrderList(e) {
    if(!this.data.Authorization){
      return false
    }
    wx.navigateTo({
      url: '/pages/mine/myOrderList/myOrderList?type=' + e.currentTarget.dataset.type + '&currentIndex=' + e.currentTarget.dataset.index,
    })
  },

  goOrderOne(e) {
    if(!this.data.Authorization){
      return false
    }
    console.log(e.currentTarget.dataset.type)
    console.log(e.currentTarget.dataset.index)
    wx.navigateTo({
      url: '/pages/mine/myOrderList/myOrderList?type=' + e.currentTarget.dataset.type + '&currentIndex=' + e.currentTarget.dataset.index,
    })
  },
  goService(e) {
    if(!this.data.Authorization){
      return false
    }
    console.log(e.currentTarget.dataset.type)
    console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index;
    if (index == 1) {
      wx.navigateTo({
        url: '/pages/mine/address/address'
      })
    } else if (index == 2) {
      wx.navigateTo({
        url: '/pages/mine/groupBuyNotice/groupBuyNotice?type=login'
      })
    } else if (index == 3) {
      wx.navigateTo({
        url: '/pages/mine/address/address'
      })
    }

  },
  
  //授权监听
  onEmpowerEvent(e) {
    console.log(e.detail)
    if (e.detail.empower == false) {
      this.setData({
        empower: false
      })

    } else if (e.detail.Authorization) {
      this.setData({
        Authorization: e.detail.Authorization,
        empower: false,
        userInfo: e.detail.userInfo
      })
      this.getCountMyOrder();
    }


  },
  
  //获取当前登陆人信息
  getUserInfo() {
    api.wxRequest({
      url: "member/user/info",
      method: 'get',
      data: {}
    }).then(res => {
      if (res.data.success == true) {
        this.setData({
          userInfo: res.data.data,
        })
      }
    })
  },
  getAuthorization(){
    var Authorization = wx.getStorageSync('Authorization')
    if(!Authorization){
      return false;
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // app.editTabbar();
    var Authorization = wx.getStorageSync('Authorization')
    this.setData({
      Authorization: Authorization,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.data.Authorization){
      if (!this.userInfo) {
        this.getUserInfo();
        var userInfo = wx.getStorageSync('userInfo')
        console.log(wx.getStorageSync('userInfo'))
        this.setData({
          userInfo: userInfo
        })
      }
      this.getCountMyOrder()
    }
   


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})