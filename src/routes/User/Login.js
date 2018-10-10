import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Checkbox, Alert, Icon } from 'antd';
import Login from '../../components/Login';
import styles from './Login.less';
import { buildModel, buildModelWithParam, preview } from '../../utils/magic';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
  };

  onTabChange = (type) => {
    this.setState({ type });
  };

  handleSubmit = (err, values) => {
    const { type } = this.state;
    if (!err) {
      this.props.dispatch({
        type: 'login/login',
        payload: {
          // rememberMe: true,
          ...values,
          type,
        },
      });
    }
  };

  changeAutoLogin = (e) => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  build124 = () => {
    // TODO replace url address
    const url = 'http://oiqvdjk3s.bkt.clouddn.com/AhA4dSmF_test.txt';
    const id = 124;
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send(null);
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.status === 200) {
        const type = request.getResponseHeader('Content-Type');
        if (type.indexOf('text') !== -1) {
          const DOT_WIDTH = [0.6, 0.5, 0.5, 0.6, 0.4];
          // const OFFSET = [2.1, 2.2, 2.3];
          const OUTER_RADIUS = [
            6.6,
            6.4,
            6.5,
            6.6,
            6.4,
            6.4,
            6.6,
            6.6,
            6.4,
            6.5,
            6.6,
            6.4,
            6.4,
            6.5,
            6.6,
            6.4,
            6.5,
            6.6,
            6.6,
            6.4,
            6.5,
            6.6,
            6.4,
            6.4,
            6.6,
          ];
          const INNER_RADIUS = [
            5.7,
            5.7,
            5.8,
            5.9,
            5.9,
            5.7,
            5.9,
            5.7,
            5.9,
            5.8,
            5.9,
            5.9,
            5.7,
            5.8,
            5.7,
            5.9,
            5.8,
            5.9,
            5.7,
            5.7,
            5.8,
            5.7,
            5.9,
            5.7,
            5.9,
          ];
          const DOT_HEIGHT = [0.9, 0.7, 0.8, 0.6, 1];
          // TODO:loop it with for let
          // const m = 0;
          for (let i = 0; i < 5; i += 1) {
            for (let j = 0; j < 5; j += 1) {
              // buildModelWithParam(JSON.parse(request.responseText), id, 0.3, 2.2, 6.6, 5.9);
              buildModelWithParam(
                JSON.parse(request.responseText),
                `${i}-${j}`,
                DOT_WIDTH[j],
                2.2,
                OUTER_RADIUS[i * 5 + j],
                INNER_RADIUS[i * 5 + j],
                DOT_HEIGHT[i]
              );
              console.log(i * 5 + j);
            }
          }
          // buildModelWithParam(
          //   JSON.parse(request.responseText),
          //   id,
          //   DOT_WIDTH[0],
          //   OFFSET[0],
          //   OUTER_RADIUS[0],
          //   INNER_RADIUS[0],
          //   DOT_HEIGHT[0]
          // );
        }
      }
    };
  };
  renderMessage = (content) => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };
  render() {
    const { login, submitting } = this.props;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <Login defaultActiveKey={type} onTabChange={this.onTabChange} onSubmit={this.handleSubmit}>
          <Tab key="account" tab="账户密码登录">
            {login.status === 'error' &&
              login.type === 'account' &&
              !login.submitting &&
              this.renderMessage('账户或密码错误（admin/888888）')}
            <UserName name="username" placeholder="admin/user" />
            <Password name="password" placeholder="888888/123456" />
          </Tab>
          <Tab key="mobile" tab="手机号登录">
            {login.status === 'error' &&
              login.type === 'mobile' &&
              !login.submitting &&
              this.renderMessage('验证码错误')}
            <Mobile name="mobile" />
            <Captcha name="captcha" />
          </Tab>
          <div>
            <Checkbox checked={this.state.autoLogin} onChange={this.changeAutoLogin}>
              自动登录
            </Checkbox>
            <a style={{ float: 'right' }} href="">
              忘记密码
            </a>
          </div>
          <Submit loading={submitting}>登录</Submit>
          <button onClick={this.build124}>搞笑</button>
          <div className={styles.other}>
            其他登录方式
            <Icon className={styles.icon} type="alipay-circle" />
            <Icon className={styles.icon} type="taobao-circle" />
            <Icon className={styles.icon} type="weibo-circle" />
            <Link className={styles.register} to="/user/register">
              注册账户
            </Link>
          </div>
        </Login>
      </div>
    );
  }
}
