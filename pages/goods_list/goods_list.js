//0.引入用来发送请求的方法
import { request } from "../../request/request.js";
import regeneratorRuntime from "../../lib/runtime/runtime.js";
/**
 * 1用户上滑页面 滚动条触底 开始加载下一页数据
 *  1找到滚动条触底事件
 *  2判断还有没有下一页数据
 *    1获取到总页数 只有总条数
 *      总页数=Math.ceil(只有总条数/pagesize)
 *    2获取当前的页码 pagenum
 *    3判断一下当前的页码是否大于或者等于总页数
 *      表示没有下一页数据
 *  3假如没有下一页数据 弹出一个提示
 *  4假如还有下一页数据 来加载下一页数据
 *    1当前的页码++
 *    2重新发送请求
 *    3数据请求回来 要对data中的数组进行拼接而不是全部替换
 * 2下拉刷新
 *  1触发下拉刷新事件  需要在页面json文件中开启一个配置项
 *    找到触发下拉刷新事件
 *  2重置数组
 *  3重置页码设置为1 
 *  4重新发送数据请求  
 *  5数据请求回来，需要手动关闭等待效果
 */
Page({
  data: {
    tabs:[
      {
        id:0,
        value:"综合",
        isActive:true
      },
      {
        id: 1,
        value: "销量",
        isActive: false
      },
      {
        id: 2,
        value: "价格",
        isActive: false
      }
    ],
    goodsList:[]
  },
  //接口要的参数
  QueryParams:{
    query:"",
    cid:"",
    pagenum:1,
    pagesize:10
  },
  //总页数
  totalPages:1,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.QueryParams.cid=options.cid||"";
    this.QueryParams.query = options.query || "";
    this.getGoodsList();
  },
  //获取商品列表数据
  async getGoodsList(){
    const res = await request({ url:"/goods/search",data:this.QueryParams});
    //获取总条数
    const total=res.total;
    //计算总页数
    this.totalPages=Math.ceil(total/this.QueryParams.pagesize);
    //console.log(this.data.goodsList);
    this.setData({
      //拼接的数组
      goodsList: [...this.data.goodsList, ...res.goods]
    })
    //console.log(this.data.goodsList);
    //关闭下拉刷新的窗口
    wx.stopPullDownRefresh();
  },
  //标题点击事件 从子组件传递过来
  handleTabsItemChange(e){
    //1获取被点击的标题索引
    const {index}=e.detail;
    //2修改原数组
    let {tabs}=this.data;
    tabs.forEach((v,i)=>i===index?v.isActive=true:v.isActive=false);
    //3赋值到data中
    this.setData({
      tabs
    })
  },
  //页面上滑 滚动条触底事件
  onReachBottom(){
    //1判断还有没有下一页数据
    if(this.QueryParams.pagenum>=this.totalPages){
      //没有下一页数据
      wx.showToast({
        title: '没有下一页数据了'
      })
    }else{
      this.QueryParams.pagenum++;
      this.getGoodsList();
    }
  },
  //下拉刷新事件
  onPullDownRefresh(){
    this.setData({
      goodsList:[]
    })
    //2重置页码
    this.QueryParams.pagenum=1;
    //发送请求
    this.getGoodsList();
    
  }
})