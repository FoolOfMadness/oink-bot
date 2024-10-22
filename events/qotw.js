//question of the week
const { CronJob } = require('cron');
const fs = require('fs');
const path = require('path');

//file paths
const questionsFilePath = path.join(__dirname, 'qotw.txt');
const recentQuestionsFilePath = path.join(__dirname, 'qotw.json');

//read questions from questions.txt file
const questions = fs
  .readFileSync(questionsFilePath, 'utf-8')
  .split('\n')
  .filter(Boolean);

//read recently asked questions from recentQuestions.json file
let recentQuestions = [];
if (fs.existsSync(recentQuestionsFilePath)) {
  recentQuestions = JSON.parse(
    fs.readFileSync(recentQuestionsFilePath, 'utf-8')
  );
}

//get a random question that hasn't been asked recently
const getRandomQuestion = () => {
  //reset recentQuestions when all questions have been asked
  if (recentQuestions.length === questions.length) {
    recentQuestions = [];
  }

  const availableQuestions = questions.filter(
    (q) => !recentQuestions.includes(q)
  );
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const question = availableQuestions[randomIndex];
  recentQuestions.push(question);

  //save the updated recentQuestions to the file
  fs.writeFileSync(
    recentQuestionsFilePath,
    JSON.stringify(recentQuestions, null, 2)
  );

  return question;
};

//real 1297844494028247040 test 1283043121751658593 cron 0 9 * * 1 cron test */5 * * * * *
//run every Monday at 09:00 server time
const qotw = (client) => {
  const job = new CronJob('0 9 * * 1', async () => {
    try {
      const channel = client.channels.cache.get('1297844494028247040');
      if (channel) {
        const question = getRandomQuestion();
        await channel.send(`**Question of the Week:** ${question}`);
      }
    } catch (error) {
      console.error(error);
    }
  });

  job.start();
};

module.exports = { qotw };
