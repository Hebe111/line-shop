// components/nearstore/nearstore.js
import Toast from '@vant/weapp/toast/toast';
const api = require("../../../utils/request");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    locationlat: "",
    locationlon: "",
    locationinfo: {},
    storeList: [], //商品列表
    selectTheIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    console.log("oooooonload!!!" + options.latitude);
    this.setData({
      // 获取上个页面传过来的列表发布信息
      locationinfo: options,
      locationlat: options.locationlat,
      locationlon: options.locationlon
    });
    this.getstoreList(options);
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

  //附近的店列表
  getstoreList(info) {
    console.log("经纬是" + info.latitude + " -- " + info.longitude);
    this.setData({
      pageShow: true
    })
    api.wxRequest({
      url: "trade/mini/shop/nearby",
      data: {
        lat: info.locationlat,
        lng: info.locationlon
      }
    }).then(res => {
      if(!res.data.success){
        Toast(res.data.message);
        return;
      }
      console.log("请求返回" + res.data.data);
      let list = res.data.data;
      this.setData({
        storeList: list,
        loading: false,
      });
      
      // list.forEach((item, index, array) => {
      //   console.log(item);
      // });

      Toast.clear()
      wx.stopPullDownRefresh()
    })
  },
  selectTheStore(e) {

    console.log("我点" + e.currentTarget.dataset.index);
    let index = e.currentTarget.dataset.index;
    console.log("我点" + this.data.storeList[index]);
    // let numINfo = "store[" + index + "].buyQuantity";
    this.setData({
      selectTheIndex: index
    });

    var pages = getCurrentPages(); //当前页面
    var prevPage = pages[pages.length - 2]; //上一页面
    prevPage.setData({
      //直接给上一个页面赋值
      storeInfo: this.data.storeList[index],
    });
    wx.setStorageSync('storeInfo', this.data.storeList[index]);
    // wx.setStorageSync({
    //   data: this.data.storeList[index],
    //   key: 'storeInfo',
    // })

    wx.navigateBack({
      //返回
      storedata: this.data.storeList[index]
    })

  }
})