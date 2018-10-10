import { stringify } from 'qs';
import request from '../utils/request';
// 101.200.212.87:8082 <=> api.musixise.com
const headers = {
  'Access-Control-Allow-Origin': '*',
  Accept: 'application/json',
  'Content-Type': 'application/json',
};
const token = localStorage.getItem('token');
const tokenObj = {
  access_token: '',
};
if (token) {
  headers.Authorization = `${token}`;
  // tokenObj.access_token = token;
}

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  // return request('/api/login/account', {
  //   method: 'POST',
  //   body: params,
  // });
  // ===================================
  // params貌似要加一个rememberMe:true,
  alert(JSON.stringify(params));
  try {
    const newtoken = await request('//101.200.212.87:8082/api/v1/user/authenticate', {
      method: 'POST',
      headers,
      body: {
        userName: params.username,
        passWord: params.password,
      },
    });
    localStorage.setItem('token', newtoken.data.id_token);
    console.log('898989898', newtoken);
    if (newtoken) {
      headers.Authorization = `${newtoken.id_token}`;
      // tokenObj.access_token = newtoken.data.id_token;
      /* previous version , called /account */
      // return request('//101.200.212.87:8082/api/v1/account', {
      //   headers,
      //   body: {},
      // });
      return request('//101.200.212.87:8082/api/v1/user/getInfo', {
        headers,
      });
    } else {
      // TODO ,这块的登录键一直在转，草
      //
    }
  } catch (e) {
    // alert('jb');
    // const error = new Error();
    // error.name = 400;
    // error.response = 'response';
    throw e;
  }
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function queryWork(params) {
  return request(
    `//101.200.212.87:8082/api/v1/admin/works?page=${params.currentPage}&size=${params.pageSize}`,
    {
      headers,
    }
  );
}

export async function removeWork(params) {
  return request(`//101.200.212.87:8082/api/v1/admin/works/${params.id}`, {
    method: 'DELETE',
    headers,
    body: {
      ...tokenObj,
      ...params,
    },
  });
}

export async function addWork(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...tokenObj,
      ...params,
    },
  });
}

export async function getMusixiserById(params) {
  return request(`//101.200.212.87:8082/api/v1/admin/musixisers/${params.id}`, {
    headers,
  });
}

export async function queryMusixiser(params) {
  return request(
    `//101.200.212.87:8082/api/v1/admin/musixisers?page=${params.currentPage}&size=${
      params.pageSize
    }`,
    {
      headers,
      // body: {
      //   ...tokenObj,
      // },
    }
  );
}

export async function removeMusixiser(params) {
  return request(`//101.200.212.87:8082/api/v1/admin/musixisers/${params.id}`, {
    method: 'DELETE',
    headers,
    body: {
      ...tokenObj,
      ...params,
      method: 'delete',
    },
  });
}
export async function updateMusixiser(params) {
  // TODO
  // return request(`//101.200.212.87:8082/api/v1/musixisers/${params.id}`, {
  //   method: 'POST',
  //   headers,
  //   body: {
  //     ...params,
  //     method: 'delete',
  //   },
  // });
}
export async function addMusixiser(params) {
  // return request('/api/rule', {
  //   method: 'POST',
  //   body: {
  //     ...params,
  //     method: 'post',
  //   },
  // });
}
