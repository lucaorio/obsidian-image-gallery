import { App, MarkdownRenderChild, TFolder, Platform } from 'obsidian'
import ImgGallery from './main'

export class imgGalleryRenderer extends MarkdownRenderChild {
  private _gallery: HTMLElement = null
  private _settings: {[key: string]: any} = {}
  private _imgList: string[] = null

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
    this._getImgList()

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

    // store settings and set sensible defaults
    this._settings.path = settingsObj.path
    if (!settingsObj.path) console.error('Please specify a path');

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

  private _getImgList() {
    // retrieve a list of the images
    const folder = this.app.vault.getAbstractFileByPath(this._settings.path)

    let files
    if (folder instanceof TFolder) { files = folder.children }
    else console.error('The folder doesn\'t exist, or it\'s empty!')

    // sort the list by name, mtime, or ctime
    const orderedFiles = files.sort((a: any, b: any) => {
      const refA = this._settings.sortby ? a.stat[this._settings.sortby] : a['name'].toUpperCase()
      const refB = this._settings.sortby ? b.stat[this._settings.sortby] : b['name'].toUpperCase()
      return (refA < refB) ? -1 : (refA > refB) ? 1 : 0
    })

    // re-sort again by ascending or descending order
    const sortedFiles = this._settings.sort === 'asc' ? orderedFiles : orderedFiles.reverse()

    // return an array of strings only
    this._imgList = sortedFiles.map(file =>
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
    this._imgList.forEach((uri) => {
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
    this._imgList.forEach((uri) => {
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
}
