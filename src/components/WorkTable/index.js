import React, { PureComponent, Fragment } from 'react';
// import moment from 'moment';
import { Table, Alert, Divider, Popconfirm } from 'antd';
import styles from './index.less';
import { buildModel, preview } from '../../utils/magic';
// const statusMap = ['default', 'processing', 'success', 'error'];
class WorkTable extends PureComponent {
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
  previewFromWorkUrl = (url) => {
    console.log(url);
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send(null);
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.status === 200) {
        const type = request.getResponseHeader('Content-Type');
        if (type.indexOf('text') !== -1) {
          preview(JSON.parse(request.responseText));
        }
      }
    };
  };
  buildModelFromWorkUrl = (url, id) => {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send(null);
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.status === 200) {
        const type = request.getResponseHeader('Content-Type');
        if (type.indexOf('text') !== -1) {
          buildModel(JSON.parse(request.responseText), id);
        }
      }
    };
  };
  deleteWorkById = (id) => {
    if (this.props.onDeleteWork) {
      this.props.onDeleteWork(id);
    }
  };
  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    const totalCallNo = selectedRows.reduce((sum, val) => {
      return sum + parseFloat(val.callNo, 10);
    }, 0);

    if (this.props.onSelectRow) {
      this.props.onSelectRow(selectedRows);
    }

    this.setState({ selectedRowKeys, totalCallNo });
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.props.onChange(pagination, filters, sorter);
  };

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  };

  render() {
    const { selectedRowKeys, totalCallNo } = this.state;
    const { data: { list, pagination }, loading } = this.props;

    // const status = ['关闭', '运行中', '已上线', '异常'];

    const columns = [
      {
        title: 'id',
        dataIndex: 'id',
      },
      {
        title: '创建时间',
        dataIndex: 'createdDate',
      },
      {
        title: '标题',
        dataIndex: 'title',
      },
      {
        title: '收藏次数',
        dataIndex: 'collectNum',
      },
      {
        title: '用户',
        dataIndex: 'userVO',
        // render: val => `id:${val.uid},${val.nickName}`,
      },
      // {
      //   title: '标题',
      //   dataIndex: 'title',
      //   sorter: true,
      //   align: 'right',
      //   render: val => `${val} 万`,
      // },
      // {
      //   title: '状态',
      //   dataIndex: 'status',
      //   filters: [
      //     {
      //       text: status[0],
      //       value: 0,
      //     },
      //     {
      //       text: status[1],
      //       value: 1,
      //     },
      //     {
      //       text: status[2],
      //       value: 2,
      //     },
      //     {
      //       text: status[3],
      //       value: 3,
      //     },
      //   ],
      //   render(val) {
      //     return <Badge status={statusMap[val]} text={status[val]} />;
      //   },
      // },
      // {
      //   title: '更新时间',
      //   dataIndex: 'updatedAt',
      //   sorter: true,
      //   render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      // },
      {
        title: '操作',
        dataIndex: 'url',
        render: (a, b) => (
          <Fragment>
            <a onClick={() => this.previewFromWorkUrl(a)}>试听</a>
            <Divider type="vertical" />
            <a onClick={() => this.buildModelFromWorkUrl(a, b.id)}>生产模型</a>
            <Divider type="vertical" />
            <Popconfirm title="确认删除？" onConfirm={() => this.deleteWorkById(b.id)}>
              <a>删除</a>
            </Popconfirm>
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
            message={
              <div>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                服务调用总计 <span style={{ fontWeight: 600 }}>{totalCallNo}</span> 万
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                  清空
                </a>
              </div>
            }
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

export default WorkTable;
