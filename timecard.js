import fs from 'fs';
import minimist from 'minimist';
import moment from 'moment';
import ora from 'ora';
import puppeteer from 'puppeteer';
import login from './login';
import padLeft from './pad_left';

const config = JSON.parse(fs.readFileSync('./config.json'));
const argv = minimist(process.argv.slice(2));

let yyyymm;

if (argv.yyyymm) {
  yyyymm = argv.yyyymm;
} else {
  yyyymm = moment().format('YYYYMM');
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

    spinner = ora('タイムカード取得中').start();

    const url = `https://gws45.j-motto.co.jp/cgi-bin/${config['member_id']}/ztcard.cgi?cmd=tcardindex#date=${yyyymm}01`;
    await page.goto(url);

    const targetDateSelector = '.jtcard-fld-targetdate';
    await page.waitForFunction((selector) => {
      return /\d+(?=月)/.test(document.querySelector(selector).textContent);
    }, {}, targetDateSelector);

    const rows = await page.evaluate((selector) => {
      const month =
        /\d+(?=月)/
          .exec(document.querySelector(selector).textContent)[0];

      return Array.from(document.querySelectorAll('table.tcard-month tr'))
        .map((tr) => {
          const tdList = Array.from(tr.querySelectorAll('td'));
          if (tdList.length === 0) return null;

          const row = tdList.map(td => td.textContent.trim());

          const date = row[0].replace('(', ' (');
          const startTime = row[1] === '未入力' ? '' : row[1];
          const endTime = row[4] === '未入力' ? '' : row[4];

          let note = row[5].replace(/^\[|\]$/g, '');
          if (note.includes('遅刻')) note = '遅刻';
          if (note.includes('承認済み')) note = '修正';
          if (note.includes('午前休') || note.includes('午後休')) note = '半休';

          return [`${month}/${date}`, startTime, endTime, note];
        })
        .filter(tr => tr);
    }, targetDateSelector);

    spinner.succeed();
    browser.close();

    console.log();
    console.log(
      [
        padLeft('日付', 10),
        padLeft('出社', 10),
        padLeft('退社', 10),
        padLeft('就業時間', 10),
        padLeft('備考', 10)
      ].join('')
    );
    console.log();

    rows.forEach((row) => {
      const [date, startTime, endTime, note] = row;
      let diff = '';

      if (startTime !== '' && endTime !== '') {
        diff = moment.utc(
          moment.utc(endTime, 'HH:mm').diff(moment.utc(startTime, 'HH:mm'))
        ).format('HH:mm');
      }

      console.log(
        [
          padLeft(date, 10),
          padLeft(startTime, 10),
          padLeft(endTime, 10),
          padLeft(diff, 10),
          padLeft(note, 10)
        ].join('')
      );
    });
  } catch (error) {
    await page.screenshot({ path: 'error.png', fullPage: true });
    browser.close();
  }
})();
