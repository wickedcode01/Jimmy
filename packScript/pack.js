const fs = require('fs');
const join = require('path').join;
const moment = require('moment');
const path = require("path");
const getupdateTime = (path) =>{
    const time = fs.statSync(path);
    return {createTime:time.birthtime,updateTime:time.mtime}
}

function getFiles(txtPath) {
    let jsonFiles = [];
    function findJsonFile(path) {
      let files = fs.readdirSync(path);
      files.forEach(function (item, index) {
        let fPath = join(path, item);
        let stat = fs.statSync(fPath);
        if (stat.isDirectory() === true) {
          findJsonFile(fPath);
        }
        if (stat.isFile() === true) {
          jsonFiles.push(fPath);
        }
      });
    }
    findJsonFile(txtPath);
    console.log(jsonFiles);
    return jsonFiles;
  }
const targetPath = path.resolve(__dirname,'../txt');
 const paths = getFiles(targetPath) || [];
 const list = [];
 const article = {};
 console.log('开始读取...');
 paths.forEach((path)=>{
    const title = path.replace(targetPath+'\\','').split('.')[0];
    console.log(title,'读取中');
    const time = getupdateTime(path);
    const file = fs.readFileSync(path,'utf-8');
    const id = moment.utc(time.createTime).valueOf();
    list.push({title,ct:time.createTime,ut:time.updateTime,brief:file.slice(0,20),id});
    article[id] = {title,ct:time.createTime,ut:time.updateTime,content:file}
 })

 console.log('开始写入...');

 fs.writeFile(path.resolve(__dirname,'../list.js'),'var lists='+JSON.stringify(list),()=>{console.log('列表写入完成')});
 fs.writeFile(path.resolve(__dirname,'../article.js') ,'var articles='+JSON.stringify(article),()=>{console.log('文章写入完成')});