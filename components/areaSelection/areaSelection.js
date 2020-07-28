// components/areaSelection/areaSelection.js
const api = require("../../utils/request.js");
Component({
  properties: {
    showRegion: {
      type: Boolean,
      observer: function(newVal, oldVal) {
        this.setData({
          dialog: newVal,
        });
      },
    },
    regionValue: {
      type: Array,
      value: [],
      observer: function(newVal, oldVal) {
        console.log(newVal)
        if (newVal.length == 0) {
          this.getCityList('')
        }
        if (newVal.length > 0) {
          let select = newVal.length - 1;
          for (let i = newVal.length - 1; i >= 0; i--) {
            if (newVal[i].id !== '') {
              select = i;
              break;
            }
          }
          console.log(newVal)
          // 除最低级别区（select = 2）以外，需要获取当前级别下一级的数据
          this.setData({
            ['region.tabs']: newVal,
            ['region.select']: select < 2 ? select + 1 : select,
            // ['region.tabs']: newVal,
            // ['region.select']: select,
            ['region.code']: newVal[select - 1].code,
          }, () => {
            this.getCityList(this.data.region.select, this.data.region.code)
          });
        }
      },
    },
  },
  data: {
    dialog: false,
    area: [],
    region: {
      tabs: [{
          name: '请选择',
          code: '',
        },
        {
          name: '请选择',
          code: '',
        },
        {
          name: '请选择',
          code: '',
        },
      ],
      select: 0,
      code: ""
    },
  },

  methods: {
    getCityList: function(action, code) {
      api.wxRequest({
        url: "basic/getAreaList",
        data: {
          action: action + 1,
          code: code || ''
        }
      }).then(res => {
        this.setData({
          province: res.data.data,
          area: res.data.data
        })
      })
    },

    // 关闭 picker 触发的方法
    emitHideRegion: function() {
      if ((this.data.region.tabs[0].code !== '' || this.data.region.tabs[0].code !== '') && this.data.region.tabs[2].code === '') {
        wx.showToast({
          title: '请选择所在地',
          icon: 'none',
          duration: 2000,
        });
        return false;
      }
      let myEventDetail = {}; // detail对象，提供给事件监听函数
      let myEventOption = {}; // 触发事件的选项
      this.setData({
        dialog: !this.data.dialog,
      });
      myEventDetail = {
        showRegion: this.data.dialog,
        regionValue: this.data.region.tabs,
      };
      this.triggerEvent('myevent', myEventDetail, myEventOption);
    },
    bindRegionChange: function(e) {
      // 获取当前选中项的name和id并赋值给data中的数据
      let code = 'region.tabs[' + this.data.region.select + '].code';
      let name = 'region.tabs[' + this.data.region.select + '].name';
      this.setData({
        [code]: e.target.dataset.code,
        [name]: e.target.dataset.name,
        ['region.code']: e.target.dataset.code
      });
      // 除了三级以外的需要获取对应子选项
      if (this.data.region.select < 2) {
        this.setData({
          ['region.select']: ++this.data.region.select,
        }, () => {
          // 获取子选项
          this.getCityList(this.data.region.select, this.data.region.code)
        });
      } else {
        // 三级选项选择完毕关闭省市区选择器
        this.emitHideRegion();
      }
    },

    // 省市区tab切换
    changeRegionLevel: function(e) {
      let level = e.target.dataset.level;
      // 三级选项的tab点击无效果
      if (level === 2) return false;
      // 当前选中tab和级别小于当前选中tab的状态都置为初始化状态
      for (let i = level; i < 3; i++) {
        let string = 'region.tabs[' + i + ']';
        this.setData({
          [string]: {
            name: '请选择',
            code: '',
          },
        });
      }
      this.setData({
        ['region.select']: level,
      });
      let perIndex = level - 1;
      if (perIndex == -1) {
        this.getCityList(this.data.region.select, '')
      } else {
        this.getCityList(this.data.region.select, this.data.region.tabs[perIndex].code)
      }

    },
  },
});