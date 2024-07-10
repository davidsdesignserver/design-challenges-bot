import { APIInteractionDataResolvedGuildMember, GuildMember } from 'discord.js';

// Throws error if member running the command does not have admin role.
export function checkAdmin(member: GuildMember | APIInteractionDataResolvedGuildMember) { 
    const admin = process.env.ADMIN as string;

    if ('id' in member ? !member.roles.cache.has(admin) : !member.roles.includes(admin)) throw new Error('You\'re not allowed to run this command!');
}