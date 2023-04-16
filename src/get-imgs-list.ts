import { App, TFolder, TFile } from 'obsidian'
import renderError from './render-error'

const getImagesList = (
    app: App,
    container: HTMLElement,
    settings: {[key: string]: any}
  ) => {
  // retrieve a list of the files
  const parentFolderPath = app.workspace.getActiveFile().parent.path
  const folderPath = settings.path === '.' 
    ? parentFolderPath 
    : settings.path.replace('./', `${parentFolderPath}/`)
  const folder = app.vault.getAbstractFileByPath(folderPath)

  let files
  if (folder instanceof TFolder) { files = folder.children }
  else {
    const error = 'The folder doesn\'t exist, or it\'s empty!'
    renderError(container, error)
    throw new Error(error)
  }

  // filter the list of files to make sure we're dealing with images only
  const validExtensions = ["jpeg", "jpg", "gif", "png", "webp", "tiff", "tif"]
  const images = files.filter(file => {
    if (file instanceof TFile && validExtensions.includes(file.extension)) return file
  })

  // sort the list by name, mtime, or ctime
  const orderedImages = images.sort((a: any, b: any) => {
    const refA = settings.sortby === 'name' ? a['name'].toUpperCase() : a.stat[settings.sortby]
    const refB = settings.sortby === 'name' ? b['name'].toUpperCase() : b.stat[settings.sortby]
    return (refA < refB) ? -1 : (refA > refB) ? 1 : 0
  })

  // re-sort again by ascending or descending order
  const sortedImages = settings.sort === 'asc' ? orderedImages : orderedImages.reverse()

  // return an array of objects
  return sortedImages.map(file => {
    return {
      name: file.name,
      folder: file.parent.path,
      uri: app.vault.adapter.getResourcePath(file.path)
    }
  })
}

export default getImagesList
