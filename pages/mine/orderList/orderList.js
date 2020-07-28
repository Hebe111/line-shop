// pages/orderList/orderList.js
import Toast from '@vant/weapp/toast/index';
const api = require("../../../utils/request.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oederList: [],
    pageShow: true,
    loading: true,
    pageNum: 1,
    pageSize: 10,
    pageNumInfo: 2,
    noMore:false,
    noMoreText:''
  },
  goOrderTails(e){
    wx.navigateTo({
      url: "/pages/mine/orderDetails/orderDetails?orderNumber=" + e.currentTarget.dataset.ordernumber,
    })
  },
  getOrderList(pageNum) {
    var that = this;
    console.log(pageNum )
    console.log( this.data.pageNumInfo )
    if (pageNum > this.data.pageNumInfo) {
      console.log(pageNum - this.data.pageCount );
      this.setData({
        noMore:true,
        noMoreText:'没有更多订单了~'
      })
      return false;
    } else {
      Toast.loading({
        mask: false,
        message: '加载中...'
      });
      api.wxRequest({
        url: "trade/mini/order/myOrders",
        data: {
          pageNum: pageNum,
          pageSize: this.data.pageSize,
        }
      }).then(res => {
        if (res.data.success == true) {
          let list = res.data.data;
          var time = require('../../../utils/util.js');
          for (var i = 0; i < list.length; i++) {
            list[i]["payTime"] = time.formatTimeTwo(list[i]["payTime"], 'M/D h:m:s')
          }
          this.setData({
            oederList: this.data.oederList.concat(list),
            pageNumInfo: res.data.pageCount,
            loading: false,
            pageShow: true
          })

          Toast.clear();
          wx.stopPullDownRefresh();
        } else {
          this.setData({
            pageShow: false
          })
        }

      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderList(1);

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
    this.setData({
      oederList: [],
    })
    this.getOrderList(1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.pageNum++;
    this.getOrderList(this.data.pageNum);

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})