'use strict';
var path = require('path'),
    //fs = require('fs'),
    fse = require('fs-extra'),
    os = require('os'),
    clc = require('cli-color'),
    spawn = require('child_process').spawn,
    log=console.log,
    pkgInfo = require('../lib/package.json'),
    //gruntFile = require('../lib/GruntFile.json'),
    fileTemp = require('../lib/file_temp.json'),
    progressBar = require('progress'),
    basedir = process.cwd();
function initProject(projectName,multiple){
    fse.exists("project.json",function(hasInstall){
        if(!hasInstall){
            fse.writeFileSync("project.json",'{"version":"0.0.0","requirejs":false,"less":true,"tpl":false}');
        }
        //return false;
        var dirs=fileTemp.dir,total=dirs.length,current=0;
        for(var i=0,j=dirs.length;i<j;i++){
            if(dirs[i].file){
                total++;
            }
        }
        var pkg=fse.readJsonSync("package.json");
        var projectInfo=fse.readJsonSync("project.json");
        if(multiple){
            if(!projectInfo.projectList){
                projectInfo.projectList=[];
            }
            //判断是否已经添加
            var hasAdded=false;
            for(var i=0;i<projectInfo.projectList.length;i++){
                if(projectInfo.projectList[i]==projectName){
                    hasAdded=true;
                    break;
                }
            }
            if(!hasAdded){
                 projectInfo.projectList.push(projectName);
            }
        }
        else{
            projectInfo.project=projectName;
        }
        fse.writeFileSync("project.json",JSON.stringify(projectInfo,null,"\t"));
        function mkfile(file,dirPath){
            if(file){
                file=file.replace("[project]",projectName?projectName:pkg.name);
                fse.exists(dirPath+"/"+file,function(hasInstall){
                    if(!hasInstall){
                        fse.writeFileSync(dirPath+"/"+file,"");
                        log("mkfile "+dirPath+"/"+file+" ok!");
                    }
                    current++;
                    if(total==current){
                        log(clc.xterm(10)("工程结构初始化完成！"));
                    }
                })
            }
        }
        for(var i=0,j=dirs.length;i<j;i++){
            (function(dir,i,j){
            var dirPath=dir.dirname,file=dir.file,isLast=(i==j-1);
            if(dirPath){
                if(multiple&&projectName){
                    dirPath=projectName+"/"+dirPath;
                }
                fse.exists(dirPath,function(hasInstall){
                    if(!hasInstall){
                        fse.mkdir(dirPath,function(){
                            //console.log(e)
                            mkfile(file,dirPath);
                        });
                        log("mkdir "+dirPath+" ok!");
                    }
                    else{
                        mkfile(file,dirPath);
                    }
                    current++;
                    if(total==current){
                        log(clc.xterm(10)("工程结构初始化完成！"));
                    }
                })
            }
            }(dirs[i],i,j))
        }
    })
}
function initGruntFile(){
    var fileStr='/*\n'
        +"* created by 习木(yelin.yl@alibab-inc.com)\n"
        +"*/\n"
        +"var path = require('path');\n"
        +"var grunt = require('./node_modules/kui/PublicGruntfile.js');\n"
        +"module.exports=grunt({\n"
        +"  basename:path.basename(__dirname)\n"
        +"});\n";
    fse.writeFileSync('GruntFile.js', fileStr);
}
function initEditorConfig(){
    var fileStr='# editorconfig文件定义一致的code style规范\n'
        +"# 根据不同的开发IDE或编辑器统一代码风格\n"
        +"详情见 editorconfig.org\n"
        +"root = true\n"
        +"[*]\n"
        +"charset = utf-8\n"
        +"end_of_line = lf\n"
        +"trim_trailing_whitespace = true\n";
        +"insert_final_newline = true\n";
        +"indent_style = space\n";
        +"indent_size = 4\n";
    fse.writeFileSync('.editorconfig', fileStr);
}
function initGitignore(){
    var arrList=['npm-debug.log',".tmp",".svn",".sass-cache",".DS_Store","*.iml","*.ipr","*.iws",
    ".idea/","node_modules","build/html","build/demo","Thumbs.db","ehthumbs.db","Desktop.ini",
    "$RECYCLE.BIN/"]
    var fileStr=arrList.join("\n");
    fse.writeFileSync('.gitignore', fileStr);
}
var tools = {
    envInfo: {
        isWin: /window/i.test(os.type()),
        ip: (function() {
            var ip = '127.0.0.1';
            var ifaces = os.networkInterfaces();
            // 获取本地IP地址,起服务器时使用ip地址
            Object.keys(ifaces).forEach(function(ifname) {
                var alias = 0;
                ifaces[ifname].forEach(function(iface) {
                    if ('IPv4' !== iface.family || iface.internal !== false) {
                        return;
                    }
                    if (iface.address.indexOf('10.1') >= 0) {
                      ip = iface.address;
                    }
                });
            });
            return ip;
        })()

    }
}

