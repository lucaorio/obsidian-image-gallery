import { normalizePath, parseYaml, Platform } from 'obsidian'
import renderError from './render-error'

const getSettings = (src: string, container: HTMLElement) => {
  // parse the settings from the code block
  const settingsSrc: any = parseYaml(src)

  // check for required settings
  if (settingsSrc === undefined) {
    const error = 'Cannot parse YAML!'
    renderError(container, error)
    throw new Error(error)
  }

  if (!settingsSrc.path) {
    const error = 'Please specify a path!'
    renderError(container, error)
    throw new Error(error)
  }

  // store settings, normalize and set sensible defaults
  const settings = {
    path: undefined as string,
    type: undefined as string,
    radius: undefined as number,
    gutter: undefined as string,
    sortby: undefined as string,
    sort: undefined as string,
    mobile: undefined as number,
    columns: undefined as number,
    height: undefined as number,
  }

  settings.path = normalizePath(settingsSrc.path)
  settings.type = settingsSrc.type ?? 'horizontal'
  settings.radius = settingsSrc.radius ?? 0
  settings.gutter = settingsSrc.gutter ?? 8
  settings.sortby = settingsSrc.sortby ?? 'ctime'
  settings.sort = settingsSrc.sort ?? 'desc'

  // settings for vertical mansory only
  settings.mobile = settingsSrc.mobile ?? 1
  if (Platform.isDesktop) settings.columns = settingsSrc.columns ?? 3
  else settings.columns = settings.mobile

  // settings for horizontal mansory only
  settings.height = settingsSrc.height ?? 260

  return settings
}

export default getSettings
