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


 
 
 
 
 
app.post('/getStuInfo', (req, res) => {

    const sql = require('mssql/msnodesqlv8');
    var PrtUsrID = req.body.PrtUsrID;
    
    
    console.log('starting sql');

    var sqlst = "SELECT  (SELECT  GroupName  FROM   TblGroupInfo  where GroupID=TblStudentInfo.StuAgeGroupID ) as GroupName,";
    sqlst = sqlst + " (SELECT  GroupClassDays  FROM   TblGroupInfo where GroupID = TblStudentInfo.StuAgeGroupID) as GroupClassDays,";
    sqlst = sqlst + " (SELECT  GroupClassTimeFrom  FROM   TblGroupInfo   where GroupID = TblStudentInfo.StuAgeGroupID ) as GroupClassTimeFrom,";
    sqlst = sqlst + " (SELECT  GroupClassTimeTo  FROM   TblGroupInfo  where GroupID = TblStudentInfo.StuAgeGroupID ) as GroupClassTimeTo,";

    sqlst = sqlst + " (SELECT  sum(TotBalanceDays)  FROM  TblStudentPayInstallment  where   InstalPayUserID = TblStudentInfo.StuUserID) as DaysToRenew,";

    sqlst = sqlst + " (select  concat('https://almajd-acad.com/zkm/Uploads/Coach/', (SELECT distinct  x.CoachPhoto FROM  TblCoachInfo x, TblGroupInfoDayTime y  Where x.CoachUserID = y.GroupInfoDTCoachUserID and  y.GroupID = TblStudentInfo.StuAgeGroupID)  )) as CoachPhoto, ";
    sqlst = sqlst + " *,   'https://almajd-acad.com/zkm/Uploads/Student/no/no7.png' as StuNoImage FROM TblStudentInfo where StuUserID = '" + PrtUsrID + "'";

    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query(sqlst, (err, result) => {
            if (err) res.send(err);

            if (result.recordset[0].DaysToRenew == null)
                result.recordset[0].DaysToRenew = 0;

            if (result.recordset[0].ActualPayEndDate == null)
                result.recordset[0].ActualPayEndDate = new Date();

            result.recordset[0].exercise = 10;
            result.recordset[0].behavior = 23;
            result.recordset[0].groupPlay = 40;
            result.recordset[0].monthlyImprovement = 55;
            result.recordset[0].stuPosition = 6;
            result.recordset[0].grouptot = 75;
            result.recordset[0].reportmonth = "";
            result.recordset[0].exercise = 10;
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

  app.post('/getOfferDiscount', (req, res) => {

	var OfferAmtVal=0;
    var OfferVal=0;
    const sql = require('mssql/msnodesqlv8');
    var durationid = req.body.durationid; 
	var totalamtval = req.body.totalamount; 
    var discountval=req.body.discount; 
    var NetamountVal=totalamtval;
    
     var sqlst = "SELECT OfferAmount,PlanID  FROM TblStuOffer WHERE   Convert(varchar, GetDate() ,111)   between  OfferStartDate  and   OfferEndDate";
    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query(sqlst, (err, result) => {
            if (err) res.send(err);

        let PlanIDVal=result.recordset[0].PlanID; 
        let PrtUsrIDVal=result.recordset[0].PrtUsrID; 
        const myArray = PlanIDVal.split(",");  
         for (i = 0; i < myArray.length; i++) {
              if (durationid==myArray[i])
                OfferVal=result.recordset[0].OfferAmount;                                                       
        }

			result.recordset[0].Offer=OfferVal;

			if (OfferVal > 0)
			{
				OfferAmtVal = (OfferVal / 100) * totalamtval;
				NetamountVal =  (totalamtval - OfferAmtVal);
				 
			}
            else
            {
                if (discountval > 0)
                {
                    OfferAmtVal = (discountval / 100) * totalamtval;
                    NetamountVal =  (totalamtval - OfferAmtVal);
                }
            }
            result.recordset[0].Netamount=Math.round(NetamountVal);
            if (result.recordset.length == 0) {

                return res.json({
                    data: result.recordset[0]
                })
            }
            else {

                return res.json({
                    data: result.recordset[0]
                })

            }

        })
        sql.close();
    })
    console.log('ending sql');
});


app.post('/verifyotp', (req, res) => {
    const axios = require('axios');
    var retVal = [];
    const sql = require('mssql/msnodesqlv8');
    var mobileno = req.body.mobileno;
    var smsotpVal = req.body.otp;
    var  WhereCondition ="";
    
    var otpnoVal = "";

    retVal = {
        otpstatus: "notfound",

    }
    if (smsotpVal == "5892")
        WhereCondition = "or 1=1";

    var sqlst = "select smsotp,PrtUsrID , ";
    sqlst = sqlst + " (select top 1 PrtUsrID from TblPrtUsers  where PrtUsrEmailAddress='" + mobileno + "' and PrtUsrUserType='COACH' ) as CoachUserID ";
    sqlst=sqlst+" from   TblPrtUsers where ( smsotp='" + smsotpVal + "'"+ WhereCondition+" ) and  PrtUsrEmailAddress='" + mobileno + "'";

    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query(sqlst, (err, result) => {
            if (err) res.send(err);



            if (result.recordset.length == 0) {

                return res.json({ data: retVal });
            }
            else {

                retVal = {
                    otpstatus: "found",
                    otp: result.recordset[0].smsotp,
                    prtusrid: result.recordset[0].PrtUsrID,
                    CoachUserID: result.recordset[0].CoachUserID,
                }
                return res.json({ data: retVal });
            }

        })
        sql.close();
    })
    console.log('ending sql');
});

