// pages/mine/myOrderList/myOrderList.js
//获取应用实例
const app = getApp()
const api = require("../../../utils/request.js");
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    status: '',
    Authorization: '',
    userId: '',
    supplyList: [], //全部供应列表 
    supplyList1: [], // 供应列表 
    supplyList2: [], // 供应列表 
    supplyList3: [], // 供应列表 
    supplyList4: [], // 供应列表 
    supplyList5: [], // 供应列表 
    pageNum: 1, //第几页
    pageNum1: 1, //第几页
    pageNum2: 1, //第几页
    pageNum3: 1, //第几页
    pageNum4: 1, //第几页
    pageNum5: 1, //第几页
    pageSize: 10,
    requestPath: '',
    currentIndex: 0,
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    pageY: "",
    type: '',
    orderStatus: '',
    tabbarList: [{
        idx: 0,
        index: 0,
        title: '全部',
        orderStatus: ''
      },
      {
        idx: 1,
        index: 1,
        title: '待支付',
        orderStatus: 40
      },
      {
        idx: 2,
        index: 2,
        title: '待分享',
        orderStatus: 45
      },
      {
        idx: 3,
        index: 3,
        title: '待发货',
        orderStatus: 50
      },
      {
        idx: 4,
        index: 4,
        title: '待收货',
        orderStatus: 60
      },
      {
        idx: 5,
        index: 5,
        title: '已取消',
        orderStatus: 100
      },
    ],
    refreshType: null, //列表刷新的类型，1是订单取消后刷新
  },




  // 取消订单
  cancelOrder(e) {
    let details = e.currentTarget.dataset.orderdetails;

    var _this = this;
    wx.showModal({
      title: '提示',
      content: '确定取消订单吗？',
      success(res) {
        if (res.confirm) {
          api.wxRequest({
            url: "trade/order/cancelOrder",
            data: {
              orderNumber: details.orderNumber,
              orderStatus: details.orderStatus
            }
          }).then(res => {
            if (res.data.success == true) {
              _this.getSupplyList(_this.data.orderStatus,1)
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
  //收货
  receivingGoodsTwo(e) {
    let details = e.currentTarget.dataset.orderdetails;
    if (details.pickedUp == 10) {
      this.toQc(details);

    } else if (details.pickedUp == 20) {
      this.receivingGoods(details);
    }
  },
  receivingGoods(e) {
    let orderNumber = e.orderNumber
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '确定收货吗？',
      success(res) {
        if (res.confirm) {
          api.wxRequest({
            url: "trade/order/takeDelivery",
            data: {
              orderNumber: orderNumber,
              origin: e.origin
            }
          }).then(res => {
            if (res.data.success == true) {
              _this.getSupplyList(_this.data.orderStatus,1)
              wx.showToast({
                title: '已确认收货！',
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
  //提货凭证
  toQc(e) {

    wx.navigateTo({
      url: '/pages/mine/voucher/voucher?oederNumber=' + e.orderNumber,
    })
  },
  //支付
  toPay(e) {
    let details = e.currentTarget.dataset.orderdetails;
    api.wxRequest({
      url: "trade/pay/order",
      data: {
        orderId: details.orderNumber,
        paymentType: 2,
        totalPayment: details.totalPayment,
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
          this.getSupplyList(this.data.orderStatus,1)
          // wx.navigateTo({
          //   url: "/pages/orderDetails/orderDetails?orderNumber=" + orderNumber,
          // })
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
  //再买一次
  buyAagain() {
    wx.navigateTo({
      url: '/pages/tabBarPages/commodity/commodity',
    })
  },
  start(e) {
    this.setData({
      pageY: e.changedTouches[0].pageY
    })
  },
  end(e) {
    let jl = e.changedTouches[0].pageY - this.data.pageY;
    if (jl < -220) {
      this.lower();
    }
  },
  lower() {
    if (this.data.currentIndex == 0) {
      this.data.pageNum++;
      this.getSupplyList(this.data.orderStatus)
    } else if (this.data.currentIndex == 1) {
      this.data.pageNum1++;
      this.getSupplyList(this.data.orderStatus)
    } else if (this.data.currentIndex == 2) {
      this.data.pageNum2++;
      this.getSupplyList(this.data.orderStatus)
    } else if (this.data.currentIndex == 3) {
      this.data.pageNum3++;
      this.getSupplyList(this.data.orderStatus)
    } else if (this.data.currentIndex == 4) {
      this.data.pageNum4++;
      this.getSupplyList(this.data.orderStatus)
    } else if (this.data.currentIndex == 5) {
      this.data.pageNum5++;
      this.getSupplyList(this.data.orderStatus)
    }
  },

  //详情
  toDetails(e) {
    //pages/mine/orderDetails/orderDetails.wxml
    wx.navigateTo({
      url: "/pages/mine/orderDetails/orderDetails?id=" + e.currentTarget.dataset.id + "&currentIndex=" + this.data.currentIndex + "&type=" + this.data.type + '&origin=' + e.currentTarget.dataset.origin

    })

  },

  //默认数据
  getSupplyList(orderStatus, refreshType) {
    console.log(orderStatus);
    var pageNum
    var action
    wx.showLoading({
      title: '加载中',
      duration: 2000
    })
    if (this.data.currentIndex == 0) {
      pageNum = this.data.pageNum
    } else if (this.data.currentIndex == 1) {
      pageNum = this.data.pageNum1
    } else if (this.data.currentIndex == 2) {
      pageNum = this.data.pageNum2
    } else if (this.data.currentIndex == 3) {
      pageNum = this.data.pageNum3
    } else if (this.data.currentIndex == 4) {
      pageNum = this.data.pageNum4
    } else if (this.data.currentIndex == 5) {
      pageNum = this.data.pageNum5
    }
    if (this.data.type == 0) {
      action = 2;
    } else {
      action = 1;
    }
    api.wxRequest({
      url: "trade/order/getMyOrders",
      data: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        action: action,
        orderStatus: orderStatus
      },
    }).then(res => {
      if (res.data.success == true) {
        let list = res.data.data;
        var time = require('../../../utils/util.js');

        if (list == null) {
          return false;
        }
        for (var i = 0; i < list.length; i++) {
          list[i]["createDate"] = time.formatTimeTwo(list[i]["createDate"], 'Y-M-D h:m:s')
        }

        if (!this.data.orderStatus) {
          if (!refreshType) {
            this.setData({
              supplyList: this.data.supplyList.concat(list),
            })
          } else if (refreshType == 1) {
            this.setData({
              supplyList: list,
            })
          }
        } else if (this.data.orderStatus == 40) {
          if (!refreshType) {
            this.setData({
              supplyList1: this.data.supplyList1.concat(list),
            })
          } else if (refreshType == 1) {
            this.setData({
              supplyList1: list,
            })
          }
        } else if (this.data.orderStatus == 45) {
          if (!refreshType) {
            this.setData({
              supplyList2: this.data.supplyList2.concat(list),
            })
          } else if (refreshType == 1) {
            this.setData({
              supplyList2: list,
            })
          }
        } else if (this.data.orderStatus == 50) {
          if (!refreshType) {
            this.setData({
              supplyList3: this.data.supplyList3.concat(list),
            })
          } else if (refreshType == 1) {
            this.setData({
              supplyList3: list,
            })
          }
        } else if (this.data.orderStatus == 60) {
          if (!refreshType) {
            this.setData({
              supplyList4: this.data.supplyList4.concat(list),
            })
          } else if (refreshType == 1) {
            this.setData({
              supplyList4: list,
            })
          }
        } else if (this.data.orderStatus == 100) {
          if (!refreshType) {
            this.setData({
              supplyList5: this.data.supplyList5.concat(list),
            })
          } else if (refreshType == 1) {
            this.setData({
              supplyList5: list,
            })
          }
        }
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

  //用户点击tab时调用
  titleClick: function (e) {
    console.log(e.currentTarget.dataset)
    let orderstatus = e.currentTarget.dataset.orderstatus
    // let currentPageIndex =
    this.setData({
      //拿到当前索引并动态改变
      currentIndex: e.currentTarget.dataset.idx,
      orderStatus: e.currentTarget.dataset.orderstatus
    })

    if (this.data.currentIndex == 0 && this.data.supplyList == '') {
      this.getSupplyList(orderstatus);
    } else if (this.data.currentIndex == 1 && this.data.supplyList1 == '') {
      this.getSupplyList(orderstatus);
    } else if (this.data.currentIndex == 2 && this.data.supplyList2 == '') {
      this.getSupplyList(orderstatus);
    } else if (this.data.currentIndex == 3 && this.data.supplyList3 == '') {
      this.getSupplyList(orderstatus);
    } else if (this.data.currentIndex == 4 && this.data.supplyList4 == '') {
      this.getSupplyList(orderstatus);
    } else if (this.data.currentIndex == 5 && this.data.supplyList5 == '') {
      this.getSupplyList(orderstatus);
    }
  },
  //swiper切换时会调用
  pagechange: function (e) {
    let orderstatus = e.currentTarget.dataset.orderstatus

    if ("touch" === e.detail.source) {
      console.log(e.currentTarget.dataset)

      let currentPageIndex = this.data.currentIndex
      // currentPageIndex = (currentPageIndex + 1) % 5
      this.setData({
        currentIndex: e.detail.current,
        orderStatus: orderstatus

      })

      if (this.data.currentIndex == 0 && this.data.supplyList == '') {
        this.getSupplyList(orderstatus);
      } else if (this.data.currentIndex == 1 && this.data.supplyList1 == '') {
        this.getSupplyList(orderstatus);
      } else if (this.data.currentIndex == 2 && this.data.supplyList2 == '') {
        this.getSupplyList(orderstatus);
      } else if (this.data.currentIndex == 3 && this.data.supplyList3 == '') {
        this.getSupplyList(orderstatus);
      } else if (this.data.currentIndex == 4 && this.data.supplyList4 == '') {
        this.getSupplyList(orderstatus);
      } else if (this.data.currentIndex == 5 && this.data.supplyList5 == '') {
        this.getSupplyList(orderstatus);
      }

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.requestPath = app.globalData.requestPath;
    var Authorization = wx.getStorageSync('Authorization')
    var userId = wx.getStorageSync('userId')
    this.setData({
      Authorization: Authorization,
      userId: userId,
      type: options.type,
      currentIndex: options.currentIndex,
      orderStatus: options.currentIndex == 0 ? '' : options.currentIndex == 1 ? '40' : options.currentIndex == 2 ? '45' : options.currentIndex == 3 ? '50' : options.currentIndex == 4 ? '60' : options.currentIndex == 5 ? '100' : ''
    })
    console.log(options)
  },

  onPageScroll: function (e) {},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(this.data.currentIndex)
    if (this.data.currentIndex == 0) {
      this.setData({
        pageNum: 1,
        supplyList: []
      })
      this.getSupplyList('')
    } else if (this.data.currentIndex == 1) {
      this.setData({
        pageNum1: 1,
        supplyList1: []
      })
      this.getSupplyList(40)
    } else if (this.data.currentIndex == 2 && this.data.supplyList2 == '') {
      this.setData({
        pageNum2: 1,
        supplyList2: []
      })
      this.getSupplyList(45)
    } else if (this.data.currentIndex == 3 && this.data.supplyList3 == '') {
      this.setData({
        pageNum3: 1,
        supplyList3: []
      })
      this.getSupplyList(50)
    } else if (this.data.currentIndex == 4 && this.data.supplyList4 == '') {
      this.setData({
        pageNum4: 1,
        supplyList4: []
      })
      this.getSupplyList(60)
    } else if (this.data.currentIndex == 5 && this.data.supplyList5 == '') {
      this.setData({
        pageNum5: 1,
        supplyList5: []
      })
      this.getSupplyList(100)
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (this.data.currentIndex == 0) {
      this.setData({
        pageNum: 1,
        supplyList: []
      })
      this.getSupplyList('')
    } else if (this.data.currentIndex == 1) {
      this.setData({
        pageNum1: 1,
        supplyList1: []
      })
      this.getSupplyList(40)
    } else if (this.data.currentIndex == 2) {
      this.setData({
        pageNum2: 1,
        supplyList2: []
      })
      this.getSupplyList(45)
    } else if (this.data.currentIndex == 3) {
      this.setData({
        pageNum3: 1,
        supplyList3: []
      })
      this.getSupplyList(50)
    } else if (this.data.currentIndex == 4) {
      this.setData({
        pageNum4: 1,
        supplyList4: []
      })
      this.getSupplyList(60)
    } else if (this.data.currentIndex == 5) {
      this.setData({
        pageNum5: 1,
        supplyList5: []
      })
      this.getSupplyList(100)
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

  }
})