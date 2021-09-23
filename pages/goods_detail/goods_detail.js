//0.引入用来发送请求的方法
import { request } from "../../request/request.js";
import regeneratorRuntime from "../../lib/runtime/runtime.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsObj:{},
    isCollect:false
  },
  //商品对象
  GoodsInfo:{},
  /**
   * 生命周期函数--监听页面加载
   
onLoad: function (options) {
    const {goods_id}=options;
    this.getGoodsDetail(goods_id);
  },
   */
  onShow: function () {
    let pages = getCurrentPages();
    let currentPage =pages[pages.length-1];
    let options =currentPage.options
    const { goods_id } = options;
    this.getGoodsDetail(goods_id);
  },
  //获取商品详情数据
  async getGoodsDetail(goods_id){
    const goodsObj = await request({ url:"/goods/detail",data:{goods_id}});
    this.GoodsInfo = goodsObj;
    //获取缓存中的商品数组
    let collect = wx.getStorageSync("collect")||[];
    //判断当前商品是否被收藏
    let isCollect = collect.some(v => v.goods_id === this.GoodsInfo.goods_id);
    this.setData({
      goodsObj:{
        goods_name:goodsObj.goods_name,
        goods_price:goodsObj.goods_price,
        //iphone部分手机，不识别webp图片格式
        goods_introduce:goodsObj.goods_introduce.replace(/\.webp/g,'.jpg'),
        pics:goodsObj.pics
      },
      isCollect
    })
  },

  //2点击轮播图 预览大图
    //1给轮播图绑定点击事件
    //调用小程序的api previewImage
  handlePreviewImage(e){
    //1先构造要预览的图片数据
    const urls=this.GoodsInfo.pics.map(v=>v.pics_mid);
    //2接收传递过来的图片url
    const current=e.currentTarget.dataset.url;
    wx.previewImage({
      current: current,
      urls: urls,
    })
  },
  /**
   * 3点击加入购物车
   *  1绑定点击事件
   *  2获取缓存中的购物车数据 数组格式
   *  3先判断 当前的商品是否已经存在购物车里
   *  4已经存在 修改商品数据 执行购物车数量++ 重新把购物车数组填充回缓存中
   *  5不存在 直接给购物车数组添加一个新元素 新元素带上购买数量属性 num 重新把购物车数组填充回缓存中
   *  6弹出用户提示
   */
  handleCartAdd(){
    //1获取缓存中的购物车数组
    let cart=wx.getStorageSync("cart")||[];
    //2判断 商品对象是否存在购物车中
    let index=cart.findIndex(v=>v.goods_id===this.GoodsInfo.goods_id);
    if(index===-1){
      //不存在 第一次添加
      this.GoodsInfo.num=1;
      this.GoodsInfo.checked=true;
      cart.push(this.GoodsInfo);
    }else{
      //已经存在购物车数据 执行num++
      cart[index].num++;
    }
    //重新添加在缓存中
    wx.setStorageSync("cart", cart);
    wx.showToast({
      title: '加入成功',
      icon:'success',
      mask:true
    });
  },
  /**
   * 4商品收藏
   *  1页面onshow 加载缓存中的商品收藏的数据
   *  2判断当前商品是不是被收藏
   *    1是 改变页面图标
   *    2不是...
   *  3点击商品收藏按钮
   *    1判断该商品是否存在于缓存数组中
   *    2已结存在 ，把该商品删除
   *    3没有存在 把该商品添加到收藏数组中 存入到缓存中即可
   */
  //点击商品收藏按钮
  handleCollect(){
    let isCollect = false;
    //获取缓存中的商品数组
    let collect = wx.getStorageSync("collect")||[];
    //判断该商品是否被收藏
    let index = collect.findIndex(v=>v.goods_id===this.GoodsInfo.goods_id);
    //当index不等于-1 表示已经收藏
    if(index!==-1){
      //已经收藏过 在数组中删除该商品
      collect.splice(index,1);
      isCollect=false;
      wx.showToast({
        title: '取消成功',
        icon: "success",
        mask: true
      })
    }else{
      //没有收藏过
      collect.push(this.GoodsInfo)
      isCollect=true;
      wx.showToast({
        title: '收藏成功',
        icon: "success",
        mask: true
      })
    }
    //把数组存入缓存中
    wx.setStorageSync("collect", collect);
    //修改data当中的属性 isCollect
    this.setData({
      isCollect
    })
  }
})