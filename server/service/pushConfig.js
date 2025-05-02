import web_push from 'web-push'

const PUBLIC_VAPI_KEY = process.env.PUBLIC_VAPI_KEY
const PRIVATE_VAPI_KEY = process.env.PRIVATE_VAPI_KEY
const MY_EMAIL = process.env.MY_EMAIL

web_push.setVapidDetails(`mailto:${MY_EMAIL}`, PUBLIC_VAPI_KEY, PRIVATE_VAPI_KEY)

export default web_push