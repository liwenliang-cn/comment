"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = require("fs");
const lodash_1 = require("lodash");
const dayjs_1 = __importDefault(require("dayjs"));
const path_1 = __importDefault(require("path"));
require("dayjs/locale/zh-cn");
dayjs_1.default.locale("zh-cn");
const cwd = process.cwd();
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const date = (0, dayjs_1.default)().format("YYYY-MM-DD");
    const fileName = `${date}.json`;
    const filePath = path_1.default.resolve(__dirname, `../data/${fileName}`);
    const comment = yield (0, node_fetch_1.default)(`https://m.weibo.cn/api/comments/show?id=Is9M7taaY&page=0`, {});
    const commentJson = yield comment.json();
    const commentData = (_a = commentJson === null || commentJson === void 0 ? void 0 : commentJson.data) === null || _a === void 0 ? void 0 : _a.data;
    commentData.forEach((item, index) => {
        var _a, _b;
        const newTime = (0, dayjs_1.default)().format("YYYY-MM-DD A hh:mm dddd");
        commentData[index].recordTime = newTime;
        if (item.created_at.indexOf("分") >= 0) {
            const time = (_a = item.created_at) === null || _a === void 0 ? void 0 : _a.split("分")[0];
            if (time) {
                const newTime = (0, dayjs_1.default)()
                    .subtract(time, "minute")
                    .format("YYYY-MM-DD A hh:mm dddd");
                commentData[index].originTime = (0, dayjs_1.default)().subtract(time, "minute");
                commentData[index].recordTime = newTime;
            }
        }
        if (item.created_at.indexOf("小时") >= 0) {
            const time = (_b = item.created_at) === null || _b === void 0 ? void 0 : _b.split("小时")[0];
            if (time) {
                const newTime = (0, dayjs_1.default)()
                    .subtract(time, "hour")
                    .format("YYYY-MM-DD A hh:mm dddd");
                commentData[index].originTime = (0, dayjs_1.default)().subtract(time, "hour");
                commentData[index].recordTime = newTime;
            }
        }
    });
    (0, fs_1.readFile)(filePath, function (err, fileData) {
        if (fileData) {
            // if file exist then read file and append data
            const beforeString = fileData.toString();
            const beforeData = JSON.parse(beforeString);
            let newComment = [...beforeData, ...commentData];
            // remove duplicate
            newComment = (0, lodash_1.uniqBy)(newComment, "id");
            // sort by id
            newComment = newComment.sort((a, b) => {
                return a.id - b.id;
            });
            console.log(`数据 ${newComment.length}`);
            if (newComment && newComment.length) {
                (0, fs_1.writeFile)(filePath, JSON.stringify(newComment), function (err) {
                    if (err) {
                        return console.error(err);
                    }
                });
            }
        }
        else {
            // if file not exist then create file and write data
            (0, fs_1.writeFile)(filePath, JSON.stringify([...commentData]), function (err) {
                if (err) {
                    return console.error(err);
                }
            });
        }
    });
});
init();
