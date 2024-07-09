import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('DDS Leaderboard Bot Commands'),
	async execute(interaction: ChatInputCommandInteraction) {
		const embed = new EmbedBuilder()
			.setTitle('DDS Leaderboard Bot Help')
			.setColor(Colors.Yellow)
			.setDescription(help);

		await interaction.reply({ ephemeral: true, embeds: [embed] });
	},
};

const help = `**/rank** Get the rank of yourself or another member.

**/leaderboard** View rankings of a leaderboard.

**/add** Admin only command to add points to a member.

**/set** Admin only command to set points of a member. Set points to 0 to remove from leaderboard.`;