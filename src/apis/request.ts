import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 5000,
})

// 添加请求拦截器
request.interceptors.request.use((config) => {
  // 在发送请求之前做些什么
  return config
}, (error) => {
  // 对请求错误做些什么
  return Promise.reject(error)
})

// 添加响应拦截器
request.interceptors.response.use((response) => {
  // 2xx 范围内的状态码都会触发该函数。
  // 对响应数据做点什么
  return response
}, (error) => {
  if (error.response) {
    const message = error.response.data?.error || '请求失败'
    return Promise.reject(new Error(message))
  } else if (error.request) {
    return Promise.reject(new Error('网络连接异常'))
  } else {
    return Promise.reject(new Error('请求配置错误'))
  }
})

export default request
