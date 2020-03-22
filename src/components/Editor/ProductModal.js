
import React, { Component } from 'react';
import { Modal, Form, Input, Button, Upload, Icon, Select } from 'antd';
import { preview } from '../../utils/magic';
const { TextArea } = Input;
const { Option } = Select

const FormItem = Form.Item;

class ProductModal extends Component {

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
  }

  handleOk = (e) => {
    e.preventDefault();
    const { onOk } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.previewPic = (values.previewPic && values.previewPic.length > 0) ? values.previewPic[0].response.data : ''
        values.previewVideo = ''
        values.id = this.props.record.id
        onOk(values);
        this.handleCancel();
      }
    });

  }
  normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };
  beforeUpload(file) {
    const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isIMG) {
      this.$message.error('上传作品需为jpeg格式!');
    }
    if (!isLt2M) {
      this.$message.error('上传作品大小需小于2MB');
    }
    return isIMG && isLt2M;
  }
  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  }

  render() {
    const { children } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { id, name, intro, price, category, previewPic } = this.props.record;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    return (
      <span>
        <span onClick={this.showModal}>
          {children}
        </span>
        <Modal
          title="编辑产品"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form onSubmit={this.handleOk}>
            <FormItem
              {...formItemLayout}
              label="产品名称"
            >
              {
                getFieldDecorator('name', {
                  initialValue: name,
                })(<Input />)
              }
            </FormItem>
            <FormItem {...formItemLayout} label="Upload" extra="图片文件">
              {getFieldDecorator('previewPic', {
                valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
                initialValue: previewPic ? [{ uid: '0', name: 'file', status: 'done', url: previewPic }] : ''
              })(
                <Upload
                  name="logo"
                  action="//api.octave-love.com/api/v1/picture/uploadPic"
                  name="files"
                  listType="picture"
                  beforeUpload={this.beforeUpload}
                >
                  <Button>
                    <Icon type="upload" /> 上传商品图片 (319*228)
                  </Button>
                </Upload>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="产品分类"
            >
              {
                getFieldDecorator('category', {
                  initialValue: category,
                })(<Select
                  style={{ width: 200 }}
                  placeholder="选择产品类型"
                >
                  <Option value="1">18音八音盒</Option>
                  <Option value="7">纸带八音盒</Option>
                  <Option value="100">wav下载</Option>
                </Select>)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="产品介绍"
            >
              {
                getFieldDecorator('intro', {
                  initialValue: intro,
                })(<TextArea rows={4} />)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="价格"
            >
              {
                getFieldDecorator('price', {
                  initialValue: price,
                })(<Input />)
              }
            </FormItem>
          </Form>
        </Modal>
      </span>
    );
  }
}

export default Form.create()(ProductModal);
