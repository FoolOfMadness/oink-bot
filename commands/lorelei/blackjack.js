//blackjack game command
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');

//name of slash command & description
const data = new SlashCommandBuilder()
  .setName('blackjack')
  .setDescription('Play a game of blackjack');

//instantiate arrays
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'Jack',
  'Queen',
  'King',
  'Ace',
];

//create the deck
const createDeck = () => {
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  return deck;
};

//shuffle the deck
const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

//get value of hand
const handValue = (hand) => {
  let value = 0;
  let aceCount = 0;
  for (let card of hand) {
    if (['Jack', 'Queen', 'King'].includes(card.value)) {
      value += 10;
    } else if (card.value === 'Ace') {
      aceCount++;
      value += 11;
    } else {
      value += parseInt(card.value);
    }
  }
  //converts ace value when over 21
  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }
  return value;
};

//start the game
const execute = async (interaction) => {
  await interaction.reply('Game is starting right nyaow!');

  //declare variables
  let deck = shuffleDeck(createDeck());
  let playerHand = [deck.pop(), deck.pop()];
  let oinkHand = [deck.pop(), deck.pop()];
  let playerStand = false;
  let gameOver = false;
  const playerName = interaction.member.displayName;
  const dealerName = interaction.client.user.displayName;

  //buttons
  const btnHit = new ButtonBuilder()
    .setCustomId('hit')
    .setLabel('Hit')
    .setStyle(ButtonStyle.Secondary);

  const btnStand = new ButtonBuilder()
    .setCustomId('stand')
    .setLabel('Stand')
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(btnHit, btnStand);

  //game embed
  let embed = new EmbedBuilder()
    .setColor('LuminousVividPink')
    .setTitle('🃏 Blackjack Table 🃏')
    .addFields({
      name: `${playerName}'s hand:`,
      value: `${handToString(playerHand)} (Value: ${handValue(playerHand)})`,
    })
    .addFields({
      name: `${dealerName}'s hand:`,
      value: `${handToString([oinkHand[0]])} and [Hidden]`,
    })
    .setThumbnail(interaction.member.displayAvatarURL());

  //send embed of blackjack game
  const message = await interaction.followUp({
    embeds: [embed],
    components: [row],
  });

  const interactionFilter = (i) => i.user.id === interaction.member.id;

  //check for blackjack
  if (handValue(playerHand) === 21) {
    await interaction.followUp(`Blackjack! ${playerName} wins!`);
    return;
  }

  //repeat until game is over
  while (!gameOver) {
    //display hands, 1 of OinkBot's cards are hidden
    embed = new EmbedBuilder()
      .setColor('LuminousVividPink')
      .setTitle('🃏 Blackjack Table 🃏')
      .addFields({
        name: `${playerName}'s hand:`,
        value: `${handToString(playerHand)} (Value: ${handValue(playerHand)})`,
      })
      .addFields({
        name: `${dealerName}'s hand:`,
        value: `${handToString([oinkHand[0]])} and [Hidden]`,
      })
      .setThumbnail(interaction.member.displayAvatarURL());

    await message.edit({ embeds: [embed] });

    //hit or stand
    if (!playerStand) {
      let action;
      try {
        action = await message.awaitMessageComponent({
          filter: interactionFilter,
          time: 120_000, // 2 minute time limit
        });
      } catch (e) {
        // this happens when we don't receive an interaction within the time limit
        await message.edit({ components: [] }); // removes the buttons
        return interaction.followUp({
          content:
            'You ran out of time to play! <:nyaAngry:1251302942456414218>',
          ephemeral: true,
        }); // exit command here
      }
      //hit
      if (action.customId === 'hit') {
        playerHand.push(deck.pop());
        //TODO this is ugly, find a better way
        embed = new EmbedBuilder()
          .setColor('LuminousVividPink')
          .setTitle('🃏 Blackjack Table 🃏')
          .addFields({
            name: `${playerName}'s hand:`,
            value: `${handToString(playerHand)} (Value: ${handValue(
              playerHand
            )})`,
          })
          .addFields({
            name: `${dealerName}'s hand:`,
            value: `${handToString([oinkHand[0]])} and [Hidden]`,
          })
          .setThumbnail(interaction.member.displayAvatarURL());
        await action.update({ embeds: [embed] });
        if (handValue(playerHand) > 21) {
          await interaction.followUp(
            `Bust! <:derplei:1254435482108956782> ${playerName} loses. <:smuglei:1271465346439708742>`
          );
          gameOver = true;
        }
        //stand
      } else if (action.customId === 'stand') {
        await action.update({ components: [] });
        playerStand = true;
      }
    } else {
      //OinkBot hits on 16, stands on 17
      while (handValue(oinkHand) < 17) {
        oinkHand.push(deck.pop());
      }
      //TODO this is ugly, find a better way
      embed = new EmbedBuilder()
        .setColor('LuminousVividPink')
        .setTitle('🃏 Blackjack Table 🃏')
        .addFields({
          name: `${playerName}'s hand:`,
          value: `${handToString(playerHand)} (Value: ${handValue(
            playerHand
          )})`,
        })
        .addFields({
          name: `${dealerName}'s hand:`,
          value: `${handToString(oinkHand)} (Value: ${handValue(oinkHand)})`,
        })
        .setThumbnail(interaction.member.displayAvatarURL());
      await message.edit({ embeds: [embed], components: [] });

      //determine outcome logic
      if (handValue(oinkHand) > 21) {
        await interaction.followUp(
          `${dealerName} busts! <:derplei:1254435482108956782> ${playerName} wins! <:nyaAngry:1251302942456414218>`
        );
      } else if (handValue(oinkHand) > handValue(playerHand)) {
        await interaction.followUp(
          `${dealerName} wins! <:smuglei:1271465346439708742>`
        );
      } else if (handValue(oinkHand) < handValue(playerHand)) {
        await interaction.followUp(
          `${playerName} wins! <:nyaOver:1285789027701886986>`
        );
      } else {
        await interaction.followUp(
          `It's a draw! ${dealerName} wins by default. <:nyaSmug:1251617158056640653>`
        );
      }
      gameOver = true;
    }
  }
};

//toString for displaying card hands
const handToString = (hand) => {
  return hand.map((card) => `${card.value} of ${card.suit}`).join(', ');
};

module.exports = { data, execute };
