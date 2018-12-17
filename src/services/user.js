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
  return request('https://api.octave-love.com/api/v1/user/getInfo', {
    // TODO: 貌似格式不一样
    headers,
  });
  // return request('/api/currentUser', { headers }); // this is mock
}
