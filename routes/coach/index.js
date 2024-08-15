const express = require('express');
const app = express();
var crypto = require('crypto');
const moment = require('moment')
const bodyParser = require('body-parser');
const cors = require("cors");
const fs = require('fs');
const dbconn = require('../../config/dbconn');
// Set maximum payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.post('/getCoachInfo', (req, res) => {

    const sql = require('mssql/msnodesqlv8');
    var CoachUserIDVal = req.body.CoachUserID;
    console.log('starting sql');


    var sqlst = " SELECT CoachFirstName,CoachLastName,CoachDOB,CoachMobileNo,CoachEmailAddress,CoachPhyGenderID,EnNationalityName ,";
    sqlst = sqlst + "  concat('https://almajd-acad.com/zkm/Uploads/Coach/', CoachPhoto )  as CoachPhoto from TblCoachInfo ";
    sqlst = sqlst + " where CoachUserID = '" + CoachUserIDVal + "'";
    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query(sqlst, (err, result) => {
            if (err) res.send(err);

            return res.json({
                data: result.recordset
            })

        })
        sql.close();
    })
    console.log('ending sql');
});
app.post('/getCoachGroupInfo', (req, res) => {

    const sql = require('mssql/msnodesqlv8');
    var CoachUserIDVal = req.body.CoachUserID;
    console.log('starting sql');


    var sqlst = " SELECT  distinct groupid,GroupInfoDTCoachUserID , ";
    sqlst = sqlst + " (select concat(GroupClassTimeFrom,'To',GroupClassTimeTo) from TblGroupInfo  where GroupID=TblGroupInfoDayTime.groupid) as GroupTime,";
    sqlst = sqlst + "( Select  concat('https://almajd-acad.com/zkm/Uploads/Coach/', CoachPhoto ) from TblCoachInfo where CoachUserID=TblGroupInfoDayTime.GroupInfoDTCoachUserID ) as CoachPhoto, ";
    sqlst = sqlst + " (select GroupClassDays from TblGroupInfo  where GroupID=TblGroupInfoDayTime.groupid) as GroupClassDays,";
    sqlst = sqlst + " (select GroupName from TblGroupInfo  where GroupID=TblGroupInfoDayTime.groupid) as GroupName,";
    sqlst = sqlst + " (select count(StuID) from TblStudentInfo where  StuPlanStatus != 'EXPIRED' and   StuAgeGroupID =TblGroupInfoDayTime.groupid) as totstudent";
    sqlst = sqlst + " FROM  TblGroupInfoDayTime   ";
    sqlst = sqlst + " where GroupInfoDTCoachUserID = '" + CoachUserIDVal + "'";
    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query(sqlst, (err, result) => {
            if (err) res.send(err);

            return res.json({
                data: result.recordset
            })

        })
        sql.close();
    })
    console.log('ending sql');
});


app.post('/OldsubmitAttendence', (req, res) => {
    const axios = require('axios');
    var retVal = [];
    const sql = require('mssql/msnodesqlv8');





    var stuUsrID = req.body.stuUsrID;

    var StuAttendStartDate = req.body.StuAttendStartDate;
    var StuAttendEndDate = req.body.StuAttendEndDate;
    var StuAttendStatus = req.body.StuAttendStatus;

    var date = StuAttendStartDate.split("/");
    var StuAttendMonthID = date[1];
    var StuAttendDayID = date[2];
    var StuAttendID = "";
    var sqlst = "";




    sqlst = " insert into  TblStudentAttendenceInfo ";
    sqlst = sqlst + " (StuAttendID,StuUserID,StuAttendMonthID,StuAttendStartDate,StuAttendEndDate,StuAttendStatus,StuAttendDayID) VALUES ";


    for (let i = 0; i < stuUsrID.length; i++) {
        const crypto = require('crypto');
        let StuAttendID = crypto.randomBytes(16).toString('hex');
        sqlst = sqlst + "  ('" + StuAttendID + "','" + stuUsrID[i] + "','" + StuAttendMonthID + "','" + StuAttendStartDate + "','" + StuAttendEndDate + "','" + StuAttendStatus + "','" + StuAttendDayID + "') ,";

    }

    // Insert Record -----------if does not exist-------------------------------
    sqlst = sqlst.slice(0, -1);

    retVal = {
        message: "success",
        code: 200,
    }


    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        pool.request().query(sqlst, (err, result) => {

            if (err) res.send(err)
            else {

                retVal = {
                    message: "success",
                    code: 200,
                    data: sqlst
                }
                return res.json({
                    data: retVal
                })
            }

        })
        sql.close();
    })

    // Insert Record -----------if does not exist-------------------------------

    //lp


});

