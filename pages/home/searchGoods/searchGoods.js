// pages/home/searchGoods/searchGoods.js
import Toast from '@vant/weapp/toast/toast';
const api = require("../../../utils/request");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList:[],
    value:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },
  onChange(e) {
    this.setData({
      value: e.detail,
    });
  },
  onSearch(){
    // Toast(this.data.value)
    // return;
    this.gethotSellingList(this.data.value);
  },
  onCancel(){
    // wx.navigateBack({})
  },

  //热销商品
  gethotSellingList(str) {
    var thestroe = wx.getStorageSync('storeInfo')
    console.log("请求商品"+str);
    api.wxRequest({
      url: "trade/commodity/queryList",
      data: {
        "categoryFirstCode":"",
        "categorySecondCode":"",
        "categoryCode":"",
        "keyword":str,
        "showCustomerType":"-1",
        "serviceAreaId":thestroe.id,
        "queryType":"0"
    }
    }).then(res => {
      console.log("请求返回"+res.data.data);
      let list = res.data.data;
      
      if(list == null || list == []){
        Toast('未搜索到'+thestroe.name+"的相应商品");
        this.setData({
          goodsList: [],
          loading: false,
        });
        return;
      }
      Toast('搜索到'+thestroe.name+"的相应商品 "+list.length+'件');
      this.setData({
        goodsList: list,
        loading: false,
      });
      // list.forEach((item, index, array) => {
      // console.log(item);
        
      // });
      
      // Toast.clear()
      wx.stopPullDownRefresh()
    })
  },
  //跳转详情页
  toDetails: function(e){
    console.log(e);
    wx.navigateTo({
      url: '/pages/commodity/goodsDetailsLine/goodsDetailsLine?commodityid='+e.currentTarget.dataset.commodityid+'&stockidlist='+e.currentTarget.dataset.stockidlist.join(","),
    })
  },
})