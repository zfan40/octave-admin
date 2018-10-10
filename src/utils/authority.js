// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
  console.log('xixiauth', localStorage.getItem('antd-pro-authority'));
  return localStorage.getItem('antd-pro-authority') || 'guest';
}

export function setAuthority(authority) {
  return localStorage.setItem('antd-pro-authority', authority);
}