async function AttendenceInsert(StuAttendID, StuUserIDVal, StuAttendMonthID, StuAttendStartDate, StuAttendEndDate, StuAttendStatus, StuAttendDayID, CreatedBy, CreatedDate) {
    const result1 = await WaitFnAttendenceInsert(StuAttendID, StuUserIDVal, StuAttendMonthID, StuAttendStartDate, StuAttendEndDate, StuAttendStatus, StuAttendDayID, CreatedBy, CreatedDate);
}

async function AttendenceUpdate(StuUserIDVal, StuAttendStartDate, StuAttendStatus) {
    const result1 = await WaitfnAttendenceUpdate(StuUserIDVal, StuAttendStartDate, StuAttendStatus);
}
WaitfnAttendenceUpdate = (StuUserIDVal, StuAttendStartDate, StuAttendStatus) => {
    return new Promise((resolve, reject) => {

        const axios = require('axios');

        const sql = require('mssql/msnodesqlv8');
        var UpdateRec = "update TblStudentAttendenceInfo set StuAttendStatus='" + StuAttendStatus + "' where   Convert(varchar, StuAttendStartDate,111) = Convert(varchar, '" + StuAttendStartDate + "',111)  and StuUserID='" + StuUserIDVal + "'";
        const newpool = new sql.ConnectionPool(dbconn);
        newpool.connect().then(() => {
            newpool.request().query(UpdateRec, (err, result) => {




            })
            sql.close();
        })
    });
};


WaitFnAttendenceInsert = (StuAttendID, StuUserIDVal, StuAttendMonthID, StuAttendStartDate, StuAttendEndDate, StuAttendStatus, StuAttendDayID, CreatedBy, CreatedDate) => {
    return new Promise((resolve, reject) => {


        const axios = require('axios');

        const sql = require('mssql/msnodesqlv8');

        var chksql = " Select   StuUserID  from  TblStudentAttendenceInfo where   Convert(varchar, StuAttendStartDate,111) = Convert(varchar, '" + StuAttendStartDate + "',111)  and StuUserID='" + StuUserIDVal + "'";

        const newpool = new sql.ConnectionPool(dbconn);
        newpool.connect().then(() => {
            newpool.request().query(chksql, (err, newresult) => {

                if (newresult.recordset.length == 0) {
                    //--------------------------------
                    var sqlst = ` insert into  TblStudentAttendenceInfo  (StuAttendID,StuUserID,StuAttendMonthID,StuAttendStartDate,StuAttendEndDate,StuAttendStatus,StuAttendDayID,CreatedBy,CreatedDate,ModifyBy,ModifyDate)
            VALUES    ('`+ StuAttendID + `','` + StuUserIDVal + `','` + StuAttendMonthID + `','` + StuAttendStartDate + `','` + StuAttendEndDate + `','` + StuAttendStatus + `','` + StuAttendDayID + `','` + CreatedBy + `','` + CreatedDate + `','` + CreatedBy + `','` + CreatedDate + `')`;
console.log(sqlst);
                    const newpool = new sql.ConnectionPool(dbconn);
                    newpool.connect().then(() => {
                        newpool.request().query(sqlst, (err, result) => {
                        })
                        sql.close();
                    })
                }
                //---------------------------------

            })
            sql.close();
        })

    });
};

