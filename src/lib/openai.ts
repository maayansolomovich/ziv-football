// Natural-language scouting: turn a free Hebrew sentence ("שוער עד מיליון עם
// חוזה שנגמר ב-2026") into the structured filters we can map onto a
// Transfermarkt search. The key is read from the app env — see config.ts.
//
// SECURITY NOTE: EXPO_PUBLIC_* values are inlined into the client bundle, so
// this key is extractable from the app. That is an accepted trade-off for a
// private 2-user app; for wider distribution move this call behind a proxy
// (e.g. a Supabase Edge Function) and drop the key from the bundle.
import { OPENAI_API_KEY } from '../config'

const OPENAI_KEY = OPENAI_API_KEY
const MODEL = 'gpt-4o-mini'

export const hasOpenAiKey = !!OPENAI_KEY

export type AgeClass = 'u18' | 'u19' | 'u20' | 'u21' | 'u23' | '23-30' | 'o30' | 'o32' | 'o34'
export type PositionGroup = 'gk' | 'def' | 'mid' | 'att'

export interface ScoutFilters {
  positionGroup: PositionGroup | null
  ageClass: AgeClass | null
  maxValueEur: number | null
  minValueEur: number | null
  freeAgent: boolean
  contractUntilYear: number | null
  playerName: string | null
  summary: string
}

const SCHEMA = {
  name: 'scout_filters',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [
      'positionGroup', 'ageClass', 'maxValueEur', 'minValueEur',
      'freeAgent', 'contractUntilYear', 'playerName', 'summary',
    ],
    properties: {
      positionGroup: {
        type: ['string', 'null'],
        enum: ['gk', 'def', 'mid', 'att', null],
        description: 'gk=goalkeeper(שוער), def=defender(בלם/מגן), mid=midfielder(קשר), att=attacker(כנף/חלוץ)',
      },
      ageClass: {
        type: ['string', 'null'],
        enum: ['u18', 'u19', 'u20', 'u21', 'u23', '23-30', 'o30', 'o32', 'o34', null],
        description: 'Age bucket. u23 = up to 23, 23-30 = between, o30 = over 30.',
      },
      maxValueEur: { type: ['number', 'null'], description: 'Max market value in euros, e.g. "עד מיליון" => 1000000' },
      minValueEur: { type: ['number', 'null'], description: 'Min market value in euros' },
      freeAgent: { type: 'boolean', description: 'true if the user wants a free agent / שחקן חופשי / ללא קבוצה' },
      contractUntilYear: { type: ['integer', 'null'], description: 'Contract expiry year mentioned, e.g. 2026' },
      playerName: { type: ['string', 'null'], description: 'A specific player name if one was mentioned, else null' },
      summary: { type: 'string', description: 'A short one-line Hebrew restatement of what was understood' },
    },
  },
} as const

export async function parseScoutQuery(text: string, signal?: AbortSignal): Promise<ScoutFilters> {
  if (!OPENAI_KEY) throw new Error('NO_KEY')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      response_format: { type: 'json_schema', json_schema: SCHEMA },
      messages: [
        {
          role: 'system',
          content:
            'You convert a Hebrew football-scouting request into structured search filters. ' +
            'Interpret Hebrew money terms: "מיליון"/"M" = 1000000, "אלף"/"K" = 1000. ' +
            'The "summary" field must be a short natural Hebrew sentence describing the search.',
        },
        { role: 'user', content: text },
      ],
    }),
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('BAD_KEY')
    throw new Error(`OpenAI ${res.status}`)
  }
  const data = await res.json()
  const raw = data?.choices?.[0]?.message?.content
  if (!raw) throw new Error('EMPTY')
  return JSON.parse(raw) as ScoutFilters
}
