// pages/login/login.js
Page({
  handlebindGetUserInfo(e){
    const { userInfo } = e.detail;
    wx.setStorageSync("userinfo", userInfo);
    wx.navigateBack({
      delta:1
    })
  }
})