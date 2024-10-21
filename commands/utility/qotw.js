//question of the week
const { CronJob } = require('cron');

//list of questions
const questions = [
  "What's your favorite book and why?",
  'If you could travel anywhere in the world, where would you go?',
  "What's a skill you'd like to learn and why?",
  "What's your favorite memory from childhood?",
  'If you could have dinner with any historical figure, who would it be?',
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

//run every Monday at 09:00 server time
const qotw = (client) => {
  const job = new CronJob('0 9 * * 1', async () => {
    const channel = client.channels.cache.get('qotw_ChannelID');
    if (channel) {
      const question = getRandomQuestion();
      await channel.send(`**Question of the Week:** ${question}`);
    }
  });

  job.start();
};

module.exports = { qotw };
