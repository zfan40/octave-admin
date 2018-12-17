
import React, { Component } from 'react';
import { Modal, Form, Input, Button,Select } from 'antd';


const FormItem = Form.Item;

class OrderModal extends Component {

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
        values.id = this.props.record.id
        onOk(values);
        this.handleCancel();
      }
    });

  }

  handleSelectChange = (value) => {
    console.log(value);
    this.props.form.setFieldsValue({
     // note: `Hi, ${value === 'male' ? 'man' : 'lady'}!`,
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
    const {id,status, price, amount, content} = this.props.record;
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
          title="编辑订单"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form onSubmit={this.handleOk}>
            <FormItem
              {...formItemLayout}
              label="订单状态"
            >
             {getFieldDecorator('status', {
               rules: [{ required: true, message: '请选择订单状态!' }],
               initialValue: status+"",
             })(
               <Select
                 placeholder="请选择订单状态"
                 onChange={this.handleSelectChange}
               >
                 <Option value="0">未付款</Option>
                 <Option value="1">支付中</Option>
                 <Option value="2">等待发货</Option>
                 <Option value="3">等待收货</Option>
                 <Option value="4">订单完成</Option>
               </Select>
             )}
            </FormItem>
             <FormItem
               {...formItemLayout}
               label="数量"
             >
              {
                getFieldDecorator('amount', {
                  initialValue: amount,
                })(<Input />)
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

export default Form.create()(OrderModal);
