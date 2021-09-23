/**
 * 1点击 “+” 触发tap点击事件
 *  1调用小程序内置的选择图片的api
 *  2获取到图片的路径 数组
 *  3把图片路径存入到data变量中
 *  4页面根据 图片数组 循环显示 自定义组件
 * 2点击 自定义图片组件
 *  1获取被点击的元素的索引
 *  2获取data中的图片数组
 *  3根据索引 数组中删除对应的元素
 *  4把数组重新设置回data中
 * 3点击 提交
 *  1获取文本域的内容
 *    1data中定义变量 表示输入框内容
 *    2 文本域 绑定输入事件 事件触发的时候 把输入框的值存入到变量中
 *  2对这些内容 合法性验证
 *  3验证通过 用户选择的图片 上传到专门的图片的服务器 返回图片外网的链接
 *    1遍历图片数组
 *    2挨个上传
 *    3自己再维护图片数组 存放 图片上传后的外网的链接
 *  4文本域 和 外网图片的路径 一起提交到服务器中 
 *  5清空当前页面
 *  6返回上一页
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        value: "体验问题",
        isActive: true
      },
      {
        id: 1,
        value: "商品、商家投诉",
        isActive: false
      }
    ],
    chooseImgs:[],
    textVal:""
  },

  //外网的图片路径数组
  upLoadImgs:[],

  //标题点击事件 从子组件传递过来
  handleTabsItemChange(e) {
    //1获取被点击的标题索引
    const { index } = e.detail;
    //2修改原数组
    let { tabs } = this.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
    //3赋值到data中
    this.setData({
      tabs
    })
  },
  //点击“+”选择图片
  handleChooseImg(){
    //2调用小程序内置的选择api
    wx.chooseImage({
      count:9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res)=> {
        
        this.setData({
          //图片数组 进行拼接
          chooseImgs: [...this.data.chooseImgs, ...res.tempFilePaths] 
        })
      },
    })
  },
  //点击 自定义图片组件
  handleRemoveImg(e){
    //2获取被点击的组件的索引
    const {index} = e.currentTarget.dataset;
    //获取data中的图片数组
    let {chooseImgs}=this.data;
    //删除元素
    chooseImgs.splice(index,1);
    this.setData({
      chooseImgs
    })
  },

  //文本域的输入事件
  handleTextInput(e){
    this.setData({
      textVal:e.detail.value
    })
  },

  //提交按钮的点击事件
  handleFormSubmit(){
    //获取文本域的内容
    const {textVal,chooseImgs} = this.data;
    //合法性验证
    if (!textVal.trim()){
      //不合法
      wx.showToast({
        title: '输入不合法',
        mask:true
      })
      return;
    }
    //3准备上传图片 到专门的图片服务器
    //上传文件的api 不支持 多个文件同时上传 遍历数组 挨个上传
    chooseImgs.forEach((v,i)=>{
      wx.uploadFile({
        url: 'https://img.coolcr.cn/api/upload',
        filePath: 'v',
        name: 'image',
        success:(res)=>{
          console.log(res);
          let url = JSON.parse(res.data).url;
          this.upLoadImgs.push(url);
          //所有的图片都上传完毕了才触发
          if(i===chooseImgs.length-1){
            //提交成功
            //重置页面
            this.setData({
              textVal:"",
              chooseImgs:[]
            })
            //
            wx.navigateBack({
              delta:1
            })
          }
        }
      })
    })
    
  }
  
})