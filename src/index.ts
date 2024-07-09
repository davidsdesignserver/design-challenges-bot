import dotenv from 'dotenv';
import { Client, Collection, Events, GatewayIntentBits, Interaction, SlashCommandBuilder } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import config from '../config.json';

dotenv.config();

interface ExtendedClient extends Client {
    commands: Collection<string, { data: SlashCommandBuilder, execute: ((interaction: Interaction) => unknown) }>,
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as ExtendedClient;

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
	
    for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);        
        const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isAutocomplete()) { // Leaderboard option is the only autocomplete option as of now.
		const leaderboards = config.leaderboards;

		const filtered = leaderboards.filter(choice => choice.name.toLowerCase().startsWith(interaction.options.getFocused(true).value.toLowerCase())).slice(0, 25);

		await interaction.respond(
			filtered.map(choice => ({ name: choice.name, value: choice.name })),
		);
	}

	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error: any) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: error.message, ephemeral: true });
		} else {
			await interaction.reply({ content: error.message, ephemeral: true });
		}
	}
});

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.TOKEN);