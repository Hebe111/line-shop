// pages/seckill/seckill.js
import Toast from '@vant/weapp/toast/toast';
var app = getApp();
const api = require("../../../utils/request");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:"",
    seckillGoodsList:[],
    time: 30 * 60 * 60 * 1000 *400,
    nowTime: new Date().getTime(),
    classifyList: [],//分类列表
    selectedName: '',
    selectCode: '',
    selectQueryType: '',
    isLoaing: false,
    goodsList: [], //商品列表
    searchText: '',
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.getseckillList(options.id);

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
    //限时抢购
    getseckillList(id) {
      console.log("请求限时抢购商品"+id);
      api.wxRequest({
        url: "trade/commodity/queryList",
        data: {
          "showCustomerType":"-1",//展示2B/2C用户（即 2B商品 / 2C商品）：-1 面向2C用户， 1 面向2B用户
          "serviceAreaId":id,//服务区ID （店铺ID） 必传
          "activityType":"1",//1 秒杀活动，2 拼团活动
          "queryType":"1"//查询类型：0（或者 null） 普通商品列表、1 活动商品列表、2 热销商品列表
      }
      }).then(res => {
        console.log("请求返回"+res.data.data);
        let list = res.data.data;
        console.log(list.length + "----1=====");
        this.setData({
          seckillGoodsList: list,
          loading: false,
        });
        // list.forEach((item, index, array) => {
        // console.log(item);
          
        // });
        
        Toast.clear()
        wx.stopPullDownRefresh()
      })
    },



    
  plus(e) {
    var that = this;
    console.log(e.currentTarget.dataset.index + '--------e.currentTarget.dataset.index');
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          this.setData({
            empower: true,
          })
          return false;
        } else {
          let index = e.currentTarget.dataset.index;
          let numINfo = "goodsList[" + index + "].buyQuantity";
          let buyLi = [];
          // 加值小于最大值，才允许加法运算 
          if (that.data.goodsList[index].remainQuantity > 0) {
            var num = that.data.goodsList[index].buyQuantity + 1;
            if (num <= that.data.goodsList[index].remainQuantity) {
              that.setData({
                [numINfo]: num,
              })
            } else {
              Toast('此商品库存不足');
              console.log('此商品库存不足');

            }
            that.data.goodsList.forEach((item, index, array) => {
              //执行代码
              if (item.buyQuantity > 0) {
                let one = {};
                one.commodityId = item.commodityId;
                one.stockId = item.stockId;
                one.buyQuantity = item.buyQuantity;
                one.price = item.price;
                buyLi.push(one);
              }
              console.log(buyLi.length)
              that.setData({
                buyListNumberLength: buyLi.length
              })
            })
            
          } else {
            Toast('此商品库存不足');

          }



        }
      }
    })


  },
  // 减法
  minus(e) {
    var that = this;
    console.log(e.currentTarget.dataset.index + '--------e.currentTarget.dataset.index');
    let index = e.currentTarget.dataset.index;
    let numINfo = "goodsList[" + index + "].buyQuantity";
    let buyLi = [];

    // 减值大于最小值，才允许减法运算
    var num = that.data.goodsList[index].buyQuantity - 1;
    if (num >= this.data.min) {
      that.setData({
        [numINfo]: num
      })
    }
    that.data.goodsList.forEach((item, index, array) => {
      //执行代码
      // console.log(item)
      if (item.buyQuantity > 0) {
        buyLi.push(item);
      }
      that.setData({
        buyListNumberLength: buyLi.length
      })
    })
    

  },
  //商品列表
  getGoodsList(id) {
    console.log("id是"+id);
    this.setData({
      pageShow: true
    })
    api.wxRequest({
      url: "trade/mini/commodity/findList",
      data: {
        shopId: id
      }
    }).then(res => {
      console.log("请求返回"+res.data.data);
      let list = res.data.data;
      
      let buyLi = [];
      if (this.data.fromGoodsInfo) {
        list.forEach((item, index, array) => {
          //执行代码 
          if (item.commodityId == this.data.fromGoodsInfo.commodityId) {
            item.buyQuantity = this.data.fromGoodsInfo.buyQuantity;
          }

          if (item.buyQuantity > 0 && item.remainQuantity > 0) {
            let one = {};
            one.commodityId = item.commodityId;
            one.stockId = item.stockId;
            one.buyQuantity = item.buyQuantity;
            one.price = item.price;
            buyLi.push(one);
          }
          this.setData({
            buyListNumberLength: buyLi.length
          })
          console.log(buyLi.length)
        })
      }
      console.log(list.length + "----=====");
      list = list.concat(list);
      list = list.concat(list);
  

      this.setData({
        goodsList: list,
        loading: false,
      });
      list.forEach((item, index, array) => {
      console.log(item);
        
      });
      
      Toast.clear()
      wx.stopPullDownRefresh()
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
        return {...i,quantity: i.quantity + 1};
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
        return {...i,quantity: i.quantity + 1};
      }else{
        return {...i}
      }
    })
    this.refreshShoppingCar();
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

})