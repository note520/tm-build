
module.exports = {
  "description": "tm-build demo config",
  "author": "ricopter@qq.com",
  "tmBuildConfig":{
    // 开发环境
    "dev":{
      // original 内的键名 必须 和webpack 原始 api 配置参数要求一致否则会报错
      "original":{
        // webpack-server-dev 配置
        "devServer":{
          //"port": 9090,
          "proxy": {
            // '/api': {
            //     "target": 'http://xxx.xxx.cn',
            //     "pathRewrite": {
            //         '^/api': ''
            //     },
            //     "changeOrigin": true // target是域名的话，需要这个参数，
            //     // "secure": false,          // 使用的是https，会有安全校验，所以设置secure为false
            // }
          },
        },
        // 自定义添加webpack插件
        "plugins":[],
      }
    },
    // 打包自定义配置
    "build": {
      "appScene":"",
      "original":{
        "optimization":{}
      }
    }
  }
};
