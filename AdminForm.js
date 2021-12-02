/**
 * @file kshstwo/component/AdminForm.js
 *
 * @team EduLeave Management
 * @authors Adam Sami, Mathew Burnett, Meet Ranparia, Robert Bessell, Stefan Aleksic, Tien Dat Ho
 * @date 27/10/2020
 * @course Murdoch University ICT302 Semester 2, 2020
 *
 * @version 1.0.0
 *
 * @description Displays a Modal (pop out) form to an Admin User who can add a leave form for any Staff Member
 *              with no restrictions. Firstly it retrieves all current staff members from the database via
 *              API calls. Then the user is able to search via Staff ID or First / Surname to select and prefill
 *              the relevant inputs. If not found the user can manually add these. User is then to select a reason
 *              from a predetermine selection, date and period. Input validation is used for all inputs.
 *              NOTE: Input validation will search for correct input format ie e1234567. Not if e1234567 is an actual
 *              Staff Member!
 *
 */


/*Import Statements*/
import React from "react";
import {Button, Form, Modal, Input, DatePicker, Typography } from "antd";
import { Checkbox, Row, Col } from 'antd';
import Select from 'react-select';
import moment from "moment";
import business from "moment-business";
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

class AdminForm extends React.Component{
    /*Constructor sets default values upon open*/
    constructor() {
        super();

        /*Binds the setSelect and setReason so they can alter the values outside of the onChange Functions*/
        this.setSelect = this.setSelect.bind(this);
        this.setReason = this.setReason.bind(this);

        /*Set Default values*/
        this.state={
            showForm:false,         //Used to display Modal
            StaffID:'',             //The Staff ID of the member whos form is to be submitted
            FirstName:'',           //The First name of the member whos form is to be submitted
            LastName:'',            //The Last name of the member whos form is to be submitted
            Date:[],                //Date of leave, used to get the start and end dates
            StartDay: null,         //Start date of leave
            EndDay: null,           //End date of leave
            Reason:'',              //Reason of leave
            PeriodOne:null,         //Periods of leave
            PeriodTwo:null,
            PeriodThree:null,
            PeriodFour:null,
            PeriodFive:null,
            PeriodSix:null,
            Status:'New',           //Status of leave
            StaffMembers:[],        //Array of all staff members, used to help select specific member
            SelectedMember:null,    //Selected Staff member
            SelectedReason:null,    //Selected Reason
            SelectMemberDetails:[], //The Details of the selected member
            allChecked:false        //Are all periods selected. Used when start and end dates are different
        }
    }
    /*Resets values, used to clear values when form closes*/
    resetForm(){
        this.setState({
            showForm:false,
            StaffID:'',
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
            Status:'New',
            StaffMembers:[],
            SelectedMember:null,
            SelectedReason:null,
            SelectMemberDetails:[],
            allChecked:false
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
    /*Gets Information of all current Staff Members from the Backend/ Database
    * Gets Staff ID, First Name, Last Name of all current employees and stores
    * in StaffMembersDetails and a formatted version in StaffMembers*/
    async getStaffMembers(){
        /*Backend API call*/
        try{
            let result = await fetch('http://localhost:8000/GetStaffMembers',{
                method:'post',
                headers:{
                    'Accept':'application/json',
                    'Content-Type':'application/json'
                }
            })
            /*Checks whether the call was successful/ information gathered from database*/
            let staffMembers = await result.json();
            /*If unsuccessful alerts user*/
            if(staffMembers.success===false){
                alert(staffMembers.msg);
            }
            /*If successful gets all information, formats it and stores on StaffMembersDetails
            * and raw version in StaffMemberDetails*/
            else {
                const temp = [];
                staffMembers.allStaffMembers.forEach((member)=>{
                    temp.push({value:`${member.StaffID}`, label: `${member.StaffID}: ${member.FirstName} ${member.LastName}`})
                })
                this.setState({StaffMembersDetails:staffMembers.allStaffMembers})
                this.setState({StaffMembers: temp})
            }
        }catch(err){
            console.log(err);
            alert("Couldn't retrieve staff members");
        }
    }
    /*Used in the drop down 'Search Select' box
    * Takes in the selected members and gets its key against the key value in all StaffMemberDetails
    * sets the local variable to the corresponding values */
    setSelect(inValue){

        let temp = inValue.value;
        let tempTwo = this.state.StaffMembersDetails.filter((e)=>{if(e.StaffID===temp){return e}})
        this.setState({
            SelectedMember:inValue,
            StaffID:tempTwo[0].StaffID,
            FirstName:tempTwo[0].FirstName,
            LastName:tempTwo[0].LastName,
        })
    }
    /*Runs submit function by validating the inputs, submitting details and closing/resetting form*/
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
    /*Display modal and gets all staff members for search function*/
    onOpen(){
        this.setTrue();
        this.getStaffMembers();
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
    and End date variables, as well as resetting on empty
     */
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
            if(temp) {
                this.setState({
                    allChecked: true
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
        // this.setState({
        //     Date:range,
        //     StartDate:range[0].format("YYYY/MM/DD"),
        //     EndDate:range[1].format("YYYY/MM/DD")
        // })
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
        return true;
    }
    /*Used by the calendar to disable selected dates. Works by returning a true and particular dates*/
    disabledDate(current) {
        return  current < moment().subtract(1,'day')|| business.isWeekendDay(current) ;
    }
    render() {
        return (
            <div>
                {/*Button used to open modal*/}
                <Button
                    size={"large"}
                    type={"primary"}
                    onClick={() => this.onOpen()}>
                    Admin Form
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

                        <Title>Staff Leave Form</Title>
                        {/*Display a drop down box that a user can search or select a user*/}
                        <Form.Item
                            label={"Search"}>
                            <Select
                                onChange={this.setSelect}
                                value={this.state.SelectedMember}
                                options={this.state.StaffMembers}
                            />
                        </Form.Item>
                        {/*Input the Staff ID for form, should update with search*/}
                        <Form.Item
                            label={"Staff ID"}
                            shouldUpdate
                        >

                            <Input type={"text"}
                                   maxLength={8}
                                   onChange={(e) => {this.setValue('StaffID', e.target.value)}}
                                   value={this.state.StaffID}/>
                        </Form.Item>
                        {/*Input the First Name for form, should update with search*/}
                        <Form.Item
                            label={"First Name"} rules={[{
                            required: true,
                            message: 'Please enter the first name'
                        }]}
                            shouldUpdate
                        >
                            <Input
                                type={"text"}
                                maxLength={30}
                                onChange={(e) => {this.setValue('FirstName', e.target.value)}}
                                value={this.state.FirstName}
                            />
                        </Form.Item>
                        {/*Input the Last Name for form, should update with search*/}
                        <Form.Item
                            label={"Last Name"} rules={[{
                            required: true,
                            message: 'Please enter the surname'
                        }]}
                            shouldUpdate
                        >
                            <Input
                                type={"text"}
                                maxLength={30}
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
export default AdminForm;