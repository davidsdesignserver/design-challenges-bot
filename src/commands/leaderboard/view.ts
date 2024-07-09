import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Colors, EmbedBuilder, Interaction, SlashCommandBuilder } from 'discord.js';
import config from '../../../config.json';
import { getLeaderboard } from '../../database/leaderboard';

// For spacing on embed
const spacer = '<:spacer:1260096272166293584>';
const bigspacer = '\n<:spacer:1260096272166293584><:spacer:1260096272166293584><:spacer:1260096272166293584><:spacer:1260096272166293584><:spacer:1260096272166293584><:spacer:1260096272166293584><:spacer:1260096272166293584><:spacer:1260096272166293584><:spacer:1260096272166293584><:spacer:1260096272166293584><:spacer:1260096272166293584><:spacer:1260096272166293584><:spacer:1260096272166293584><:spacer:1260096272166293584>\n'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View a leaderboard.')
        .addStringOption(option =>
            option
                .setName('leaderboard')
                .setDescription('Which leaderboard to view.')
                .setAutocomplete(true)
                .setRequired(true),
        ),
	async execute(interaction: ChatInputCommandInteraction) {
        handleLeaderboard(interaction, interaction.options.getString('leaderboard'), 0);
    },  
};

async function handleLeaderboard(interaction: ButtonInteraction | ChatInputCommandInteraction, leaderboardName: string | null, page: number) {
    if (leaderboardName == null) throw new Error('All options must be specified.');

    const leaderboard = config.leaderboards.find(leaderboard => leaderboard.name == leaderboardName);

    if (leaderboard == undefined) throw new Error('Leaderboard not found.');

    const ranks = await getLeaderboard(leaderboard.database, page);

    const embed = new EmbedBuilder()
        .setAuthor({ name: 'david\'s design server' })
        .setTitle(leaderboard.name + ' Leaderboard')
        .setColor(Colors.Green)
        .setDescription(ranks.entries.length != 0 ? ranks.entries.reduce((prev, current, index) => {
            const rank = (() => {
                switch (index + 1 + (page * 10)) {
                    case 1:
                        return ':first_place:';
                    case 2:
                        return ':second_place:';
                    case 3:
                        return ':third_place:';
                    default:
                        return '**#' + (index + 1 + (page * 10)) + '**';
                }
            })();

            return prev + rank + ' - <@' + current.id + '>\n' + spacer + current.points + ' Points\n\n';
        }, bigspacer).trimEnd() + bigspacer : 'No points set.')
        .setFooter({ text: 'Page ' + (page + 1) + ' of ' + (Math.floor(ranks.size / 10) + 1) + '.' });

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setEmoji('⏪')
                .setCustomId(JSON.stringify({ page: 0, type: '0', leaderboard: leaderboardName }))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page == 0),
            new ButtonBuilder()
                .setEmoji('⬅️')
                .setCustomId(JSON.stringify({ page: page - 1, type: '1', leaderboard: leaderboardName }))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page == 0),
            new ButtonBuilder()
                .setEmoji('➡️')
                .setCustomId(JSON.stringify({ page: page + 1, type: '2', leaderboard: leaderboardName }))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(Math.floor(ranks.size / 10) == page),
            new ButtonBuilder()
                .setEmoji('⏩')
                .setCustomId(JSON.stringify({ page: Math.floor(ranks.size / 10), type: '3', leaderboard: leaderboardName }))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(Math.floor(ranks.size / 10) == page),
        ]);
        
    const response = interaction.isButton() ? await interaction.update({
        embeds: [embed],
        components: [row],
    }) : await interaction.reply({
        embeds: [embed],
        components: [row],
    });


    const collectorFilter = (i: Interaction) => i.user.id === interaction.user.id;

    try {
        const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

        if (!confirmation.isButton()) return;

        const info = JSON.parse(confirmation.customId);

        if (!('leaderboard' in info) || typeof info.leaderboard != 'string' || !('page' in info) || typeof info.page != 'number') return;

        handleLeaderboard(confirmation, info.leaderboard, info.page);
    } catch (e) {
        await interaction.editReply({ components: [] });
    }
}