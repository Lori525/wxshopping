/**
 * 1页面加载的时候
 *  1从缓存中获取购物车数据 渲染页面中
 *    这些数据 checked =true
 * 2微信支付
 *  1哪些人 哪些账号 可以实现微信支付
 *    1企业账号 
 *    2企业账号的小程序后台中 必须给开发者添加上白名单
 *      1一个appid可以同时绑定多个开发者
 *      2这些开发者就可以共用这个appid和它的开发权限
 * 3支付按钮
 *  1先判断缓存中有没有token
 *  2没有跳转到授权页面 进行获取token
 *  3有token正常执行逻辑
 *  4创建订单
 *  5已经完成支付
 *  6手动删除缓存中已经被选中了的商品
 *  7删除后的购物车数据 填充回缓存中
 *  8再跳转页面
 */
//0.引入用来发送请求的方法
import { request } from "../../request/request.js";
import { getSetting, chooseAddress, openSetting, showModal, showToast, requestPayment} from "../../utils/asyncWx.js";
import regeneratorRuntime from "../../lib/runtime/runtime.js";//es7包
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: [],
    cart: [],
    totalPrice: 0,
    totalNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  onShow() {
    //1获取本地存储中的地址数据
    const address = wx.getStorageSync("address");
    //获取缓存中的购物车数据
    let cart = wx.getStorageSync("cart") || [];
    //过滤后的购物车数组
    cart = cart.filter(v=>v.checked);
    this.setData({
      address
    });
    //总价格 总数量
    let totalPrice = 0;
    let totalNum = 0;
    cart.forEach(v => {
        totalPrice += v.num * v.goods_price;
        totalNum += v.num;
     
    })
    
    this.setData({
      cart,
      totalPrice,
      totalNum,
      address
    });
  },

  //点击支付
 async handleOrderPay(){

    try{
        //判断缓存中有没有token
        const token = wx.getStorageSync("token");
        //判断
        if (!token) {
          wx.navigateTo({
            url: '/pages/auth/auth'
          })
          return;
        }
        //3创建订单
        //3.1准备请求头参数
        //const header = { Authorization: token };
        //3.2准备请求体参数
        const order_price = this.data.totalPrice;
        const consignee_addr = this.data.address.all;
        let goods = [];
        cart.forEach(v => goods.push({
          goods_id: v.goods_id,
          goods_number: v.num,
          goods_price: v.goods_price
        }))
        const orderParams = { order_price, consignee_addr, goods }
        //4发送请求 创建订单 获取订单编号
        const { order_number } = await request({ url: "my/orders/create", method: "POST", data: orderParams });
        //5发起预支付接口
        const { pay } = await request({ url: "/my/orders/req_unifiedorder", method: "POST", data: { order_number } });
        //6发起微信支付
        await requestPayment(pay);
        //7查询后台订单状态
        const res = await request({ url: "/my/orders/chkOrder", method: "POST", data: { order_number } });

        await wx.showToast({title:"支付成功"});
        //手动删除缓存中 已经支付的商品
        let newCart = wx.getStorageSync("cart");
        newCart = newCart.filter(v=>!v.checked);
        wx.setStorageSync("cart", newCart);
        //跳转到订单页面
        wx.navigateTo({
          url: '/pages/order/order'
        })

    }catch(error){
      await wx.showToast({ title: "支付失败" });
      console.log(err);
    }
  }

})