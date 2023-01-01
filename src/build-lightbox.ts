import { App, Platform } from 'obsidian'
import Lightbox from 'lightgallery';
import LightboxThumbs from 'lightgallery/plugins/thumbnail'

const lightbox = (gallery: HTMLElement, imagesList: {[key: string]: any}, app: App) => {
  // attach a custom button to open original image, only on desktop
  if (Platform.isDesktop) globalSearchBtn(gallery, imagesList)

  // setup a lightbox for the gallery
  const galleryLightbox = Lightbox(gallery, {
    plugins: [LightboxThumbs],
    counter: false,
    download: false,
    thumbnail: true,
    loop: false,
    mode: 'lg-fade',
    licenseKey: '622E672F-760D49DC-980EF90F-B7A9DCB0',
  })

  // if we are on mobile, make sure to remove unnecessary controls
  if (Platform.isIosApp || Platform.isAndroidApp) {
    const elements:NodeListOf<HTMLElement> = document.querySelectorAll('.lg-close, .lg-prev, .lg-next')
    for (const element of elements) {
      element.style.display = 'none'
    }
  }

  return galleryLightbox
}

const globalSearchBtn = (gallery: HTMLElement, imagesList: {[key: string]: any}) => {
  gallery.addEventListener('lgInit', (event: CustomEvent) => {
    const galleryInstance = event.detail.instance
    const btn ='<button type="button" id="btn-glob-search" class="lg-icon btn-glob-search"></button>'
    galleryInstance.outer.find('.lg-toolbar').append(btn)

    galleryInstance.outer.find('#btn-glob-search').on('click', () => {
      const index = galleryInstance.index
      const selected = imagesList[index]
      app.workspace.openLinkText('', `${selected.folder}/${selected.name}`, true, {active: true})
      galleryInstance.closeGallery()
    });
  })
}

export default lightbox
