// pages/index/index.js
// import Toast from '@vant/weapp/toast/index';
const api = require("../../../utils/request");
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const app = getApp();
var that = this;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageShow: true,
    loading: true,
    src: '',
    addMimiShow: true, //添加到我的小程序
    checked: false,
    goodsList: [], //商品列表
    num: 1,
    min: 0,
    max: 10000,
    totalPrice: 0,
    empower: false, //授权
    Authorization: '', //token
    buyList: [], //购买列表
    buyListNumber: {}, //购买数量
    buyListNumberLength: 0,
    storeInfo: {}, //店铺信息
    storeInfoShow: true, //店铺名字显示
    overlayShow: false, //遮罩层
    bindgetphonenumberStatus: false, //绑定手机号
    commodityList: [],
    buttonStatus: false,
    noPhoneNumber: 0,
    fromGoodsInfo: '',
    locationEnabled: false
  },
  //
  goOrderList() {
    wx.navigateTo({
      url: '/pages/orderList/orderList',
    })
  },
  //遮罩层隐藏
  onClickHide() {
    this.setData({
      overlayShow: false,
      addMimiShow:true
    });
    wx.setStorageSync('overlayShow', 'no');
  },
  getOverlayShowStatus() {
    let status = wx.getStorageSync('overlayShow');
    console.log(status)
    if(status == 'no'){
      console.log('qqqqqqqqqqqqqqq')
      this.setData({
        addMimiShow:false
      })
      return false;
    }else {
      this.setData({
        overlayShow: true,
        addMimiShow:true

      });
    }
  },
  //商品列表
  getGoodsList(id) {
    this.setData({
      pageShow: true
    })
    api.wxRequest({
      url: "trade/mini/commodity/findList",
      data: {
        shopId: id
      }
    }).then(res => {
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
      this.setData({
        goodsList: list,
        loading: false,
      });
      this.calculation(buyLi);
      Toast.clear()
      wx.stopPullDownRefresh()
    })
  },
  //根据经纬度获取最近的店铺
  getStore(info){
    api.wxRequest({
      url: "trade/mini/shop/nearest",
      data: {
        lat: info.latitude,
        lng: info.longitude
      }
    }).then(res => {
      if (res.data.success == true) {
        if (res.data.data != null) {
          if (this.data.goodsList.length == 0) {
            this.getGoodsList(res.data.data.id);
          }
          this.setData({
            storeInfo: res.data.data,
            storeInfoShow: false
          })
          // wx.setStorageSync('storeInfo', res.data.data);
        } else {
          Toast("您不在店铺附近，请换个位置哦！");
          this.setData({
            pageShow: false,
          })
        }

      } else {
        Toast(res.data.message);
        this.setData({
          pageShow: false,

        })
      }

    })
  },
  //获取定位经纬度
  getLocation() {

    var that = this;
    wx.getSetting({
      success: res => {
        console.log(res)
        console.log(res.authSetting)
        if (res.authSetting['scope.userLocation'] == null) {
          console.log(res.authSetting['scope.userLocation']);

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
                  console.log(res)
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
              console.log("拒绝授权")
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
              console.log(res)
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
  //授权监听
  onEmpowerEvent(e) {
    console.log(e);
    console.log(e.detail.phoneNumber)
    if (e.detail.empower == false) {
      this.setData({
        empower: false
      })
    } else if (e.detail.Authorization) {
      this.setData({
        Authorization: e.detail.Authorization,
        empower: false
      })
    }
    if (e.detail.phoneNumber == false) {
      console.log("e.detail.phoneNumber == false")
      this.setData({
        bindgetphonenumberStatus: true
      })
    }


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
              let commodityList = [];
              that.data.goodsList.forEach((item, index, array) => {
                //执行代码
                // console.log(item)
                if (item.buyQuantity > 0) {
                  let one = {};
                  one.commodityId = item.commodityId;
                  one.stockId = item.stockId;
                  one.buyQuantity = item.buyQuantity;
                  one.price = item.price;
                  commodityList.push(one);
                }
              })
              // this.setData({
              //   commodityList: commodityList
              // })
              // console.log(that.data.commodityList);
              if (commodityList.length > 0) {
                that.submitOrder(commodityList);

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
                //        that.submitOrder(commodityList);

                //     } else  if (res.cancel) {
                //       Toast.fail('请到店购买');

                //     }
                //   }
                // })
              } else {
                Toast.fail('请选购商品');
              }
            } else {
              that.setData({
                bindgetphonenumberStatus: true
              })
            }
          } else {
            let commodityList = [];
            that.data.goodsList.forEach((item, index, array) => {
              //执行代码
              // console.log(item)
              if (item.buyQuantity > 0) {
                let one = {};
                one.commodityId = item.commodityId;
                one.stockId = item.stockId;
                one.buyQuantity = item.buyQuantity;
                one.price = item.price;
                commodityList.push(one);
              }
            })
            // this.setData({
            //   commodityList: commodityList
            // })
            // console.log(that.data.commodityList);
            if (commodityList.length > 0) {
              that.submitOrder(commodityList);

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
              //        that.submitOrder(commodityList);

              //     } else  if (res.cancel) {
              //       Toast.fail('请到店购买');

              //     }
              //   }
              // })
            } else {
              Toast.fail('请选购商品');
            }
            // that.submitOrder(commodityList);
          }
        }
      }
    })


  },

  submitOrder(list) {
    let commodityList = list;
    if (commodityList.length > 0) {
      this.setData({
        buttonStatus: true
      })
      api.wxRequest({
        url: "trade/mini/order/submit",
        data: {
          commodityList: commodityList,
          shopId: this.data.storeInfo.id,
          version:"1.0"
        }
      }).then(res => {
        if (res.data.success == true) {
          let paymentInfo = res.data.data
          this.pay(paymentInfo.timestamp, paymentInfo.nonceStr, paymentInfo.packet, paymentInfo.signType, paymentInfo.sign, paymentInfo.orderNumber)

        } else {
          Toast(res.data.message);
          this.setData({
            buttonStatus: false
          })
          setTimeout(() => {
            Toast.clear()
          }, 1000);

        }
      })
    } else {
      Toast("请选择商品");
      setTimeout(() => {
        Toast.clear()
      }, 1000);
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
            buttonStatus: false
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
          // that.getGoodsList(that.data.storeInfo.id);
          that.setData({
            buttonStatus: false,
            // totalPrice: 0,
            // buyListNumberLength: 0
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
              // that.toPay();

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
  getInfo() {
    Toast.loading({
      mask: false,
      message: '加载中...'
    });
    api.wxRequest({
      url: "member/user/info",
      method: "get",
      data: {
        Authorization: this.data.Authorization
      }
    }).then(res => {
      wx.setStorageSync('userInfo', res.data.data);
      Toast.clear();
      setTimeout(() =>
        this.toPay(),
        200);
    })

  },
  // 加法
  //是否授权
  authSettingInfo() {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          this.setData({
            empower: true,
          })
        }
      }
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
            that.calculation(buyLi);
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
    that.calculation(buyLi);

  },
  //计算价格
  calculation(buyLi) {

    var that = this;

    if (buyLi.length > 0) {


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
  // 文本框失去焦点事件，判断输入值是否为数字
  onInputBlur(e) {
    // var value = e.detail.value;
    // if (isNaN(value)) {
    //   // 不是数字，直接置为最小值
    //   this.setData({ num: this.data.min })
    // } else {
    //   // 是数字，输入值大于最大值，置为最大值，同理最小值
    //   if (value > this.data.max) {
    //     this.setData({ num: this.data.max })
    //   } else if (value < this.data.min) {
    //     this.setData({ num: this.data.min })
    //   }
    // }
  },
  //
  goDetails(e) {
    console.log(e.currentTarget.dataset.commodityid);
    //shopId
    wx.navigateTo({
      url: "/pages/goodsDetails/goodsDetails?commodityid=" + e.currentTarget.dataset.commodityid + '&shopId=' + e.currentTarget.dataset.shopid + '&stockId=' + e.currentTarget.dataset.stockid + '&from=1',
    })
  },
  //
  onChange(event) {
    console.log(event.detail);
  },
  //骨架屏测试
  skeleton() {
    setTimeout(() =>
      this.setData({
        loading: false,
        src: "https://img.yzcdn.cn/vant/cat.jpeg"
      }), 2000);
  },
  //
  closeAddMimiShow() {
    console.log('1111111111')
    this.setData({
      addMimiShow: true,
      overlayShow: true
    })
  },
  closeAddMimiClose() {
    this.setData({
      addMimiShow: false,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    Toast.loading({
      mask: false,
      message: '加载中...'
    });
    app.getInterface().then(function (res) {
      console.log(res + "-------------------");
      if (res == true) {
        var Authorization = wx.getStorageSync('Authorization')
        that.setData({
          Authorization: Authorization,
        })
        if (that.data.storeInfo.id) {
          that.getGoodsList(that.data.storeInfo.id);
        }
        that.getOverlayShowStatus();

      }

    })



  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.skeleton();
    // this.setData({
    //   loading: true
    // });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getLocation();
    let fromGoodsInfo = app.globalData.fromGoodsInfo;
    console.log(fromGoodsInfo)
    if (fromGoodsInfo) {
      this.setData({
        fromGoodsInfo: fromGoodsInfo
      })
      this.getGoodsList(this.data.storeInfo.id);

    }
    this.setData({
      // totalPrice: 0,
      // buyListNumberLength: 0
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
    console.log('')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("下拉");
    this.getLocation();
    this.setData({
      buyListNumberLength: 0,
      totalPrice: 0
    })
    // wx.stopPullDownRefresh()
    if (this.data.storeInfo.id) {
      this.getGoodsList(this.data.storeInfo.id);

    }

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
    // 选择小程序模式
    chooseTheMode(detail){
      // data-index="{{2}}" bindtap="toggle"
      // console.log(this.data.checked);
      Dialog.confirm({
        title: '提示',
        message: this.data.checked?'您要切换到店模式吗？':'您要切换商城模式吗？'
      }).then((res) => {
        
  
        console.log(detail);
        if (!detail.detail.value) {
          console.log("xz1"+detail.detail.value);
          wx.hideTabBar()
          
        } else {
          console.log("xz2"+detail.detail.value);
           
           wx.switchTab({
             url: '../home/home',
           })
           wx.showTabBar()
          //  wx.reLaunch({
          //   url: '../home/home',
          //  })
          //  wx.redirectTo({
          //   url: '../home/home',
          // })
        }
        this.setData({ checked: detail.detail.value});
      });
    },
})