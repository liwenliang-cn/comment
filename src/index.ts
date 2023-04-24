import fetch from "node-fetch";
import { readFile, writeFile } from "fs/promises";
import { uniqBy } from "lodash";
import dayjs from "dayjs";
import path from "path";
import "dayjs/locale/zh-cn";
dayjs.locale("zh-cn");

const fetchComments = async () => {
  const response = await fetch(
    `https://m.weibo.cn/api/comments/show?id=Is9M7taaY&page=0`,
    {}
  );
  const commentJson = await response.json();
  return commentJson?.data?.data;
};

const processComments = (commentData) => {
  return commentData.map((item) => {
    const newTime = dayjs().format("YYYY-MM-DD A hh:mm dddd");
    let recordTime = newTime;

    if (item.created_at.includes("分")) {
      const time = item.created_at.split("分")[0];
      recordTime = dayjs()
        .subtract(time, "minute")
        .format("YYYY-MM-DD A hh:mm dddd");
    }

    if (item.created_at.includes("小时")) {
      const time = item.created_at.split("小时")[0];
      recordTime = dayjs()
        .subtract(time, "hour")
        .format("YYYY-MM-DD A hh:mm dddd");
    }

    return { ...item, recordTime };
  });
};

const readDataFile = async (filePath) => {
  try {
    const fileData = await readFile(filePath);
    return JSON.parse(fileData.toString());
  } catch (err) {
    return null;
  }
};

const writeDataFile = async (filePath, data) => {
  await writeFile(filePath, JSON.stringify(data));
};

const init = async () => {
  const date = dayjs().format("YYYY-MM-DD");
  const fileName = `${date}.json`;
  const filePath = path.resolve(__dirname, `../data/${fileName}`);

  const commentData = await fetchComments();
  const processedComments = processComments(commentData);

  const existingData = await readDataFile(filePath);
  let newData = processedComments;

  if (existingData) {
    newData = uniqBy([...existingData, ...processedComments], "id");
    newData.sort((a, b) => a.id - b.id);
  }

  await writeDataFile(filePath, newData);
};

init();
