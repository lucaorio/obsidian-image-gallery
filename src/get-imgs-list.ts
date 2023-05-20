import { App, TFolder, TFile } from 'obsidian'
import renderError from './render-error'

const getImagesList = (
    app: App,
    container: HTMLElement,
    settings: {[key: string]: any},
  ) => {
  // retrieve a list of the files
  const folder = app.vault.getAbstractFileByPath(settings.path)

  let files
  if (folder instanceof TFolder) { files = folder.children }
  else {
    const error = 'The folder doesn\'t exist, or it\'s empty!'
    renderError(container, error)
    throw new Error(error)
  }

  // filter the list of files to make sure we're dealing with images only
  const validExtensions = ["jpeg", "jpg", "gif", "png", "webp", "tiff", "tif"]
  let images = files.filter(file => {
    if (file instanceof TFile && validExtensions.includes(file.extension)) return file
  })

  // check if we should recursively look for files in sub-folders, if so find all files.
  if (settings.recursive) {
    files.forEach(f => {
      if (f instanceof TFolder && f.path != settings.path) {
        settings.path = f.path;
        images = images.concat(getImagesListHelper(app, container, settings, f.path))
      }
    })
  }

  // sort the list by name, mtime, or ctime
  const orderedImages = images.sort((a: any, b: any) => {
    const refA = settings.sortby === 'name' ? a['name'].toUpperCase() : a.stat[settings.sortby]
    const refB = settings.sortby === 'name' ? b['name'].toUpperCase() : b.stat[settings.sortby]
    return (refA < refB) ? -1 : (refA > refB) ? 1 : 0
  })

  // re-sort again by ascending or descending order
  const sortedImages = settings.sort === 'asc' ? orderedImages : orderedImages.reverse()

  // return an array of objects
  return sortedImages.map(file => { return {
    name: file.name,
    folder: file.parent.path,
    uri: app.vault.adapter.getResourcePath(file.path)
    }})
}

const getImagesListHelper = (
  app: App,
  container: HTMLElement,
  settings: {[key: string]: any},
  path: string
) => {

  // retrieve a list of the files
  const folder = app.vault.getAbstractFileByPath(path)

  let files
  if (folder instanceof TFolder) { files = folder.children }
  else {
    return []
  }

  // filter the list of files to make sure we're dealing with images only
  const validExtensions = ["jpeg", "jpg", "gif", "png", "webp", "tiff", "tif"]
  let images = files.filter(file => {
    if (file instanceof TFile && validExtensions.includes(file.extension)) return file
  })

  // check if we should recursively look for files in sub-folders, if so find all files.
  if (settings.recursive) {
    files.forEach(f => {
      if (f instanceof TFolder && f.path != path) {
        images = images.concat(getImagesListHelper(app, container, settings, f.path))
      }
    })
  }

  return images
}

export default getImagesList
