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
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  let page = await browser.newPage();
  let spinner;

  try {
    spinner = ora('ログイン中').start();

    await login(page).catch((error) => {
      spinner.fail(error.message);
      throw error;
    });

    spinner.succeed();

    const btnSelector = `.portal-timecard-${kintai.type} input.portal-timecard-btn`;
    const btnVisible = () => {
      return page.evaluate((selector) => {
        return document.querySelector(selector).offsetParent !== null;
      }, btnSelector);
    }

    if (await btnVisible()) {
      spinner = ora('打刻中').start();

      while (true) {
        if (await btnVisible()) {
          await page.click(btnSelector);
        } else {
          break;
        }
        await sleep(50);
      }

      spinner.succeed();
    } else {
      console.log(`※ ${kintai.label}時刻は打刻済みです。`);
    }

    const [startTime, endTime] = await Promise.all(
      ['start', 'end'].map(async (type) => {
        const timeSelector = `.portal-timecard-${type} .portal-timecard-time`;
        const time = await page.evaluate((selector) => {
          return document.querySelector(selector).textContent;
        }, timeSelector);

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
  } catch (error) {
    await page.screenshot({ path: 'error.png', fullPage: true });
  }

  browser.close();
})();
