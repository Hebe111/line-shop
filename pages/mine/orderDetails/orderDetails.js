// pages/orderDetails/orderDetails.js
//获取应用实例
const app = getApp()
import Toast from '@vant/weapp/toast/toast';
const api = require("../../../utils/request.js");
var time = require('../../../utils/util.js');
var total_micro_secondEnd;
var timerSetTimeoutEnd;
/* 毫秒级倒计时 */
function count_downEnd(that, total_micro_secondEnd) {
  // 渲染倒计时时钟
  that.setData({
    countDown: date_format(total_micro_secondEnd)
  });

  if (total_micro_secondEnd <= 0) {
    that.getSupplyDetails()
    that.setData({
      countDown: '00:00:00'
    });
    // timeout则跳出递归
    return;
  }
  timerSetTimeoutEnd = setTimeout(function () {
    // 放在最后--
    total_micro_secondEnd -= 10;
    count_downEnd(that, total_micro_secondEnd);
  }, 10)
}

function date_format(micro_second) {
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = Math.floor(second / 3600);
  // 分钟位
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  // 秒位
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60)); // equal to => var sec = second % 60;
  // 毫秒位，保留2位
  // var micro_sec = fill_zero_prefix(Math.floor((micro_second % 1000) / 10));
  // sec = sec > 9 ? sec : `0${sec}`;
  // min = min > 9 ? min : `0${min}`;
  // hr = hr > 9 ? hr : `0${hr}`;
  return hr + "小时" + min + "分钟";
}
// 位数不足补零
function fill_zero_prefix(num) {
  return num < 10 ? `0${num}` : num
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    details: {},
    requestPath: '',
    requestPathBase: '',
    userInfo: {},
    Authorization: '',
    transactionTime: '',
    currentIndex: '',
    orderStatusIcon: {
      one: "https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/over.png",
      two: "https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/orderWaitIcon.png",
      three: "https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/orderCancel.png",
    },
    orderStstusImg: {
      forty: 'https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/buyToBePaid.png',
      fifty: 'https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/buyToBeShipped.png',
      sixty: 'https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/buyToBeReceived.png',
      ninety: 'https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/buyPaySuccess.png',
      oneHundred: 'https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/cancel.png',
    },
    countDown: '',
    type: '',
    origin: '',
    shipmentTime: "",
    dealPriceStatus: false,
    price: "",
    createDate: '',
    deliverTime: '',
    cancelTime: '',
    payTime: '',
    totalPayment: '',
    payStatus: false,
    finishDate: '', //完成时间
    receiveTime: "", //收货时间
    dealPriceStatusDetermine: false,
    receiveLoading: false, //收货按钮loading
    payLoading: false, //支付按钮loading
    cancelLoading: false, //取消按钮loading，
    shareLoading:false,
    goodsNumber:null,
  },
  toQc() {
    wx.navigateTo({
      url: '/pages/mine/voucher/voucher?oederNumber=' + this.data.details.orderNumber,
    })
  },
  getPayment() {
    var url;
    if (this.data.details.items[0].itemPayment == '0') {
      url = 'pay/freeOrder'
    } else {
      url = 'pay/order'

    }
    wx.request({
      url: app.globalData.requestPath + url,
      header: {
        'content-type': 'application/json', // 默认值
        "Authorization": this.data.Authorization
      },
      method: "post",
      data: {
        orderId: this.data.details.orderNumber,
        paymentType: '2',
        totalPayment: this.data.details.items[0].itemPayment
      },
      success: res => {
        if (res.data.success == true) {
          this.setData({
            payStatus: true
          })
          if (this.data.details.items[0].itemPayment == '0') {
            this.getSupplyDetails()
          } else {
            let paymentInfo = res.data.data

            this.pay(paymentInfo.timestamp, paymentInfo.nonceStr, paymentInfo.packet, paymentInfo.signType, paymentInfo.paySign)

          }


        } else {

        }
      }
    })
  },
  // pay(timeStamp, nonceStr, payPackage, signType, paySign) {
  //   var _this = this
  //   wx.requestPayment({
  //     timeStamp: timeStamp,
  //     nonceStr: nonceStr,
  //     package: payPackage,
  //     signType: signType,
  //     paySign: paySign,
  //     success(res) {
  //       console.log(res)
  //       if (res.errMsg == 'requestPayment:ok') {
  //         _this.getSupplyDetails()
  //         wx.showToast({
  //           title: '支付成功！',
  //           icon: 'none',
  //           duration: 2000
  //         })
  //       }
  //     },
  //     fail(res) {
  //       console.log(res)
  //       if (res.errMsg == 'requestPayment:fail cancel') {
  //         _this.setData({
  //           payStatus: false
  //         })
  //         _this.getSupplyDetails()
  //         wx.showToast({
  //           title: '用户取消支付',
  //           icon: 'none',
  //           duration: 2000
  //         })

  //       }

  //     },
  //     complete(res) {
  //       // console.log(res)
  //       // wx.showToast({
  //       //   title: res.errMsg,
  //       //   icon: 'none',
  //       //   duration: 2000
  //       // })

  //     }
  //   })
  // },
  //
  quotePrice() {
    if (!this.data.price) {
      wx.showToast({
        title: '请填写成交价！',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    this.setData({
      dealPriceStatusDetermine: true
    })

    wx.request({
      url: this.requestPath + 'order/quotePrice',
      header: {
        'content-type': 'application/json', // 默认值
        "Authorization": this.data.Authorization
      },
      method: "post",
      data: {
        orderNumber: this.data.details.orderNumber,
        itemPrice: this.data.price

      },
      success: res => {
        if (res.data.success == true) {
          this.dealPriceClose();
          this.getSupplyDetails()
          wx.showToast({
            title: '价格提交成功，等待买家付款！',
            icon: 'none',
            duration: 1500
          })
          setTimeout(() => {
            this.setData({
              dealPriceStatusDetermine: false
            })
          }, 1000);


        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000,
            mask: true
          })
          setTimeout(() => {
            this.setData({
              dealPriceStatusDetermine: false
            })
          }, 1000);

        }
      }
    })
  },
  getPrice(e) {
    const val = e.detail.value;
    this.setData({
      price: val
    });
  },
  dealPriceShow() {

    this.setData({
      dealPriceStatus: true
    })
  },
  dealPriceClose() {
    this.setData({
      dealPriceStatus: false

    })
  },

  // 一键复制事件
  copyBtn: function (e) {
    var that = this;
    wx.setClipboardData({
      //准备复制的数据
      data: that.data.details.orderNumber,
      success: function (res) {
        wx.showToast({
          title: '订单号复制成功！',
          icon: 'success',
          duration: 1500
        })
      }
    });
  },
  //收货
  receivingGoods(e) {
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '确定收货吗？',
      success(res) {
        if (res.confirm) {
          _this.setData({
            receiveLoading: true
          })
          api.wxRequest({
            url: "trade/order/takeDelivery",
            data: {
              orderNumber: _this.data.details.orderNumber,
              origin: _this.data.details.origin
            }
          }).then(res => {
            if (res.data.success == true) {
              _this.getSupplyDetails()
              wx.showToast({
                title: '已确认收货！',
                icon: 'success',
                duration: 2000
              })
              _this.setData({
                receiveLoading: false
              })

            } else {
              wx.showToast({
                title: res.data.message,
                icon: 'none',
                duration: 2000,
                mask: true
              })

            }
          })

        } else if (res.cancel) {}
      }
    })

  },

  toPay() {
    api.wxRequest({
      url: "trade/pay/order",
      data: {
        orderId: this.data.details.orderNumber,
        paymentType: 2,
        totalPayment: this.data.details.totalPayment,
      }
    }).then(res => {
      if (res.data.success == true) {
        this.setData({
          payLoading: true
        })
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
            payLoading: false
          })
          setTimeout(() => {
            Toast.clear()
          }, 2000);
          wx.navigateTo({
            url: "/pages/mine/orderDetails/orderDetails?id=" + orderNumber,
          })
        }
      },
      fail(res) {
        console.log(res)
        if (res.errMsg == 'requestPayment:fail cancel') {
          Toast.fail('支付失败');
          // that.getGoodsList(that.data.storeInfo.id);
          that.setData({
            payLoading: false
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
  // 取消订单
  cancelOrder(e) {

    var _this = this;
    wx.showModal({
      title: '提示',
      content: '确定取消订单吗？',
      success(res) {
        if (res.confirm) {
          api.wxRequest({
            url: "trade/order/cancelOrder",
            data: {
              orderNumber: _this.data.details.orderNumber,
              orderStatus: _this.data.details.orderStatus
            }
          }).then(res => {
            if (res.data.success == true) {
              _this.getSupplyDetails()
              wx.showToast({
                title: '取消订单成功！',
                icon: 'success',
                duration: 2000
              })

            } else {
              wx.showToast({
                title: res.data.message,
                icon: 'none',
                duration: 2000,
                mask: true
              })

            }
          })

        } else if (res.cancel) {}
      }
    })
  },

  //获取详情
  getSupplyDetails() {
    wx.showLoading({
      title: '加载中',
    })
    api.wxRequest({
      url: "trade/order/myOrderDetail",
      data: {
        orderNumber: this.data.id,
      }
    }).then(res => {
      if (res.data.success == true) {

        var details = res.data.data;
        if (res.data.data.pickedUp == 20) {
          var fromAdress = {}
          fromAdress.sellerAddress = details.items[0].sellerAddress
          fromAdress.sellerCity = details.items[0].sellerCity
          fromAdress.sellerCounty = details.items[0].sellerCounty
          fromAdress.sellerProvince = details.items[0].sellerProvince
          fromAdress.sellerContactName = details.items[0].sellerContactName
          fromAdress.sellerContactPhone = details.items[0].sellerContactPhone
          details.fromAdress = fromAdress;
        }
       

        let shipmentTime = time.formatTimeTwo(details.shipmentTime, 'Y/M/D')
        if (details.timeToPay > 0 && details.orderStatus == 40) {
          count_downEnd(this, details.timeToPay)
        } else {
          this.setData({
            countDown: '00:00:00'
          })
        }
      

        let goodsNumber = 0;
        details.items.map(function(item,index,arr){
          return goodsNumber += item.itemQuantity;
        })
        this.setData({
          details: details,
          shipmentTime: shipmentTime,
          goodsNumber:goodsNumber
        })
        console.log(goodsNumber)

        wx.hideLoading()
        wx.stopPullDownRefresh()

      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 3000,
          mask: true
        })
      }

    })

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(options.currentIndex)
    var Authorization = wx.getStorageSync('Authorization')
    this.setData({
      Authorization: Authorization,
      id: options.id,
      currentIndex: options.currentIndex,
      type: options.type,
      origin: options.origin
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
    if (this.data.id) {

      this.getSupplyDetails();
    }
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
    clearTimeout(timerSetTimeoutEnd);
    timerSetTimeoutEnd = '';
    wx.navigateTo({
      url: "/pages/my/pages/address/address"
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    clearTimeout(timerSetTimeoutEnd);
    timerSetTimeoutEnd = ''
    this.getSupplyDetails();
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
    let goodsId = this.data.details.items[0].goodsId;
    let stockIds = []; 
    var groupActivityId;
    let serviceAreaId = this.data.details.serviceAreaId;
    stockIds.push(this.data.details.items[0].stockId)
   
    if(this.data.details.groupActivityId != null){
      var groupActivityId = this.data.details.groupActivityId;
    }
    let url = encodeURIComponent('/pages/commodity/goodsDetailsLine/goodsDetailsLine?commodityid=' + goodsId + '&stockidlist=' + stockIds + "&groupActivityId=" + groupActivityId);
    return {
      title: "商品详情",
      path: `/pages/tabBarPages/home/home?orderShare=${url}&serviceAreaId=${serviceAreaId}`,
      success: function(res) {
        // 转发成功 
       
      },
      fail: function(res) {
        // 转发失败 
        
      }
    }
   
  }
})