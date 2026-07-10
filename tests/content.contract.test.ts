import assert from 'node:assert/strict'
import test from 'node:test'

import { content, languages } from '../src/content.ts'

test('content exposes Portuguese and English language modes', () => {
  assert.deepEqual(
    languages.map((language) => language.code),
    ['pt', 'en'],
  )
  assert.equal(content.pt.hero.titleEmphasis, 'comunidade')
  assert.equal(content.en.hero.titleEmphasis, 'living community')
})

test('campaign content covers the visible Figma sections', () => {
  for (const language of languages) {
    const copy = content[language.code]

    assert.equal(copy.stats.length, 4)
    assert.equal(copy.history.timeline.length, 5)
    assert.ok(copy.people.length >= 5)
    assert.equal(copy.beliefs.preserve.items.length, 4)
    assert.equal(copy.beliefs.demolish.items.length, 4)
    assert.match(copy.cta.primary, /Assina|Sign/)
  }
})

test('localized content does not ship placeholder text', () => {
  const textValues = JSON.stringify(content)

  assert.doesNotMatch(textValues, /\.\.\./)
  assert.doesNotMatch(textValues, /\b(?:TODO|TBD|placeholder|lorem ipsum)\b/i)
})

test('people heading preserves Figma color emphasis segments', () => {
  assert.deepEqual(content.pt.peopleSection.titleParts, [
    { text: 'Pessoas', emphasis: true },
    { text: ' que aqui ' },
    { text: 'trabalham', emphasis: true },
    { text: ' e tornam este lugar ' },
    { text: 'vivo', emphasis: true },
  ])

  assert.deepEqual(content.en.peopleSection.titleParts, [
    { text: 'People', emphasis: true },
    { text: ' who ' },
    { text: 'work', emphasis: true },
    { text: ' here and make this place ' },
    { text: 'alive', emphasis: true },
  ])
})

test('people testimonials match the portrait list source', () => {
  const expectedPortuguesePeople = [
    {
      id: 'alex',
      name: 'Alex',
      role: 'Sales Manager',
      since: 'Aqui desde 2026',
      quote: 'Aqui nasceram amizades para a vida.',
    },
    {
      id: 'mariana',
      name: 'Mariana',
      role: 'Consultora',
      since: 'Aqui desde 2023',
      quote: 'Aqui encontrei a minha comunidade.',
    },
    {
      id: 'ricardo',
      name: 'Ricardo',
      role: 'CEO',
      since: 'Aqui desde 2022',
      quote: 'Aqui encontrei a minha vibe profissional.',
    },
    {
      id: 'fernando',
      name: 'Fernando',
      role: 'Estratega de Transformacao Digital, Fundador',
      since: 'Aqui desde 2022',
      quote: 'Aqui o meu horizonte tornou-se mais horizontal.',
    },
    {
      id: 'raquel',
      name: 'Raquel',
      role: 'Fundadora',
      since: 'Aqui desde 2025',
      quote: 'Aqui cresci, pessoal e profissionalmente.',
    },
    {
      id: 'manuel',
      name: 'Manuel',
      role: 'Porteiro',
      since: 'Aqui desde',
      quote: 'Aqui encontrei o meu lugar.',
    },
    {
      id: 'diogo',
      name: 'Diogo',
      role: 'Marketing',
      since: 'Aqui desde 2014',
      quote: 'Este lugar abriu-me novas oportunidades.',
    },
    {
      id: 'ines-consultora',
      name: 'Inês',
      role: 'Consultora',
      since: 'Aqui desde 2021',
      quote: 'Este lugar deu-me novas perspectivas.',
    },
    {
      id: 'catia',
      name: 'Cátia',
      role: 'Marketing',
      since: 'Aqui desde 2025',
      quote: 'Este espaço faz-me sentir parte de algo.',
    },
    {
      id: 'marlon',
      name: 'Marlon',
      role: 'Vidéografo',
      since: 'Aqui desde 2025',
      quote: 'Este espaço ligou-me a pessoas incríveis.',
    },
    {
      id: 'patricia',
      name: 'Patrícia',
      role: 'People Partner',
      since: 'Aqui desde 2026',
      quote: 'Este lugar trouxe mais cor ao meu dia a dia.',
    },
    {
      id: 'guilherme',
      name: 'Guilherme',
      role: 'Developer',
      since: 'Aqui desde 2026',
      quote: 'Este espaço tornou o Porto mais meu.',
    },
    {
      id: 'ines-designer',
      name: 'Inês',
      role: 'Graphic Designer',
      since: 'Aqui desde 2026',
      quote: 'Aqui conheci pessoas que me inspiram.',
    },
    {
      id: 'joana',
      name: 'Joana',
      role: 'People and Culture',
      since: 'Aqui desde 2023',
      quote: 'Este lugar mostrou-me o valor da comunidade.',
    },
    {
      id: 'jane',
      name: 'Jane',
      role: 'Sales Development Rep',
      since: 'Aqui desde 2026',
      quote: 'Aqui construí relações que importam.',
    },
    {
      id: 'vanessa',
      name: 'Vanessa',
      role: 'Space Manager',
      since: 'Aqui desde 2024',
      quote: 'Aqui encontrei mais do que um local de trabalho.',
    },
    {
      id: 'jose-maria',
      name: 'José Maria',
      role: 'Designer',
      since: 'Aqui desde 2024',
      quote: 'Aqui encontrei energia para criar e crescer.',
    },
    {
      id: 'rebecca',
      name: 'Rebecca',
      role: 'Arquiteta',
      since: 'Aqui desde 2023',
      quote: 'Este lugar mudou a minha vida.',
    },
    {
      id: 'hellen',
      name: 'Hellen',
      role: 'Talent Manager',
      since: 'Aqui desde 2024',
      quote: 'Aqui criaram-se laços que continuam fora daqui.',
    },
  ]

  assert.deepEqual(content.pt.people, expectedPortuguesePeople)
  assert.deepEqual(
    content.en.people.map((person) => person.name),
    expectedPortuguesePeople.map((person) => person.name),
  )
  assert.doesNotMatch(content.pt.people.map((person) => person.name).join(' '), /\?/)
})

test('desktop menu content matches the Figma menu structure', () => {
  assert.deepEqual(content.pt.nav.menuItems.map((item) => item.label), [
    'Introdução',
    'Dados',
    'Comunidade',
    'No que acreditamos',
    'Ecossistema',
  ])
  assert.equal(content.pt.nav.petition, 'Assina a petição')
  assert.equal(content.en.nav.petition, 'Sign the petition')
})

test('requested English campaign wording is present', () => {
  assert.equal(content.en.cta.titleStart, 'Sign to')
  assert.equal(content.en.cta.titleEmphasis, 'protect')
  assert.equal(content.en.cta.titleEnd, 'this ecosystem')
  assert.equal(content.en.history.timeline[3].label, 'Building 100% occupied')
  assert.equal(content.en.hero.titleStart, 'A')
  assert.equal(content.en.hero.titleEmphasis, 'living community')
  assert.equal(content.en.hero.titleEnd, "is the city's heritage")
})
