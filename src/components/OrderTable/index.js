import React, { PureComponent, Fragment } from 'react';
// import moment from 'moment';
import { Table, Alert, Divider, Popconfirm,Badge } from 'antd';
import { Link, Redirect, Switch, Route } from 'dva/router';
import styles from './index.less';
import { buildModel, preview } from '../../utils/magic';
import OrderModal from '../../components/Editor/OrderModal'
const statusMap = ['default', 'default', 'processing', 'success', 'error'];
class OrderTable extends PureComponent {
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

  handleUpdate = (values) => {
    console.log('on ok value', values);
    if (this.props.handleUpdate) {
      this.props.handleUpdate(values);
    }
  }

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
  deleteById = (id) => {
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

    const status = ['未付款', '支付中', '待发货', '待收货', '订单完成'];

    const columns = [
      {
        title: 'id',
        dataIndex: 'id',
      },
      {
        title: '价格',
        dataIndex: 'price',
        sorter: true,
        align: 'right',
        render: val => `${val} 元`,
      },
      {
        title: "数量",
        dataIndex: 'amount',
      },
      {
        title: '下单时间',
        dataIndex: 'shipTime',
      },
      {
        title: '确认时间',
        dataIndex: 'confirmTime',
      },
      {
        title: '收货地址',
        dataIndex: 'address',
      },
      {
        title: "订单状态",
        dataIndex: 'status',
          filters: [
            {
              text: status[0],
              value: 0,
            },
            {
              text: status[1],
              value: 1,
            },
            {
              text: status[2],
              value: 2,
            },
            {
              text: status[3],
              value: 3,
            },
          ],
          render(val) {
            return <Badge status={statusMap[val]} text={status[val]} />;
          }
      },
      {
        title: "创建时间",
        dataIndex: "createdDate"
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
        render: (text, record) => (
          <Fragment>
            <Link to={`/list/order-profile/${record.id}`}>查看</Link>
            <Divider type="vertical" />
            <OrderModal record={record} onOk={update => this.handleUpdate(update)}>
              <a>编辑</a>
            </OrderModal>
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

export default OrderTable;
