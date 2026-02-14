import type { Ref } from 'vue'
import type { NfPlugin } from '../../nfplugins'
import { ref } from 'vue'
import { plugins } from '../../nfplugins'

export default () => {
  const allPlugins: Ref<NfPlugin[]> = ref(plugins)

  return { allPlugins }
}
