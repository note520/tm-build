import Human from './human'

const boy = new Human('girl',1,1);
boy.say();
// 异步加载模块方法1
require.ensure([], function(require) {
    console.log("异步加载模块方法1");
    const Woman = require("./woman");
    console.log("Woman:",Woman);
    // const girl = new Woman('pretty',20);
    // girl.say();
});
// 异步加载模块方法2
import('./woman').then(module=>{
    console.log("异步加载模块方法2");
    const girl = new module.default('pretty',20);
    girl.say();
}).catch(e=>{
    console.warn('==e==',e)
});

