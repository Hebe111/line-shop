// components/infoBar/infoBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "标题"
    },
    img: {
      type: String,
      value: "https://eggwaiter.oss-cn-beijing.aliyuncs.com/web/miniprogram/detailsBacRed.png"
    },
    name: {
      type: String,
      value: "蛋小二"
    },
    date: {
      type: String,
      value: "1小时前"
    },
    readNum: {
      type: String,
      value: "666"
    },
    newsid: {
      type: String,
      value: "",
    },
    newsType: {
      type: String,
      value: ""
    },
    newsSrc: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    toDetails(e){
      console.log(e)
      const newsUrl = encodeURIComponent(e.currentTarget.dataset.newsurl);
      const newsType = e.currentTarget.dataset.newstype;
      const newsid = e.currentTarget.dataset.newsid;
      wx.navigateTo({
        url: '/pages/posts/pages/infoDetails/infoDetails?newsSrc=' + newsUrl + "&newsType=" + newsType + "&newsid=" + newsid,
      })
    }
  }
})
