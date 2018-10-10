
import React, { Component } from 'react';
import { Modal, Form, Input, Button } from 'antd';

const FormItem = Form.Item;

class MusixiserModal extends Component {

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
        onOk(values);
        this.handleCancel();
      }
    });

  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  }

  render() {
    const {children} = this.props;
    const {getFieldDecorator} = this.props.form;
    const {realname, email, website} = this.props.record;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    };

    return (
      <span>
        <span onClick={this.showModal}>
          {children}
        </span>
        <Modal
          title="编辑用户"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form onSubmit={this.handleOk}>
            <FormItem
              {...formItemLayout}
              label="姓名"
            >
              {
                getFieldDecorator('realname', {
                  initialValue: realname,
                })(<Input />)
              }
            </FormItem>
          </Form>
        </Modal>
      </span>
    );
  }
}

export default Form.create()(MusixiserModal);
