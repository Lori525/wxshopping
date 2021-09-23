/**
 * 1获取用户的收货地址
    *  1绑定点击事件
    *  2调用小程序内置API 获取用户收货地址 wx.chooseAddress
    * 2获取用户对小程序所授予 获取地址的权限状态 scope
    *  1假设用户点击获取收货地址的提示框 确定 authSetting scope.address
    *    scope的值为true 直接调用 获取收货地址
    *  2假设用户从来没有调用过 收货地址的api
    *    scope的值为undefined 直接调用 获取收货地址
    *  3假设用户点击获取收货地址的提示框 取消  
    *    scope的值为false
    *    1诱导用户自己打开授权设置页面 当用户重新给与获取地址权限的时候 openSetting
    *    2获取收货地址
    *  4把获取到的地址存入缓存中
 * 2页面加载完毕
 *  0 onLoad  onshow事件
 *  1获取本地存储中的地址数据
 *  2把数据设置给data中的一个变量
 * 3onShow
 *  1获取缓存中的购物车数组
 *  2把购物车数据填充到data中
 * 4全选的实现
 *  1在onshow 获取缓存中的购物车数组
 *  2根据购物车中的商品数据进行计算 ，所有的商品被选中 checked=true 全选就被选中
 * 5总价格和总数量
 *  1都需要商品被选中，才计算
 *  2获取购物车数组
 *  3遍历
 *  4判断商品是否被选中
 *  5总价格 += 商品单价*商品数量
 *  6总数量 += 商品的数量
 *  7计算后的价格和数量 设置回data中即可
 * 6商品选中功能
 *  1绑定change事件
 *  2获取到被修改的商品对象
 *  3商品对象的选中状态 取反
 *  4重新填充回data中和缓存中
 *  5重新计算全选，总价格和总数量
 * 7全选和反选
 *  1全选复选框绑定事件change
 *  2获取data中全选变量 allChecked
 *  3直接取反 allChecked=！allChecked
 * ·4遍历购物车数组，让里面购物车商品选中状态跟随者allChecked改变
 *  5把购物车数组和allChecked 重新设置回data中 把购物车重新设置回缓存中
 * 8商品数量的编辑功能
 *  1 "+" "-" 按钮绑定同一个点击事件 区分关键 自定义属性
 *    1 "+" "+1"
 *    2 "-" "-1"
 *  2传递被点击的商品id goods_id
 *  3获取到data中的购物车数组 来获取需要被修改的商品对象
 *  4当购物车的数量 =1 同时用户点击 "-"
 *    弹窗提示 showModal 询问用户 是否删除
 *      确定 直接执行删除
 *      取消 什么都不做
 *  4直接修改商品对象的数量 num
 *  5把cart数组 重新设置回缓存中和data中 this.setCart
 * 9点击结算
 * 1判断有没有收货地址信息
 * 2判断用户有没有选购商品
 * 3经过以上验证 跳转到 支付页面
 */
