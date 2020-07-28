const api = require("../../../utils/request.js");
// const key = 'CXOBZ-SKEWD-5GY4K-PXQWV-GBARJ-CUFBQ'; //使用在腾讯位置服务申请的key
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
    textareaShow: 1,
    addreeText: '选择收货地址',
    houseNumberText:"例：5号楼901室",
    id: "",
    bandCardNum: '',
    opener: '',
    openingBank: '',
    fixedHeight: '40',
    optionsEdit: '',
    isFinish: false,
    noEdit: '1',
    bankCar: '',
    // https://oss.eggxiaoer.com/web/miniprogram/selection.png
    ischecked: 'https://oss.eggxiaoer.com/web/miniprogram/unchecked.png',
    showRegion: false,
    formData: {
      regionValue: [],
    },
    type: '',
    name:'',
    phoneNum:"",
    lat:null,//纬度
    lng:null,//经度
    houseNumber:'',
  },

  toChoseLocation(){
    wx.navigateTo({
      url: `plugin://chooseLocation/index?key=${key}&referer=${referer}&category=${category}`
    });
  },
  getName(e){
    const val = e.detail.value;
    if (!val) {
      this.setData({
        name: val
      });
    }
    this.setData({
      name: val
    });
  },
  getPhoneNum: function (e) {
    var that = this;
    const val = e.detail.value;
    if (!val || val.length != 11) {
      this.setData({
        phoneNum: val
      });
    }
    let telephone = val;
    if ((telephone.length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(telephone)) && val !== '') {
      wx.showToast({
        title: '请输入有效的手机号码',
        icon: "none"
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)

    } else {
      this.setData({
        phoneNum: val
      });
    }
  },
  unbound() {
    var id = this.data.id
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '确定删除吗？',
      success(res) {
        if (res.confirm) {
          api.wxRequest({
            url: "member/user/deleteAddress",
            data: {
              id: id
            }
          }).then(res => {
            if (res.data.success == true) {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1500
              })
              setTimeout(() => { 
                wx.navigateBack({
                  delta: 1
                })
              }, 1500);
            }
          })
        } else if (res.cancel) {

        }
      }
    })
  },
  // 地区选择
  chooseRegion: function () {
    this.setData({
      showRegion: true,
      textareaShow: 0
    });
    console.log("_+++"+this.data.addreeText)
  },

  // 关闭地区选择
  emitHideRegion: function (e) {
    this.setData({
      showRegion: e.detail.showRegion,
      ['formData.regionValue']: e.detail.regionValue,
      textareaShow: 1

    });
    this.isFinishFun()
  },
  ischecked(e) {
    console.log("1"+e.currentTarget.dataset.ischecked)
    let ischecked = e.currentTarget.dataset.ischecked
    if (ischecked == 'https://oss.eggxiaoer.com/web/miniprogram/unchecked.png') {
      this.setData({
        ischecked: 'https://oss.eggxiaoer.com/web/miniprogram/selection.png',
        type: 1
      })


    } else if (ischecked == 'https://oss.eggxiaoer.com/web/miniprogram/selection.png') {
      this.setData({
        ischecked: 'https://oss.eggxiaoer.com/web/miniprogram/unchecked.png',
        type: 0

      })
    }
  },
  switchChange: function (e) {
    console.log("2"+e.detail.value)
  },

  addAdress() {
    if (this.data.isFinish) {
      this.setData({
        isFinish: false
      })
      if(!this.data.name){
        wx.showToast({
          title: '请输入姓名！',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return false;
      }
      if (!this.data.phoneNum) {
        wx.showToast({
          title: '请输入手机号！',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return false;
      }
      if (!this.data.formData.regionValue[2].code) {
        wx.showToast({
          title: '请选择区域！',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return false;
      }
      if (!this.data.openingBank) {
        wx.showToast({
          title: '请选择详细地址！',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return false;
      }
      if (!this.data.houseNumber) {
        wx.showToast({
          title: '请输入门牌号！',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return false;
      }
      //
      if (this.data.optionsEdit == 1) {
        var url = 'member/user/editAddress'
        console.log("3"+url)
      } else {
        var url = "member/user/addAddress"

      }
      api.wxRequest({
        url: url,
        data: {
          id: this.data.id,
          provinceCode: this.data.formData.regionValue[0].code,
          province: this.data.formData.regionValue[0].name,
          cityCode: this.data.formData.regionValue[1].code,
          city: this.data.formData.regionValue[1].name,
          countyCode: this.data.formData.regionValue[2].code,
          county: this.data.formData.regionValue[2].name,
          address: this.data.openingBank,
          type: this.data.type,
          contactName:this.data.name,
          mobile: this.data.phoneNum,
          houseNumber:this.data.houseNumber,
          lat:this.data.lat,
          lng:this.data.lng
        }
      }).then(res => {
        if (res.data.success == true) {
          wx.showToast({
            title: '成功',
            icon: "success"
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000,
            mask: true
          })
        }
      })
    }

  },
  getOpeningBank: function (e) {
    const val = e.detail.value;
    if (!val) {
      this.setData({
        openingBank: val
      });
    } else {
      this.setData({
        openingBank: val
      });
    }
   
    this.isFinishFun()
  },

  getHouseNumber(e){
    console.log("4"+e.detail)
    const val = e.detail.value;
    if (!val) {
      this.setData({
        houseNumber: val
      });
    } else {
      this.setData({
        houseNumber: val
      });
    }
   
    this.isFinishFun()
  },

  getAdressInfo() {
    api.wxRequest({
      url: "member/user/getAddressInfo",
      data: {
        id: this.data.id
      }
    }).then(res => {
      if (res.data.success == true) {
        console.log("5"+res.data.data)
        let info = res.data.data;
        let geocoder = info.province + info.city + info.county + info.address
        let regionValueList = []
        let p = {}
        p.name = res.data.data.province
        p.code = res.data.data.provinceCode
        regionValueList.push(p)
        let c = {}
        c.name = res.data.data.city
        c.code = res.data.data.cityCode
        regionValueList.push(c)
        let a = {}
        a.name = res.data.data.county
        a.code = res.data.data.countyCode
        regionValueList.push(a)
        console.log("6"+regionValueList)
        this.setData({
          ['formData.regionValue']: regionValueList,
          // one: res.data.data.province,
          // two: res.data.data.city,
          // three: res.data.data.county,
          openingBank: res.data.data.address,
          type: res.data.data.type,
          name: res.data.data.contactName,
          phoneNum: res.data.data.mobile,
          houseNumber:res.data.data.houseNumber,
          lat:res.data.data.lat,
          lng:res.data.data.lng,
        })
        if (res.data.data.type == 1) {
          console.log("7"+res.data.data.type)
          this.setData({
            ischecked: 'https://oss.eggxiaoer.com/web/miniprogram/selection.png',
          })
        }

        qqmapsdk.geocoder({
          //获取表单传入地址
          address: geocoder, //地址参数，例：固定地址，address: '北京市海淀区彩和坊路海淀西大街74号'
          success: function(res) {//成功后的回调
            console.log("8"+res);
            var res = res.result;
            
            //根据地址解析在地图上标记解析地址位置
             
          },
          fail: function(error) {
            console.error(error);
          },
          complete: function(res) {
            console.log(res);
          }
        })
      }
    })
  },

  // 判断输入框是否输入完整
  isFinishFun() {
    const that = this.data;
    if ((that.formData.regionValue[2].name != '请选择' && typeof (that.formData.regionValue) != 'undefined') && (that.openingBank != '' && that.openingBank != null && that.openingBank != 'undefined') && (that.houseNumber !="" && that.houseNumber != undefined )) {
      this.setData({
        isFinish: true
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    if (options.edit == 1) {
      wx.setNavigationBarTitle({
        title: '编辑地址'
      })
      this.setData({
        optionsEdit: options.edit,
        id: options.id,
        fixedHeight: 158
      })
      this.getAdressInfo()
      setTimeout(() => {
        this.isFinishFun()
      }, 500)
    } else {
      wx.setNavigationBarTitle({
        title: '新增地址'
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
    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    console.log("9"+location)
    if(location != null){
      this.setData({
        openingBank:location.name,
        lat:location.latitude,
        lng:location.longitude
      })
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
