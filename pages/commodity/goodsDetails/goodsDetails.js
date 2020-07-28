// pages/goodsDetails/goodsDetails.js
// pages/index/index.js
import Toast from '@vant/weapp/toast/toast';
const api = require("../../../utils/request.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodDetails: {},
    loading: true,
    pageShow: true,
    overlayShow: false,
    num: 1,
    min: 0,
    max: 10000,
    storeInfo: {},
    totalPrice: 0,
    bindgetphonenumberStatus: false,
    optionsInfo: {},
    Authorization: '',
    buttonStatus: false

  },
  //支付
  toPay() {
    var that = this;
    console.log("pay");
    wx.getSetting({
      success: res => {
        console.log(res)
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            empower: true,
          })
          return false;
        } else {
          let userInfo = wx.getStorageSync('userInfo');
          if (!userInfo.phoneNumber) {
            let noPhoneNumber = wx.getStorageSync('noPhoneNumber');
            if (noPhoneNumber == 1) {
              // 唤起支付 
              that.submitOrder();
            } else {
              that.setData({
                bindgetphonenumberStatus: true
              })
            }
          } else {

            that.submitOrder();
          }
        }
      }
    })



  },

  submitOrder() {
    var that = this;
    if (this.data.goodDetails.remainQuantity > 0) {

      if (this.data.goodDetails.buyQuantity > 0) {

        that.setData({
          buttonStatus: true
        })
        let one = {};
        let buyLi = [];
        one.commodityId = that.data.goodDetails.commodityId;
        one.stockId = that.data.goodDetails.stockId;
        one.buyQuantity = that.data.goodDetails.buyQuantity;
        one.price = that.data.goodDetails.price;
        buyLi.push(one);
        api.wxRequest({
          url: "trade/mini/order/submit",
          data: {
            commodityList: buyLi,
            shopId: that.data.storeInfo.id,
            version:"1.0"
          }
        }).then(res => {
          if (res.data.success == true) {
            let paymentInfo = res.data.data
            that.pay(paymentInfo.timestamp, paymentInfo.nonceStr, paymentInfo.packet, paymentInfo.signType, paymentInfo.sign, paymentInfo.orderNumber)

          } else {
            Toast(res.data.message);
            that.setData({
              buttonStatus: false
            })
            setTimeout(() => {
              Toast.clear()
            }, 1000);
          }
        })
        // wx.showModal({
        //   title: "重要提示",
        //   content: "请确认是否在店内购买？",
        //   showCancel: true,
        //   cancelText: "否",
        //   cancelColor: "#000",
        //   confirmText: "是",
        //   confirmColor: "#0f0",
        //   success: function (res) {
        //     console.log(res)
        //     if (res.confirm) {
        //       that.setData({
        //         buttonStatus: true
        //       })
        //       let one = {};
        //       let buyLi = [];
        //       one.commodityId = that.data.goodDetails.commodityId;
        //       one.stockId = that.data.goodDetails.stockId;
        //       one.buyQuantity = that.data.goodDetails.buyQuantity;
        //       one.price = that.data.goodDetails.price;
        //       buyLi.push(one);
        //       api.wxRequest({
        //         url: "trade/mini/order/submit",
        //         data: {
        //           commodityList: buyLi,
        //           shopId: that.data.storeInfo.id,
        //         }
        //       }).then(res => {
        //         if (res.data.success == true) {
        //           let paymentInfo = res.data.data
        //           that.pay(paymentInfo.timestamp, paymentInfo.nonceStr, paymentInfo.packet, paymentInfo.signType, paymentInfo.sign, paymentInfo.orderNumber)

        //         } else {
        //           Toast(res.data.message);
        //           that.setData({
        //             buttonStatus: false
        //           })
        //           setTimeout(() => {
        //             Toast.clear()
        //           }, 1000);
        //         }
        //       })
        //     } else  if (res.cancel) {
        //       Toast.fail('请到店购买');

        //     }
        //   }
        // })

      } else {
        Toast.fail('请选购商品');

      }
    } else {
      Toast('此商品库存不足');

    }


  },

  pay(timeStamp, nonceStr, packet, signType, paySign, orderNumber) {
    var that = this;
    wx.requestPayment({
      timeStamp: timeStamp,
      nonceStr: nonceStr,
      package: packet,
      signType: signType,
      paySign: paySign,
      success(res) {
        console.log(res)
        if (res.errMsg == 'requestPayment:ok') {
          Toast.success('支付成功！');
          that.setData({
            buttonStatus: false,
          })
          setTimeout(() => {
            Toast.clear()
          }, 2000);
          wx.navigateTo({
            url: "/pages/orderDetails/orderDetails?orderNumber=" + orderNumber,
          })
        }
      },
      fail(res) {
        console.log(res)
        if (res.errMsg == 'requestPayment:fail cancel') {
          Toast.fail('支付失败');
          that.setData({
            buttonStatus: false,
          })
          setTimeout(() => {
            Toast.clear()
          }, 1000);

        }

      },
      complete(res) {
        // console.log(res)
        // wx.showToast({
        //   title: res.errMsg,
        //   icon: 'none',
        //   duration: 2000
        // })

      }
    })
  },

  //获取手机号
  getPhoneNumber(e) {
    console.log(e)
    var that = this;
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      wx.checkSession({
        success: function (res) {
          console.log("处于登录态");
          api.wxRequest({
            url: "member/mini/user/bindWxPhoneNumber",
            data: {
              wxEncryptedData: e.detail.encryptedData,
              wxIv: e.detail.iv,
              wxJsCode: ""
            }
          }).then(res => {
            if (res.data.success == true) {
              console.log('绑定手机号成功')
              Toast.success('绑定手机号成功');
              setTimeout(() => {
                Toast.clear()
              }, 1000);
              that.setData({
                bindgetphonenumberStatus: false
              })
              that.getInfo();
              // 唤起支付
              that.toPay();

            }
          })
        },
        fail: function (res) {
          console.log("需要重新登录");
          wx.login({
            success(res) {
              api.wxRequest({
                url: "member/mini/user/bindWxPhoneNumber",
                data: {
                  wxEncryptedData: e.detail.encryptedData,
                  wxIv: e.detail.iv,
                  wxJsCode: res.code
                }
              }).then(res => {
                if (res.data.success == true) {
                  console.log('绑定手机号成功')
                  Toast.success('绑定手机号成功');
                  setTimeout(() => {
                    Toast.clear()
                  }, 1000);
                  that.setData({
                    bindgetphonenumberStatus: false
                  })
                  that.getInfo();

                  // // 唤起支付
                  // that.toPay();

                }
              })
            },
            fail(res) {

            },
            complete: (res) => { },
          })
        }
      })


    } else {
      wx.setStorageSync('noPhoneNumber', '1');
      that.setData({
        bindgetphonenumberStatus: false
      })
      that.getInfo();

      // this.toPay()
    }
  },
  //
  getInfo() {
    api.wxRequest({
      url: "member/user/info",
      method: "get",
      data: {
        Authorization: this.data.Authorization
      }
    }).then(res => {
      wx.setStorageSync('userInfo', res.data.data);
      this.toPay(res.data.data);
    })

  },
  //
  goStore() {
    let fromGoodsInfo = {};
    fromGoodsInfo.commodityId = this.data.goodDetails.commodityId;
    fromGoodsInfo.buyQuantity = this.data.goodDetails.buyQuantity;
    app.globalData.fromGoodsInfo = fromGoodsInfo;
    wx.navigateTo({
      url: '/pages/index/index'
    })
  },
  //
  getDetails(id, shopId,stockId) {
    this.setData({
      pageShow: true
    })
    api.wxRequest({
      url: "trade/mini/commodity/findDetail",
      data: {
        shopId: shopId,
        commodityId: id,
        stockId:stockId
      }
    }).then(res => {
      this.setData({
        goodDetails: res.data.data,
        loading: false,
      })
      wx.setNavigationBarTitle({
        title: res.data.data.commodityName,
      })
    })
  },
  //
  plus(e) {
    var that = this;
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          this.setData({
            empower: true,
          })
          return false;
        } else {
          if (that.data.goodDetails.remainQuantity > 0) {
            let numINfo = "goodDetails.buyQuantity";
            // 加值小于最大值，才允许加法运算 
            var num = that.data.goodDetails.buyQuantity + 1;
            console.log(num)
            if (num <= that.data.goodDetails.remainQuantity) {
              that.setData({
                [numINfo]: num
              })
              that.calculation();

            } else {
              Toast('此商品库存不足');

            }
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
    let numINfo = "goodDetails.buyQuantity";

    // 减值大于最小值，才允许减法运算
    var num = that.data.goodDetails.buyQuantity - 1;
    if (num >= this.data.min) {
      that.setData({
        [numINfo]: num
      })
      that.calculation();

    }

  },
  //计算价格
  calculation() {
    var that = this;
    if (that.data.goodDetails.buyQuantity > 0) {

      let one = {};
      let buyLi = [];
      one.commodityId = that.data.goodDetails.commodityId;
      one.stockId = that.data.goodDetails.stockId;
      one.buyQuantity = that.data.goodDetails.buyQuantity;
      one.price = that.data.goodDetails.price;
      buyLi.push(one);

      api.wxRequest({
        url: "trade/mini/order/calculate",
        data: {
          commodityList: buyLi,
          shopId: that.data.storeInfo.id,
          version:"1.0"
        }
      }).then(res => {
        if (res.data.success == true) {
          that.setData({
            totalPrice: res.data.data.amount,
          })

        } else {
          Toast(res.data.message);

        }
      })
    } else {
      that.setData({
        totalPrice: 0,
      })
    }
  },
  //授权监听
  onEmpowerEvent(e) {
    console.log(e)
    if (e.detail.empower == false) {
      this.setData({
        empower: false
      })
    } else if (e.detail.Authorization) {
      this.setData({
        Authorization: e.detail.Authorization,
        empower: false
      })
    } else if (e.detail.phoneNumber == false) {
      this.setData({
        bindgetphonenumberStatus: true
      })
    }


  },
  //根据经纬度获取最近的店铺
  getStore(info) {
    api.wxRequest({
      url: "trade/mini/shop/nearest",
      data: {
        lat: info.latitude,
        lng: info.longitude
      }
    }).then(res => {
      if (res.data.success == true) {

        if (res.data.data != null) {
          this.setData({
            storeInfo: res.data.data,
          })
          console.log(this.data.goodDetails)
          if (this.data.optionsInfo.from == 1) {
            this.getDetails(this.data.optionsInfo.commodityid, this.data.optionsInfo.shopId);

          } else if (this.data.optionsInfo.from == 2) {
            this.getDetails(this.data.optionsInfo.commodityid, res.data.data.id);

          }
          wx.setStorageSync('storeInfo', res.data.data);
        } else {
          Toast("您不在店铺附近，请换个位置哦！");
          this.setData({
            pageShow: false,

          })
        }


      }

    })
  },
  //获取定位经纬度
  getLocation() {
    console.log('ingetLocation')
    var that = this;
    wx.getSetting({
      success: res => {
        console.log(res.authSetting)
        if (res.authSetting['scope.userLocation'] == null) {
          console.log(res.authSetting['scope.userLocation'])
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              // 用户同意
              // 相关操作
              wx.getLocation({
                type: 'gcj02',
                isHighAccuracy: true,
                success(res) {
                  console.log(res);
                  that.getStore(res);
                }, fail(res) {
                  if (res.errMsg != "" ) {
                    wx.getSystemInfo({
                      success(res) {
                        console.log(res);
                        console.log(res.locationEnabled);
                        Toast.fail('请开启手机定位后重试');
                        that.setData({
                          pageShow: false
                        })
    
                      },
                      fail(res) {
    
                      },
                      complete: (res) => { },
                    })
                  }
                }
              })
            },
            fail() {
              // 用户不同意
              // 相关操作
              that.setData({
                pageShow: false
              })
            }
          })



        } // 如果已经有权限，就查询
        else if (res.authSetting['scope.userLocation'] == true) {
          // 相关操作
          wx.getLocation({
            type: 'gcj02',
            isHighAccuracy: true,
            success(res) {
              console.log(res);
              that.getStore(res);
            }, fail(res) {
              if (res.errMsg != "" ) {
                wx.getSystemInfo({
                  success(res) {
                    console.log(res);
                    console.log(res.locationEnabled);
                    Toast.fail('请开启手机定位后重试');
                    that.setData({
                      pageShow: false
                    })

                  },
                  fail(res) {

                  },
                  complete: (res) => { },
                })
              }
            }
          })
        } else {
          console.log('33333333333')
          wx.showModal({
            title: '位置信息授权',
            content: '位置授权暂未开启',
            cancelText: '仍然拒绝',
            confirmText: '开启授权',
            success: function (res) {
              if (res.confirm) {
                that.modalConfirm();
              } else {
                that.modalCancel();

              }
            }
          })
        }
      }
    })

  },


  modalConfirm() {
    this.triggerEvent('confirm')
    // 跳转授权页
    wx.openSetting({
      success(res) {
        console.log(res)
        if (!res.authSetting['scope.userLocation']) {
          console.log("---------------");
          wx.getLocation({
            type: 'gcj02',
            isHighAccuracy: true,
            success(res) {
              console.log(res);
              this.getStore(res);
              this.setData({
                pageShow: true
              })
            },
            // fail(res){
            //   Toast.fail('定位失败！');
            // }

          })
        }
      },
      complete: (res) => { },
    })

  },

  modalCancel() {
    this.setData({
      pageShow: false
    })
    this.triggerEvent('cancel')
    console.log("用户未开启定位授权");
    Toast.fail('定位失败！');
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    this.setData({
      optionsInfo: options
    })
    if (options.from == 1) {
      this.getDetails(options.commodityid, options.shopId,options.stockId);
      let storeInfo = wx.getStorageSync('storeInfo');
      this.setData({
        storeInfo: storeInfo
      })
    } else if (options.from == 2) {
      console.log(options.from)

      app.getInterface().then(function (res) {
        console.log(res + "-------------------");
        if (res == true) {
          that.getLocation();

          var Authorization = wx.getStorageSync('Authorization')
          that.setData({
            Authorization: Authorization,
          })
          // that.getDetails(options.commodityid, options.shopId);

        }

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
    // let storeInfo = wx.getStorageSync('storeInfo');
    // if (!storeInfo) {
    //   this.getLocation();
    // } else {
    //   this.getDetails(this.data.optionsInfo.commodityid, storeInfo.id);
    //   this.setData({
    //     storeInfo: storeInfo
    //   })
    // }

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
    console.log('商品详情')
    let fromGoodsInfo = {};
    fromGoodsInfo.commodityId = this.data.goodDetails.commodityId;
    fromGoodsInfo.buyQuantity = this.data.goodDetails.buyQuantity;
    app.globalData.fromGoodsInfo = fromGoodsInfo;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getLocation();
    this.setData({
      totalPrice: 0
    })

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