import minimist from 'minimist';
import moment from 'moment';
import ora from 'ora';
import puppeteer from 'puppeteer';
import login from './login';
import sleep from './sleep';

const argv = minimist(process.argv.slice(2));
let kintai;

if (argv.kin && !argv.tai) {
  kintai = {
    type: 'start',
    label: '出社'
  };
} else if (!argv.kin && argv.tai) {
  kintai = {
    type: 'end',
    label: '退社'
  };
} else {
  console.log('オプションで --kin あるいは --tai を指定してください。');
  process.exit(1);
}

(async() => {
  const browser = await puppeteer.launch();
  let page = await browser.newPage();
  let spinner;

  spinner = ora('ログイン中').start();
  await login(page);
  spinner.succeed();

  const btnSelector = `.portal-timecard-${kintai.type} input.portal-timecard-btn`;
  const btnVisible = () => {
    return page.evaluate(`document.querySelector('${btnSelector}').offsetParent !== null`);
  }

  if (await btnVisible()) {
    spinner = ora('打刻中').start();

    while (true) {
      await page.click(btnSelector);
      if (await btnVisible() === false) break;
      await sleep(50);
    }

    spinner.succeed();
  } else {
    console.log(`※ ${kintai.label}時刻は打刻済みです。`);
  }

  const [startTime, endTime] = await Promise.all(
    ['start', 'end'].map(async (type) => {
      const timeSelector = `.portal-timecard-${type} .portal-timecard-time`;
      const time = await page.evaluate(`document.querySelector('${timeSelector}').textContent`);

      return time.replace(/-/g, '');
    })
  );

  if (startTime) console.log(`出社時刻は ${startTime} です。`);

  if (startTime && endTime) {
    const diff = moment.utc(
      moment.utc(endTime, 'HH:mm').diff(moment.utc(startTime, 'HH:mm'))
    ).format('HH:mm');

    console.log(`退社時刻は ${endTime} です。`);
    console.log(`就業時間は ${diff} です。`);
  }

  browser.close();
})();
