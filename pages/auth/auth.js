// pages/auth/auth.js
import { request } from "../../request/request.js";
import regeneratorRuntime from "../../lib/runtime/runtime.js";
import { login } from "../../utils/asyncWx.js"
Page({


    //获取用户信息
 async handleGetUserInfo(e){

    try{
        //1获取用户信息
        const { encryptedData, rawData, iv, signature } = e.detail;
        //2获取小程序登录成功后的code值
        const { code } = await login();
        const loginParams = { encryptedData, rawData, iv, signature };
        //3发送请求获取用户token值
        const { token } = await request({ url: "https://api-hmugo-web.itheima.net/api/public/v1/users/wxlogin", data: loginParams, method: "post" });
        console.log(token);
        //4把token存入缓存中，同时跳转回上一个页面
        wx.setStorageSync("token", token);
        wx.navigateBack({
          delta: 1
        })
    }catch(error){
      console.log(error);
    }
    
  }
 
})