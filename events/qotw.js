//question of the week
const { CronJob } = require('cron');

//list of questions
const questions = [
  "What's your favourite book and why?",
  'If you could travel anywhere in the world, where would you go?',
  "What's a skill you'd like to learn and why?",
  "What's your favourite memory from childhood?",
  'If you could have any superpower, what would it be and why?',
  "What's the most interesting place you've ever visited?",
  'If you could meet any fictional character, who would it be and why?',
  "What's your favorite hobby and how did you get into it?",
  'If you could instantly become an expert in something, what would it be?',
  "What's the best piece of advice you've ever received?",
  'If you could live in any historical period, which one would you choose and why?',
  "What's your favourite movie and what do you love about it?",
  'If you could change one thing about the world, what would it be?',
  "What's a goal you have for the next year?",
];

//recently asked questions
let recentQuestions = [];

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

  return question;
};

//real 1297844494028247040 test 1283043121751658593 cron 0 9 * * 1 cron test */5 * * * * *
//run every Monday at 09:00 server time
const qotw = (client) => {
  const job = new CronJob('0 9 * * 1', async () => {
    try {
      const channel = client.channels.cache.get('1283043121751658593');
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
