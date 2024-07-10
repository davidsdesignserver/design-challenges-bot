import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { checkAdmin } from '../../checks';
import config from '../../config.json';
import { updateMember } from '../../database/leaderboard';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Add to a member\'s points.')
        .addUserOption(option =>
            option  
                .setName('member')
                .setDescription('Add points to which member.')
                .setRequired(true),
        )
        .addStringOption(option =>
            option
                .setName('leaderboard')
                .setDescription('Which leaderboard to edit points of.')
                .setAutocomplete(true)
                .setRequired(true),
        )
        .addNumberOption(option =>
            option  
                .setName('points')
                .setDescription('How many points to add.')
                .setRequired(true),
        ),
	async execute(interaction: ChatInputCommandInteraction) {
		const user = interaction.options.getUser('member');
        const leaderboardName = interaction.options.getString('leaderboard');
        const points = interaction.options.getNumber('points');

        if (user == null || user == null || leaderboardName == null || points == null || interaction.member == null) throw new Error('All options must be specified.');

        checkAdmin(interaction.member);

        const leaderboard = config.leaderboards.find(leaderboard => leaderboard.name == leaderboardName);

        if (leaderboard == undefined) throw new Error('Leaderboard not found.');

        await updateMember(user.id, leaderboard.database, { increment: points });

        await interaction.reply({ ephemeral: true, content: 'Added ' + points + ' points to <@' + user.id + '>.' });
 	},
};