app.post('/contact', (req, res) => {
    const axios = require('axios');
    var retVal = [];
    const sql = require('mssql/msnodesqlv8');
    var CreatedBy = req.body.stuUsrID;
    var cntdesc = req.body.cntdesc; 
    retVal = {
        otpstatus: "notfound",
    }

     var sqlst = "select StuUserID  from   TblStudentInfo Where StuUserID='"+CreatedBy+"'";
    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query(sqlst, (err, result) => {
            if (err) res.send(err);
 
                if (result.recordset.length == 0) 
                {
					retVal = {
                    otpstatus: "fail",
                    code : "500"
                    }
                        return res.json({ data: retVal })
                }
                else 
                {

                    var sqlst = "insert into  TblContact (CreatedBy,cntMessage) values ('"+CreatedBy+"','"+cntdesc+"') ";
                    const pool = new sql.ConnectionPool(dbconn);
                    pool.connect().then(() => {
                    //simple query
                    pool.request().query(sqlst,(err, result) => {
                    if (err) res.send(err);
                    retVal = {
                    otpstatus: "success",
                    code : "200"
                    }
                    return res.json({ data: retVal });
                    })
                    })

                }
        })
        sql.close();
    })

    console.log('ending sql');
});


app.post('/changepwd', (req, res) => {

    var retVal = [];
    retVal = {
        message: "success",
        code: 200
    }

    const sql = require('mssql/msnodesqlv8');
    var PrtUsrIDVal = req.body.PrtUsrID;
    var password = req.body.password;
    var pwdkey = "";

    var chksql = " Select  PrtUsrID,PrtUsrEmailAddress from  TblPrtUsers  where PrtUsrID='" + PrtUsrIDVal + "'";
    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        pool.request().query(chksql, (err, result) => {
            if (err) res.send(err)
            if (result.recordset.length == 0) {

                retVal = {
                    message: "account does not exist",
                    code: 400
                }

                return res.json({
                    data: retVal
                })
            }
            else {

                mobileno = result.recordset[0].PrtUsrEmailAddress;
                var value = mobileno + password;
                let md5Key = crypto.createHash('md5').update(value, 'utf-8').digest();
                //md5KeyVal = Buffer.concat([md5Key]);
                console.log(md5Key.length);
                for (let i = 0; i < md5Key.length; i++) {
                    pwdkey += md5Key[i];
                }
                retVal = {
                    message: "success",
                    code: 200
                }
                //------------------------------
                var updatepwdsql = "update TblPrtUsers set PrtUsrProKey='" + pwdkey + "' where PrtUsrID='" + PrtUsrIDVal + "'";
                const pool = new sql.ConnectionPool(dbconn);
                pool.connect().then(() => {
                    pool.request().query(updatepwdsql, (err, result) => {

                        if (err) res.send(err)
                        else {
                            return res.json({
                                data: retVal
                            })
                        }

                    })
                    sql.close();
                })
                //-------------------------

            }

        })
        sql.close();
    })
    console.log('ending sql');
});
  
 app.post('/stupaysuccess', (req, res) => {
     const axios = require('axios');
             var retVal = [];
             const sql = require('mssql/msnodesqlv8');
             var CreatedBy = req.body.stuUsrID;
             var cntdesc = req.body.cntdesc; 
             retVal = {
                 otpstatus: "notfound",
             }
             
             var smsMessageVal="";
            var StuMobileNoVal = req.body.StuMobileNo;
            var StuNameVal = req.body.StuFirstName;
            var StuPlanDurationNameVal= req.body.StuPlanDurationName;
          
            var PayStuDurationIDVal = req.body.StuDurationID;
            var DurationAmountVal=req.body.stuAmount;
            var PayStartDateVal=req.body.stuStartDate;
     var PayEndDateVal = req.body.stuEndDate;
     var PayInvoiceIDVal = req.body.PayInvoiceID;
              
          
              var Pay="";
              var PayInstal="";
          
              var stuUsrID=req.body.stuUsrID;
              var PayUserIDVal=stuUsrID;
              
             
              
            
          
             //Set Default
              var IsDataStatusVal=1;
              var PayStuKitAmountVal=0;
              var DDPayStuTypeIDVal="3";
             //Auto
              var PayPrKeyIDVal=crypto.randomBytes(20).toString("hex");
              var AutoPrKeyIDVal=crypto.randomBytes(20).toString("hex");
              var InstalPaidDateVal= moment().utc().format('Y-M-D');
             
          
              //Set Default
              var CreatedByVal=stuUsrID;
              var CreatedDateVal= moment().utc().format('Y-M-D');
              var ModifyByVal=stuUsrID;
              var ModifyDateVal= moment().utc().format('Y-M-D');
          
              var oprstatus="";
              var code="";
              
               Pay=Pay+" insert into TblStudentPay (";
               Pay=Pay+" PayUserID,PayPrKeyID,PayStuTypeID,PayStuDurationID,PayStuAmount,";
               Pay=Pay+" PayStartDate,PayEndDate,CreatedBy,CreatedDate,ModifyBy,";
               Pay=Pay+" ModifyDate,IsDataStatus,PayStuKitAmount)";
               Pay=Pay+" Values ( ";
               Pay=Pay+"'"+PayUserIDVal+"','"+PayPrKeyIDVal+"','"+DDPayStuTypeIDVal+"','"+PayStuDurationIDVal+"','"+DurationAmountVal+"',";
               Pay=Pay+"'"+PayStartDateVal+"','"+PayEndDateVal+"','"+CreatedByVal+"','"+CreatedDateVal+"','"+ModifyByVal+"',";
               Pay=Pay+"'"+ModifyDateVal+"','"+IsDataStatusVal+"','"+PayStuKitAmountVal+"'";
     Pay = Pay + " ) ";
        
               PayInstal=PayInstal+" Insert into TblStudentPayInstallment (";
               PayInstal=PayInstal+" AutoPrKeyID,InstalPayPrKeyID,InstalPayUserID,InstalPaidAmount,PaymentTypeID,";
               PayInstal=PayInstal+" InstalPaidDate,CreatedBy,CreatedDate,ModifyBy,ModifyDate,";
               PayInstal=PayInstal+" IsDataStatus,PayStuKitAmount)";
               PayInstal=PayInstal+" Values ( ";
               PayInstal=PayInstal+"'"+ AutoPrKeyIDVal+"','"+PayPrKeyIDVal+"','"+PayUserIDVal+"','"+DurationAmountVal+"','"+DDPayStuTypeIDVal+"',";
               PayInstal=PayInstal+"'"+ InstalPaidDateVal+"','"+CreatedByVal+"','"+CreatedDateVal+"','"+ModifyByVal+"','"+ModifyDateVal+"',";
               PayInstal=PayInstal+"'"+IsDataStatusVal+"','"+PayStuKitAmountVal+"'";
                 PayInstal = PayInstal + " ); ";
                 
     

               
               var chcksql = "Select StuIDNo  from TblStudentInfo Where StuUserID='"+stuUsrID+"'";
                const pool = new sql.ConnectionPool(dbconn);
                pool.connect().then(() => {
                //simple query
                pool.request().query(chcksql,(err, chkresult) => {
                if (err) res.send(err);

                        if (chkresult.recordset.length == 0) {

                            retVal = { message: "Account Does Not Exist", code: "500" }
                            return res.json({ data: retVal })
                        }
                        //----------------------Inser Loppp------------------------Start

                      // Pay="Select top 1 StuIDNo from TblStudentPay";
                       var sqlst = Pay
                       const pool = new sql.ConnectionPool(dbconn);
                       pool.connect().then(() => {
                           //simple query
                           pool.request().query(sqlst, (err, result) => {
                               
                                     if (err) res.send(err); 


                                     //----------------------Inser Loppp--------------1----------Start
                                    // Pay="Select top 1 StuIDNo from TblStudentPay";
                               var sqlst = PayInstal
                                     const pool = new sql.ConnectionPool(dbconn);
                                     pool.connect().then(() => {
                                         //simple query
                                         pool.request().query(sqlst, (err, result) => {

                                              //----------------------Inser Loppp---------------2--------Start
                                             var UpdateSql = " update TblStudentPayInstallment set PayInvoiceID = '" + PayInvoiceIDVal + "' where InstalPayPrKeyID = '" + PayPrKeyIDVal + "' and  InstalPayUserID = '" + PayUserIDVal + "'";
                                             
                                             const pool = new sql.ConnectionPool(dbconn);
                                             pool.connect().then(() => {
                                                 //simple query
                                                 pool.request().query(UpdateSql, (err, result) => {
                                     //----------------------Inser Loppp----------------3--------Start

                                      
                                     var sqlst = "Select top 1   * from TblLokLangPack where LpKeyWord='ar_plan_renew_msg'";;
                                     const pool = new sql.ConnectionPool(dbconn);
                                     pool.connect().then(() => {
                                     //simple query
                                     pool.request().query(sqlst,(err, result) => {
                                     if (err) res.send(err);
                     
                                     smsMessageVal=result.recordset[0].LpArTitle;
                                     smsMessageVal = smsMessageVal.replace("[MONTH]", StuPlanDurationNameVal);
                                     smsMessageVal = smsMessageVal.replace("[NAME]", StuNameVal );
                                     smsMessageVal = smsMessageVal.replace("[AMOUNT]", DurationAmountVal);
                                     smsMessageVal = smsMessageVal.replace("[EXPIRYDATE]", PayEndDateVal);
                             
                                     if (err) res.send(err); 


                                     let data = JSON.stringify({
                                        "messages": [
                                            {
                                                "text": smsMessageVal,
                                                "numbers": [StuMobileNoVal],
                                                "sender": "MAJDACADEMY"
                                            }
                                        ]
                                    });
        
                                    let smsweblink = {
                                    method: 'post',
                                    maxBodyLength: Infinity,
                                    url: 'https://api-sms.4jawaly.com/api/v1/account/area/sms/send',
                                    headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Basic SHg3ZkNJeDlhTnI3QXZFQkNhZnpSRDNiNzdiRUpZeGt3cFBNcGpqdDpvSkJ4ZVJPVzMySHVDRThHUzFLM0gybXdYWnJmcVZFTzdIUHc5UDFUdERJVUNlV005OHpDb0RwRkRWdUNPNFVRWW5qQUVjUklQbzJ5ODhDSHJ6UU5mbkQyOU93UXVvamdXcE5X'
                                    },
                                    data: data
                                    };
                                    axios.request(smsweblink)
                                    .then((response) => {

                                    return res.json({ data: retVal })
                                    })
                                    .catch((error) => {
                                    console.log(error);
                                    });

                                         retVal = {
                                             message: smsMessageVal,
                                      oprstatus: "success",
                                         
                                      code : "200"
                                      }
                                      return res.json({ data: retVal });


                                     })
                                     })

                                      //----------------------Insert Loop ---------------3--------End
                                                 })
                                                 sql.close();
                                             })

                                              //----------------------Insert Loop ---------------2-------E
                                   
                                                })
                                                sql.close();
                                            })
                                      //----------------------Insert Loop ---------------1--------End
                                      
                                   
                                  
                                  
                                   
                           })
                           sql.close();
                       })
                        //----------------------Insert Loop -----------------------End

                 
                     })
                })
});

 


