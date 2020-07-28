// pages/tabBarPages/home/home.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const api = require("../../../utils/request");
const app = getApp();
var that = this;
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
    pageShow: true,
    loading: true,
    src: '',
    addMimiShow: true, //添加到我的小程序
    goodsList: [], //商品列表
    seckillGoodsList:[],//秒杀显示抢购商品
    hotSellingGoodsList:[],//热销商品
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
    overlayShow: null, //遮罩层
    bindgetphonenumberStatus: false, //绑定手机号
    commodityList: [],
    buttonStatus: false,
    noPhoneNumber: 0,
    fromGoodsInfo: '',
    locationEnabled: false,
    checked: true,
    time: 30 * 60 * 60 * 1000 *400,
    timeText:"",
    timeData: {},
    locationInfo:{},
    oldLocation:{},
    locationName:"请选择您的收货地址",
    btns:["PS","RP","AE","C4D"],
    cons: ["PS", "RP", "AE", "C4D"],
    active:0,//控制当前显示盒子 
    selectedName: '',
    selectCode: '',
    selectQueryType: '',
    isLoaing: false,
    goodsList: [], //商品列表
    searchText: '',
    nowTime: new Date().getTime(),
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
  toggle(e){

    //console.log(e.currentTarget.dataset.index)
 
    this.setData({
 
      //设置active的值为用户点击按钮的索引值
      
      active:e.currentTarget.dataset.index,
 
    })
 
  },

  onchangetime(e){
    this.setData({
      timeData: e.detail
    });
  },
  //
  goOrderList() {
    wx.navigateTo({
      url: '/pages/orderList/orderList',
    })
  },
  //遮罩层隐藏
  onClickHide(){
    this.setData({
      overlayShow: false
    });
    wx.setStorageSync('overlayShow', 'no');
  },
  getOverlayShowStatus() {
    let status = wx.getStorageSync('overlayShow');
    console.log(status)
    if(status == 'no'){
      console.log('00909090900')
      this.setData({
        addMimiShow:false
      })
      return false;
    }else {
      console.log('10100101010010001')

      this.setData({
        overlayShow: true,
        addMimiShow:true
      });
    }
  },

  //限时抢购
  getseckillList(id) {
    this.getOverlayShowStatus();
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
      
      if(list == [] || list == "" || list == null){
        this.setData({
          seckillGoodsList: [],
          loading: false,
        });
        return false;
      }else {

      // var item = list[0];
      // if(item.activityBeginTime < this.data.nowTime && item.activityType == 1 && item.activityEndTime > this.data.nowTime){
      //   console.log("时间"+item.activityEndTime);
      //   console.log(this.data.nowTime);
      //   console.log((item.activityEndTime - this.data.nowTime));
        
      //   this.setData({
      //     time: (item.activityEndTime - this.data.nowTime),
      //     timeText: "后结束",
      //   });
      // }else if(item.activityBeginTime > this.data.nowTime && item.activityType == 1){
      //   this.setData({
      //     time: (item.activityBeginTime - this.data.nowTime),
      //     timeText: "后开始",
      //   });
      // }else{
      //   this.setData({
      //     time: 0,
      //     timeText: "已结束",
      //   });
      // }

      // item.activityBeginTime < nowTime && item.activityType == 1 && item.activityEndTime > nowTime 后结束
      // item.activityBeginTime > nowTime && item.activityType == 1 后开始
      // item.activityEndTime < nowTime && item.activityType == 1 已结束

    //   "maxEndTimeDistance": 1369206748,
    // "minBeginTimeDistance": -1   
      if(res.data.minBeginTimeDistance != -1 && res.data.minBeginTimeDistance != null){
        this.setData({
              time: res.data.minBeginTimeDistance,
              timeText: "后开始",
            });
      }else{
        this.setData({
          time: res.data.maxEndTimeDistance,
          timeText: "后结束",
        });
      }

      console.log(list.length + "----1=====");
      this.setData({
        seckillGoodsList: list,
        loading: false,
      });
      // list.forEach((item, index, array) => {
      // console.log(item);
        
      // });
    }
      Toast.clear()
      wx.stopPullDownRefresh()
   
    })
  },
  //热销商品
  gethotSellingList(id) {
    console.log("请求热销商品"+id);
    api.wxRequest({
      url: "trade/commodity/queryList",
      data: {
        "showCustomerType":"-1",
        "serviceAreaId":id,
        "queryType":"2"
    }
    }).then(res => {
      console.log("请求返回"+res.data.data);
      let list = res.data.data;
      
      if(list == null || list == []){
        this.setData({
          hotSellingGoodsList: [],
          loading: false,
        });
        return;
      }
  
      this.setData({
        hotSellingGoodsList: list,
        loading: false,
      });
      // list.forEach((item, index, array) => {
      // console.log(item);
        
      // });
      
      Toast.clear()
      wx.stopPullDownRefresh()
    })
  },
  //根据经纬度获取最近的店铺
  getStore(info){
//     latitude: 31.22114, longitude: 121.54409, speed: -1, accuracy: 65, verticalAccuracy: 65, …}
// accuracy: 65
// errMsg: "getLocation:ok"
// horizontalAccuracy: 65
// latitude: 31.22114
// longitude: 121.54409
// speed: -1
// verticalAccuracy: 65
console.log(info.address);
this.setData({
  locationInfo: info,
  oldLocation:info
});
    api.wxRequest({
      url: "trade/mini/shop/nearest",
      data: {
        lat: info.latitude,
        lng: info.longitude
      }
    }).then(res => {
      if (res.data.success == true) {
        if (res.data.data != null) {
          var Authorization = wx.getStorageSync('Authorization')
          console.log("我有tocken，所以不弹"+Authorization);
          if(Authorization == null || Authorization == ""){
            this.setData({
              empower:true
            })
            return ;
          }
            this.getseckillList(res.data.data.id);
            this.gethotSellingList(res.data.data.id);
          
          this.setData({
            storeInfo: res.data.data,
            storeInfoShow: false
          })
          // wx.setStorageSync('storeInfo', res.data.data);
        } else {
          // Toast("您不在店铺附近，请换个位置哦！");
          // this.setData({
          //   pageShow: false,
          // })
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

    // if(!this.getUserPower()){
    //   return;
    // }

    var that = this;
    wx.getSetting({
      success: res => {
        console.log(res)
        console.log(res.authSetting)
        if (res.authSetting['scope.userLocation'] == null) {
          // console.log(res.authSetting['scope.userLocation']);

          wx.authorize({
            scope: 'scope.userLocation',
            success(){
              // 用户同意
              // 相关操作
              wx.getLocation({
                type: 'gcj02',
                isHighAccuracy: true,
                success(res) {
                  console.log(res);
                  qqmapsdk.reverseGeocoder({
                    location: {
                      latitude: res.latitude,
                      longitude: res.longitude
                    },
                    success: function (res) {
                      console.log(res);
                      var add = res.result.address_reference.crossroad.title;
                      that.setData({
                        locationName: add
                      })
                    }
                  })
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

              qqmapsdk.reverseGeocoder({
                location: {
                  latitude: res.latitude,
                  longitude: res.longitude
                },
                success: function (res) {
                  console.log(res);
                  var add = res.result.address_reference.crossroad.title;
                  that.setData({
                    locationName: add
                  })
                }
              })
              console.log("请求店铺吧");
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
  //选择收货地址
  chooseAD(){
    
    wx.navigateTo({
           url:'../../home/chooseAdress/chooseAdress?locationName='+this.data.locationName,  //跳转页面的路径，可带参数 ？隔开，不同参数用 & 分隔；相对路径，不需要.wxml后缀
           success:function(){},        //成功后的回调；
           fail(){},       //失败后的回调；
           complete(){},      //结束后的回调(成功，失败都会执行)
       })
  },

  // 选择小程序模式
  chooseTheMode(detail){
    // data-index="{{2}}" bindtap="toggle"
    console.log(this.data.checked);
    Dialog.confirm({
      title: '提示',
      message: this.data.checked?'您要切换到店模式吗？':'您要切换商城模式吗？'
    }).then((res) => {
      // console.log(res);

      console.log(detail);
      if (!detail.detail.value) {
        wx.hideTabBar()
        wx.redirectTo({
          url: '../index/index',
        })
      } else {
         wx.showTabBar()
      }
      this.setData({ checked: detail.detail.value});
    });
  },
  chooseWXMode(detail){
    console.log(this.data.checked);
    Dialog.confirm({
      title: '提示',
      message: this.data.checked?'您要切换到店模式吗？':'您要切换商城模式吗？'
    }).then((res) => {
      // console.log(res);
      console.log(detail);
      this.setData({ checked: detail.detail});
    });
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
  hotgocommodity(){
    wx.switchTab({
      url: '../commodity/commodity'
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
    console.log("用户信息得到了么")
    console.log(e);
    if (e.detail.empower == false) {
      this.setData({
        empower: false
      })
    } else if (e.detail.Authorization) {
      var stoid = this.data.storeInfo.id;
      var storeI = wx.getStorageSync('storeInfo');
    console.log(storeI);
    console.log("保存的店铺信息");
    if(storeI){
      stoid = storeI.id;
    }
      this.getseckillList(stoid);
      this.gethotSellingList(stoid);
      this.setData({
        Authorization: e.detail.Authorization,
        empower: false
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
  getPhoneNumber(e){
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
  // 循环权限判断
  getUserPower(){
    var showp = false;
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          this.setData({
            empower: true,
          })
          return;
        }
        if (!res.authSetting['scope.userLocation']) {
          this.getLocation();
          return;
        }
        showp = true;

      }
    })
    if(showp && this.data.overlayShow == null){ //
        this.setData({
          overlayShow:true
        })
        return true;
    }
    return showp;



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
  onLoad: function (options){
    console.log("加载首页");
    
    this.getLocation();

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
        if(options.serviceAreaId){
          var storeInfo = {};
          storeInfo.id = options.serviceAreaId;
          wx.setStorageSync('storeInfo', storeInfo);
          that.setData({
            storeInfo:storeInfo
          })
        }
        // if (that.data.storeInfo.id) {
        //   // that.getGoodsList(that.data.storeInfo.id);
        //   this.getseckillList(this.data.storeInfo.id);
        //   this.gethotSellingList(this.data.storeInfo.id);
        // }
       
        if(options.orderShare){
          let url = decodeURIComponent(options.orderShare);
          wx.navigateTo({
            url
          })
        }
      }

    })
    // that.getOverlayShowStatus();



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
    var storeI = wx.getStorageSync('storeInfo');
    console.log(storeI);
    console.log("保存的店铺信息");

    this.refreshShoppingCar();
    // let pages = getCurrentPages();
    // let currPage = pages[pages.length - 1];
    // if (currPage.data.storeInfo) {
    //     this.setData({
    //         //将携带的参数赋值
    //         storeInfo: currPage.data.storeInfo
    //   });
    // }
    //如果经纬不一样就刷新
    
    // if(!this.getUserPower()){
    //   return;
    // }
    
    console.log("新老");
    console.log(this.data.oldLocation);
    console.log(this.data.locationInfo);
    if(this.data.oldLocation.latitude != this.data.locationInfo.latitude || this.data.oldLocation.longitude != this.data.locationInfo.longitude){
      console.log("进来咯~！！！！！！！！！！！！！");
      this.getStore(this.data.locationInfo);
      return;
    }
    console.log("店铺 id id："+this.data.storeInfo.id);
    if(this.data.storeInfo.id != null){
      this.getseckillList(this.data.storeInfo.id);
      this.gethotSellingList(this.data.storeInfo.id);
    }
    
   
    
    return;
    this.getLocation();
    let fromGoodsInfo = app.globalData.fromGoodsInfo;
    console.log(fromGoodsInfo)
    if (fromGoodsInfo) {
      this.setData({
        fromGoodsInfo: fromGoodsInfo
      })
      this.getGoodsList(this.data.storeInfo.id);
      this.getseckillList(this.data.storeInfo.id);
      this.gethotSellingList(this.data.storeInfo.id);

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
    var storeI = wx.getStorageSync('storeInfo');
    console.log(storeI);
    console.log("保存的店铺信息");
    if(storeI){
      var li = {
        latitude:storeI.lat,
        longitude:storeI.lng
      }
      this.getStore(li);
      this.setData({
        storeInfo:storeI
      })
    }else{
      this.getLocation();
    }
    this.setData({
      buyListNumberLength: 0,
      totalPrice: 0
    })
    // wx.stopPullDownRefresh()
    if (this.data.storeInfo.id) {
      // this.getGoodsList(this.data.storeInfo.id);
      this.getseckillList(this.data.storeInfo.id);
      this.gethotSellingList(this.data.storeInfo.id);
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
  goSeckill(){
    console.log("要传的id 是"+this.data.storeInfo.id);
   wx.navigateTo({
           url:'../../home/seckill/seckill?id='+this.data.storeInfo.id,  //跳转页面的路径，可带参数 ？隔开，不同参数用 & 分隔；相对路径，不需要.wxml后缀
           success:function(){
             console.log("来到方法11");
           },        //成功后的回调；
           fail(){},       //失败后的回调；
           complete(){},      //结束后的回调(成功，失败都会执行)
       })
  },
  goNearStore(){
    // latitude: 31.22114, longitude: 121.54409,
    console.log("要传的经纬度 是"+this.data.locationInfo.latitude);
   wx.navigateTo({
           url:'../../home/nearstore/nearstore?locationlat='+this.data.locationInfo.latitude+"&locationlon="+this.data.locationInfo.longitude,  //跳转页面的路径，可带参数 ？隔开，不同参数用 & 分隔；相对路径，不需要.wxml后缀
           success:function(){},        //成功后的回调；
           fail(){},       //失败后的回调；
           complete(){},      //结束后的回调(成功，失败都会执行)
       })
  },
   //添加购物车
   addCar: function(e){
    // shoppingCarStockIdList,item.stockIdList[0]
    console.log(e.currentTarget.dataset.goodsinfo.stockIdList[0]+ " --"+this.data.shoppingCarStockIdList);
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
    //跳转详情页
    toDetails: function(e){
      console.log(e);
      wx.navigateTo({
        url: '/pages/commodity/goodsDetailsLine/goodsDetailsLine?commodityid='+e.currentTarget.dataset.commodityid+'&stockidlist='+e.currentTarget.dataset.stockidlist.join(","),
      })
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

//清空购物车
cleanShoppingCar: function(){
  app.globalData.shoppingCarList = [];
  this.refreshShoppingCar();
},
searchg(){
  wx.navigateTo({
    url: '../../home/searchGoods/searchGoods',
  })
}


})