import React, { PureComponent, Fragment } from 'react';
// import moment from 'moment';
import { Table, Alert, Divider, Popconfirm, InputNumber } from 'antd';
import styles from './index.less';
import { buildModel, preview, buildModelWithParam } from '../../utils/magic';
import WorkModal from '../Editor/CreateWorkModal';
// const statusMap = ['default', 'processing', 'success', 'error'];
const DEFAULT_DOT_WIDTH = 0.3;
const DEFAULT_DOT_HEIGHT = 1;
const DEFAULT_RATIO = 0.98;
const DEFAULT_OFFSET = 2.2; // 1.95 is center
const DEFAULT_OUTER_RADIUS = 6.6;
const DEFAULT_INNER_RADIUS = 5.9;
const DEFAULT_ANGLE = 30;
class WorkTable extends PureComponent {
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
    /* txt file */
    // const request = new XMLHttpRequest();
    // request.open('GET', url, true);
    // request.send(null);
    // request.onreadystatechange = () => {
    //   if (request.readyState === 4 && request.status === 200) {
    //     const type = request.getResponseHeader('Content-Type');
    //     if (type.indexOf('text') !== -1) {
    //       preview(JSON.parse(request.responseText));
    //     }
    //   }
    // };
    /* midi file */
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
    /* txt file */
    // const request = new XMLHttpRequest();
    // request.open('GET', url, true);
    // request.send(null);
    // request.onreadystatechange = () => {
    //   if (request.readyState === 4 && request.status === 200) {
    //     const type = request.getResponseHeader('Content-Type');
    //     if (type.indexOf('text') !== -1) {
    //       buildModel(JSON.parse(request.responseText), id);
    //     }
    //   }
    // };
    /* midi file */

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
  handleUpdate(workInfo,data) {
    console.log(workInfo)
    console.log('new data',data)
    workInfo.url = data.url[0].response.data// //img.musixise.com/itB012vg_castle.mid
    const {onEditWork} = this.props
    onEditWork(workInfo)
  }
  render() {
    const { selectedRowKeys, totalCallNo } = this.state;
    const {
      data: { list, pagination },
      loading,
    } = this.props;

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
      // {
      //   title: '用户id',
      //   dataIndex: 'userId',
      // },
      {
        title: '用户',
        dataIndex: 'userVO',
        render: val => `id:${val ? val.userId : ''}, ${val ? val.realname : ''}`,
      },
      {
        title: '头像',
        dataIndex: 'avatar',
        render: (v, data) => (
          <img
            style={{ width: '30px', height: '30px' }}
            alt="头像"
            src={data.userVO ? data.userVO.smallAvatar : ''}
          />
        ),
      },
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
            <Divider type="vertical" />
            <WorkModal record={b} onOk={res => this.handleUpdate(b, res)}>
              <a>编辑</a>
            </WorkModal>
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
                <div style={{flex:1}}>
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
                  <div style={{flex:1}}>
                  <span>凸点高度（center一半）</span>
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
                  <div style={{flex:1}}>
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
                <div style={{ display: 'flex',marginTop:'6px' }}>
                <div style={{flex:1}}>
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
                  <div style={{flex:1}}>
                  <span>音桶内径</span>
                  <InputNumber
                    min={5.0}
                    max={6.7}
                    step={0.1}
                    defaultValue={DEFAULT_INNER_RADIUS}
                    onChange={(v) => {
                      this.onChangeInput('inner_radius', v);
                    }}
                  />
                  </div>
                  <div style={{flex:1}}>
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

export default WorkTable;
