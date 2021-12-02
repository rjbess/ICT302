/**
 * @file kshstwo/component/TeacherForm.js
 *
 * @team EduLeave Management
 * @authors Adam Sami, Mathew Burnett, Meet Ranparia, Robert Bessell, Stefan Aleksic, Tien Dat Ho
 * @date 27/10/2020
 * @course Murdoch University ICT302 Semester 2, 2020
 *
 * @version 1.0.0
 *
 * @description Displays a Modal (pop out) form to an Teacher User who can create a leave form for themselves.
 *              The Staff ID, First name and Last Name which  are stored in the session data is loaded into
 *              the form and cannot be altered by the user. NOTE: For a Teacher User this session data has already
 *              been verified and belongs to the Teacher. The User then can select a date from plus 1 business day
 *              up to a year, select a reason and then select the periods. If the leave is over multiple days then
 *              all periods are checked by default. All inputs are validated and sent to the Backend to be uploaded
 *              to the server
 *
 */

/*Import Statements*/
import React from "react";
import {Button, Form, Modal, Input, DatePicker, Typography } from "antd";
import { Checkbox, Row, Col } from 'antd';
import Select from 'react-select';
import moment from "moment";
import business from 'moment-business';
const {Title} = Typography;
const {RangePicker} = DatePicker;


/*Sets the options available for the 'Reason' selection
* More can be added as desired*/
const options = [
    { value: 'excursion', label: 'Excursion' },
    { value: 'family', label: 'Family Carers Leave' },
    { value: 'lsl', label: 'LSL' },
    { value: 'lwop', label: 'LWOP' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'pd', label: 'Professional Development' },
    { value: 'sick', label: 'Sick/ Medical Leave' },
    { value: 'short', label: 'Short Leave' },
    { value: 'other', label: 'Other' }
];

