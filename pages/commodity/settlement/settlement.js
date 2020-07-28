// pages/commodity//settlement/settlement.js
var app = getApp();
const api = require("../../../utils/request");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeShow: false,
    type: 2,
    selfRaisingInfo: [
      {"label": "提货人","content": wx.getStorageSync('userInfo').name},
      {"label": "提货地址","content": wx.getStorageSync('storeInfo').place},
      {"label": "提货时间","content": ""}
    ],
    goodsList: [],
    deliveryInstructions: [ 
      "配送范围：哪都行",
      "配送时间：自己看着办吧自己看着办吧自己看着办吧自己看着办吧自己看着办吧自己看着办吧自己看着办吧自己看着办吧自己看着办吧"
    ],
    orderInfo: [
      {"label": "商品数量","content": "1"},
      {"label": "订单金额","content": "￥9.38"},
      // {"label": "配送费","content": "有吗"},
    ],
    pickUpWayList: [],
    timeLists: {},
    timeKeys: [],
    timeValues: [],
    selectTime: '',
    buyType: ''
  },

  //显示时间选择
  showTimeSelect: function (){
    this.setData({
      timeShow: true
    })
  },

  //关闭时间选择
  hiddenTimeSelect: function (){
    this.setData({
      timeShow: false
    })
  },

  //选择时间
  selectTime: function(e) {
    console.log(e);
    this.setData({
      selfRaisingInfo: [
        {"label": "提货人","content": wx.getStorageSync('userInfo').name},
        {"label": "提货地址","content": wx.getStorageSync('storeInfo').place},
        {"label": "提货时间","content": this.data.selectTime+ '  ' +e.currentTarget.dataset.time}
      ],
      timeShow: false
    })
  },

  bindDateChange: function(e) {
    this.setData({
      selectTime: e.currentTarget.dataset.time,
      timeValues: this.data.timeLists[e.currentTarget.dataset.time]
    })
  },

  //选择配货方式
  selectType: function(e){
    console.log(this.data.pickUpWayList);
    console.log(this.data.pickUpWayList.includes(20));
    if(e.currentTarget.dataset.type == 1 && !this.data.pickUpWayList.includes(20)){
      wx.showToast({
        title: '商家不支持配送',
      })
    }else if(e.currentTarget.dataset.type == 2 && !this.data.pickUpWayList.includes(10)){
      wx.showToast({
        title: '商家不支持自提',
      })
    }else{
      this.setData({
        type: e.currentTarget.dataset.type
      })
    }
  },

  //获取提货时间列表
  getTimeList: function(){
    api.wxRequest({
      "url": "member/store/time/work/findPickUpTime",
      "data": {
        "storeId":wx.getStorageSync('storeInfo').id
      }
    }).then(res => {
      this.setData({
        timeLists: res.data.data,
        timeKeys: Object.keys(res.data.data),
        selectTime: Object.keys(res.data.data)[0],
        timeValues: res.data.data[Object.keys(res.data.data)[0]]
      })
    })
  },

  //提交订单
  submitOrder: function(){
    if(this.data.selfRaisingInfo[2].content != ''){
      api.wxRequest({
        "url": "trade/order/submit",
        "data": {
          "pickedUp": 10,
          "payWay": 2,
          "appointment": this.data.selfRaisingInfo[2].content,
          "shopId":wx.getStorageSync('storeInfo').id,
          "groupPurchaseId": this.data.goodsList[0].groupId || null,
          "commodityList": this.data.goodsList.map((i) => ({
            "activityId": i.activityId,
            "commodityId": i.commodityId,
            "stockId": i.stockId,
            "buyQuantity": i.quantity,
            "skuId": i.skuId,
            "price": i.activityPrice != null ? i.activityPrice : i.realPrice
          }))
        }
      }).then(res => {
        if(res.data.success){
          console.log(res.data.data);
          if(this.data.buyType == 'settlement'){
            app.globalData.shoppingCarList = []
          }
          wx.redirectTo({
            url: "/pages/mine/orderDetails/orderDetails?id=" + res.data.data.orderNumber
          })
        }else{
          wx.showToast({
            title: res.data.message,
          })
        }
      })
    }else{
      wx.showToast({
        title: '请选择提货时间',
        icon: "none"
      })
    }
  },

  //获取门店配送方式
  getPickUpWayList: function(){
    api.wxRequest({
      "url": "member/store/pickUpWayList",
      "data": {
        "id": wx.getStorageSync('storeInfo').id,
        "toC": 1
      }
    }).then(res => {
      this.setData({
        pickUpWayList: res.data.data,
        type: res.data.data[0] == 10 ? 2 : 1
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPickUpWayList();
    this.getTimeList();
    if(options.buyType == 'settlement'){
      this.setData({
        buyType: options.buyType,
        goodsList: app.globalData.shoppingCarList,
        orderInfo: [
          {"label": "商品数量","content": app.globalData.shoppingCarList.map(i => parseInt(i.quantity)).reduce((pre,next) => pre+next)},
          {"label": "订单金额","content": "￥"+parseFloat(app.globalData.shoppingCarList.map(i => {
            if(i.activityPrice != null){
              return parseFloat(i.activityPrice)*parseInt(i.quantity)
            }else{
              return parseFloat(i.realPrice)*parseInt(i.quantity)
            }
          }).reduce((pre,next) => pre+next)).toFixed(2)},
        ],
      })
    }else if(options.buyType == 'group'){

      let goodsInfo = JSON.parse(options.goodsInfo);
      console.log(options.goodsInfo);
      this.setData({
        buyType: options.buyType,
        goodsList: [goodsInfo],
        orderInfo: [
          {"label": "商品数量","content": goodsInfo.quantity},
          {"label": "订单金额","content": goodsInfo.activityPrice != null ? "￥"+parseFloat(parseFloat(goodsInfo.activityPrice)*parseInt(goodsInfo.quantity)).toFixed(2) : "￥"+parseFloat(parseFloat(goodsInfo.realPrice)*parseInt(goodsInfo.quantity)).toFixed(2)}
        ],
      })
      console.log(this.data.goodsList);
    }
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