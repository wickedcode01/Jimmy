import { defineConfig } from 'umi';
export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  favicon:'./favicon.ico',
  routes: [
    {
      name: '首页',
      path: '/',
      title:'JimmyYen',
      component: '@/pages/index',
    },
    {
      name:'article',
      path:'/list',
      title:'article',
      component:'@/pages/list'
    }
  ],
  fastRefresh: {},
  // history:{type:'hash'},
  base:'/Jimmy',
  publicPath:'./',
  // dva: {},
  // locale:{
  //   antd:false
  // }
});
