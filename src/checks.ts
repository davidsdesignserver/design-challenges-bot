import { GuildMember } from 'discord.js';

// Throws error if member running the command does not have admin role.
export function checkAdmin(member: GuildMember) { 
    const admin = process.env.ADMIN as string;

    if (!member.roles.cache.has(admin)) throw new Error('You\'re not allowed to run this command!');
}