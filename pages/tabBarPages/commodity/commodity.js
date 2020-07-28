// pages/tabBarPages/commodity/commodity.js
var app = getApp();
const api = require("../../../utils/request");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classifyList: [],//分类列表
    selectedName: '',
    selectCode: '',
    selectQueryType: '',
    isLoaing: false,
    goodsList: [], //商品列表
    searchText: '',
    nowTime: new Date().getTime(),
    shoppingCarList: [],
    shoppingCarInfo: {
      quantity: 0,
      totalPrice: 0,
      totalGuidePrice: 0,
      totalDiscountPrice: 0,
    },
    shoppingCarIdList: [],
    shoppingCarStockIdList:[],
  },

  //获取分类接口
  getCategoryList: function(){
    wx.showToast({
      title: '加载中',
      icon: "loading"
    })
    api.wxRequest({
      "url": "trade/goods/category/queryByLevel?level=2&queryType=1",
      "method": "GET"
    }).then(res => {
      this.setData({
        classifyList: res.data.data,
        selectedName: res.data.data[0].name,
        selectCode: res.data.data[0].code,
        selectQueryType: res.data.data[0].queryType
      })
      this.getGoodsList(res.data.data[0].code,res.data.data[0].queryType)
    })
  },

  //获取商品列表
  getGoodsList: function(code,queryType){
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    api.wxRequest({
      "url": "trade/commodity/queryList",
      "data": {
        "categorySecondCode": code,
        "keyword": this.data.searchText,
        "showCustomerType": "-1",
        "activityType": 1,
        "serviceAreaId": wx.getStorageSync('storeInfo').id,
        "queryType": queryType
      }
    }).then(res => {
      this.setData({
        goodsList: res.data.data,
      })
      wx.stopPullDownRefresh();
    })
  },

  //输入框的值改变
  setSearchText: function(e){
    this.setData({
      searchText: e.detail.value
    })
  },

  //跳转详情页
  toDetails: function(e){
    console.log(e);
    wx.navigateTo({
      url: '/pages/commodity/goodsDetailsLine/goodsDetailsLine?commodityid='+e.currentTarget.dataset.commodityid+'&stockidlist='+e.currentTarget.dataset.stockidlist.join(","),
    })
  },

  //分类选择
  selectCategory: function(e){
    console.log(e);
    this.setData({
      selectedName: e.currentTarget.dataset.name,
      selectCode: e.currentTarget.dataset.code,
      selectQueryType: e.currentTarget.dataset.querytype
    })
    this.getGoodsList(e.currentTarget.dataset.code,e.currentTarget.dataset.querytype)
  },

  //刷新购物车数据
  refreshShoppingCar: function(){
    this.setData({
      shoppingCarList: app.globalData.shoppingCarList,
      shoppingCarIdList: app.globalData.shoppingCarList.map(i => i.commodityId),
      shoppingCarStockIdList: app.globalData.shoppingCarList.map(i => i.stockId),
      shoppingCarInfo: {
        quantity: app.globalData.shoppingCarList.length > 0 ? app.globalData.shoppingCarList.map(i => parseInt(i.quantity)).reduce((pre,next) => pre+next) : 0,
        totalPrice: app.globalData.shoppingCarList.length > 0 ? parseFloat(app.globalData.shoppingCarList.map(i => {
          if(i.activityPrice != null){
            return parseFloat(i.activityPrice)*parseInt(i.quantity)
          }else{
            return parseFloat(i.realPrice)*parseInt(i.quantity)
          }
        }).reduce((pre,next) => pre+next)).toFixed(2) : 0,
        totalGuidePrice: app.globalData.shoppingCarList.length > 0 ? parseFloat(app.globalData.shoppingCarList.map(i => parseFloat(i.guidePrice)*parseInt(i.quantity)).reduce((pre,next) => pre+next)).toFixed(2) : 0,
        totalDiscountPrice: app.globalData.shoppingCarList.length > 0 ? parseFloat(app.globalData.shoppingCarList.map(i => parseFloat(i.guidePrice)*parseInt(i.quantity)).reduce((pre,next) => pre+next) - app.globalData.shoppingCarList.map(i => {
          if(i.activityPrice != null){
            return parseFloat(i.activityPrice)*parseInt(i.quantity)
          }else{
            return parseFloat(i.realPrice)*parseInt(i.quantity)
          }
        }).reduce((pre,next) => pre+next)).toFixed(2) : 0,
      },
    })
  },
  
  //添加购物车
  addCar: function(e){
    app.globalData.shoppingCarList.push({
      commodityName: e.currentTarget.dataset.goodsinfo.commodityName,
      subtitle: e.currentTarget.dataset.goodsinfo.subtitle,
      labels: e.currentTarget.dataset.goodsinfo.labels,
      image: e.currentTarget.dataset.goodsinfo.imageList[0],
      guidePrice: e.currentTarget.dataset.goodsinfo.guidePrice,
      realPrice: e.currentTarget.dataset.goodsinfo.realPrice,
      activityPrice: e.currentTarget.dataset.goodsinfo.activityPrice,
      stockId: e.currentTarget.dataset.goodsinfo.stockIdList[0],
      skuId: e.currentTarget.dataset.goodsinfo.skuIdList[0],
      commodityId: e.currentTarget.dataset.goodsinfo.commodityId,
      activityId: e.currentTarget.dataset.goodsinfo.activityId,
      skuQuantity: e.currentTarget.dataset.goodsinfo.quantity,
      quantity: 1,
    });
    this.refreshShoppingCar();
  },

  //数量减
  reduceQuantity: function(e){
    app.globalData.shoppingCarList = app.globalData.shoppingCarList.map((i)=>{
      if(i.commodityId == e.currentTarget.dataset.commodityid && i.stockId == e.currentTarget.dataset.stockid){
        return {...i,quantity: i.quantity -1};
      }else{
        return {...i}
      }
    }).filter((i) =>{
      return i.quantity != 0;
    })
    this.refreshShoppingCar();
  },

  onReduce: function(e){
    console.log(e);
    app.globalData.shoppingCarList = app.globalData.shoppingCarList.map((i)=>{
      if(i.commodityId == e.detail.id  && i.stockId == e.detail.stockId){
        return {...i,quantity: i.quantity -1};
      }else{
        return {...i}
      }
    }).filter((i) =>{
      return i.quantity != 0;
    })
    this.refreshShoppingCar();
  },

  addQuantity: function(e){
    console.log(e);
    console.log(app.globalData.shoppingCarList);
    app.globalData.shoppingCarList = app.globalData.shoppingCarList.map((i)=>{
      if(i.commodityId == e.currentTarget.dataset.commodityid && i.stockId == e.currentTarget.dataset.stockid){
        if(i.quantity >= i.skuQuantity){
          wx.showToast({
            title: '不能再加了',
          })
          return {...i}
        }else{
          return {...i,quantity: i.quantity + 1};
        }
      }else{
        return {...i}
      }
    })
    this.refreshShoppingCar();
  },

  onAdd: function(e){
    console.log(e);
    app.globalData.shoppingCarList = app.globalData.shoppingCarList.map((i)=>{
      if(i.commodityId == e.detail.id && i.stockId == e.detail.stockId){
        if(i.quantity >= i.skuQuantity){
          wx.showToast({
            title: '不能再加了',
          })
          return {...i}
        }else{
          return {...i,quantity: i.quantity + 1};
        }
      }else{
        return {...i}
      }
    })
    this.refreshShoppingCar();
  },

  //清空购物车
  cleanShoppingCar: function(){
    app.globalData.shoppingCarList = [];
    this.refreshShoppingCar();
  },

  //搜索
  search: function(){
    this.getGoodsList(this.data.selectCode,this.data.selectQueryType);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCategoryList();
    this.refreshShoppingCar();
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
    this.getCategoryList();
    this.refreshShoppingCar();
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
    this.getCategoryList();
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