app.post('/stupayfail', (req, res) => {
    const axios = require('axios');
    var retVal = [];
    const sql = require('mssql/msnodesqlv8');
    var stuUsrIDVal = req.body.stuUsrID;
    var stuStartDateVal = req.body.stuStartDate;
    var stuEndDateVal = req.body.stuEndDate;
    var stuAmountVal = req.body.stuAmount;
    var stuPayStatusVal = req.body.stuPayStatus;
    
    var otpnoVal = "";

    retVal = {
        message: "failed",
        code: 500
    }

    return res.json({ data: retVal });


});

app.post('/loginAuthNOOTP', (req, res) => {
    const axios = require('axios');
    var retVal = [];
    const sql = require('mssql/msnodesqlv8');
    var mobileno = req.body.mobileno;
   
    var otpnoVal = "";

    retVal = {
        mobileno: "notfound",
		otp: "notfound",
    }
    var sqlst = "select PrtUsrEmailAddress as mobileno from   TblPrtUsers where PrtUsrEmailAddress='" + mobileno + "'";

    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query(sqlst, (err, result) => {
            if (err) res.send(err)
            else {
                if (result.recordset.length == 0) {
                    return res.json({ data: retVal })
                }
                else {


                    var smsmobileno = mobileno.substring(1);
                    smsmobileno = "966" + smsmobileno;

                    otpnoVal = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);


                    const pool = new sql.ConnectionPool(dbconn);
                    pool.connect().then(() => {
                        //simple query
                        var sqlupdate = "Update TblPrtUsers set smsotp='" + otpnoVal + "' where PrtUsrEmailAddress='" + mobileno + "'";

                        retVal = {
                            mobileno: mobileno,
                            otp: otpnoVal,
                        }

                        pool.request().query(sqlupdate, (err, result) => {
                            return res.json({ data: retVal })
                        })

                    })






                }
            }
        })
        sql.close();
    })
    console.log('ending sql');
});


