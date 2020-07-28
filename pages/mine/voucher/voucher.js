// pages/mine//voucher/voucher.js
const api = require("../../../utils/request.js");
const QRCode = require("../../../utils/qrCode.js");
var qrcode;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    details:{},

  },
  getSupplyDetails(orderNumber) {
    wx.showLoading({
      title: '加载中',
    })
    api.wxRequest({
      url: "trade/order/myOrderDetail",
      data: {
        orderNumber: orderNumber
      }
    }).then(res => {
      if (res.data.success == true) {
       
        var details = res.data.data;
        qrcode = new QRCode('canvas', {
          text: details.pickUpCodeContent,
          width: 150,
          height: 150,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H,
      });
        this.setData({
          details: details,
        })
        wx.hideLoading() 
        wx.stopPullDownRefresh()
      
        if(details.orderStatus == 90){
          wx.showToast({
            title: '订单已完成！',
            icon: 'none',
            duration: 3000,
            mask: true
          })
        }
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 3000,
          mask: true
        })
      }
     
    })
 
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.getSupplyDetails(options.oederNumber);
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
    this.getSupplyDetails(this.data.details.orderNumber);
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