app.post('/submitAttendence', (req, res) => {

    let TotalInsRec = "";
    const axios = require('axios');
    var retVal = [];
    const sql = require('mssql/msnodesqlv8');
    var stuUsrID = req.body.stuUsrID;
    var StuAttendStartDate = req.body.StuAttendStartDate;
    var StuAttendEndDate = req.body.StuAttendEndDate;
    var StuAttendStatus = req.body.StuAttendStatus;




   var CreatedBy = req.body.CreatedBy;
    var CreatedDate = req.body.CreatedDate;
  // var todayDate = new Date().toISOString().slice(0, 10);
    


    var chksql = "";
    var date = StuAttendStartDate.split("/");
    var StuAttendMonthID = date[1];
    var StuAttendDayID = date[2];
    var StuAttendID = "";
    var sqlst = "";
    var updatepwdsql = "";
    var UpdateSql = 0;
    let SqlAr = [];

    SqlAr.push(sqlst);
    for (let i = 0; i < stuUsrID.length; i++) {
        const crypto = require('crypto');
        let StuAttendID = crypto.randomBytes(16).toString('hex');
        let StuUserIDVal = stuUsrID[i];
        chksql = " Select   StuUserID  from  TblStudentAttendenceInfo where   Convert(varchar, StuAttendStartDate,111) = Convert(varchar, '" + StuAttendStartDate + "',111)  and StuUserID='" + StuUserIDVal + "'";

        const pool = new sql.ConnectionPool(dbconn);
        pool.connect().then(() => {
            //simple query
            pool.request().query(chksql, (err, result) => {


                if (err) res.send(err)
                if (result.recordset.length == 0) {

                    AttendenceInsert(StuAttendID, StuUserIDVal, StuAttendMonthID, StuAttendStartDate, StuAttendEndDate, StuAttendStatus, StuAttendDayID, CreatedBy, CreatedDate);

                }
                else {
                    AttendenceUpdate(StuUserIDVal, StuAttendStartDate, StuAttendStatus);
                }


            })
            sql.close();
        })

        retVal = {
            message: "success",
            code: 200,
            data: UpdateSql
        }
        TotalInsRec = TotalInsRec + StuUserIDVal;
    }
    return res.json({
        data: retVal,
        TotalInsRec: TotalInsRec
    })

    // for(let i = 0; i < stuUsrID.length; i++)
    //     {
    //  chksql = " Select StuUserID  from  TblStudentAttendenceInfo";
    //  where   Convert(varchar, StuAttendStartDate,111) = Convert(varchar, '"+StuAttendStartDate+"',111)  and StuUserID='" + stuUsrID[i] + "'";
    // const pool = new sql.ConnectionPool(dbconn);
    // pool.connect().then(() => {
    // pool.request().query(chksql, (err, result) => {

    // if (err) res.send(err)
    // if (result.recordset.length == 0) {

    // const crypto = require('crypto');
    // let StuAttendID = crypto.randomBytes(16).toString('hex');
    // sqlst=sqlst+"  ('"+StuAttendID+"','"+stuUsrID[i]+"','"+StuAttendMonthID+"','"+StuAttendStartDate+"','"+StuAttendEndDate+"','"+StuAttendStatus+"','"+StuAttendDayID+"') ,";       
    //   TotalInsRec++;
    // }
    // else
    // {


    //     // //------------------------------
    //     updatepwdsql = "update TblPrtUsers set StuAttendStatus='" + StuAttendStatus + "' where   Convert(varchar, StuAttendStartDate,111) = Convert(varchar, '"+StuAttendStartDate+"',111)  and StuUserID='" + stuUsrID[i] + "'";
    //     const pool = new sql.ConnectionPool(dbconn);
    //     pool.connect().then(() => {
    //         pool.request().query(updatepwdsql, (err, result) => {

    //         })
    //         sql.close();
    //     })
    //     //-------------------------
    //     UpdateSql++;
    // }

    // })
    // sql.close();
    // })
    //  }

    // retVal = {  message: "success",   code: 200, stuUsrID:stuUsrID, data :sqlst ,chksql : chksql ,updatepwdsql: updatepwdsql,TotalInsRec:TotalInsRec,UpdateSql:UpdateSql}
    //  return res.json({  data: retVal  })   
    // Insert Record -----------if does not exist-------------------------------
    // if (TotalInsRec > 0 )
    // {

    //      sqlst = sqlst.slice(0, -1); 
    //      const pool = new sql.ConnectionPool(dbconn);
    //      pool.connect().then(() => {
    //      pool.request().query(sqlst, (err, result) => {

    //      if (err) res.send(err)
    //      else 
    //      {
    //         return res.json({  data: retVal  })
    //      }

    //      })
    //      sql.close();
    //      })


    // }
    // Insert Record -----------if does not exist-------------------------------

    // return res.json({  data: retVal  })   
});
app.post('/getStuInfoByGroupid', (req, res) => {

    const sql = require('mssql/msnodesqlv8');
    var GroupID = req.body.GroupID;
    var StuAttendStartDate = req.body.StuAttendStartDate;

    

    var sqlst = "SELECT  StuUserID, StuFirstName,StuLastName,  StuProfileImage, CAST(0 AS bit) AS value, StuID as id, StuFirstName as title,";
    sqlst = sqlst + " (select top 1 StuAttendCoachComment from TblStudentAttendenceInfo   Where  TblStudentAttendenceInfo.StuUserID=TblStudentInfo.StuUserID and  Convert(varchar, StuAttendStartDate,111) = Convert(varchar, '" + StuAttendStartDate + "',111) ) as StuAttendCoachComment  ,";
    sqlst = sqlst + " (select top 1 StuAttendStatus from TblStudentAttendenceInfo   Where  TblStudentAttendenceInfo.StuUserID=TblStudentInfo.StuUserID and  Convert(varchar, StuAttendStartDate,111) = Convert(varchar, '" + StuAttendStartDate + "',111) ) as StuAttendStatus  ,";
    sqlst = sqlst + " (select top 1 concat('https://almajd-acad.com/zkm/Uploads/Coach/', (SELECT distinct  x.CoachPhoto FROM  TblCoachInfo x, TblGroupInfoDayTime y  Where x.CoachUserID = y.GroupInfoDTCoachUserID and  y.GroupID = TblStudentInfo.StuAgeGroupID)  )) as CoachPhoto,  ";
    sqlst = sqlst + " FORMAT (StuDOB, 'dd-MMM-yyyy ')  as StuDOB ,StuPlanStatus FROM TblStudentInfo where  StuPlanStatus != 'EXPIRED' and   StuAgeGroupID = '" + GroupID + "'";
console.log(sqlst);

    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query(sqlst, (err, result) => {
            if (err) res.send(err);


            return res.json({
                data: result.recordset
            })

        })
        sql.close();
    })
    console.log('ending sql');
});
app.post('/getStuInfoByGroupidWSD', (req, res) => {

    const sql = require('mssql/msnodesqlv8');
    var whereSql="";
    var GroupID = req.body.GroupID;
    var StuStatYearNo = req.body.StuStatYearNo;
    var StuStatMonthNo = req.body.StuStatMonthNo;
    var StuUserID=req.body.StuUserID;
    if (StuUserID !="NODATA")
      whereSql=" and StuUserID='"+StuUserID+"'";
    console.log('starting sql');

    var sqlst = "SELECT  StuUserID, StuFirstName,StuLastName,  StuProfileImage, CAST(0 AS bit) AS value, StuID as id, StuFirstName as title,";
    sqlst = sqlst + " (SELECT  StuExercise FROM  TblStuStatisticsData  where TblStuStatisticsData.StuUserID=TblStudentInfo.StuUserID  and StuStatMonthNo='" + StuStatMonthNo + "' and StuStatYearNo='" + StuStatYearNo + "' and StuGroupID ='" + GroupID + "') as StuExercise  ,";
    sqlst = sqlst + " (SELECT  StuBehavior FROM  TblStuStatisticsData  where TblStuStatisticsData.StuUserID=TblStudentInfo.StuUserID  and StuStatMonthNo='" + StuStatMonthNo + "' and StuStatYearNo='" + StuStatYearNo + "' and StuGroupID ='" + GroupID + "') as StuBehavior  ,";
    sqlst = sqlst + " (SELECT  StuMultiplayer FROM  TblStuStatisticsData  where TblStuStatisticsData.StuUserID=TblStudentInfo.StuUserID  and StuStatMonthNo='" + StuStatMonthNo + "' and StuStatYearNo='" + StuStatYearNo + "' and StuGroupID ='" + GroupID + "') as StuMultiplayer  ,";
    sqlst = sqlst + " (SELECT  StuOtherNote FROM  TblStuStatisticsData  where TblStuStatisticsData.StuUserID=TblStudentInfo.StuUserID  and StuStatMonthNo='" + StuStatMonthNo + "' and StuStatYearNo='" + StuStatYearNo + "' and StuGroupID ='" + GroupID + "') as StuOtherNote  ,";
    sqlst = sqlst + " (SELECT  StuMonthlyImprovement FROM  TblStuStatisticsData  where TblStuStatisticsData.StuUserID=TblStudentInfo.StuUserID  and StuStatMonthNo='" + StuStatMonthNo + "' and StuStatYearNo='" + StuStatYearNo + "' and StuGroupID ='" + GroupID + "') as StuMonthlyImprovement  ,";

      sqlst = sqlst + " (select  concat('https://almajd-acad.com/zkm/Uploads/Coach/', (SELECT distinct  x.CoachPhoto FROM  TblCoachInfo x, TblGroupInfoDayTime y  Where x.CoachUserID = y.GroupInfoDTCoachUserID and  y.GroupID = TblStudentInfo.StuAgeGroupID)  )) as CoachPhoto  ";
    sqlst = sqlst + " FROM TblStudentInfo where  StuAgeGroupID = '" + GroupID + "'"+whereSql;

    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query(sqlst, (err, result) => {
            if (err) res.send(err);


            return res.json({
                data: result.recordset
            })

        })
        sql.close();
    })
    console.log('ending sql');
});