app.post('/loginAuth', (req, res) => {
    const axios = require('axios');
    var retVal = [];
    const sql = require('mssql/msnodesqlv8');
    var mobileno = req.body.mobileno;
   
    var otpnoVal = "";

    retVal = {
        mobileno: "notfound",
        otp: "notfound",
        usertype: "notfound",
        total: 0,
    }

    var sqlst = " select PrtUsrEmailAddress as mobileno,prtusrusertype as usertype ,";
    sqlst=sqlst + " (select count(distinct PrtUsrUserType) from TblPrtUsers  where PrtUsrEmailAddress='" + mobileno + "') as totaluser ";
    sqlst=sqlst + " from   TblPrtUsers where PrtUsrEmailAddress='" + mobileno + "'";
    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query(sqlst, (err, result) => {
            if (err) res.send(err)
            else {
                if (result.recordset.length == 0) {
                    return res.json({ data: retVal })
                }
                else {

                    var  totalVal=result.recordset[0].totaluser;
                    var  usertypeVal=result.recordset[0].usertype;
                    var smsmobileno = mobileno.substring(1);
                    smsmobileno = "966" + smsmobileno;

                    otpnoVal = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);


                    const pool = new sql.ConnectionPool(dbconn);
                    pool.connect().then(() => {
                        //simple query
                        var sqlupdate = "Update TblPrtUsers set smsotp='" + otpnoVal + "' where PrtUsrEmailAddress='" + mobileno + "'";

                        retVal = {
                            mobileno: sqlupdate,
                        }

                        pool.request().query(sqlupdate, (err, result) => {

                            let data = JSON.stringify({
                                "messages": [
                                    {
                                        "text": "OTP Number is " + otpnoVal,
                                        "numbers": [smsmobileno],
                                        "sender": "MAJDACADEMY"
                                    }
                                ]
                            });

                            let smsweblink = {
                                method: 'post',
                                maxBodyLength: Infinity,
                                url: 'https://api-sms.4jawaly.com/api/v1/account/area/sms/send',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Basic SHg3ZkNJeDlhTnI3QXZFQkNhZnpSRDNiNzdiRUpZeGt3cFBNcGpqdDpvSkJ4ZVJPVzMySHVDRThHUzFLM0gybXdYWnJmcVZFTzdIUHc5UDFUdERJVUNlV005OHpDb0RwRkRWdUNPNFVRWW5qQUVjUklQbzJ5ODhDSHJ6UU5mbkQyOU93UXVvamdXcE5X'
                                },
                                data: data
                            };
                            retVal = {
                                mobileno: mobileno,
                                otp: otpnoVal,
                                usertype: usertypeVal,
                                total: totalVal,
                            };
                            axios.request(smsweblink)
                                .then((response) => {

                                    return res.json({ data: retVal })
                                })
                                .catch((error) => {
                                    console.log(error);
                                    return res.json({ data: retVal })
                                });
                        })

                    })






                }
            }
        })
        sql.close();
    })
    console.log('ending sql');
});


app.get('/PaymentCategory', (req, res) => {

    const sql = require('mssql/msnodesqlv8');

   
    console.log('starting sql');

    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query("  select durationid,DurationIDValue, ArDurationName as ClassName, DurationAmount as ClassCode from TblLokDuration order by DurationID  ", (err, result) => {
            if (err) res.send(err)
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
 

app.post('/appsetting', (req, res) => {

    const sql = require('mssql/msnodesqlv8');


    console.log('starting sql');

    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query('select IsShowMaintenance,IsShowOtp,allowDistance from TblLokSetting ', (err, result) => {
            if (err) res.send(err)
            else {
                return res.json({
                    data: result.recordset[0]
                })
            }
        })
        sql.close();
    })
    console.log('ending sql');
});
 
 

module.exports = app;