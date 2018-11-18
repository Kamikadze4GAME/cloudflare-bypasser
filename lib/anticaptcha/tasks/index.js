'use strict'

const Task = require('./task');
const NoCaptchaTask = require('./noCaptchaTask');
const FunCaptchaTask = require('./funCaptchaTask');
const GeeTestTask = require('./geeTestTask');
const SquareNetTextTask = require('./squareNetTextTask');
const ImageToTextTask = require('./imageToTextTask');
const CustomCaptchaTask = require('./customCaptchaTask');


module.exports = {
  Task,
  NoCaptchaTask,
  FunCaptchaTask,
  GeeTestTask,
  SquareNetTextTask,
  ImageToTextTask,
  CustomCaptchaTask
};
