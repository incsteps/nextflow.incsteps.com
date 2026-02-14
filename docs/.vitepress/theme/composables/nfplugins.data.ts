import type { NfPlugin } from '../../nfplugins'
import { plugins } from '../../nfplugins'

declare const data: NfPlugin[]
export { data }

async function load(): Promise<NfPlugin[]>
async function load() {
  return plugins
}

export default {
  load,
}
