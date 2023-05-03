import {Telegraf} from "telegraf";
import config from 'config'
import {message} from 'telegraf/filters'
import {ogg} from "./ogg.js";
import {openai} from "./openai.js";

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))


bot.on(message('voice'), async ctx => {
    try {
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)

        const oggPath = await ogg.downloadFile(link.href, userId)
        const mp3Path = await ogg.convertToMp3(oggPath, userId)

        const text = await openai.transcription(mp3Path)
        const response = await openai.chat(text)

        await ctx.reply(JSON.stringify(link, null, 2))
    } catch (e) {
        console.log(e.message)
    }
})

bot.command('start', async (ctx) => {
    await ctx.reply(JSON.stringify(ctx.message, null, 2))
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))