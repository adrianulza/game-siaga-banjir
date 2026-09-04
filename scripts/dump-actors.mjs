/**
 * Runs the ORIGINAL actorsFor() straight out of the .dc.html and dumps its output
 * for a spread of game states.
 *
 * The actor layer is ~20 derived numbers per figure across 8 figures and 6 screens.
 * Reviewing that by eye is not verification, so the port is checked against these
 * fixtures instead (see tests/actors.test.ts).
 *
 *   node scripts/dump-actors.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import vm from 'node:vm'

const html = readFileSync('docs/original/Siaga Banjir.dc.html', 'utf8')

const bodyStart = html.indexOf('>', html.indexOf('data-dc-script')) + 1
const script = html.slice(bodyStart, html.lastIndexOf('</script>'))

// Module-level data the method closes over (G, FLOOD, FAM0, ...).
const constBlock = script.slice(script.indexOf('const P1 ='), script.indexOf('class Snd'))

// The method itself, from its signature to the `return []}` that closes it.
const methodStart = script.indexOf('actorsFor(){')
const methodEnd = script.indexOf('return []}', methodStart) + 'return []}'.length
const methodBody = script.slice(methodStart + 'actorsFor(){'.length, methodEnd - 1)

const sandbox = {}
vm.createContext(sandbox)
vm.runInContext(
  `${constBlock}
   globalThis.__actorsFor = function () { ${methodBody} };
   globalThis.__FAM0 = FAM0;`,
  sandbox,
)

const actorsFor = sandbox.__actorsFor
const FAM0 = sandbox.__FAM0

const base = { screen: 'intro', cardIdx: 0, open: null, family: { ...FAM0 } }
const at = (over) => ({ ...base, ...over, family: { ...FAM0, ...(over.family ?? {}) } })

const cases = {}
const add = (name, state) => {
  cases[name] = { state, actors: actorsFor.call({ state }) }
}

add('intro', at({ screen: 'intro' }))
add('p1', at({ screen: 'p1' }))
for (const id of ['radio', 'dapur', 'atap', 'sungai', 'balai', 'nenek']) {
  add(`p1-open-${id}`, at({ screen: 'p1', open: id }))
}
for (let i = 0; i < 8; i++) add(`p2-card-${i}`, at({ screen: 'p2', cardIdx: i }))
// Family status changes the faces and the panic animations, so cover them too.
add('p2-hurt', at({ screen: 'p2', cardIdx: 4, family: { ayah: 'terluka', nenek: 'terluka' } }))
add('p2-worried', at({ screen: 'p2', cardIdx: 4, family: { adik: 'cemas', ibu: 'cemas' } }))
add('p2-late', at({ screen: 'p2', cardIdx: 6, family: { tetangga: 'terlambat' } }))
add('over', at({ screen: 'over' }))
add('over-hurt', at({ screen: 'over', family: { nenek: 'terluka', ayah: 'cemas' } }))
add('p3', at({ screen: 'p3' }))
for (const id of ['rumah', 'air', 'posko', 'rapat', 'lereng', 'darto']) {
  add(`p3-open-${id}`, at({ screen: 'p3', open: id }))
}
add('end', at({ screen: 'end' }))
for (const screen of ['recap1', 'recap2', 'recap3']) add(screen, at({ screen }))

writeFileSync('tests/fixtures/original-actors.json', JSON.stringify(cases, null, 2) + '\n')

const total = Object.values(cases).reduce((n, c) => n + c.actors.length, 0)
console.log(`dumped ${Object.keys(cases).length} states, ${total} actor sprites`)