import { getSetting, chooseAddress, openSetting, showModal, showToast} from "../../utils/asyncWx.js";
import regeneratorRuntime from "../../lib/runtime/runtime.js";//es7包
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:[],
    cart:[],
    allChecked:false,
    totalPrice:0,
    totalNum:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  onShow(){
    //1获取本地存储中的地址数据
    const address = wx.getStorageSync("address");
    //获取缓存中的购物车数据
    const cart=wx.getStorageSync("cart")||[];
    //计算全选
    //every 数组方法 会遍历 会接收一个回调函数 那么每一个回调函数都返回true，every方法的返回值就是true
    //只要有一个回调函数返回false 那么不再循环执行，直接返回false
    //空数组 调用every，返回值就是true
    this.setData({
      address
    });
    this.setCart(cart);
  },

  //点收货地址
  async handleChooseAddress(){
    /*1获取 权限状态
    wx.getSetting({
      success:(result)=>{
        //2获取权限状态 主要发现一些属性名很怪异的时候 都要使用[]形式来获取属性值
        const scopeAddress= result.authSetting["scope.address"];
        if (scopeAddress === true || scopeAddress === undefined){
          wx.chooseAddress({
            success:(result1)=>{
              console.log(result1)
            }
          });
        }else{
          //3用户拒绝过授予权限 先诱导用户打开授予权限页面
          wx.openSetting({
            success:(result2)=>{
              //4可以调用 收货地址代码
              wx.chooseAddress({
                success: (result3) => {
                  console.log(result3)
                }
              });
            }
          });
        }
      }
    })*/
    try{
        //1获取 权限状态
        const res1 = await getSetting();
        //获取权限状态 主要发现一些属性名很怪异的时候 都要使用[]形式来获取属性值
        const scopeAddress = res1.authSetting["scope.address"];
        //2判断 权限状态
        if (scopeAddress === false) {

          //3先诱导用户打开授予权限页面
          await openSetting();
        }
        //4调用获取收货地址的代码的api
       let address = await chooseAddress();
      address.all = address.provinceName + address.cityName + address.detailInfo;
       //5存入缓存中
       wx.setStorageSync("address", address);
    }catch(error){
      console.log(error)
    }
    

  },

  //商品的选中
  handeItemchange(e){
    //获取被修改的商品id
    const goods_id = e.currentTarget.dataset.id;
    //获取购物车数组
    let {cart} =this.data;
    //找到被修改的商品对象
    let index = cart.findIndex(v => v.goods_id === goods_id);
    //选中状态取反
    cart[index].checked =!cart[index].checked;
    
    this.setCart(cart);
  },

  //设置购物车状态同时 重新计算 全选 总价格 购买数量
  setCart(cart){
      let allChecked = true;
      //总价格 总数量
      let totalPrice = 0;
      let totalNum = 0;
      cart.forEach(v => {
        if (v.checked) {
          totalPrice += v.num * v.goods_price;
          totalNum += v.num;
        } else {
          allChecked = false;
        }
      })
      //判断数组是否为空
      allChecked = cart.length != 0 ? allChecked : false;

      //把购物车数据重新设置回data中和缓存中
      this.setData({
        cart,
        totalPrice,
        totalNum,
        allChecked
      });
    wx.setStorageSync("cart", cart);
  },

  //商品的全选
  handleItemAllCheck(){
    //获取data中的数据
    let {cart,allChecked} = this.data;
    //修改值
    allChecked = !allChecked;
    //循环修改cart数组中的商品选中状态
    cart.forEach(v=>v.checked=allChecked);
    //修改后的值 填充回data或者缓存中
    this.setCart(cart);
  },

  //商品数量的编辑
  async handleItemNumEdit(e){
    
    //1获取传递过来的参数
    const {operation,id}=e.currentTarget.dataset;
    //获取购物车数组
    let {cart} = this.data;
    //找到需要修改的商品索引
    const index = cart.findIndex(v=>v.goods_id===id);
    //判断是否要删除
    if(cart[index].num===1&&operation===-1){
        //弹窗提示
        /*wx.showModal({
          title: '提示',
          content: '你是否要删除？',
          success:(res)=> {
            if (res.confirm) {
              cart.splice(index,1);
              this.setCart(cart);
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })*/
      const res = await showModal({ content:"你是否要删除？"})
        if (res.confirm) {
          cart.splice(index, 1);
          this.setCart(cart);
        } 
    }else{
      //进行修改数量
      cart[index].num += operation;
      //设置回缓存和data中
      this.setCart(cart);
    }
  },

  //点击结算
  async handlePay(){
    //1判断收货地址
    const {address,totalNum} = this.data;
    if(!address.userName){
      await showToast({title:"您还没选择收货地址"});
      return;
    }
    //2判断用户有没有选购商品的
    if(totalNum===0){
      await showToast({ title: "您还没选择购商品" });
      return;
    }
    //3跳转到支付页面
    wx.navigateTo({
      url: '/pages/pay/pay'
    })
  }

})