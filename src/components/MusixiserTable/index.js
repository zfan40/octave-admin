import React, { PureComponent, Fragment } from 'react';
import { Link, Redirect, Switch, Route } from 'dva/router';
// import moment from 'moment';
import { Table, Alert, Divider, Popconfirm } from 'antd';
import MusixiserModal from '../Editor/MusixiserModal';
import styles from './index.less';

// const statusMap = ['default', 'processing', 'success', 'error'];
class MusixiserTable extends PureComponent {
  state = {
    selectedRowKeys: [],
    totalCallNo: 0,
  };

  componentWillReceiveProps(nextProps) {
    // clean state
    if (nextProps.selectedRows.length === 0) {
      this.setState({
        selectedRowKeys: [],
        totalCallNo: 0,
      });
    }
  }

  showMusixiserById = (row) => {
    if (this.props.onSelectRow) {
      this.props.onSelectRow(row);
    }
  }

  handleUpdate = (id, values) => {
    console.log('on ok value', values.realname);
    if (this.props.handleUpdate) {
      this.props.handleUpdate(id, values.realname);
    }
  }

  handleDelete = (id) => {
    console.log('componenet', id);
    if (this.props.handleDeleteMusixiser) {
      this.props.handleDeleteMusixiser(id);
    }
  }
  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    const totalCallNo = selectedRows.reduce((sum, val) => {
      return sum + parseFloat(val.callNo, 10);
    }, 0);

    if (this.props.onSelectRow) {
      this.props.onSelectRow(selectedRows);
    }

    this.setState({ selectedRowKeys, totalCallNo });
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.props.onChange(pagination, filters, sorter);
  }

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  }

  render() {
    const { selectedRowKeys, totalCallNo } = this.state;
    const { data: { list, pagination }, loading } = this.props;

    // const status = ['关闭', '运行中', '已上线', '异常'];

    const columns = [
      {
        title: '用户ID',
        dataIndex: 'userId',
      },
      {
        title: '头像',
        dataIndex: 'smallAvatar',
        render: val => (<img style={{ width: '30px', height: '30px' }} alt="头像" src={val} />),
      },
      {
        title: '用户名',
        dataIndex: 'realname',
        render: (text, record) => <Link to={`/list/musixiser-profile/${record.id}`}>{text}</Link>,

      },
      {
        title: '电话',
        dataIndex: 'tel',
      },
      {
        title: '性别',
        dataIndex: 'gender',
      },
      {
        title: '创作数',
        dataIndex: 'songNum',
      },
      {
        title: '粉丝数',
        dataIndex: 'fansNum',
      },
      {
        title: '创建时间',
        dataIndex: 'createdDate',
      },
      {
        title: '操作',
        dataIndex: 'url',
        render: (text, record) => (
          <Fragment>
            <Link to={`/list/musixiser-profile/${record.id}`}>查看</Link>
            <Divider type="vertical" />

            <MusixiserModal record={record} onOk={res => this.handleUpdate(record.id, res)}>
              <a>编辑</a>
            </MusixiserModal>
            <Divider type="vertical" />
            <Popconfirm title="确认删除？" onConfirm={() => this.handleDelete(record.id)}><a>删除</a></Popconfirm>
          </Fragment>
        ),
      },
    ];

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...pagination,
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
    };

    return (
      <div className={styles.standardTable}>
        <div className={styles.tableAlert}>
          <Alert
            message={(
              <div>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                服务调用总计 <span style={{ fontWeight: 600 }}>{totalCallNo}</span> 万
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>清空</a>
              </div>
            )}
            type="info"
            showIcon
          />
        </div>
        <Table
          loading={loading}
          rowKey={record => record.key}
          rowSelection={rowSelection}
          dataSource={list}
          columns={columns}
          pagination={paginationProps}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default MusixiserTable;
