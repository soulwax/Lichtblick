import type { CommandInteraction, User } from "discord.js";
import {
  ApplicationCommandOptionType,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { deleteUserMessages } from "../../lib/messages/deleteUserMessages.js";
import { LogService } from "../../lib/logs/Log.service.js";

@Discord()
export class DeleteMessages {
  @Slash({
    name: "delete-user-messages",
    description: "Deletes messages from a channel",
    defaultMemberPermissions: PermissionFlagsBits.DeafenMembers,
  })
  async deleteMessages(
    @SlashChoice({ name: "Previous 24 Hours", value: "1" })
    @SlashChoice({ name: "Previous 7 Days", value: "7" })
    @SlashOption({
      name: "days",
      description: "Delete message History",
      required: true,
      type: ApplicationCommandOptionType.Integer,
    })
    days: number,
    @SlashOption({
      name: "user",
      description: "Select existing user",
      type: ApplicationCommandOptionType.User,
    })
    user: User,
    @SlashOption({
      name: "user-id",
      description: "Input user ID which messages should be deleted",
      type: ApplicationCommandOptionType.String,
    })
    userId: string,
    @SlashOption({
      name: "jail",
      description: "Should user be jailed",
      type: ApplicationCommandOptionType.Boolean,
    })
    jail: boolean = false,
    interaction: CommandInteraction
  ) {
    LogService.logCommandHistory(interaction, "delete-user-messages");
    const memberId = user?.id ?? userId;
    const guildId = interaction.guild?.id;

    // check if user is administator
    const isAdmin =
      interaction.member instanceof GuildMember &&
      interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isAdmin! && memberId || !guildId) return;

    await interaction.deferReply({ ephemeral: true });

    await deleteUserMessages({
      days,
      guild: interaction.guild,
      memberId,
      jail,
      user,
    });

    // notify that messages were deleted
    await interaction.editReply({ content: "user messages are deleted" });
  }
}
