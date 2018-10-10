import request from '../utils/request';

const headers = { 'Access-Control-Allow-Origin': '*' };
const token = localStorage.getItem('token');
const tokenObj = {
  access_token: '',
};
if (token) {
  headers.Authorization = `${token}`;
  tokenObj.access_token = token;
}

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('http://101.200.212.87:8082/api/v1/user/getInfo', {
    // TODO: 貌似格式不一样
    headers,
  });
  // return request('/api/currentUser', { headers }); // this is mock
}
