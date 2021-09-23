/**
 * 
 * 1页面被打开的时候 onShow
 *  0 onShow不同于onload 无法在形参上接收option参数
 *  判断缓存中有没有token
 *    没有 直接跳转到授权页面
 *    有 直接往下进行
 *  1获取url上参数type
 *    根据type来决定页面标题的数组元素 哪个被激活选中
 *  2根据type去发送请求获取订单数据
 *  3渲染页面
 * 2点击不同标题 重新发送请求和渲染数据
 */
import { request } from "../../request/request.js";
import regeneratorRuntime from "../../lib/runtime/runtime.js";
Page({

  data: {
    orders:[],
    tabs: [
      {
        id: 0,
        value: "全部",
        isActive: true
      },
      {
        id: 1,
        value: "代付款",
        isActive: false
      },
      {
        id: 2,
        value: "代发货",
        isActive: false
      },
      {
        id: 3,
        value: "退款/退货",
        isActive: false
      }
    ]
  },

  onShow(options){
    /*const token = wx.getStorageSync("token");
    if (!token){
      wx.navigateTo({
        url: '/pages/auth/auth'
      });
      return;
    }
   
    //1获取当前小程序的页面栈-数组 长度最大是10页面
    let pages = getCurrentPages()
    //2数组中索引最大的页面就是当前页面
    let currentPage = pages[pages.length-1];
    //3获取url上的type的参数
    this.getOrders();*/

    let pages = getCurrentPages()
    let currentpage = pages[pages.length - 1].options
    console.log(currentpage)
    const { type } = currentpage
    //激活选中页面标题
    this.changeTitleByIndex(type-1);
    this.getOrders(type)
    wx.setStorageSync('token', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIzLCJpYXQiOjE1NjQ3MzAwNzksImV4cCI6MTAwMTU2NDczMDA3OH0.YPt-XeLnjV-_1ITaXGY2FhxmCe4NvXuRnRB8OMCfnPo')
    const token = wx.getStorageSync("token")
    if (!token) {
      wx.navigateTo({
        url: '/pages/auth/auth'
      }); 
      return;
    }

  },
  //获取订单列表的方法
  async getOrders(type){
    const res = await request({ url:"/my/orders/all",data:{type}});
    this.setData({
      orders: res.orders.map(v => ({ ...v, create_time_cn: (new Date(v.create_time * 1000).toLocaleString())}))
    })
  },
  //根据标题索引来激活选中 标题数组
  changeTitleByIndex(index){
    //2修改原数组
    let { tabs } = this.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
    //3赋值到data中
    this.setData({
      tabs
    })
  },
  handleTabsItemChange(e) {
    //1获取被点击的标题索引
    const { index } = e.detail;
    this.changeTitleByIndex(index);
    //2重新发送请求 type=1 index=0
    this.getOrders(index+1);
  }
 
})