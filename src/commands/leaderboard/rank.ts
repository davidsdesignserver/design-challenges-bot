import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import config from '../../../config.json';
import { getMember, getRank } from '../../database/leaderboard';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Get your rank and points on a leaderboard.')
        .addStringOption(option =>
            option
                .setName('leaderboard')
                .setDescription('Which leaderboard to edit points of.')
                .setAutocomplete(true)
                .setRequired(true),
        )
        .addUserOption(option =>
            option  
                .setName('member')
                .setDescription('Get rank of a member.'),
        ),
	async execute(interaction: ChatInputCommandInteraction) {
        const leaderboardName = interaction.options.getString('leaderboard');

        if (leaderboardName == null) throw new Error('All options must be specified.');

        const leaderboard = config.leaderboards.find(leaderboard => leaderboard.name == leaderboardName);

        if (leaderboard == undefined) throw new Error('Leaderboard not found.');

        const user = interaction.options.getUser('member') ?? interaction.user;

        const ranking = await getMember(user.id, leaderboard.database);

        const embed = new EmbedBuilder()
            .setAuthor({ iconURL: user.avatarURL() ?? user.defaultAvatarURL ?? '', name: user.displayName ?? user.username })
            .setColor(Colors.Green)
            .setDescription('Rank: **#' + await getRank(leaderboard.database, ranking.id, ranking.points) + '**\nPoints: **' + ranking.points + '**')
            .setFooter({ text: leaderboard.name + ' Leaderboard' });
        
        await interaction.reply({ embeds: [embed] });
    },
};