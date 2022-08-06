import { PrismaClient } from '@prisma/client';
import type { Message } from 'discord.js';

const prisma = new PrismaClient();

export const addMessageDb = async (message: Message<boolean>) => {
  // check if disboard bump command was used

  // get info
  const content = message.content;
  const memberId = message.member?.user.id;
  const channelId = message.channelId;
  const messageId = message.id;
  const guildId = message.guild?.id;

  // if info doesnt exist
  if (!content || !guildId || !memberId || message.interaction?.user.bot)
    return;

  await prisma.memberMessages.create({
    data: {
      channelId,
      guildId,
      memberId,
      messageId,
    },
  });
};