app.post('/getCoachData', (req, res) => {

    const sql = require('mssql/msnodesqlv8');
    var CoachUserIDVal = req.body.CoachUserID;
    console.log('starting sql');



    var sqlst = " select sum(GroupName) as totalgroup, sum(totstudent) as totalstudent from (";
    sqlst = sqlst + " SELECT  distinct  ";
    sqlst = sqlst + " (select count(GroupName) from TblGroupInfo  where GroupID=TblGroupInfoDayTime.groupid) as GroupName, ";
    sqlst = sqlst + " (select count(StuID) from TblStudentInfo where StuAgeGroupID =TblGroupInfoDayTime.groupid) as totstudent ";
    sqlst = sqlst + " FROM  TblGroupInfoDayTime    ";
    sqlst = sqlst + " where GroupInfoDTCoachUserID = '" + CoachUserIDVal + "'";
    sqlst = sqlst + " )   temp ";


    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query(sqlst, (err, result) => {
            if (err) res.send(err);

            return res.json({
                data: result.recordset[0]
            })

        })
        sql.close();
    })
    console.log('ending sql');
});


//--- Coach Comments -----------------------------------------------------------
async function CoachCommentInsert(StuAttendID, StuUserIDVal, StuAttendMonthID, StuAttendStartDate, StuAttendEndDate, StuAttendCoachComment, StuAttendDayID, CreatedBy, CreatedDate) {
    const result1 = await WaitFnCoachCommentInsert(StuAttendID, StuUserIDVal, StuAttendMonthID, StuAttendStartDate, StuAttendEndDate, StuAttendCoachComment, StuAttendDayID, CreatedBy, CreatedDate);
}

