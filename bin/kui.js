#!/usr/bin/env node
var program = require('commander');
var appInfo = require('../package.json');
var projectTool = require('../task/projectTask.js');
var gitTool = require('../task/gitTask.js');
var log = console.log;
var basedir = process.cwd();
program
    .version(appInfo.version)
    .usage('[command] [options]')
    .on('--help', function() {
        log('    install 初始化工程基础配置,package.json,GruntFile.js等');
        log('            例：kui install issue');
        log();
        log('    init    初始化目录结构,按照前端目录规范一键创建');
        log('            例：单项目初始化 kui init issue');
        log('            例：多项目初始化 kui init -m issue');
        log();
        log('    new     多项目新建项目');
        log('            例：kui new issue2 等同 kui init -m issue2');
        log();
        log('    add     新建文件');
        log('            例：kui add issue2.js');
        log();
        log('    部署相关：[branch]为可选值，例："daily/0.0.1"或者"0.0.1"，默认为当前分支；');
        log();
    });
program
    .command('install [projectName]')
    .description('工程初始化！')
    .action(function(name){
        projectTool.install(name);
    })

program
    .command('init [projectName]')
    .option("-m, --multiple [projectName]", "多项目目录")
    .description('目录初始化！')
    .action(function(name,options){
        projectTool.init(name,options);
    })
program
    .command('new [projectName]')
    .description('新增子项目！')
    .action(function(name){
        projectTool.init(name,null,true);
    })
program
    .command('add [fileName]')
    .description('添加文件')
    .action(function(name){
        projectTool.add(name);
    })
program
    .command('branch [branch]')
    .description('新建branch,[branch]可选，默认当前分支；')
    .action(function(name){
        gitTool.branch(name);
    })
program
    .command('pull [branch]')
    .description('更新分支,[branch]可选，默认当前分支；')
    .action(function(name){
        gitTool.pull(name);
    })
program
    .command('push [branch]')
    .description('发布分支,[branch]可选，默认当前分支；')
    .action(function(name){
        gitTool.push(name);
    })
program
    .command('publish [branch]')
    .description('发布线上,[branch]可选，默认当前分支；')
    .action(function(name){
        gitTool.publish(name);
    })

program.parse(process.argv);
