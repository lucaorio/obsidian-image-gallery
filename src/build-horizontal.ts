const buildHorizontal = (
    container: HTMLElement,
    imagesList: {[key: string]: any},
    settings: {[key: string]: any}
  ) => {
  // inject the gallery wrapper
  const gallery = container.createEl('div')
  gallery.addClass('grid-wrapper')
  gallery.style.display = 'flex'
  gallery.style.flexWrap = 'wrap'
  gallery.style.marginRight = `-${settings.gutter}px`

  // inject and style images
  imagesList.forEach((file: {[key: string]: string}) => {
    const figure = gallery.createEl('figure')
    figure.addClass('grid-item')
    figure.style.margin = `0px ${settings.gutter}px ${settings.gutter}px 0px`
    figure.style.width = 'auto'
    figure.style.height = `${settings.height}px`
    figure.style.borderRadius = `${settings.radius}px`
    figure.style.flex = '1 0 auto'
    figure.style.overflow = 'hidden'
    figure.setAttribute('data-name', file.name)
    figure.setAttribute('data-folder', file.name)
    figure.setAttribute('data-src', file.uri)

    const img = figure.createEl('img')
    img.style.objectFit = 'cover'
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.borderRadius = '0px'
    img.src = file.uri
  })

  return gallery
}

export default buildHorizontal
