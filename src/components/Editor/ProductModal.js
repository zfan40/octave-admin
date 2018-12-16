
import React, { Component } from 'react';
import { Modal, Form, Input, Button } from 'antd';
const { TextArea } = Input;


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
        values.id = this.props.record.id
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
    const {id, name, intro, price, category} = this.props.record;
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
             <FormItem
               {...formItemLayout}
               label="产品分类"
             >
              {
                getFieldDecorator('category', {
                  initialValue: category,
                })(<Input />)
              }
            </FormItem>
             <FormItem
               {...formItemLayout}
               label="产品介绍"
             >
              {
                getFieldDecorator('intro', {
                  initialValue: intro,
                })(<TextArea rows={4}/>)
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
