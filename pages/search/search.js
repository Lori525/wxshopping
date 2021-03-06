/**
 * 1输入框绑定 值改变事件 input事件
 *  1获取到输入框的值
 *  2合法性判断
 *  3检验通过 把输入框的值 发送到后台
 *  4返回的数据打印到页面上
 * 2防抖(防止抖动) 定时器
 *  0 防抖 一般 输入框中 防止重复输入 重复发送请求
 *  1 节流 一般是用在页面下拉和上拉
 *  1定义全局的定时器id
 * 
 * 
 */
//0.引入用来发送请求的方法
import { request } from "../../request/request.js";
import regeneratorRuntime from "../../lib/runtime/runtime.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods:[],
    isFocus:false,
    inpValue:""
  },
  TimeId : -1,
  //输入框的值改变就会触发的事件
  handleInput(e){
    //1获取输入框的值
    const {value} = e.detail;
    //2检测合法性
    if(!value.trim()){
      this.setData({
        goods:[],
        isFocus:false
      })
      return
    }
    //准备发送请求获取数据
    this.setData({
      isFocus :true
    })
    clearTimeout(this.TimeId);
    this.TimeId=setTimeout(()=>{
      this.qsearch(value);
    },1000);
    
  },
  //发送请求获取搜索建议 数据
  async qsearch(query){
    const res = await request({ url:"/goods/qsearch",data:{query}});
    console.log(res);
    this.setData({
      goods:res
    })
  },
  //点击取消按钮
  handleCancel(){
    this.setData({
      goods: [],
      isFocus: false,
      inpValue: ""
    })
  }
 
})