async function CoachCommentUpdate(StuUserIDVal, StuAttendStartDate, StuAttendCoachComment) {
    const result1 = await WaitfnCoachCommentUpdate(StuUserIDVal, StuAttendStartDate, StuAttendCoachComment);
}
WaitfnCoachCommentUpdate = (StuUserIDVal, StuAttendStartDate, StuAttendCoachComment) => {
    return new Promise((resolve, reject) => {

        const axios = require('axios');

        const sql = require('mssql/msnodesqlv8');
        var UpdateRec = "update TblStudentAttendenceInfo set StuAttendCoachComment='" + StuAttendCoachComment + "' where   Convert(varchar, StuAttendStartDate,111) = Convert(varchar, '" + StuAttendStartDate + "',111)  and StuUserID='" + StuUserIDVal + "'";
        const newpool = new sql.ConnectionPool(dbconn);
        newpool.connect().then(() => {
            newpool.request().query(UpdateRec, (err, result) => {




            })
            sql.close();
        })
    });
};


WaitFnCoachCommentInsert = (StuAttendID, StuUserIDVal, StuAttendMonthID, StuAttendStartDate, StuAttendEndDate, StuAttendCoachComment, StuAttendDayID, CreatedBy, CreatedDate) => {
    return new Promise((resolve, reject) => {


        const axios = require('axios');

        const sql = require('mssql/msnodesqlv8');

        var chksql = " Select   StuUserID  from  TblStudentAttendenceInfo where   Convert(varchar, StuAttendStartDate,111) = Convert(varchar, '" + StuAttendStartDate + "',111)  and StuUserID='" + StuUserIDVal + "'";

        const newpool = new sql.ConnectionPool(dbconn);
        newpool.connect().then(() => {
            newpool.request().query(chksql, (err, newresult) => {

                if (newresult.recordset.length == 0) {
                    //--------------------------------
                    var sqlst = ` insert into  TblStudentAttendenceInfo  (StuAttendID,StuUserID,StuAttendMonthID,StuAttendStartDate,StuAttendEndDate,StuAttendCoachComment,StuAttendDayID,CreatedBy,CreatedDate,ModifyBy,ModifyDate)
                VALUES    ('`+ StuAttendID + `','` + StuUserIDVal + `','` + StuAttendMonthID + `','` + StuAttendStartDate + `','` + StuAttendEndDate + `','` + StuAttendCoachComment + `','` + StuAttendDayID + `','` + CreatedBy + `','` + CreatedDate + `','` + CreatedBy + `','` + CreatedDate + `')`;

                    const newpool = new sql.ConnectionPool(dbconn);
                    newpool.connect().then(() => {
                        newpool.request().query(sqlst, (err, result) => {
                        })
                        sql.close();
                    })
                }
                //---------------------------------

            })
            sql.close();
        })

    });
};

