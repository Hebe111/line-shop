// components/shoppingCar.js
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shoppingCarList: {
      type: Array,
      value: []
    },
    shoppingCarInfo: {
      type: Object,
      value: {}
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    animationData: {},
    showModalStatus: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //显示购物车列表弹窗
    showModel:function(){
      var animation = wx.createAnimation({
        duration: 200,
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
      }.bind(this), 200)
    },

    //隐藏购物车列表弹窗
    hideModal: function () {
      var animation = wx.createAnimation({
        duration: 200,
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
      }.bind(this), 200)
    },

    //去结算
    goSettlement: function(){
      if(this.data.shoppingCarList.length == 0){
        wx.showToast({
          title: '请选购商品',
          duration: 2000,
          icon: "none"
        })
      }else{
        wx.navigateTo({
          url: '/pages/commodity/settlement/settlement?buyType=settlement',
        })
      }
    },

    //减
    reduce: function(e){
      this.triggerEvent("reduce",{"id":e.currentTarget.dataset.id,"stockId": e.currentTarget.dataset.stockid})
    },

    //加
    add: function(e){
      this.triggerEvent("add",{"id": e.currentTarget.dataset.id,"stockId": e.currentTarget.dataset.stockid})
    },
    
    //清空购物车
    cleanShoppingCar: function(){
      this.hideModal();
      this.triggerEvent("cleanShoppingCar")
    }
  }
})
