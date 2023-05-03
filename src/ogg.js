import axios from "axios";
import ffmpeg from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'
import {createWriteStream} from 'fs'
import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'

import {removeFile} from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
    constructor() {
        ffmpeg.setFfmpegPath(installer.path)
    }

    convertToMp3(path, filename) {
        try {
            const fileNamePath = resolve(dirname(path), `${filename}.mp3`)
            return new Promise((resolve, reject) => {
                ffmpeg(path).inputOption('-t 30')
                    .output(fileNamePath)
                    .on('end', () => {
                        removeFile(path)
                        resolve(fileNamePath)
                    })
                    .on('error', err => reject(err.message))
                    .run()
            })
        } catch (e) {
            console.log('Error convert file', e.message)
        }
    }

    async downloadFile(url, filename) {
        try {
            const filePath = resolve(__dirname, '../voices', `${filename}.ogg`)
            const response = await axios({
                method: 'GET',
                url,
                responseType: 'stream'
            })
            return new Promise(resovle => {
                const steam = createWriteStream(filePath)
                response.data.pipe(steam)
                steam.on('finish', () => resovle(filePath))
            })
        } catch (e) {
            console.log('Error download file', e.message)
        }
    }
}

export const ogg = new OggConverter()