class TeacherForm extends React.Component{
    /*Constructor sets default values upon open*/
    constructor() {
        super();

        /*Binds the setSelect so it can be alter the values outside of the onChange function*/
        this.setReason = this.setReason.bind(this);

        this.state={
            showForm:false,             //Used to display Modal
            // Hard Coded for Demo
            // StaffID:InformationStore.username,
            StaffID:'e1234567',         //The Staff ID of the user
            FirstName:'',               //The First name of the user
            LastName:'',                //The Last name of the user
            Date:[],                    //Date of leave, used to get the start and end dates
            StartDay: null,             //Start date of leave
            EndDay: null,               //End date of leave
            Reason:'',                  //Reason of leave
            PeriodOne:null,             //Periods of leave
            PeriodTwo:null,
            PeriodThree:null,
            PeriodFour:null,
            PeriodFive:null,
            PeriodSix:null,
            Status:'new',               //Status of leave
            SelectedReason:null,        //Selected Reason
            allChecked:false,           //Are all periods selected. Used when start and end dates are different
        }
    }
    /*Resets values, used to clear values when form closes*/
    resetForm(){
        this.setState({
            showForm:false,
            // Hard Coded for Demo
            // StaffID:InformationStore.username,
            StaffID:'e1234567',
            FirstName:'',
            LastName:'',
            Reason:'',
            Date:[],
            StartDate:null,
            EndDate:null,
            PeriodOne:null,
            PeriodTwo:null,
            PeriodThree:null,
            PeriodFour:null,
            PeriodFive:null,
            PeriodSix:null,
            Status:'new',
            SelectedReason:null,
            SelectMemberDetails:[],
            allChecked:false,
        })
    }
    /*Submits form information to the backend to be uploaded to the database.
    * Occurs after all input validation*/
    async submitForm(){
        try{
            /*API Call Sends values to the backend*/
            let result = await fetch('http://localhost:8000/SubmitForm',{
                method:'post',
                headers:{
                    'Accept':'application/json',
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    StaffID:this.state.StaffID,
                    StartDate:this.state.StartDate,
                    EndDate:this.state.EndDate,
                    LeaveType:this.state.Reason,
                    Period1:this.state.PeriodOne,
                    Period2:this.state.PeriodTwo,
                    Period3:this.state.PeriodThree,
                    Period4:this.state.PeriodFour,
                    Period5:this.state.PeriodFive,
                    MG:this.state.PeriodSix,
                    Status:this.state.Status,
                })
            });
            /*Waits on backend to check success of upload*/
            let submitForm = await result.json();
            /*Informs user of success, resets form*/
            if(submitForm.success===false){
                this.resetForm();
                alert(submitForm.msg);
            }
            else{
                alert(submitForm.msg);
                window.location.reload(false);
            }
        }catch(err){
            console.log(err);
            this.resetForm();
        }
    }
    //replace call to DB with reading session data
    // async getStaffMemberDetails(){
    //     try{
    //         let result = await fetch('/GetStaffMemberDetails',{
    //             method:'post',
    //             headers:{
    //                 'Accept':'application/json',
    //                 'Content-Type':'application/json'
    //             },
    //            body:JSON.stringify({
    //                username:InformationStore.username
    //            })
    //         });
    //         let staffMember = await result.json();
    //         if(staffMember.success===false){
    //             alert(staffMember.msg);
    //         }
    //         else {
    //             //Replaceable with session data
    //             this.setState({
    //                 FirstName:staffMember.FirstName,
    //                 LastName:staffMember.LastName
    //             })
    //         }
    //     }catch(err){
    //         console.log(err);
    //         alert("Couldn't retrieve staff member details");
    //     }
    // }

    /*Runs submit function by validating the inputs, submitting details and closing/reseting form*/
    submit(){
        let valid= this.validateForm()
        if(valid){
            if(this.state.PeriodOne===true){this.state.PeriodOne=1}else{this.state.PeriodOne=0}
            if(this.state.PeriodTwo===true){this.state.PeriodTwo=1}else{this.state.PeriodTwo=0}
            if(this.state.PeriodThree===true){this.state.PeriodThree=1}else{this.state.PeriodThree=0}
            if(this.state.PeriodFour===true){this.state.PeriodFour=1}else{this.state.PeriodFour=0}
            if(this.state.PeriodFive===true){this.state.PeriodFive=1}else{this.state.PeriodFive=0}
            if(this.state.PeriodSix===true){this.state.PeriodSix=1}else{this.state.PeriodSix=0}
            this.submitForm()
            this.cancel();
        }
    }
    /*Display modal and sets user first and last name*/
    onOpen(){
        this.setTrue();
        this.setState({
            FirstName:'Carl',
            LastName:'Gauss'
        })
        // this.getStaffMemberDetails()
    }
    /*Resets form and closes modal*/
    cancel(){
        this.decheckAll();
        this.resetForm();
        this.setFalse();
    }
    /*Takes a property and sets a value against it*/
    setValue(property, val){
        this.setState( {
            [property]:val
        })
    }
    /*Used to open form*/
    setTrue(){
        this.setState({showForm:true})
    }
    /*Used to close form*/
    setFalse(){
        this.setState({showForm:false})
    }
    /*Used in the calendar to set a date. Once a date is selected sets the Start
    and End date variables, as well as resetting on empty*/
    setDate=(range)=>{
        /*Checks if date is selected, if not resets values*/
        if(range!=null) {
            /*Sets Date, start and end dates*/
            this.setState({
                Date: range,
                StartDate: range[0].format("YYYY/MM/DD"),
                EndDate: range[1].format("YYYY/MM/DD")
            })
            /*Checks if dates are on the same day*/
            let temp = range[0] < range[1]
            /*If not on the same day sets all periods to true
           * If on the same day unlocks periods*/
            if(temp){
                this.setState({
                    allChecked:true
                })
                this.checkAll();
            }else{
                this.setState(({
                    allChecked:false
                }))
                this.decheckAll();
            }
        }else{
            this.decheckAll();
            this.setState(({
                Date:null,
                StartDate:null,
                EndDate:null,
                allChecked:false
            }))
        }
    }
    /*Checks all periods to true*/
    checkAll(){
        this.setState({
            PeriodOne:true,
            PeriodTwo:true,
            PeriodThree:true,
            PeriodFour:true,
            PeriodFive:true,
            PeriodSix:true,
        })
    }
    /*Resets all periods*/
    decheckAll(){
        this.setState({
            PeriodOne:null,
            PeriodTwo:null,
            PeriodThree:null,
            PeriodFour:null,
            PeriodFive:null,
            PeriodSix:null,
        })
    }
    /*Used to select and store a reason*/
    setReason(inValue) {
        this.setState({
            SelectedReason:inValue,
            Reason:inValue.label
        })
    };
    /*Validates inputs, if one false doesnt reset form or submit*/
    validateForm(){
        /*Sets valid characters to A-Z upper and lower case as well and ' ' and -*/
        let chars =  /^[a-zA-Z -]+$/;

        /*Validate empty string*/
        if(this.state.StaffID===''){
            alert("Please enter a Staff ID");
            return false;
        }
        /*Validate StaffID length*/
        if(this.state.StaffID.length!==8){
            alert("Please enter a validate Staff ID");
            return false;
        }
        /*Validate StaffID format- must in the form of One 'e' followed by 7 numbers*/
        if (!this.state.StaffID.match("^[e]{1}[0-9]{7}")) {
            alert("Please enter a validate Staff ID");
            return false;
        }
        /*Validate empty first name*/
        if(this.state.FirstName===''){
            alert("Please enter a first name");
            return false;
        }
        /*Validates first name to have allowed character*/
        if (!this.state.FirstName.match(chars)) {
            alert("Please enter a validate first name");
            return false;
        }
        /*Validate empty last name*/
        if(this.state.LastName===''){
            alert("Please enter a surname");
            return false;
        }
        /*Validates last name to have allowed character*/
        if (!this.state.LastName.match(chars)) {
            alert("Please enter a validate surname");
            return false;
        }
        /*Validates that both dates are selected*/
        if(this.state.StartDate===null || this.state.EndDate==null){
            alert("Please enter a date");
            return false;
        }
        /*Validates empty reason*/
        if(this.state.Reason===''){
            alert("Please select a reason");
            return false;
        }
        /*Validates that at least one period is selected*/
        if(!this.state.PeriodOne===true && !this.state.PeriodTwo===true && !this.state.PeriodThree===true
            && !this.state.PeriodFour===true  && !this.state.PeriodFive===true  && !this.state.PeriodSix===true)
        {
            alert("Please select a period");
            return false;
        }
        /*Validates that at least two periods are selected, if its a meeting*/
        if(this.state.Reason==='Meeting'){
            let pcount = 0
            if(this.state.PeriodOne===true){pcount+=1}
            if(this.state.PeriodTwo===true){pcount+=1}
            if(this.state.PeriodThree===true){pcount+=1}
            if(this.state.PeriodFour===true){pcount+=1}
            if(this.state.PeriodFive===true){pcount+=1}
            if(this.state.PeriodSix===true){pcount+=1}
            if(pcount > 2){
            alert("Meeting must be two periods or less");
            return false;
            }
        }
        return true;
    }
    /*Used by the calendar to disable selected dates. Works by returning a true and particular dates.
    *  Disables the calendar so the user must select one full business day ahead of current day
    * ie if Monday the earliest they can input is Wednesday.
    * And up to a year*/
    disabledDate(current) {
        let temp = new Date()
        let day = temp.getDay();
        let amount=0;
        if(day===0|| day ===1 || day===2){
            amount=1
        }
        else if( day===3 || day ===4 || day===5){
            amount = 3;
        }
        else if(day===6){
            amount = 2
        }
        return current < moment().add(amount, "days") || business.isWeekendDay(current) || current > moment().add(1, "year");
    }
    render() {
        return (
            <div>
                {/*Button used to open modal*/}
                <Button
                    size={"large"}
                    type={"primary"}
                    onClick={() => this.onOpen()}>
                    Teacher Leave Form
                </Button>
                {/*Modal displays the form on open. On close it resets the form and values*/}
                <Modal
                    
                    visible={this.state.showForm}
                    onCancel={() => this.cancel()}
                    onOk={() => this.submit()}
                >
                    <Form
                        layout={"vertical"}
                        name={"LeaveForm"}
                    >

                        <Title>Leave Form</Title>

                        {/*Input the Staff ID for form, should update with search. Locked and uneditable*/}
                        <Form.Item
                            label={"Staff ID"}
                            disabled={true}
                            shouldUpdate
                        >

                            <Input type={"text"}
                                   onChange={(e) => {this.setValue('StaffID', e.target.value)}}
                                   disabled={true}
                                   value={this.state.StaffID}/>
                        </Form.Item>
                        {/*Input the First Name for form, should update with search. Locked and uneditable*/}
                        <Form.Item
                            label={"First Name"}
                            shouldUpdate
                        >
                            <Input
                                type={"text"}
                                disabled={true}
                                onChange={(e) => {this.setValue('FirstName', e.target.value)}}
                                value={this.state.FirstName}
                            />
                        </Form.Item>
                        {/*Input the Last name for form, should update with search. Locked and uneditable*/}
                        <Form.Item
                            label={"Last Name"}
                            shouldUpdate
                        >
                            <Input
                                type={"text"}
                                disabled={true}
                                onChange={(e) => {this.setValue('LastName', e.target.value)}}
                                value={this.state.LastName}
                            />
                        </Form.Item>
                        {/*Displays the Calendar*/}
                        <Form.Item
                            label={"Date"}
                        >
                            <RangePicker
                                disabledDate={this.disabledDate}
                                value={this.state.Date}
                                onChange={this.setDate}
                                format={"DD/MM/YYYY"}/>
                        </Form.Item>
                        {/*Displays the 'Reason' drop down*/}
                        <Form.Item
                            label={"Reason"}
                        >
                            <Select
                                onChange={this.setReason}
                                value={this.state.SelectedReason}
                                options={options}
                            />
                        </Form.Item>
                        {/*Displays the Periods, if the Start and end dates are different auto ticks
                        every period and locks. If not deselects all and unlocks*/}
                        <Form.Item
                            label={"Periods"}
                        >
                            <Row width={"100%"}>
                                <Col span={8}>
                                    {this.state.allChecked
                                    ? <Checkbox
                                            disabled={true}
                                            defaultChecked={true}
                                            onChange={(e)=>this.setValue('PeriodOne', e.target.checked)}
                                            checked={this.state.PeriodOne}
                                        >
                                            Period One
                                        </Checkbox>
                                    :<Checkbox
                                            disabled={false}
                                            onChange={(e)=>this.setValue('PeriodOne', e.target.checked)}
                                            checked={this.state.PeriodOne}
                                        >
                                            Period One
                                        </Checkbox>
                                    }
                                </Col>
                                <Col span={8}>
                                    {this.state.allChecked
                                        ? <Checkbox
                                            disabled={true}
                                            defaultChecked={true}
                                            onChange={(e)=>this.setValue('PeriodTwo', e.target.checked)}
                                            checked={this.state.PeriodTwo}
                                        >
                                            Period Two
                                        </Checkbox>
                                        :<Checkbox
                                            disabled={false}
                                            onChange={(e)=>this.setValue('PeriodTwo', e.target.checked)}
                                            checked={this.state.PeriodTwo}
                                        >
                                            Period Two
                                        </Checkbox>
                                    }
                                </Col>
                                <Col span={8}>
                                    {this.state.allChecked
                                        ? <Checkbox
                                            disabled={true}
                                            defaultChecked={true}
                                            onChange={(e)=>this.setValue('PeriodThree', e.target.checked)}
                                            checked={this.state.PeriodThree}
                                        >
                                            Period Three
                                        </Checkbox>
                                        :<Checkbox
                                            disabled={false}
                                            onChange={(e)=>this.setValue('PeriodThree', e.target.checked)}
                                            checked={this.state.PeriodThree}
                                        >
                                            Period Three
                                        </Checkbox>
                                    }
                                </Col>
                            </Row>
                            <Row width={"100%"}>
                                <Col span={8}>
                                    {this.state.allChecked
                                        ? <Checkbox
                                            disabled={true}
                                            defaultChecked={true}
                                            onChange={(e)=>this.setValue('PeriodFour', e.target.checked)}
                                            checked={this.state.PeriodFour}
                                        >
                                            Period Four
                                        </Checkbox>
                                        :<Checkbox
                                            disabled={false}
                                            onChange={(e)=>this.setValue('PeriodFour', e.target.checked)}
                                            checked={this.state.PeriodFour}
                                        >
                                            Period Four
                                        </Checkbox>
                                    }
                                </Col>
                                <Col span={8}>
                                    {this.state.allChecked
                                        ? <Checkbox
                                            disabled={true}
                                            defaultChecked={true}
                                            onChange={(e)=>this.setValue('PeriodFive', e.target.checked)}
                                            checked={this.state.PeriodFive}
                                        >
                                            Period Five
                                        </Checkbox>
                                        :<Checkbox
                                            disabled={false}
                                            onChange={(e)=>this.setValue('PeriodFive', e.target.checked)}
                                            checked={this.state.PeriodFive}
                                        >
                                            Period Five
                                        </Checkbox>
                                    }
                                </Col>
                                <Col span={8}>
                                    {this.state.allChecked
                                        ? <Checkbox
                                            disabled={true}
                                            defaultChecked={true}
                                            onChange={(e)=>this.setValue('PeriodSix', e.target.checked)}
                                            checked={this.state.PeriodSix}
                                        >
                                            Period Six
                                        </Checkbox>
                                        :<Checkbox
                                            disabled={false}
                                            onChange={(e)=>this.setValue('PeriodSix', e.target.checked)}
                                            checked={this.state.PeriodSix}
                                        >
                                            Period Six
                                        </Checkbox>
                                    }
                                </Col>
                            </Row>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        )
    }
}
export default TeacherForm;