module.exports ={
    init:function(name,options,required) {
        if(required){
            if(!name){
                log(clc.xterm(196)("请输入项目名称！"));
                return false;
            }
        }
        fse.exists("package.json",function(hasInstall){
            if(!hasInstall){
                log(clc.xterm(196)("请切换到根目录！如果未初始化，请先运行 "+clc.xterm(165)('"kui install"')+" 初始化前端项目"));
                return false;
            }
            if(options&&options.multiple){
                if(typeof(options.multiple)!="string"){
                    log(clc.xterm(196)("请输入项目名称！"));
                    return false;
                }
                fse.exists(options.multiple,function(hasInstall){
                    if(!hasInstall){
                        fse.mkdir(options.multiple);
                        log("mkdir "+options.multiple+" ok!");
                    }
                    initProject(options.multiple,true);
                })
            }
            else if(required){
                fse.exists(name,function(hasInstall){
                    if(!hasInstall){
                        fse.mkdir(name);
                        log("mkdir "+name+" ok!");
                    }
                    initProject(name,true);
                })
            }
            else{
                initProject(name,false);
            }
        });
    },
    install:function(name) {
        if(!name){
            log(clc.xterm(196)("项目名不能为空！请尝试"+clc.xterm(165)('" kui install projectName "')));
            return false;
        }
        fse.exists("package.json",function(hasInstall){
            if(hasInstall){
                log(clc.xterm(196)("请不要重复初始化！如需重置请删除package.json。"));
                return false;
            }
            pkgInfo.name=name;
            fse.writeFileSync('package.json', JSON.stringify(pkgInfo,null,"\t"));
            initGruntFile();
            initEditorConfig();
            initGitignore();
            console.log('tnpm install 安装依赖');
            var bar = new progressBar(':bar', { complete: '-',
                incomplete: ' ',
                width: 20,
                total: 10
            });
            var internal=true;
            var timer = setInterval(function () {
                  bar.tick();
                  if(internal){
                      if(bar.curr>=bar.total-1){
                        bar.curr=0;
                      }
                  }
                  if (bar.complete) {
                    clearInterval(timer);
                    log(clc.xterm(10)("\n项目初始化完成！"));
                  }
            }, 100);
            var proc=spawn('cmd',['/c','tnpm install']).on('error', function( err ){
                console.log(err);
            });
            proc.stdout.on('data', function(data) {
                var buff = new Buffer(data);
                console.log("\n"+buff.toString('utf8'));
            });
            proc.on('exit', function(code) {
                if (code != 0) {
                    console.log('项目初始化失败，请手动执行tnpm install ' + code);
                    return false;
                }
                internal=false;
            });
        });
    },
    add:function(name) {
        if(!name){
            log(clc.xterm(196)(" 请输入文件名！"));
            return false;
        }
        fse.exists(name,function(hasInstall){
            if(hasInstall){
                log(clc.xterm(196)(name+"已经存在"));
                return false;
            }
            fse.writeFileSync(name,'');
            log(clc.xterm(10)(name+"新建成功"));
        });
    }
}