import React, { Component } from 'react';
import { Modal, Form, Input, Button, Upload, Icon } from 'antd';

const FormItem = Form.Item;

class WorkModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }
  showModal = (e) => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e) => {
    e.preventDefault();
    const { onOk } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        onOk(values);
        this.handleCancel();
      }
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };
  normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };
  beforeUpload(file) {
    const isMIDI = file.type === 'audio/mid' || file.type === 'audio/midi';
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isMIDI) {
      this.$message.error('上传作品需为mid格式!');
    }
    if (!isLt2M) {
      this.$message.error('上传作品大小需小于2MB');
    }
    return isMIDI && isLt2M;
  }
  render() {
    const { children } = this.props;
    const { getFieldDecorator } = this.props.form;
    // const {realname, email, website} = this.props.record;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const { userId } = this.props.record;
    return (
      <span>
        <span onClick={this.showModal}>{children}</span>
        <Modal
          title="编辑用户"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form onSubmit={this.handleOk}>
            <FormItem {...formItemLayout} label="作者用户id">
              {getFieldDecorator('userId', {
                initialValue: userId,
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label="Upload" extra="midi文件">
              {getFieldDecorator('url', {
                valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
              })(
                <Upload
                  name="logo"
                  action="//api.octave-love.com/api/v1/picture/uploadPic"
                  listType="midi"
                  name="files"
                  beforeUpload={this.beforeUpload}
                >
                  <Button>
                    <Icon type="upload" /> 上传20s的midi文件 (.mid)
                  </Button>
                </Upload>
              )}
            </FormItem>
          </Form>
        </Modal>
      </span>
    );
  }
}

export default Form.create()(WorkModal);
