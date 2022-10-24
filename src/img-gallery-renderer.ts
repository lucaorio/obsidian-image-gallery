import { App, MarkdownRenderChild, TAbstractFile, TFolder, TFile, Platform, normalizePath, parseYaml, setIcon } from 'obsidian'
import ImgGallery from './main'

export class imgGalleryRenderer extends MarkdownRenderChild {
  private _gallery: HTMLElement = null
  private _settings: {[key: string]: any} = {}
  private _imagesList: {[key: string]: TAbstractFile} = {};
  
  private _lightbox: HTMLElement = null
  private _currentImage: TAbstractFile = null

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
    this._injectMasonry()
    if (this._settings.preview) this._injectLightbox()
  }

  async onunload() {
    if (this._gallery) {
      this._gallery.remove()
      this._gallery = null
    }
  }

  private _getSettings() {
    // parse the settings from the code block
    const settingsObj: any = parseYaml(this.src)

    // check for required settings
    if (settingsObj === undefined) {
      const error = 'Cannot parse YAML!'
      this._renderError(error)
      throw new Error(error)
    }

    if (!settingsObj.path) {
      const error = 'Please specify a path!'
      this._renderError(error)
      throw new Error(error)
    }

    // store settings, normalize and set sensible defaults
    this._settings.path = normalizePath(settingsObj.path)

    this._settings.type = settingsObj.type ?? 'horizontal'
    this._settings.radius = settingsObj.radius ?? 0
    this._settings.gutter = settingsObj.gutter ?? 8
    this._settings.sortby = settingsObj.sortby ?? 'ctime'
    this._settings.sort = settingsObj.sort ?? 'desc'

    //always disable previews on mobile
    if (Platform.isMobile) this._settings.preview = false
    else this._settings.preview = settingsObj.preview ?? false

    // settings for vertical mansory only
    this._settings.mobile = settingsObj.mobile ?? 1
    if (Platform.isDesktop) this._settings.columns = settingsObj.columns ?? 3
    else this._settings.columns = this._settings.mobile

    // settings for horizontal mansory only
    this._settings.height = settingsObj.height ?? 260
  }

  private _getImagesList() {
    // retrieve a list of the files
    const folder = this.app.vault.getAbstractFileByPath(this._settings.path)

    let files
    if (folder instanceof TFolder) { files = folder.children }
    else {
      const error = 'The folder doesn\'t exist, or it\'s empty!'
      this._renderError(error)
      throw new Error(error)
    }

    // filter the list of files to make sure we're dealing with images only
    const validExtensions = ["jpeg", "jpg", "gif", "png", "webp", "tiff", "tif"]
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

    // create an object with the key being the image path
    sortedImages.forEach(file => {
      const path = this.app.vault.adapter.getResourcePath(file.path);
      this._imagesList[path] = file;
    })
  }

  private _injectMasonry() {
    // inject the gallery wrapper
    const gallery = this.container.createEl('div')
    const galleryType = this._settings.type === 'horizontal' ? 'horizontal' : 'vertical'
    gallery.addClass('grid-wrapper')
    gallery.addClass(galleryType)
    
    gallery.setAttribute("style",`\
      --oig-columns: ${this._settings.columns};\
      --oig-gutter: ${this._settings.gutter}px;\
      --oig-radius: ${this._settings.radius}px;\
      --oig-height: ${this._settings.height}px;\
    `);
    this._gallery = gallery

    // inject and style images
    Object.keys(this._imagesList).forEach(uri => {
      const figure = this._gallery.createEl('figure')
      figure.addClass('grid-item')
      if (this._settings.preview) 
        figure.addEventListener('click', () => this._selectImage(uri))
      
      const img = figure.createEl('img')
      img.src = uri
    })
  }
  
  private _injectLightbox() {
    console.log(this.container.parentElement)
    this._lightbox = this.container.createDiv()
    this._lightbox.id = 'oig-lightbox'
    this._lightbox.hidden = true
    this._lightbox.addEventListener('click', e => {
      if(e.target === wrapper || e.target === this._lightbox) this._lightbox.hidden = true
    });
    
    const wrapper = this._lightbox.createDiv({cls: 'wrapper'})
    const controls = wrapper.createDiv({cls: 'controls'})
    const name = controls.createEl('div', {cls: 'name'})
    name.createEl('span')
    
    const goto = controls.createEl('button')
    setIcon(goto, 'external-link')
    goto.addEventListener('click', () =>
      this.app.workspace.openLinkText(this._currentImage.path, '', true, {active: true})  
    );
    
    const search = controls.createEl('button')
    setIcon(search, 'search')
    search.addEventListener('click', () => {
      const search = (this.app as any).internalPlugins.getPluginById('global-search')?.instance
      search.openGlobalSearch(this._currentImage.name); 
    });
    
    const close = controls.createEl('button')
    setIcon(close, 'x')
    close.addEventListener('click', () => this._lightbox.hidden = true);

    wrapper.createEl('img')
  }
  
  private _selectImage = (uri: string) => {
    this._currentImage = this._imagesList[uri];

    this._lightbox.hidden = false
    this._lightbox.getElementsByTagName("img")[0].src = uri
    this._lightbox.getElementsByTagName("span")[0].innerHTML = this._currentImage.name
  }  

  private _renderError(error: string) {
    // render a custom error
    const wrapper = this.container.createEl('div', { cls: 'error'})
    wrapper.createEl('p', {text: `(Error) Image Gallery: ${error}`});
  }
}
