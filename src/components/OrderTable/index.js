import React, { PureComponent, Fragment } from 'react';
// import moment from 'moment';
import { Table, Alert, Divider, Popconfirm, Badge, InputNumber } from 'antd';
import { Link, Redirect, Switch, Route } from 'dva/router';
import styles from './index.less';
import { buildModel, preview } from '../../utils/magic';
import OrderModal from '../../components/Editor/OrderModal';

const statusMap = ['default', 'default', 'processing', 'success', 'error'];
const DEFAULT_DOT_WIDTH = 0.3;
const DEFAULT_DOT_HEIGHT = 1;
const DEFAULT_RATIO = 0.98;
const DEFAULT_OFFSET = 2.2; // 1.95 is center
const DEFAULT_OUTER_RADIUS = 6.6;
const DEFAULT_INNER_RADIUS = 5.9;
const DEFAULT_ANGLE = 30;
class OrderTable extends PureComponent {
  state = {
    selectedRowKeys: [],
    totalCallNo: 0,
  };
  componentWillMount() {
    this.model_dot_width = DEFAULT_DOT_WIDTH;
    this.model_offset = DEFAULT_OFFSET;
    this.model_outer_radius = DEFAULT_OUTER_RADIUS;
    this.model_inner_radius = DEFAULT_INNER_RADIUS;
    this.model_dot_height = DEFAULT_DOT_HEIGHT;
    this.model_angle = DEFAULT_ANGLE;
  }
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
    MidiConvert.load(url, (midi) => {
      if (!midi) {
        alert('文件有误');
        return;
      }
      const mergeNotes = midi.tracks.reduce((a, b) => a.concat(b.notes), []);
      preview(mergeNotes);
    });
  };
  buildModelFromWorkUrl = (url, id) => {
    MidiConvert.load(url, (midi) => {
      if (!midi) {
        alert('文件有误');
        return;
      }
      const mergeNotes = midi.tracks.reduce((a, b) => a.concat(b.notes), []);
      buildModelWithParam(
        mergeNotes,
        id,
        this.model_dot_width,
        this.model_offset,
        this.model_outer_radius,
        this.model_inner_radius,
        this.model_dot_height,
        this.model_angle
      );
    });
  };

  handleUpdate = (values) => {
    console.log('on ok value', values);
    if (this.props.handleUpdate) {
      this.props.handleUpdate(values);
    }
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
  onChangeInput = (type, v) => {
    switch (type) {
      case 'dot_width':
        this.model_dot_width = v;
        break;
      case 'offset':
        this.model_offset = v;
        break;
      case 'outer_radius':
        this.model_outer_radius = v;
        break;
      case 'inner_radius':
        this.model_inner_radius = v;
        break;
      case 'dot_height':
        this.model_dot_height = v;
        break;
      case 'angle':
        this.model_angle = v;
        break;
    }
  };
  render() {
    const { selectedRowKeys, totalCallNo } = this.state;
    const {
      data: { list, pagination },
      loading,
    } = this.props;

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
        title: '数量',
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
        title: '订单状态',
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
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createdDate',
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
            <a onClick={() => this.previewFromWorkUrl(text)}>试听</a>
            <Divider type="vertical" />
            <a onClick={() => this.buildModelFromWorkUrl(text, record.id)}>生产模型</a>
            <Divider type="vertical" />
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
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1 }}>
                    <span>凸点宽度</span>
                    <InputNumber
                      min={0.2}
                      max={0.8}
                      step={0.1}
                      defaultValue={DEFAULT_DOT_WIDTH}
                      onChange={(v) => {
                        this.onChangeInput('dot_width', v);
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span>凸点高度</span>
                    <InputNumber
                      min={0.5}
                      max={1.5}
                      step={0.1}
                      defaultValue={DEFAULT_DOT_HEIGHT}
                      onChange={(v) => {
                        this.onChangeInput('dot_height', v);
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span>凸点位移</span>
                    <InputNumber
                      min={2.0}
                      max={2.4}
                      step={0.1}
                      defaultValue={DEFAULT_OFFSET}
                      onChange={(v) => {
                        this.onChangeInput('offset', v);
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', marginTop: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <span>音桶外径</span>
                    <InputNumber
                      min={6.4}
                      max={6.8}
                      step={0.1}
                      defaultValue={DEFAULT_OUTER_RADIUS}
                      onChange={(v) => {
                        this.onChangeInput('outer_radius', v);
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span>音桶内径</span>
                    <InputNumber
                      min={6.3}
                      max={5.7}
                      step={0.1}
                      defaultValue={DEFAULT_INNER_RADIUS}
                      onChange={(v) => {
                        this.onChangeInput('inner_radius', v);
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span>凸点角度</span>
                    <InputNumber
                      min={0}
                      max={45}
                      step={1}
                      defaultValue={DEFAULT_ANGLE}
                      onChange={(v) => {
                        this.onChangeInput('angle', v);
                      }}
                    />
                  </div>
                </div>
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
