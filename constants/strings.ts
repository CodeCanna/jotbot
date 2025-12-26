export const startString: string =
  `Hello!  Welcome to JotBot.  I'm here to help you record your emotions and emotion!`;
// This will be constructed dynamically using the configured API base URL
export const getTelegramDownloadUrl = (baseUrl: string, token: string, filePath: string) =>
  `${baseUrl}/file/bot${token}/${filePath}`;

export const catImagesApiBaseUrl = `https://cataas.com`;
export const quotesApiBaseUrl = `https://zenquotes.io/api/quotes/`;

export const crisisString = `
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
`;

export const helpString: string = `
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
`;

export enum Emotions {
  VERY_SAD = "very-sad",
  SAD = "sad",
  MEH = "meh",
  HAPPY = "happy",
  VERY_HAPPY = "very-happy",
}

export const phq9Questions: string[] = [
  "<b>1.</b> Little interest or pleasure in doing things?",
  "<b>2.</b> Feeling down, depressed, or hopeless?",
  "<b>3.</b> Trouble falling or staying asleep, or sleeping too much?",
  "<b>4.</b> Feeling tired or having little energy?",
  "<b>5.</b> Poor appetite or overeating?",
  "<b>6.</b> Feeling bad about yourself or that you're a failure or have let yourself or your family down?",
  "<b>7.</b> Trouble conventrating on things, such as reading the newspaper or watching television?",
  "<b>8.</b> Moving or speaking so slowly that other people could have noticed?  Or the opposite, being so fidgety or restless that you have been moving around a lot more than usual?",
  "<b>9.</b> Thoughts that you would be better off dead or of hurting yourself in some way?",
];

export const gad7Questions: string[] = [
  "Feeling nervous, anxious, or on edge?",
  "Not being able to stop or control worrying?",
  "Worrying too much about different things?",
  "Trouble relaxing?",
  "Being so restless that it is hard to sit still?",
  "Becoming easily annoyed or irritable?",
  "Feeling afraid, as if something awful might happen?",
];

export const depressionExplanations = {
  none_minimal:
    `A PHQ-9 score of 0 to 4 suggests minimal or no depressive symptoms. This is often an indicator of good emotional health. While you might experience occasional low moods, they generally do not significantly impact your daily life. It’s a good time to focus on maintaining your well-being through healthy habits like exercise, mindfulness, and strong social connections. Even with minimal symptoms, engaging in self-care practices is always beneficial.`,
  mild:
    `If your score falls between 5 and 9, it indicates mild depression. You might be noticing subtle changes in your mood, energy levels, or interest in activities. These signs, while not severe, are worth acknowledging. This range is an excellent opportunity to proactively engage in self-care strategies. Consider exploring stress reduction techniques, improving sleep hygiene, or increasing physical activity. It's also a good moment to reflect on what might be contributing to these feelings and decide if seeking some guidance could be helpful.`,
  moderate:
    `A PHQ-9 score of 10 to 14 suggests moderate depression. At this level, symptoms are more noticeable and might be affecting your daily functioning, relationships, or work. This is a point where considering professional guidance becomes particularly important. A mental health professional can offer tailored support, whether through therapy, lifestyle adjustments, or other interventions. Early intervention can make a significant difference, and many find relief and strategies for coping by speaking with someone.`,
  moderately_severe:
    `A score of 15 to 19 indicates moderately severe depression. Symptoms are likely prominent and significantly impacting various aspects of your life. You might find it challenging to engage in daily tasks, maintain your routine, or experience joy. It's crucial to seek professional help at this stage. Mental health professionals can provide comprehensive assessments and develop effective treatment plans to support you through these challenges. Reaching out for help is a brave and self-compassionate step. Take the first step and assess your emotional health today.`,
  severe:
    `A PHQ-9 score between 20 and 27 signifies <b>severe depression</b>. At this level, symptoms are intense and pervasive, severely affecting your ability to function. Immediate professional support is crucial. This might involve urgent consultation with a doctor, a psychiatrist, or another mental health specialist. In some cases, hospitalization may be necessary to ensure safety and provide intensive care. It's important to remember that severe depression is treatable, and help is available.`,
};

export const anxietyExplanations = {
  minimal_anxiety:
    "A score in this range suggests that you are experiencing minimal or no anxiety symptoms. This is generally considered a healthy range, indicating that you are managing daily stressors effectively and are not significantly bothered by generalized anxiety. While this score is reassuring, it doesn't mean you won't experience anxiety at all, as anxiety is a normal human emotion. It simply implies that your current level of anxiety isn't significantly impacting your life. Continue practicing healthy coping strategies and mindfulness to maintain your mental well-being.",
  mild_anxiety:
    "If your score falls between 5 and 9, you are likely experiencing mild anxiety. At this level, you might notice some anxiety symptoms, but they are generally manageable and may not severely disrupt your daily life. You might find yourself worrying more often than usual or feeling a bit more irritable or restless. This is an opportune moment for self-awareness and implementing simple anxiety management techniques. Consider exploring relaxation exercises, mindfulness, or discussing your feelings with a trusted friend or family member. Recognizing mild anxiety early can prevent it from escalating.",
  moderate_anxiety:
    "A score of 10 to 14 indicates moderate anxiety. At this stage, your anxiety symptoms are more noticeable and might be having a noticeable impact on your daily functioning, work, relationships, or overall quality of life. You might find it harder to control your worries, experience more physical symptoms like restlessness or trouble sleeping, and feel frequently on edge. This range suggests it could be beneficial to explore support options. Consider speaking with a doctor or a mental health professional who can offer guidance and discuss potential coping strategies. Proactive steps at this level can significantly improve your well-being.",
  severe_anxiety:
    "A score between 15 and 21 suggests severe anxiety. This level indicates that anxiety symptoms are highly prominent and likely causing significant distress and impairment in various aspects of your life. You might find it extremely difficult to control worrying, experience persistent physical symptoms, and feel overwhelmed by your anxiety. If your score is in this range, it is strongly recommended that you seek professional help immediately. Mental health professionals can provide comprehensive assessments and develop an appropriate treatment plan to help you manage and alleviate your symptoms. Remember, seeking help is a courageous act, and support is readily available.",
};

export const finalCallBackQueries = [
  "Not difficult at all",
  "Somewhat difficult",
  "Very difficult",
  "Extremely difficult",
];

export const questionCallBackQueries = [
  "not-at-all",
  "several-days",
  "more-than-half-the-days",
  "nearly-every-day",
];
