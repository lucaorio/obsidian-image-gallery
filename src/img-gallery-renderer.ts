import { App, MarkdownRenderChild, TFolder, TFile, Platform, normalizePath } from 'obsidian'
import ImgGallery from './main'

export class imgGalleryRenderer extends MarkdownRenderChild {
  private _gallery: HTMLElement = null
  private _settings: {[key: string]: any} = {}
  private _imagesList: string[] = null

  constructor(
    public plugin: ImgGallery,
    public src: string,
    public container:
    HTMLElement,
    public app: App
  ) {
    super(container)
  }

  async onload() {
    this._getSettings()
    this._getImagesList()

    if (this._settings.type === 'horizontal') this._injectHorMasonry()
    else this._injectVerMasonry()
  }

  async onunload() {
    this._gallery.remove()
    this._gallery = null
  }

  private _getSettings() {
    // parse the settings from the code block
    const settingsObj: {[key: string]: string} = {}

    this.src.split('\n')
      .filter((row) => row.length > 0)
      .forEach((item) => {
        const setting = item.split('=')
        settingsObj[setting[0]] = setting[1]
      })

    // check for required settings
    if (!settingsObj.path) {
      const error = 'Please specify a path!'
      this._renderError(error)
      throw new Error(error);
    }

    // store settings, normalize and set sensible defaults
    this._settings.path = normalizePath(settingsObj.path)

    this._settings.type = settingsObj.type || 'horizontal'
    this._settings.radius = settingsObj.radius || '0'
    this._settings.gutter = settingsObj.gutter || '8'
    this._settings.sortby = settingsObj.sortby || 'ctime'
    this._settings.sort = settingsObj.sort || 'desc'

    // settings for vertical mansory only
    this._settings.mobile = settingsObj.mobile || '1'
    if (Platform.isDesktop) this._settings.columns = settingsObj.columns || '3'
    else this._settings.columns = this._settings.mobile

    // settings for horizontal mansory only
    this._settings.height = settingsObj.height || '260'
  }

  private _getImagesList() {
    // retrieve a list of the files
    const folder = this.app.vault.getAbstractFileByPath(this._settings.path)

    let files
    if (folder instanceof TFolder) { files = folder.children }
    else {
      const error = 'The folder doesn\'t exist, or it\'s empty!'
      this._renderError(error)
      throw new Error(error);
    }

    // filter the list of files to make sure we're dealing with images only
    const validExtensions = ["jpeg", "jpg", "gif", "png", "webp", ".tiff", ".tif"]
    const images = files.filter(file => {
      if (file instanceof TFile && validExtensions.includes(file.extension)) return file
    })

    // sort the list by name, mtime, or ctime
    const orderedImages = images.sort((a: any, b: any) => {
      const refA = this._settings.sortby ? a.stat[this._settings.sortby] : a['name'].toUpperCase()
      const refB = this._settings.sortby ? b.stat[this._settings.sortby] : b['name'].toUpperCase()
      return (refA < refB) ? -1 : (refA > refB) ? 1 : 0
    })

    // re-sort again by ascending or descending order
    const sortedImages = this._settings.sort === 'asc' ? orderedImages : orderedImages.reverse()

    // return an array of strings only
    this._imagesList = sortedImages.map(file =>
      this.app.vault.adapter.getResourcePath(file.path)
    )
  }

  private _injectVerMasonry() {
    // inject the gallery wrapper
    const gallery = this.container.createEl('div')
    gallery.addClass('grid-wrapper')
    gallery.style.lineHeight = '0px'
    gallery.style.columnCount = `${this._settings.columns}`
    gallery.style.columnGap = `${this._settings.gutter}px`
    this._gallery = gallery

    // inject and style images
    this._imagesList.forEach((uri) => {
      const img = this._gallery.createEl('img')
      img.addClass('grid-item')
      img.style.marginBottom = `${this._settings.gutter}px`
      img.style.width = '100%'
      img.style.height = 'auto'
      img.style.borderRadius = `${this._settings.radius}px`
      img.src = uri
    })
  }

  private _injectHorMasonry() {
    // inject the gallery wrapper
    const gallery = this.container.createEl('div')
    gallery.addClass('grid-wrapper')
    gallery.style.display = 'flex'
    gallery.style.flexWrap = 'wrap'
    gallery.style.marginRight = `-${this._settings.gutter}px`
    this._gallery = gallery

    // inject and style images
    this._imagesList.forEach((uri) => {
      const figure = this._gallery.createEl('figure')
      figure.addClass('grid-item')
      figure.style.margin = `0px ${this._settings.gutter}px ${this._settings.gutter}px 0px`
      figure.style.height = `${this._settings.height}px`
      figure.style.borderRadius = `${this._settings.radius}px`
      figure.style.flex = '1 0 auto'
      figure.style.overflow = 'hidden'

      const img = figure.createEl('img')
      img.style.objectFit = 'cover'
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.borderRadius = '0px'
      img.src = uri
    })
  }

  private _renderError(error: string) {
    // inject the error wrapper
    const wrapper = this.container.createEl('div')
    wrapper.style.borderRadius = '4px'
    wrapper.style.padding = '2px 16px'
    wrapper.style.backgroundColor = '#e50914'
    wrapper.style.color = '#fff'

    const content = wrapper.createEl('p')
    content.style.fontWeight = 'bolder'
    const prefix = '(Error) Image Gallery: '
    content.innerHTML = `${prefix}${error}`
  }
}
