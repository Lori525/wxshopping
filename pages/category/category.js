
//0.引入用来发送请求的方法
import { request } from "../../request/request.js";
import regeneratorRuntime from "../../lib/runtime/runtime.js";

Page({

  data: {
    //左侧的菜单数据
    leftMenuList:[],
    //右侧的商品数据
    rightContent:[],
    //被点击左侧菜单
    currentIndex:0,
    //右侧内容的滚动条距离顶部的距离
    scrollTop:0
  },
  //接口返回的数据
  Cates:[],

  onLoad: function (options) {
    /**
     * 0web中的本地存储和小程序中的本地存储的区别
     *  写代码方式不一样
     *    web:localStora.setItem("key","value");localStora.getItem("key");
     *    小程序：wx.setStorageSync("key", "value");wx.getStorageSync("cates");
     *  存的时候 有没有做类型转换
     *    web:不管存入的是什么类型的数据，最终都会先调用一下toString(),把数据变成字符串再存入进去
     *    小程序：不存在类型转换的操作，存入什么类型的数据，获取的时候就是什么类型数据
     * 1先判断一下本地存储中有没有旧的数据
     * {time：Date.now(),data[...]}
     * 2没有旧数据直接发送新的请求
     * 3有旧的数据，同时旧的数据也没有过期就使用本地存储的旧数据即可
     */
      //1获取本地存储中的数据（小程序中也是存在本地存储 技术）
      const Cates = wx.getStorageSync("cates");
      //2判断
      if(!Cates){
        //不存在，就发送请求
        this.getCates();
      }else{
        //有旧的数据 暂时定义过期时间 10s变成5分钟
        if(Date.now()-Cates.tiem>1000*10){
          this.getCates();
        }else{
          //可以用旧的数据
          this.Cates=Cates.data;
          //构造左侧菜单数据
          let leftMenuList = this.Cates.map(v => v.cat_name);
          //构造右侧商品数据
          let rightContent = this.Cates[0].children;
          this.setData({
            leftMenuList,
            rightContent
          })
        }

      }


    
  },
  //获取分类数据
  async getCates(){
   /*request({
      url: '/categories',
    })
    .then(res=>{
      this.Cates=res.data.message;
      //把接口的数据存入本地存储中
      wx.setStorageSync("cates", {tiem:Date.now(),data:this.Cates});

      //构造左侧菜单数据
      let leftMenuList=this.Cates.map(v=>v.cat_name);
      //构造右侧商品数据
      let rightContent=this.Cates[0].children;
      this.setData({
          leftMenuList,
          rightContent
      })
    })*/

    //1.使用es7的async await来发送请求
    const res=await request({ url: '/categories'});
   // this.Cates = res.data.message;
    this.Cates = res;
    
    //把接口的数据存入本地存储中
    wx.setStorageSync("cates", { tiem: Date.now(), data: this.Cates });

    //构造左侧菜单数据
    let leftMenuList = this.Cates.map(v => v.cat_name);
    //构造右侧商品数据
    let rightContent = this.Cates[0].children;
    this.setData({
      leftMenuList,
      rightContent
    })
  },
  //左侧点击菜单事件
  handleItemTap(e){
   /**
    * 1获取被点击的标题身上的索引
      2给data中的currentIndex赋值
      3根据不同索引来渲染右侧的商品内容
    */
    const {index}=e.currentTarget.dataset;
    let rightContent = this.Cates[index].children;
    this.setData({
      currentIndex:index,
      rightContent,
      //重新设置 右侧内容的scroll-view标签的距离顶部的距离
      scrollTop:0
    })
    
  }

  
})