// pages/home/chooseAdress/chooseAdress.js
const api = require("../../../utils/request");
const app = getApp()

const referer = '蛋小二交易平台'; //调用插件的app的名称
const location = JSON.stringify({
  latitude: 39.89631551,
  longitude: 116.323459711
});
const category = '小区,娱乐休闲,生活服务';
const chooseLocation = requirePlugin('chooseLocation');
const QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');

const key = 'CXOBZ-SKEWD-5GY4K-PXQWV-GBARJ-CUFBQ'; //使用在腾讯位置服务申请的key
// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: key // 必填
});
Page({
  /**
   * 页面的初始数据
   */
  data: {
    addreeText: '选择右侧按钮重新定位',
    openingBank: '',
    list: [],
    locationAD:{},
    locationName:"-"
  },
  choosethead(e){
    if(this.data.locationAD.name == null ||this.data.locationAD.name == ""){
      return false;
    }
    let id = e.currentTarget.dataset.id; 
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2]; 
    var li = { latitude: this.data.locationAD.latitude,
       longitude: this.data.locationAD.longitude};
       console.log(li);
    //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。 
    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。 
      locationName:this.data.locationAD.name,
      locationInfo:li
    })
    wx.navigateBack({
      
    })
  },
  selectAddress(e){
    let item = e.currentTarget.dataset.item; 
    var li = { latitude: item.lat,
      longitude: item.lng};
    if(item.lat == "" || item.lat == null){
      qqmapsdk.geocoder({
        //获取表单传入地址
        address: item.city+item.county+item.address, //地址参数，例：固定地址，address: '北京市海淀区彩和坊路海淀西大街74号'
        success: function(res) {//成功后的回调
          console.log(res);
          var res = res.result;
          li = { latitude: res.location.lat,
            longitude: res.location.lng};
          
          //根据地址解析在地图上标记解析地址位置
           
        },
        fail: function(error) {
	
      wx.showToast({
  title: '该地址经纬度异常，您可尝试重新编辑！',
  icon: 'none',
  duration: 1500
})
          console.error(error);
        },
        complete: function(res) {
          wx.showToast({
            title: '该地址经纬度异常，您可尝试重新编辑！',
            icon: 'none',
            duration: 1500
          })
          console.log(res);
        }
      })
      
    }else{
      li = { latitude: item.lat,
        longitude: item.lng};
    }

    
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2]; 
    //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。 
    if(prevPage){
      prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。 
        locationName:item.address,
        locationInfo:li
      })
      wx.navigateBack({})
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
    
    this.setData({
      locationName:options.locationName
      // locationAD:{"name":this.data.adressnae}
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

    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    console.log(location)
    if(location != null){
      this.setData({
// address: "上海市浦东新区世纪大道"
// city: "上海市"
// district: "浦东新区"
// latitude: 31.22114
// longitude: 121.54409
// name: "上海市浦东新区人民政府(世纪大道北)"
// province: "上海市"
        locationAD:location
        // openingBank:location.name,
        // lat:location.latitude,
        // lng:location.longitude
      })
    }

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

  toChoseLocation(){
    wx.navigateTo({
      url: `plugin://chooseLocation/index?key=${key}&referer=${referer}&category=${category}`
    });
  },
  getOpeningBank: function (e) {
    const val = e.detail.value;
    console.log("??"+val);
    if (!val) {
      this.setData({
        locationAD: {name:val}
      });
    } else {
      this.setData({
        locationAD: {name:val}
      });
    }
  
  },
})
