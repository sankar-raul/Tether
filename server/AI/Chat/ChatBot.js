import OpenAI from "openai"
import { config } from "dotenv"
config({path: '../../.env'})

const key = process.env.OPENAI_API_KEY

const client = new OpenAI({
    apiKey: 'sk-mnopqrstijkl5678mnopqrstijkl5678mnopqrst'
})

const res = client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {
            role: "user",
            content: "Who is MArk Zukerbark"
        }
    ]
})
;(async () => {
    try {
    const result = await res
    console.log(result)
    } catch (err) {
        console.log(err)
    }
})()