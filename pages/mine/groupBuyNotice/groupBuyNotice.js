// pages/my/pages/groupBuyNotice/groupBuyNotice.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:''
  },
  loading(){
    wx.showLoading({
      title: '',
    })

    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loading()
    if(options.type == 'login'){
      this.setData({
        url:'https://activity.eggxiaoer.net/privacyPolicy'
      })
      wx.setNavigationBarTitle({
        title: '蛋小二平台隐私政策'
      })
    }else{
      this.setData({
        url: 'https://activity.eggxiaoer.com/groupBuyNotice'
      })
      wx.setNavigationBarTitle({
        title: '拼团须知'
      })
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