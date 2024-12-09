// @/utils/request.js

import axios from 'axios';
import { Message, MessageBox } from 'element-ui';
import store from '../store';
import { getToken } from '@/utils/auth';

// 创建 axios 实例
const service = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'http://47.98.109.173:8080/'
      : 'http://localhost:8080/', // 根据环境选择 base_url
  timeout: 5000, // 请求超时时间
});

// request 拦截器
service.interceptors.request.use(
  (config) => {
    if (store.getters.token) {
      config.headers['token'] = getToken(); // 根据实际情况添加 token
    }
    return config;
  },
  (error) => {
    console.error(error); // 调试用
    return Promise.reject(error);
  },
);

// response 拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 如果后端返回的 res.code 存在
    if (res.code !== undefined) {
      if (res.code !== 200) {
        Message({
          message: res.message || 'Error',
          type: 'error',
          duration: 5 * 1000,
        });

        // 处理特定的错误代码
        if ([50008, 50012, 50014].includes(res.code)) {
          MessageBox.confirm(
            '你已被登出，可以取消继续留在该页面，或者重新登录',
            '确定登出',
            {
              confirmButtonText: '重新登录',
              cancelButtonText: '取消',
              type: 'warning',
            },
          ).then(() => {
            store.dispatch('FedLogOut').then(() => {
              location.reload(); // 为了重新实例化 vue-router 对象，避免 bug
            });
          });
        }

        // 创建错误对象并拒绝 Promise
        const error = new Error(res.message || 'Error');
        error.response = response;
        return Promise.reject(error);
      } else {
        // 如果 res.code === 200，返回 res.data 或 res
        return res.data || res;
      }
    } else {
      // 当 res.code 不存在时，检查 HTTP 状态码
      if (response.status !== 200) {
        const error = new Error(res.message || 'Error');
        error.response = response;
        return Promise.reject(error);
      } else {
        // 返回完整的响应数据
        return res;
      }
    }
  },
  (error) => {
    console.error('err' + error); // 调试用
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  },
);

export default service;
