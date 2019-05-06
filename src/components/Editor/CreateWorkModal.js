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
        console.log('213123', values.cover)
        values.url = (values.url && values.url.length > 0 && values.url[0].response) ? values.url[0].response.data : ''
        values.cover = (values.cover && values.cover.length > 0 && values.cover[0].response) ? values.cover[0].response.data : values.cover
        values.status = 0
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

  beforeImageUpload(file) {
    const isIMG = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isIMG) {
      this.$message.error('上传作品需为图片格式!');
    }
    if (!isLt2M) {
      this.$message.error('上传作品大小需小于2MB');
    }
    return isIMG && isLt2M;
  }
  render() {
    const { children } = this.props;
    const { getFieldDecorator } = this.props.form;
    // const {realname, email, website} = this.props.record;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const { userId, title, url, content, cover } = this.props.record;
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
            <FormItem {...formItemLayout} label="作品名称">
              {getFieldDecorator('title', {
                initialValue: title,
              })(<Input />)}
            </FormItem>
            <FormItem key="cover"  {...formItemLayout} label="作品封面" extra="jpg文件">
              {getFieldDecorator('cover', {
                valuePropName: 'imageFileList',
                getValueFromEvent: this.normFile,
                initialValue: cover,
              })(<Upload
                key="cover"
                action="//api.octave-love.com/api/v1/picture/uploadPic"
                listType="picture"
                name="files"
                beforeUpload={this.beforeUploadImage}
                defaultFileList={cover ? [{
                  uid: '-1',
                  name: '',
                  status: 'done',
                  url: cover,
                  thumbUrl: cover,
                }] : []}
              >
                <Button>
                  <Icon type="upload" /> 上传封面图片 (.jpg)
                </Button>
              </Upload>)}
            </FormItem>
            <FormItem {...formItemLayout} label="作品留言">
              {getFieldDecorator('content', {
                initialValue: content,
              })(<Input />)}
            </FormItem>
            <FormItem key="url" {...formItemLayout} label="Upload" extra="midi文件">
              {getFieldDecorator('url', {
                valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
              })(
                <Upload
                  key="midi"
                  action="//api.octave-love.com/api/v1/picture/uploadPic"
                  listType="text"
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
