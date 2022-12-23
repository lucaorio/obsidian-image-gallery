import { App, MarkdownRenderChild } from 'obsidian'
import ImgGallery from './main'
import getImagesList from './get-imgs-list'
import getSettings from './get-settings'
import buildHorizontal from './build-horizontal'
import buildVertical from './build-vertical'
import buildLightbox from './build-lightbox'

export class imgGalleryInit extends MarkdownRenderChild {
  private _gallery: HTMLElement = null
  private _lightbox: any = null
  private _settings: {[key: string]: any} = {}
  private _imagesList: {[key: string]: any} = {}

  constructor(
    public plugin: ImgGallery,
    public src: string,
    public container: HTMLElement,
    public app: App
  ) {
    super(container)
  }

  async onload() {
    // parse and normalize settings
    this._settings = getSettings(this.src, this.container)
    this._imagesList = getImagesList(this.app, this.container, this._settings)

    // inject the pertinent kind of gallery
    if (this._settings.type === 'horizontal') {
      this._gallery = buildHorizontal(this.container, this._imagesList, this._settings)
    } else if (this._settings.type === 'vertical') {
      this._gallery = buildVertical(this.container, this._imagesList, this._settings)
    }

    // initialize a lightbox
    this._lightbox = buildLightbox(this._gallery, this._imagesList, this.app)
  }

  async onunload() {
    // todo: monitor the bug attached below (obsidian 1.1.8)
    // https://forum.obsidian.md/t/markdown-render-childes-are-not-being-unloaded-when-switching-notes-in-the-same-tab/49681

    // destroy the gallery
    if (this._gallery) {
      this._gallery.remove()
      this._gallery = null
    }

    // destroy the lightbox
    if (this._lightbox) {
      this._lightbox.destroy()
      this._lightbox = null
    }
  }
}
