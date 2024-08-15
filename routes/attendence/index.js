const express = require('express');
const app = express();
var crypto = require('crypto');
const moment = require('moment')
const bodyParser = require('body-parser');
const cors = require("cors");
const fs = require('fs');
const dbconn  = require('../../config/dbconn');
// Set maximum payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true })); 
 app.post('/regAttendance', (req, res) => {
     const axios = require('axios');
             var retVal = [];
             retVal = {
                otpstatus: "notfound",
            }
             const sql = require('mssql/msnodesqlv8');

            var AttenPrtUsrIDVal = req.body.AttenPrtUsrID; 
            var AttenUserTypeVal = req.body.AttenUserType;
            var AttenDateVal = req.body.AttenDate;
            var AttenTimeVal= req.body.AttenTime;

            var AttenLatVal = req.body.AttenLat;
            var AttenLangVal=req.body.AttenLang;
            var AttenDistanceVal=req.body.AttenDistance; 

             //Set Default
              var IsDataStatusVal=1;
              
             //Auto
              var AttenStaffPrKeyIDVal=crypto.randomBytes(20).toString("hex");
              
          
              //Set Default
              var CreatedByVal=AttenPrtUsrIDVal;
              var CreatedDateVal= moment().utc().format('Y-M-D');
              var ModifyByVal=AttenPrtUsrIDVal;
              var ModifyDateVal= moment().utc().format('Y-M-D');
              var Attend="";
             
            Attend=Attend+" insert into TblStaffAttendance (";
            Attend=Attend+" AttenStaffPrKeyID,AttenPrtUsrID,AttenUserType,AttenDate,AttenTime,";
            Attend=Attend+" AttenLat,AttenLang,CreatedBy,CreatedDate,ModifyBy,";
            Attend=Attend+" ModifyDate,IsDataStatus,AttenDistance)";
            Attend=Attend+" Values ( ";
            Attend=Attend+"'"+AttenStaffPrKeyIDVal+"','"+AttenPrtUsrIDVal+"','"+AttenUserTypeVal+"','"+AttenDateVal+"','"+AttenTimeVal+"',";
            Attend=Attend+"'"+AttenLatVal+"','"+AttenLangVal+"','"+CreatedByVal+"','"+CreatedDateVal+"','"+ModifyByVal+"',";
            Attend=Attend+"'"+ModifyDateVal+"','"+IsDataStatusVal+"','"+AttenDistanceVal+"'";
            Attend = Attend + " ) ";
 
       
               var chcksql = "Select CAID  from TblStaffAttendance Where AttenDate='"+AttenDateVal+"' and AttenPrtUsrID='"+AttenPrtUsrIDVal+"'";
                const pool = new sql.ConnectionPool(dbconn);
                pool.connect().then(() => {
                //simple query
                pool.request().query(chcksql,(err, chkresult) => {
                if (err) res.send(err);

                        if (chkresult.recordset.length == 0) 
                        { 
                              //----------------------Inser Loppp---------------2--------Start
                              const pool = new sql.ConnectionPool(dbconn);
                            pool.connect().then(() => {
                            //simple query
                            pool.request().query(Attend, (err, result) => {
                                //Sucess
                                retVal = {
                                message: "Your Attendance Registration successfully Completed   ",
                                oprstatus: "success",

                                code : "200"
                                }
                                

                                if (err) res.send(err)
                                    else {
                                        return res.json({ data: retVal });  
                                    }


                                })
                                }) 
                                        
                                sql.close();
                            
                                //----------------------Insert Loop -----------------------End
                        }
                        else
                        {

                        //Fail
                        retVal = { message: "Attendance Registration Failed or Registered Already   ", code: "500" }
                        return res.json({ data: retVal })
                        }
                                 
                    })
                  
                })
});
 
app.post('/getAttendance', (req, res) => {

    const sql = require('mssql/msnodesqlv8');
    var AttenPrtUsrIDVal = req.body.AttenPrtUsrID; 

    var sqlst = "SELECT  DATENAME(dw, AttenDate) as AttenDay, FORMAT (AttenDate, 'dd-MMM-yyyy ')  as AttenDate, convert(char(5), AttenTime, 108)   as AttenTime FROM TblStaffAttendance where AttenPrtUsrID = '" + AttenPrtUsrIDVal + "' order by CAID desc";
	 
     const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query(sqlst, (err, result) => {
            if (err) res.send(err);
 
            if (result.recordset.length == 0) {

                return res.json({
                    data: result.recordset
                })
            }
            else {

                return res.json({
                    data: result.recordset
                })

            }

        })
        sql.close();
    })
    console.log('ending sql');
});
module.exports = app;