// pages/my//pages/address/address.js
const api = require("../../../utils/request");
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },
  selectAddress(e){
    if (app.globalData.selectAddress == true){
      let id = e.currentTarget.dataset.id; 
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let prevPage = pages[pages.length - 2]; 
      //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。 
      prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。 
        addressId: id,
      })
      wx.navigateBack({
        delta: 1
      })
    }
    
  },
  addAdress() {
    wx.navigateTo({
      url: '/pages/mine/editAddress/editAddress',
    })
  },
  edit(e) {
    wx.navigateTo({
      url: '/pages/mine/editAddress/editAddress?edit=1' + '&id=' + e.currentTarget.dataset.id,
    })
  },

  getList() {
    api.wxRequest({
      url: "member/user/getAddressList",
      data: {}
    }).then(res => {
      if (res.data.success == true) {
        this.setData({
          list: res.data.data,
        })
        console.log(this.data.list)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    console.log(app.globalData.selectAddress)

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
    this.setData({
      listL:[]
    })
    this.getList()
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
    if (app.globalData.selectAddress == true) {
      app.globalData.selectAddress = false; 
     
    }else{
      wx.switchTab({
        url: '/pages/tabBarPages/mine/mine',
      })
    }
   
   
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