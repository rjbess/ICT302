/**
 * @file kshstwo/component/LoginForm.js
 *
 * @team EduLeave Management
 * @authors Adam Sami, Mathew Burnett, Meet Ranparia, Robert Bessell, Stefan Aleksic, Tien Dat Ho
 * @date 27/10/2020
 * @course Murdoch University ICT302 Semester 2, 2020
 *
 * @version 1.0.0
 *
 * @description Displays a 'Login Form' to the user asking them to enter a StaffID and Password.
 *              The credentials are verified on the backend and if successful the user details are
 *              stored in LocalStorage
 *
 */

/*Import Statements*/
import React, { Component } from 'react'
import { Form, Input, Button, Col } from 'antd';
import Axios from 'axios';
import {reactLocalStorage} from 'reactjs-localstorage';


export default class LoginForm extends Component {
    constructor(props){
    super(props);
    this.state = {
        data: [],   //Holds data return by the API call to set the LocalStorage Data
      };
    }

    /*Sends the inputted values to the backend to be verified by the LDAP server
    * If successful sets the LocalStorage information to the user*/
    onFinish = (values) => {
            /*API call to the Backend, Passes inpoutted values*/
            Axios.post("http://localhost:8000/login", {
              values: values
            })
                /*Waits for response, If successful saves information to LocalStorage*/
            .then((response) => {
                if (response.data.success === true){
                    console.log(response.data)
                    this.setState({data: response.data})
                    this.props.parentCallback(response.data)
                    reactLocalStorage.setObject('user', this.state.data)
                    //map data to state for callback to parent
                    //send isAdmin to state for callback
                }
                if (response.data.success === false){
                    console.log(response.data)
                }  
            })
            .catch((error) =>{
                console.log(error)
            })
            
          };
    /*Displays error in form fails*/
    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    render() {
        return (
            <div className='LoginForm'>
                <Col span={12}>
                {/*Form asking for StaffID and Password*/}
                <Form
                    name="basic"
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                    >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[
                        {
                            required: true,
                            message: 'Please input your username!',
                        },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                        {
                            required: true,
                            message: 'Please input your password!',
                        },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                        Submit
                        </Button>
                    </Form.Item>
                </Form>
                </Col>
            </div>
        )
    }
}
