'use strict';
var path = require('path'),
    exec = require('child_process').exec;
var tool = {
    currentBranch: function(callback) {
        var This=this;
        exec('git symbolic-ref --short HEAD', function(error, stdout, stderr) {
            if (error) {
                console.log(error);
            }
            else{
                callback(stdout);
            }
        });
    },
    push: function(version) {
        this.pull("master",function(){
            if(/^\d+\.\d+\.\d+$/ig.test(version)){
                version="daily/"+version;
            }
            console.log("git push origin "+version);
            exec('git push origin '+version, function(error, stdout, stderr) {
                if (error) {
                    console.log(error);
                }
                else if(stdout){
                    console.log(stdout);
                }
                else if(stderr){
                    console.log(stderr);
                }

            });
        });
    },
    pull: function(version,callback) {
        if(/^\d+\.\d+\.\d+$/ig.test(version)){
            version="daily/"+version;
        }
        console.log("git pull origin "+version);
        exec('git pull origin '+version, function(error, stdout, stderr) {
            if (error) {
                console.log(error);
            }
            else if(stdout){
                console.log(stdout);
            }
            else if(stderr){
                console.log(stderr);
            }
            if(callback){
                callback();
            }

        });
    },
    publish: function(version) {
        if(/^\d+\.\d+\.\d+$/ig.test(version)){
            version="publish/"+version;
        }
        console.log("git tag "+version);
        exec('git tag '+version, function(error, stdout, stderr) {
            if (error) {
                console.log(error);
            }
            else if(stdout){
                console.log(stdout);
            }
            else if(stderr){
                console.log(stderr);
            }
            exec('git push origin '+version+":"+version, function(error, stdout, stderr) {
                    if (error) {
                        console.log(error);
                    }
                    else if(stdout){
                        console.log(stdout);
                    }
                    else if(stderr){
                        console.log(stderr);
                    }
                });
        });
    },
    newBranch: function(version) {
        if(!version){
            console.log('请输入有效分支名,示例：daily/0.0.1 或者 0.0.1');
            return false;
        }
        if (!/\d+\.\d+\.\d+$/ig.test(version)) {
            console.log('请输入有效分支名x.y.z,否则无法发布到cdn上');
        }
        exec('git checkout -b daily/' + version, function(err, stdout, stderr, cb) {
            console.log(('创建新分支：daily/' + version));
        });
    }
};
module.exports = {
    branch:function(version){
        if(version){
            tool.newBranch(version)
        }
        else{
            console.log('请输入有效分支名,示例：daily/0.0.1 或者 0.0.1');
        }
    },
    push:function(version){
        if(!version){
            tool.currentBranch(function(stdout){
                tool.push(stdout);
            })
        }
        else{
            tool.push(version);
        }
    },
    publish:function(version){
        if(!version){
            tool.currentBranch(function(stdout){
                stdout=stdout.replace("\n","");
                if(/^(daily\/)*\d+\.\d+\.\d+$/ig.test(stdout)){
                    stdout=stdout.replace(/daily\//,"");
                }
                tool.publish(stdout);
            })
        }
        else{
            tool.publish(version);
        }
    },
    pull:function(version){
        if(!version){
            tool.currentBranch(function(stdout){
                tool.pull(stdout);
            })
        }
        else{
            tool.pull(version);
        }
    }
}
