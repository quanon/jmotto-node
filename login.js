import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./config.json'));
const loginUrl = 'https://www1.j-motto.co.jp/fw/dfw/po80/portal/jsp/J10201.jsp?https://www1.j-motto.co.jp/fw/dfw/gws/cgi-bin/aspioffice/iocjmtgw.cgi?cmd=login';

export default async (page) => {
  await page.goto(loginUrl, { waitUntil: 'networkidle' });
  await page.focus('#memberID');
  await page.type(config['member_id']);
  await page.focus('#userID');
  await page.type(config['user_id']);
  await page.focus('#password');
  await page.type(config['password']);
  await page.click('[name=NAME_DUMMY04]');
  await page.waitForSelector('.portal-timecard', { timeout: 10000 })
    .catch(() => { throw new Error('ログインに失敗しました。')});

  return page;
};
