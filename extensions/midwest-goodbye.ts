/**
 * Midwest Goodbye
 *
 * The "hand on the doorknob, one more thing" pattern.
 *
 * /bye triggers reflection: did anything surface this session that didn't
 * result in a clean world action?
 *
 * - Clean: random midwest farewell → user /new to leave
 * - Uncertain: random "one more thing" → engage or /new anyway
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const cleanGoodbyes = [
  "See ya",
  "Bye, now",
  "See you later",
  "Alright then",
  "Take 'er easy",
  "You betcha, see ya",
  "Drive safe now",
  "Watch out for deer",
  "Don't be a stranger",
  "Say hi to your folks",
];

const oneMoreThings = [
  "Hang on a minute...",
  "Before you go, one quick thing...",
  "I'll let you go in just a sec, but...",
  "Oh hey, that reminds me...",
  "One more thing before you head out...",
  "I know you gotta run, but real quick...",
  "Oh shoot, almost forgot...",
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("bye", {
    description: "Hand on the doorknob check",
    handler: async () => {
      const cleanBye = pick(cleanGoodbyes);
      const oneMore = pick(oneMoreThings);

      pi.sendMessage({
        customType: "midwest-goodbye",
        content: `The user typed /bye. Reflect on this session:

Did anything surface that wasn't captured in a world action (commit, file, note)?

Examples of things worth surfacing:
- A decision we made but didn't document
- A TODO or "we should also..." that wasn't written down
- An insight about the codebase worth noting
- An intention for next time ("next I want to...")
- An unfinished thread we got sidetracked from

If everything important was persisted or is genuinely ephemeral:
→ Just say "${cleanBye}" (User will /new to start fresh)

If something might be worth capturing (one or two sentences max):
→ "${oneMore}"
→ Surface what you noticed
→ They'll either engage or /new anyway

Meta: if we OODA'd, that's a calibration signal. Was it worth stopping? If yes, the extension did its job—no changes needed. If not, what would have made this a clean goodbye? Surface that.`,
        display: false,
      }, { triggerTurn: true });
    },
  });
}