app.post('/submitCoachComment', (req, res) => {

    let TotalInsRec = "";
    const axios = require('axios');
    var retVal = [];
    const sql = require('mssql/msnodesqlv8');
    var stuUsrID = req.body.stuUsrID;
    var StuAttendStartDate = req.body.StuAttendStartDate;
    var StuAttendEndDate = req.body.StuAttendStartDate;
    var StuAttendCoachComment = req.body.StuAttendCoachComment;
     var CreatedBy = req.body.CreatedBy;
     var CreatedDate = req.body.CreatedDate;

    //var todayDate = new Date().toISOString().slice(0, 10);
   // var CreatedDate= todayDate;
    

 

    var chksql = "";
    var date = StuAttendStartDate.split("/");
    var StuAttendMonthID = date[1];
    var StuAttendDayID = date[2];
    var StuAttendID = "";
    var sqlst = "";
    var updatepwdsql = "";
    var UpdateSql = 0;
    let SqlAr = [];

    SqlAr.push(sqlst);
    for (let i = 0; i < stuUsrID.length; i++) {
        const crypto = require('crypto');
        let StuAttendID = crypto.randomBytes(16).toString('hex');
        let StuUserIDVal = stuUsrID[i];
        chksql = " Select   StuUserID  from  TblStudentAttendenceInfo where   Convert(varchar, StuAttendStartDate,111) = Convert(varchar, '" + StuAttendStartDate + "',111)  and StuUserID='" + StuUserIDVal + "'";

        const pool = new sql.ConnectionPool(dbconn);
        pool.connect().then(() => {
            //simple query
            pool.request().query(chksql, (err, result) => {


                if (err) res.send(err)
                if (result.recordset.length == 0) {

                    CoachCommentInsert(StuAttendID, StuUserIDVal, StuAttendMonthID, StuAttendStartDate, StuAttendEndDate, StuAttendCoachComment, StuAttendDayID, CreatedBy, CreatedDate);

                }
                else {
                    CoachCommentUpdate(StuUserIDVal, StuAttendStartDate, StuAttendCoachComment);
                }


            })
            sql.close();
        })

        retVal = {
            message: "success",
            code: 200,
            data: UpdateSql
        }
        TotalInsRec = TotalInsRec + StuUserIDVal;
    }
    return res.json({
        data: retVal,
        TotalInsRec: TotalInsRec
    })


});

//--- Coach Comments -----------------------------------------------------------

