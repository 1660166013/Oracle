import Vue from 'vue';
import Axios from 'axios';
import 'normalize.css/normalize.css'; // A modern alternative to CSS resets
import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import '@svgdotjs/svg.draggable.js';
import '@svgdotjs/svg.topoly.js';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import locale from 'element-ui/lib/locale/lang/en'; // lang i18n

import '@/styles/index.scss'; // global css

import App from './App';
import router from './router';
import store from './store';

import '@/utils/webAnnotate.js';

import '@/icons'; // icon
import '@/permission'; // permission control

Vue.prototype.$svg = SVG;
Vue.use(ElementUI, { locale });

Vue.config.productionTip = false;

// 创建一个 Axios 实例
// const axiosInstance = Axios.create({
// baseURL: 'http://localhost:9000', // 可选：设置请求的基本 URL
// timeout: 5000, // 可选：设置请求超时时间（单位：毫秒）
//   headers: {
//     // 可选：设置请求头
//     'Content-Type': 'application/json',
//   },
// });
// 将 Axios 实例添加到 Vue 原型上，使其在所有组件中可用
// Vue.prototype.$axiosInstance = axiosInstance;
// 在需要发送请求的地方使用该实例
// instance.get('/endpoint')
//   .then(response => {
//     console.log(response.data);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });
//在utils/request中写过了

new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
});
