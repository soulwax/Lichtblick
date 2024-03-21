import { dirname, importx } from "@discordx/importer";
import {
  CategoryScale,
  Chart,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  TimeSeriesScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { log } from "console";
import { ActivityType, GatewayIntentBits, Partials } from "discord.js";
import { Client } from "discordx";
import "dotenv/config";
import { prisma } from "./prisma.js";
Chart.register(
  LineController,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  TimeSeriesScale,
  Filler,
);

const token = process.env.TOKEN;

// discord client config
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.User,
  ],
  silent: true,
  simpleCommand: {
    // prefix: "/",
  },
});

bot.once("ready", async () => {
  await bot.initApplicationCommands();
  log(`Logged in as ${bot.user?.tag}!`);
});

bot.on("interactionCreate", async (interaction) => {
  void bot.executeInteraction(interaction);
  
    // Ensure interaction is a command
    if (!interaction.isCommand()) return;

    // Prisma create CommandHistory entry
    try {
      await prisma.commandHistory.create({
        data: {
          username: interaction.user.username,
          user: interaction.user.id,
          channel: interaction.channelId,
          command: interaction.commandName
        },
      });
    } catch (error) {
      console.error("Error logging command history:", error);
    }

    console.log(interaction); // for now, just log the interaction
});

bot.on("messageCreate", (message) => void bot.executeCommand(message));

bot.on(
  "messageReactionAdd",
  (reaction, user) => void bot.executeReaction(reaction, user),
);

const main = async () => {
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Let's start the bot
  if (!token) {
    throw Error("Could not find TOKEN in your environment");
  }

  // Log in with your bot token
  await bot.login(token);

  bot.user?.setPresence({
    activities: [
      {
        name: "Imperial Cult Abominable Intelligence",
        type: ActivityType.Watching,
      },
    ],
  });
};

main();
