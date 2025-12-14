export const startString: string = `Hello!  Welcome to JotBot.  I'm here to help you record your emotions and emotion!`;
export const telegramDownloadUrl = "https://api.telegram.org/file/bot<token>/<file_path>";

export const catImagesApiBaseUrl = `https://cataas.com`;
export const quotesApiBaseUrl = `https://zenquotes.io/api/quotes/`;

export const crisisString = 
`
Hello <username> here are the crisis help lines.
🚨<b><u>PLEASE CALL IF YOU FEEL YOU MIGHT HURT YOURSELF OR OTHERS</u></b>🚨

<b><u>CRISIS LINES</u></b>
- 988 <b>Mental health crisis line</b>
- 1-800-273-8255 <b>National Suicide Prevention Lines</b>

<b><u>Immediate Help via text</u></b>
Text the word <b>HOME</b> to 741741 to connect with <b>Crisis Text Line</b>

🏳️‍🌈 <b><u>LGBTQ+ Resources</u></b> 🏳️‍🌈
Councelors specializing in LGBTQ+
- 1-800-488-7386 <b>The Trevor Project</b>

<b><u>Sexual Assault Resources</u></b>
- 1-800-799-7233

<b><u>Veteran Resources</u></b>
1-877-927-8387 <b>24/7 Veteran Combat Call center to speak with another combat veteran</b>

<b><u>Life Threatening Emergencies</u></b>
Call 911
`

export const helpString: string = 
`
<b>Jotbot help</b>
<b><u>What is Jotbot?</u></b>
Jotbot is a telegram bot that can help you to record your thoughts and emotions in directly in the telegram app.

<b><u>How do I use Jotbot?</u></b>
Jotbot is easy to use you have to be "registered" to start recording entries.
Once this is done you can use /new_entry to start recording an entry.  You just answer the bot's questions to the best of you ability from there.

After you are finished recording your entry you can view your entry by using /view_entries.  This will bring up a menu that let's you scroll through your entries.  You can also delete entries from this screen.
If you are wanting to stop using Jotbot you can delete your account using /delete_account this will also delete all of your journal entries!

<b><u>Commands</u></b>
/start - Start the bot, if it's your first time messaging the bot you will be asked if you want to register.
/help - Prints this help string in a message
/new_entry - Start a new entry
/view_entries - Scroll through your entries
/kitties - Open the kitties app!  Studies show kitties can help with depression
/delete_account - Delete your accound plus all entries
/🆘 or /sos - Show the crisis help lines

<b>NOTE</b>: The selfie features aren't working right now.
`

export enum Emotions {
    VERY_SAD = "very-sad",
    SAD = "sad",
    MEH = "meh",
    HAPPY = "happy",
    VERY_HAPPY = "very-happy"
}