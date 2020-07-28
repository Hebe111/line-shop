// pages/commodity//goodsDetailsLine/goodsDetailsLine.js
var app = getApp();
const api = require("../../../utils/request");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsInfo: {},
    gropList: [""],
    showModalStatus: false,
    animationData: {},
    shoppingCarList: [],
    goodsInfoBuyQuantity: 0,
    goodsId: null,
    timeData: {},
    selectList: [],
    selectInfo: {
      "minPurchaseQuantity": '',                                                                   
      "maxPurchaseQuantity": '',
      "image": '',
      "stockNum": '',
      "realPrice": '',
      "activityPrice": '',
      "stockId": '',
    },
    shoppingCarInfo: {
      quantity: 0,
      totalPrice: 0,
      totalGuidePrice: 0,
      totalDiscountPrice: 0,
    },
    thisIsSelect: [],
    nextIsSelectList: [],
    groupId: null,
    selectGroupId: null
  },

  //刷新购物车数据
  refreshShoppingCar: function(){
    this.setData({
      shoppingCarList: app.globalData.shoppingCarList,
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
        }).reduce((pre,next) => pre+next).toFixed(2)).toFixed(2) : 0,
      },
    })
  },

  //倒计时
  onChange(e) {
    this.setData({
      timeData: e.detail,
    });
  },

  //显示选择规格弹窗
  showModel:function(){
    var animation = wx.createAnimation({
      duration: 50,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(800).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
      animationData: animation.export()
      })
    }.bind(this), 0)
  },

  //隐藏选择规格弹窗
  hideModal: function () {
    var animation = wx.createAnimation({
      duration: 50,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(800).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
      animationData: animation.export(),
      showModalStatus: false
      })
    }.bind(this), 0)
    this.setData({
      selectGroupId: null
    })
  },

  //购物车数量增加
  onAdd: function(e){
    app.globalData.shoppingCarList = app.globalData.shoppingCarList.map((i)=>{
      if(i.stockId == e.detail.stockId){
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
    this.setData({
      goodsInfoBuyQuantity: app.globalData.shoppingCarList.filter(i => i.stockId == this.data.selectInfo.stockId)[0].quantity,
    })
  },

  //购物车数量减少
  onReduce: function(e){
    app.globalData.shoppingCarList = app.globalData.shoppingCarList.map((i)=>{
      if(i.stockId == e.detail.stockId){
        return {...i,quantity: i.quantity -1};
      }else{
        return {...i}
      }
    }).filter((i) =>{
      return i.quantity != 0;
    })
    this.refreshShoppingCar();
    this.setData({
      goodsInfoBuyQuantity: app.globalData.shoppingCarList.filter(i => i.stockId == this.data.selectInfo.stockId)[0].quantity != undefined ? app.globalData.shoppingCarList.filter(i => i.stockId == this.data.selectInfo.stockId)[0].quantity : 0
    })
  },

  //秒杀数量增加
  add: function(){
    if(app.globalData.shoppingCarList.filter((i) => i.stockId == this.data.selectInfo.stockId).length != 0){
      app.globalData.shoppingCarList = app.globalData.shoppingCarList.map((i)=>{
        if(i.stockId == this.data.selectInfo.stockId){
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
      this.setData({
        goodsInfoBuyQuantity: app.globalData.shoppingCarList.filter(i => i.stockId == this.data.selectInfo.stockId)[0].quantity
      })
    }else{
      app.globalData.shoppingCarList.push({
        commodityName: this.data.goodsInfo.commodityName,
        subtitle: this.data.goodsInfo.subtitle,
        activityId: this.data.goodsInfo.activityId,
        labels: this.data.goodsInfo.labels,
        image: this.data.selectInfo.image,
        guidePrice: this.data.selectInfo.guidePrice,
        realPrice: this.data.selectInfo.realPrice,
        activityPrice: this.data.selectInfo.activityPrice,
        stockId: this.data.selectInfo.stockId,
        skuId: this.data.selectInfo.skuId,
        skuQuantity: this.data.selectInfo.stockNum,
        commodityId: this.data.goodsInfo.id,
        quantity: 1,
      });
      this.refreshShoppingCar();
      this.setData({
        goodsInfoBuyQuantity: app.globalData.shoppingCarList.filter(i => i.stockId == this.data.selectInfo.stockId)[0].quantity
      })
    }
  },

  //秒杀数量减少
  reduce: function(){
    console.log('jianjianajianasnadfisdafsnfj')
    app.globalData.shoppingCarList = app.globalData.shoppingCarList.map((i)=>{
      if(i.stockId == this.data.selectInfo.stockId){
        return {...i,quantity: i.quantity - 1};
      }else{
        return {...i}
      }
    }).filter((i) =>{
      return i.quantity != 0;
    })
    this.refreshShoppingCar();
    this.setData({
      goodsInfoBuyQuantity: app.globalData.shoppingCarList.filter(i => i.stockId == this.data.selectInfo.stockId).length != 0 ? app.globalData.shoppingCarList.filter(i => i.stockId == this.data.selectInfo.stockId)[0].quantity : 0
    })
  },

  //数量增加
  groupAdd: function(){
    console.log(this.data.selectInfo.stockNum );
    if(typeof this.data.selectInfo.image != ''){
      if(this.data.selectInfo.stockNum <= this.data.goodsInfoBuyQuantity){
        wx.showToast({
          title: '库存不足',
        })
      }else{
        this.setData({
          goodsInfoBuyQuantity: this.data.goodsInfoBuyQuantity + 1
        })
      }
    }else{
      wx.showToast({
        title: '请选择规格',
      })
    }
    
  },

  //数量减少
  groupReduce: function(){
    if(this.data.goodsInfoBuyQuantity > 0){
      this.setData({
        goodsInfoBuyQuantity: this.data.goodsInfoBuyQuantity - 1
      })
    }
  },

  //单独购买
  selfBuy: function(){
    if(this.data.selectList.filter((i) => i != '').length == this.data.selectList.length && this.data.goodsInfoBuyQuantity > 0){
      if(app.globalData.shoppingCarList.map((i) => i.stockId).includes(this.data.selectInfo.stockId)){
        app.globalData.shoppingCarList.map((i) => {
          if(i.stockId == this.data.selectInfo.stockId){
            return {...i,quantity: i.quantity + this.data.goodsInfoBuyQuantity}
          }else{
            return {...i}
          }
        })
      }else{
        app.globalData.shoppingCarList.push({
          commodityName: this.data.goodsInfo.commodityName,
          activityId: null,
          subtitle: this.data.goodsInfo.subtitle,
          labels: this.data.goodsInfo.labels,
          image: this.data.selectInfo.image,
          guidePrice: this.data.selectInfo.guidePrice,
          realPrice: this.data.selectInfo.realPrice,
          activityPrice: null,
          stockId: this.data.selectInfo.stockId,
          skuId: this.data.selectInfo.skuId,
          commodityId: this.data.goodsInfo.id,
          skuQuantity: this.data.selectInfo.stockNum,
          quantity: this.data.goodsInfoBuyQuantity,
        });
      }
      wx.showToast({
        title: '已加入购物车',
        duration: 1000
      })
      this.hideModal();
    }else if(this.data.showModalStatus && this.data.selectList.filter((i) => i != '').length < this.data.selectList.length && this.data.goodsInfoBuyQuantity > 0){
      wx.showToast({
        title: '请选择规格',
        duration: 1000,
        icon: "none"
      })
    }else if(this.data.showModalStatus && this.data.selectList.filter((i) => i != '').length == this.data.selectList.length && this.data.goodsInfoBuyQuantity == 0){
      wx.showToast({
        title: '请选择数量',
        duration: 1000,
        icon: "none"
      })
    }else if(!this.data.showModalStatus){
      this.showModel();
    }
  },

  //发起拼团
  groupBuy: function(){
    if(this.data.selectList.filter((i) => i != '').length == this.data.selectList.length && this.data.goodsInfoBuyQuantity > 0){
      wx.navigateTo({
        url: '/pages/commodity/settlement/settlement?buyType=group&goodsInfo='+ JSON.stringify({
          commodityName: this.data.goodsInfo.commodityName,
          activityId: this.data.goodsInfo.activityId,
          image: this.data.selectInfo.image,
          guidePrice: this.data.selectInfo.guidePrice,
          realPrice: this.data.selectInfo.realPrice,
          activityPrice: this.data.selectInfo.activityPrice,
          stockId: this.data.selectInfo.stockId,
          skuId: this.data.selectInfo.skuId,
          commodityId: this.data.goodsInfo.id,
          quantity: this.data.goodsInfoBuyQuantity,
        }),
      })
      this.hideModel();
    }else if(this.data.showModalStatus && this.data.selectList.filter((i) => i != '').length < this.data.selectList.length && this.data.goodsInfoBuyQuantity > 0){
      wx.showToast({
        title: '请选择规格',
        duration: 1000,
        icon: "none"
      })
    }else if(this.data.showModalStatus && this.data.selectList.filter((i) => i != '').length == this.data.selectList.length && this.data.goodsInfoBuyQuantity == 0){
      wx.showToast({
        title: '请选择数量',
        duration: 1000,
        icon: "none"
      })
    }else if(!this.data.showModalStatus){
      this.showModel();
    }
  },

  //去拼团
  group: function(e){    
    if(this.data.selectList.filter((i) => i != '').length == this.data.selectList.length && this.data.goodsInfoBuyQuantity > 0){
      wx.navigateTo({
        url: '/pages/commodity/settlement/settlement?buyType=group&goodsInfo='+ JSON.stringify({
          commodityName: this.data.goodsInfo.commodityName,
          activityId: this.data.goodsInfo.activityId,
          image: this.data.selectInfo.image,
          guidePrice: this.data.selectInfo.guidePrice,
          realPrice: this.data.selectInfo.realPrice,
          activityPrice: this.data.selectInfo.activityPrice,
          stockId: this.data.selectInfo.stockId,
          skuId: this.data.selectInfo.skuId,
          commodityId: this.data.goodsInfo.id,
          quantity: this.data.goodsInfoBuyQuantity,
          groupId: this.data.selectGroupId != null ? this.data.selectGroupId : e.currentTarget.dataset.id 
        }),
      })
      this.hideModel();
    }else if(this.data.showModalStatus && this.data.selectList.filter((i) => i != '').length < this.data.selectList.length && this.data.goodsInfoBuyQuantity > 0){
      wx.showToast({
        title: '请选择规格',
        duration: 1000,
        icon: "none"
      })
    }else if(this.data.showModalStatus && this.data.selectList.filter((i) => i != '').length == this.data.selectList.length && this.data.goodsInfoBuyQuantity == 0){
      wx.showToast({
        title: '请选择数量',
        duration: 1000,
        icon: "none"
      })
    }else if(!this.data.showModalStatus){
      this.setData({
        selectGroupId: e.currentTarget.dataset.id
      })
      this.showModel();
    }
  },

  //选择规格
  bindSelect: function(e){
    console.log(e);
    if((e.currentTarget.dataset.suttleitem == 0 || this.data.selectList[e.currentTarget.dataset.suttleitem - 1] != '') && e.currentTarget.dataset.isbind){
      this.setData({
        goodsInfoBuyQuantity: 0,
        thisIsSelect: this.data.goodsInfo.valueOpts[this.data.goodsInfo.specificationList[e.currentTarget.dataset.suttleitem].key]
      })
      if(this.data.thisIsSelect.includes(e.currentTarget.dataset.item)){
        if(e.currentTarget.dataset.item != this.data.selectList[e.currentTarget.dataset.suttleitem]){
          this.setData({
            selectList: this.data.selectList.map((i,index) => {
              if(index == e.currentTarget.dataset.suttleitem){
                return e.currentTarget.dataset.item
              }else{
                return i
              }
            })
          })
        }else{
          this.setData({
            selectList: this.data.selectList.map((i,index) => {
              if(index == e.currentTarget.dataset.suttleitem){
                return ''
              }else{
                return i
              }
            })
          })
        }
        this.setData({
          selectList: this.data.selectList.map((i,index) => {
            if(index <= e.currentTarget.dataset.suttleitem){
              return this.data.selectList[index];
            }else{
              return '';
            }
          })
        })
        if(e.currentTarget.dataset.suttleitem < this.data.goodsInfo.specificationList.length - 1){
          if(this.data.selectList[e.currentTarget.dataset.suttleitem] != ''){
            this.setData({
              nextIsSelectList: this.data.goodsInfo.skuList.map((i) => {
                if(i.values[this.data.goodsInfo.specificationList[e.currentTarget.dataset.suttleitem].key] == e.currentTarget.dataset.item){
                  return i.values[this.data.goodsInfo.specificationList[e.currentTarget.dataset.suttleitem].key]
                }
              }).filter((i) => i != null)
            })
          }else{
            this.setData({
              nextIsSelectList: this.data.goodsInfo.skuList.map((i) => {
                if(i.values[this.data.goodsInfo.specificationList[e.currentTarget.dataset.suttleitem].key] == e.currentTarget.dataset.item){
                  return i.values[this.data.goodsInfo.specificationList[e.currentTarget.dataset.suttleitem].key]
                }
              }).filter((i) => i != null)
            })
          }
          this.setData({
            selectInfo: {
              "minPurchaseQuantity": '',                                                                   
              "maxPurchaseQuantity": '',
              "image": '',
              "stockNum": '',
              "realPrice": '',
              "activityPrice": '',
              "stockId": '',
            }
          })
        }else{
          if(this.data.selectList[e.currentTarget.dataset.suttleitem] != ''){
            this.setData({
              selectInfo: this.data.goodsInfo.skuList.map((i) => {
                if(Object.values(i.values).toString() == this.data.selectList.toString()){
                  return i;
                }
              }).filter((i) => i != null)[0]
            })
          }else{
            this.setData({
              selectInfo: {
                "minPurchaseQuantity": '',                                                                   
                "maxPurchaseQuantity": '',
                "image": '',
                "stockNum": '',
                "realPrice": '',
                "activityPrice": '',
                "stockId": '',
              }
            })
          }
        }
      }
    }else{
      wx.showToast({
        title: '不能选择',
      })
    }
  },

  //获取商品详情
  getGoodsDetails(id,stockIds,groupId){
    api.wxRequest({
      "url": "trade/commodity/findCommodityDetail",
      "data": {
        "id": id,
        "stockIds": stockIds,
      }
    }).then(res => {
      console.log(res);
      if(res.data.data.activityType == 1){
        this.setData({
          goodsId: res.data.data.id,
          shoppingCarList: app.globalData.shoppingCarList,
          selectInfo: res.data.data.skuList[0],
          goodsInfoBuyQuantity: app.globalData.shoppingCarList.filter(i => i.stockId == stockIds[0]).length != 0 ? app.globalData.shoppingCarList.filter(i => i.stockId == stockIds[0])[0].quantity : 0
        });
        this.refreshShoppingCar();
      }else{
        if(res.data.data.activityType == 2){
          this.getGroupList(res.data.data.activityId,groupId);
        }
        if(res.data.data.specificationList.length != 0){
          this.setData({
            selectList: res.data.data.specificationList.map((i) => ''),
            thisIsSelect: res.data.data.valueOpts[res.data.data.specificationList[0].key],
            goodsInfoBuyQuantity: 0
          });    
          if(res.data.data.skuList.length == 1){
            this.setData({
              selectInfo: res.data.data.skuList[0],
              selectList: res.data.data.valueOpts[res.data.data.specificationList[0].key],
            });
          }
        }else{
          this.setData({
            selectInfo: res.data.data.skuList[0],
            goodsInfoBuyQuantity: 0
          });
        }
      }
      this.setData({
        goodsInfo: res.data.data,
      })
    })
  },

  //获取拼团列表
  getGroupList: function(activityId,id){
    api.wxRequest({
      "url": "trade/activity/group/record/findList",
      "data": {
        "activityId": activityId,
        "teamUp":"1",
        "storeId": wx.getStorageSync('storeInfo').id,
        "groupStatus":"0",
        "id": id
      }
    }).then(res => {
      this.setData({
        gropList: res.data.data
      })
    })
  },

  //进店逛逛
  toHome: function(){
    console.log('aaaaaa');
    wx.switchTab({
      url: '/pages/tabBarPages/home/home',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      groupId: options.id,
      selectGroupId: options.id
    })
    this.getGoodsDetails(options.commodityid,options.stockidlist.split(','),options.id);
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
    this.refreshShoppingCar();
    this.setData({
      selectGroupId: null,
      showModalStatus: false,
    })
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