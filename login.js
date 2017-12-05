import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./config.json'));
const loginUrl = 'https://www1.j-motto.co.jp/fw/dfw/po80/portal/jsp/J10201.jsp?https://www1.j-motto.co.jp/fw/dfw/gws/cgi-bin/aspioffice/iocjmtgw.cgi?cmd=login';

export default async (page) => {
  await page.goto(loginUrl);
  await page.type('#memberID', config['member_id']);
  await page.type('#userID', config['user_id']);
  await page.type('#password', config['password']);
  await page.click('[name=NAME_DUMMY04]');
  await page
    .waitForSelector('.portal-timecard', { timeout: 10000 })
    .catch(() => { throw new Error('ログインに失敗しました。')});

  return page;
};
