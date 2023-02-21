import fetch from "node-fetch";
import { readFile, writeFile } from "fs";
import { uniqBy } from "lodash";
import dayjs from "dayjs";
import path from "path";
import "dayjs/locale/zh-cn";
dayjs.locale("zh-cn");

const cwd = process.cwd();

const init = async () => {
  const date = dayjs().format("YYYY-MM-DD");
  const fileName = `${date}.json`;
  const filePath = path.resolve(__dirname, `../data/${fileName}`);

  const comment = await fetch(
    `https://m.weibo.cn/api/comments/show?id=Is9M7taaY&page=0`,
    {}
  );

  const commentJson = await comment.json();

  const commentData = commentJson?.data?.data;

  commentData.forEach((item, index) => {
    const newTime = dayjs().format("YYYY-MM-DD A hh:mm dddd");
    commentData[index].recordTime = newTime;

    if (item.created_at.indexOf("分") >= 0) {
      const time = item.created_at?.split("分")[0];
      if (time) {
        const newTime = dayjs()
          .subtract(time, "minute")
          .format("YYYY-MM-DD A hh:mm dddd");
        commentData[index].originTime = dayjs().subtract(time, "minute");
        commentData[index].recordTime = newTime;
      }
    }

    if (item.created_at.indexOf("小时") >= 0) {
      const time = item.created_at?.split("小时")[0];
      if (time) {
        const newTime = dayjs()
          .subtract(time, "hour")
          .format("YYYY-MM-DD A hh:mm dddd");
        commentData[index].originTime = dayjs().subtract(time, "hour");
        commentData[index].recordTime = newTime;
      }
    }
  });

  readFile(filePath, function (err, fileData) {
    if (fileData) {
      // if file exist then read file and append data
      const beforeString = fileData.toString();
      const beforeData = JSON.parse(beforeString);
      const newComment = uniqBy([...beforeData, ...commentData], "id");

      console.log(`数据 ${newComment.length}`);

      if (newComment && newComment.length) {
        writeFile(filePath, JSON.stringify(newComment), function (err) {
          if (err) {
            return console.error(err);
          }
        });
      }
    } else {
      // if file not exist then create file and write data
      writeFile(filePath, JSON.stringify([...commentData]), function (err) {
        if (err) {
          return console.error(err);
        }
      });
    }
  });
};

init();
