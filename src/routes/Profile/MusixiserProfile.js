
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Divider, Avatar } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import DescriptionList from '../../components/DescriptionList/index';
// import styles from './MusixiserProfile.less';

const { Description } = DescriptionList;

@connect(({ musixiser, loading }) => ({
  musixiser,
  loading: loading.effects['musixiser/getById'],
}))

export default class MusixiserProfile extends PureComponent {
  componentDidMount() {
    const { dispatch, match: { params } } = this.props;
    dispatch({
      type: 'musixiser/getById',
      payload: params,
    });
  }
  render() {
    const { musixiser: { one }, loading } = this.props;
    console.log('one', one);
    return (
      <PageHeaderLayout title="基础详情页">
        <Card bordered={false}>
          <Description><Avatar size="large" src={one.smallAvatar} /></Description>
          <Divider style={{ marginBottom: 32 }} />
          <DescriptionList size="large" title="基本信息" style={{ marginBottom: 32 }}>
            <Description term="Id">{one.id}</Description>
            <Description term="userId">{one.userId}</Description>
            <Description term="昵称">{one.realname}</Description>
            <Description term="创建时间">{one.createdDate}</Description>
            <Description term="电话">{one.tel}</Description>
            <Description term="Email">{one.email}</Description>
            <Description term="生日">{one.birth}</Description>
            <Description term="性别">{one.gender}</Description>
            <Description term="国家">{one.nation}</Description>
            <Description term="简介">{one.brief}</Description>
          </DescriptionList>
          <Divider style={{ marginBottom: 32 }} />
          <DescriptionList size="large" title="产品信息" style={{ marginBottom: 32 }}>
            <Description term="浏览数">{one.pv}</Description>
            <Description term="关注数">{one.followNum}</Description>
            <Description term="粉丝数">{one.fansNum}</Description>
            <Description term="歌曲数">{one.songNum}</Description>
          </DescriptionList>
        </Card>
      </PageHeaderLayout>
    );
  }
}
