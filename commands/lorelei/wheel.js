//wheel command
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

//name of slash command & description
const data = new SlashCommandBuilder()
  .setName('wheel')
  .setDescription('Spin a wheel to randomly select an option')
  .addStringOption((option) =>
    option
      .setName('options')
      .setDescription('Comma-separated list of options (1,2,3,4)')
      .setRequired(true)
  );

//spin the wheel
const execute = async (interaction) => {
  try {
    const optionsInput = interaction.options.getString('options');
    const options = optionsInput.split(',').map((option) => option.trim());

    //validate at least 2 options
    if (options.length < 2) {
      await interaction.reply('Please provide at least two options.');
      return;
    }

    //shuffle the options
    const shuffledOptions = (options) => {
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      return options;
    };

    //make the embed
    let embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('🎡 Wheel of Fortune 🎡')
      .setDescription('Spinning the wheel...')
      .addFields({ name: 'Options:', value: options.join(', ') })
      .setThumbnail(interaction.member.displayAvatarURL());

    //send the initial embed
    const message = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });

    //loop to spin the wheel, embed colours as a stand-in for a gif
    for (let i = 0; i < shuffledOptions.length; i++) {
      embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('🎡 Wheel of Fortune 🎡')
        .setDescription(`Spinning the wheel...`)
        .addFields({ name: 'Options:', value: shuffledOptions.join(', ') })
        .addFields({ name: 'Current Selection:', value: shuffledOptions[i] })
        .setThumbnail(interaction.member.displayAvatarURL());

      await message.edit({ embeds: [embed] });
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    //select outcome
    const selectedOption = shuffledOptions[0];

    //final embed
    embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('🎡 Wheel of Fortune 🎡')
      .setDescription(
        `The wheel has stopped! The selected option is **${selectedOption}**.`
      )
      .addFields({ name: 'Options:', value: options.join(', ') })
      .setThumbnail(interaction.member.displayAvatarURL());

    await message.edit({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content:
        'Something went wrong while spinning... <:nyaSad:1250106743514599435>',
      ephemeral: true,
    });
  }
};

module.exports = { data, execute };