app.get('/getMonthList', (req, res) => {

    const sql = require('mssql/msnodesqlv8');


    console.log('starting sql');

    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        //simple query
        pool.request().query('select MonthName,MonthCode from TblLokMonth order by MID desc', (err, result) => {
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


//--------------------------------------------------------------------------------submitStuStaticsData---------------------------------------------
app.post('/submitStuStaticsData', (req, res) => {

    var chksql = "";
    const axios = require('axios');
    var retVal = [];
    const sql = require('mssql/msnodesqlv8');
    var StuUserIDVal = req.body.StuUserID;
    var StuGroupID = req.body.StuGroupID;
    var StuExercise = req.body.StuExercise;
    var StuBehavior = req.body.StuBehavior;
    var StuMultiplayer = req.body.StuMultiplayer;
    var StuMonthlyImprovement = req.body.StuMonthlyImprovement;
    var StuOtherNote = req.body.StuOtherNote;
    var CoachUserID = req.body.CoachUserID;
  


    var CreatedBy = req.body.CreatedBy;
     var CreatedDate = req.body.CreatedDate;
   // var todayDate = new Date().toISOString().slice(0, 10);
   // var CreatedDate= todayDate;
   // var CreatedBy= "SYSTEM";
    
    var StuStatMonthNo = req.body.StuStatMonthNo;
    var StuStatYearNo = req.body.StuStatYearNo;

    var DuplicateDataSql = "";

    const crypto = require('crypto');
    let StuStatID = crypto.randomBytes(16).toString('hex');

    var chksql = " Select   StuUserID  from  TblStudentInfo where  StuUserID='" + StuUserIDVal + "'";
    const pool = new sql.ConnectionPool(dbconn);
    pool.connect().then(() => {
        pool.request().query(chksql, (err, result) => {

            if (err) res.send(err)
            if (result.recordset.length == 0) {
                retVal = {
                    message: "fail",
                    code: 400,

                }
            }
            else {

                DuplicateDataSql = " Select   StuUserID  from  TblStuStatisticsData where  StuStatYearNo='" + StuStatYearNo + "' and  StuStatMonthNo='" + StuStatMonthNo + "'  and StuUserID='" + StuUserIDVal + "'";


                const pool = new sql.ConnectionPool(dbconn);
                pool.connect().then(() => {
                    pool.request().query(DuplicateDataSql, (err, result) => {
                        if (err) res.send(err)
                        if (result.recordset.length == 0) {


                            var sqlst = ` insert into  TblStuStatisticsData  (StuStatID,StuUserID,StuGroupID,StuExercise,StuBehavior,StuMultiplayer,StuMonthlyImprovement,StuOtherNote,CoachUserID,CreatedBy,CreatedDate,ModifyBy,ModifyDate,StuStatMonthNo,StuStatYearNo)
                                                        VALUES    ('`+ StuStatID + `','` + StuUserIDVal + `','` + StuGroupID + `','` + StuExercise + `','` + StuBehavior + `','` + StuMultiplayer + `','` + StuMonthlyImprovement + `','` + StuOtherNote + `','` + CoachUserID + `','` + CreatedBy + `','` + CreatedDate + `','` + CreatedBy + `','` + CreatedDate + `','` + StuStatMonthNo + `','` + StuStatYearNo + `')`;

                            const newpool = new sql.ConnectionPool(dbconn);
                            newpool.connect().then(() => {
                                newpool.request().query(sqlst, (err, result) => {

                                })
                                sql.close();
                            })



                        }
                        else {


                            var UpdateRec = "update TblStuStatisticsData set";
                            UpdateRec = UpdateRec + " StuExercise='" + StuExercise + "',";
                            UpdateRec = UpdateRec + " StuBehavior='" + StuBehavior + "',";
                            UpdateRec = UpdateRec + " StuMultiplayer='" + StuMultiplayer + "',";
                            UpdateRec = UpdateRec + " StuMonthlyImprovement='" + StuMonthlyImprovement + "',";
                            UpdateRec = UpdateRec + " StuOtherNote='" + StuOtherNote + "'";

                            UpdateRec = UpdateRec + " where    StuUserID='" + StuUserIDVal + "' and  StuGroupID='" + StuGroupID + "' and  StuStatMonthNo='" + StuStatMonthNo + "' and  StuStatYearNo='" + StuStatYearNo + "'";
                            const newpool = new sql.ConnectionPool(dbconn);
                            newpool.connect().then(() => {
                                newpool.request().query(UpdateRec, (err, result) => {




                                })
                                sql.close();
                            })

                        }

                        retVal = {
                            message: "success",
                            code: 200,

                        }

                        return res.json({
                            data: retVal,
                            // chksql : chksql,
                            // DuplicateDataSql: DuplicateDataSql,
                            length: result.recordset.length,
                            ins: sqlst,
                            update: UpdateRec



                        })

                    })
                    sql.close();
                })

            } //else



        })
        sql.close();
    })







});

UpdateStuStatDate = (StuUserIDVal, StuGroupID, StuExercise, StuBehavior, StuMultiplayer, StuMonthlyImprovement, StuOtherNote, StuStatMonthNo, StuStatYearNo) => {
    return new Promise((resolve, reject) => {

        const axios = require('axios');
        const sql = require('mssql/msnodesqlv8');

    });
};



//--------------------------------------------------------------------------------submitStuStaticsData---------------------------------------------

module.exports = app;