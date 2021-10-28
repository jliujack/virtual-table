/*
  用于 组件库发布使用，
  可以自动升级子版本或者获取命令行给定的版本。
*/

const path = require('path');
const shelljs = require('shelljs');
const program = require('commander');

const targetFile = path.resolve(__dirname, '../package.json');
const packagejson = require(targetFile);
const currentVersion = packagejson.version;
const versionArr = currentVersion.split('.');
const [mainVersion, subVersion, phaseVersion] = versionArr;

// 默认版本号
const defaultVersion = `${mainVersion}.${subVersion}.${+phaseVersion + 1}`;

let newVersion = defaultVersion;

// 从命令行参数中取版本号
program.option('-v, --versions <type>', 'Add release version number', defaultVersion);

program.parse(process.argv);

if (program.versions) {
  newVersion = program.versions;
}

function publish() {
  shelljs.sed('-i', `"version": "${currentVersion}"`, `"version": "${newVersion}"`, targetFile); // 修改版本号
  // shelljs.cd('..');
  shelljs.exec('npm publish'); // 发布
}

publish();
